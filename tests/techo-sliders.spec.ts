import { expect, test } from './support/fixtures';
import type { Locator, Page } from '@playwright/test';
import { allocate, classifyAndRankValues, confirmCurrentScenario, expectFullyShown, expectNoHorizontalScroll, expectTouchTargets, goToScenario, setAmount } from './support/experience';

/** WCAG contrast ratio between two computed `rgb(...)` colors. */
function contrast(first: string, second: string) {
  const luminance = (color: string) => {
    const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(channel => {
      const c = channel / 255;
      return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
    });
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + .05) / (dark + .05);
}

const computed = (locator: Locator, property: string) => locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);

async function openScenario(page: Page, title: string) {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, title);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`存錢筒在${colorScheme === 'light' ? '淺色' : '深色'}下，月數清楚印在撲滿上`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await openScenario(page, '先準備多少，再換一種工作？');
    const count = page.locator('.pig-count');
    const body = page.locator('.pig-body');
    expect(contrast(await computed(count, 'fill'), await computed(body, 'fill'))).toBeGreaterThanOrEqual(4.5);
  });
}

test('時鐘說明不再提紅色時針，只說拖曳時針', async ({ page }) => {
  await openScenario(page, '八週的進修，留多少空白？');
  const board = page.locator('.game-board');
  await expect(board).not.toContainText('紅色');
  await expect(board.locator('.game-instruction')).toContainText('拖曳時針');
  await expect(board.locator('.real-clock')).toContainText('拖曳時針');
});

/** Text color against both the page and the paper color, so it reads wherever the semi-transparent board sits. */
async function expectReadableText(page: Page, control: Locator) {
  const tokens = await page.evaluate(() => {
    const probe = document.createElement('i');
    document.body.append(probe);
    const resolve = (name: string) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };
    const result = { bg: resolve('--bg'), paper: resolve('--paper') };
    probe.remove();
    return result;
  });
  const own = await computed(control, 'background-color');
  const backgrounds = own.startsWith('rgba') && own.endsWith(', 0)') ? [tokens.bg, tokens.paper] : [own];
  expect(await computed(control, 'opacity')).toBe('1');
  for (const background of backgrounds) expect(contrast(await computed(control, 'color'), background)).toBeGreaterThanOrEqual(4.5);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`${colorScheme === 'light' ? '淺色' : '深色'}下，到達邊界而停用的按鈕仍清楚可讀`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await openScenario(page, '先準備多少，再換一種工作？');
    const takeBack = page.getByRole('button', { name: '取回一份', exact: true });
    await expect(takeBack).toBeDisabled();
    await expectReadableText(page, takeBack);
    await goToScenario(page, '成果發表，要多留一個版本嗎？');
    const previous = page.getByRole('button', { name: '往前翻一頁' });
    await expect(previous).toBeDisabled();
    await expectReadableText(page, previous);
  });
}

/** Which slider or allocation control the current question uses, or null for a choice or strike scene. */
async function controlForm(page: Page) {
  if (await page.locator('.piggy-scene').count()) return 'piggy';
  if (await page.locator('.real-clock').count()) return 'clock';
  if (await page.locator('.desk-calendar').count()) return 'calendar';
  if (await page.locator('[data-planner-slot]').count()) return 'planner';
  return null;
}

/** Sets the control to its lowest or highest value: 0 / the maximum, or every slot to the second / first activity. */
async function setBoundary(page: Page, form: string, boundary: 'min' | 'max') {
  if (form === 'planner') await allocate(page, boundary === 'min' ? 0 : await page.locator('[data-planner-slot]').count());
  else await setAmount(page, boundary === 'min' ? 0 : 'max');
}

// Set T21_SHOTS to a folder to keep a screenshot of every control at each boundary.
const shots = process.env.T21_SHOTS;

for (const scenarioRandom of [0, .999]) {
  for (const width of [320, 390, 1280]) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test.describe(() => {
        test.use({ scenarioRandom });
        test(`題組 ${scenarioRandom}：${width}px ${colorScheme === 'light' ? '淺色' : '深色'}下，滑桿與分配在最小與最大值都不溢出、點擊區至少 44 × 44px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await page.emulateMedia({ colorScheme });
          await page.goto('/');
          await classifyAndRankValues(page);
          await page.getByRole('button', { name: '進入情境中的取捨' }).click();
          const confirm = page.getByRole('button', { name: '確認答案', exact: true });
          const mechanic = page.locator('.scenario-mechanic');
          for (let question = 0; question < 15 && await confirm.count(); question += 1) {
            const form = await controlForm(page);
            if (form) {
              for (const boundary of ['min', 'max'] as const) {
                await setBoundary(page, form, boundary);
                await expectNoHorizontalScroll(page);
                await expectTouchTargets(mechanic);
                await expectFullyShown(page.locator('.scene-feedback'));
                if (form === 'calendar') {
                  await expectFullyShown(page.locator('.calendar-navigation'));
                  await expect(page.getByRole('button', { name: boundary === 'min' ? '往前翻一頁' : '往後翻一頁' })).toBeDisabled();
                }
                if (form === 'piggy') await expect(page.getByRole('button', { name: boundary === 'min' ? '取回一份' : '放入一個月生活費', exact: true })).toBeDisabled();
                if (width === 1280) {
                  // Complex controls keep room on desktop: planner slots in at least three columns, scenes at least 360px wide.
                  if (form === 'planner') expect(await page.locator('[data-planner-slot]').evaluateAll(slots => new Set(slots.map(slot => Math.round(slot.getBoundingClientRect().left))).size)).toBeGreaterThanOrEqual(3);
                  else expect((await page.locator('.piggy-scene, .real-clock, .desk-calendar').boundingBox())!.width).toBeGreaterThanOrEqual(360);
                }
                if (shots) await mechanic.screenshot({ path: `${shots}/t21-${scenarioRandom ? 'b' : 'a'}-${form}-q${question + 1}-${width}-${colorScheme}-${boundary}.png` });
              }
            }
            await confirmCurrentScenario(page);
          }
          await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
        });
      });
    }
  }
}

test('鍵盤焦點在硬幣、時鐘、桌曆與行程上都看得見，減少動態效果時硬幣不落下', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openScenario(page, '先準備多少，再換一種工作？');
  const coin = page.getByRole('button', { name: '放入一個月生活費', exact: true });
  await page.keyboard.press('Shift');
  await coin.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.scene-feedback')).toContainText(' 1 個月生活費');
  // The coin is drawn in SVG, so its focus shows as an ink ring around the coin.
  expect(await computed(page.locator('.pig-coin-hit'), 'stroke')).not.toBe('none');
  expect(await computed(page.locator('.deposit-coin'), 'animation-name')).toBe('none');
  await expect(page.locator('.deposit-coin')).toHaveCSS('opacity', '0');
  for (const title of ['六個晚上，留給哪些事？', '八週的進修，留多少空白？', '成果發表，要多留一個版本嗎？']) {
    await goToScenario(page, title);
    for (const control of await page.locator('.real-clock, .desk-calendar button:enabled, .planner-activities button, [data-planner-slot]').all()) {
      await page.keyboard.press('Shift');
      await control.focus();
      await expect(control).toHaveCSS('outline-style', 'solid');
      await expect(control).toHaveCSS('outline-width', '2px');
    }
  }
});
