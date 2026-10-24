import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { scenarios } from '../src/scenarios';
import { classifyAndRankValues, confirmCurrentScenario, expectHorizontalText, expectLongParagraphsInSans, expectNoHorizontalScroll, expectTouchTargets, goToScenario } from './support/experience';

async function openFirstScenario(page: Page) {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
}

test('情境進度同時有可見文字與可讀取的數值，確認與返回時跟著更新', async ({ page }) => {
  await openFirstScenario(page);
  const progress = page.getByRole('progressbar', { name: '第二幕進度' });
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
  await expect(progress).toHaveAttribute('aria-valuemin', '1');
  await expect(progress).toHaveAttribute('aria-valuemax', '15');
  await expect(progress).toHaveAttribute('aria-valuetext', '第 1 題，共 15 題');
  await confirmCurrentScenario(page);
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
});

test('長情境以無襯線內文呈現，標題維持手寫字，文字不旋轉', async ({ page }) => {
  await openFirstScenario(page);
  const fontOf = (selector: string) => page.locator(selector).first().evaluate(element => getComputedStyle(element).fontFamily);
  const setup = page.locator('.scenario-page .setup');
  expect((await setup.textContent())!.length).toBeGreaterThan(60);
  expect(await fontOf('.scenario-page .setup')).toMatch(/^"?Noto Sans TC/);
  expect(await fontOf('.scenario-page h1')).toMatch(/^"?LXGW WenKai TC/);
  for (const text of await page.locator('.scenario-page h1, .scenario-page .setup').all()) expect(await text.evaluate(element => getComputedStyle(element).transform)).toBe('none');
});

test('每題情境照作者原文顯示，標籤只寫領域，畫面沒有英文裝飾字', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openFirstScenario(page);
  const confirm = page.getByRole('button', { name: '確認答案', exact: true });
  for (let question = 0; question < 15 && await confirm.count(); question += 1) {
    const title = await page.locator('.scenario-page h1').textContent();
    const candidates = scenarios.filter(scenario => scenario.title === title);
    const shown = (await page.locator('.scenario-card').locator('.setup, .setup-question').allTextContents()).join('');
    const scenario = candidates.find(item => item.setup === shown);
    expect(scenario, `「${title}」的情境文字被改寫：${shown}`).toBeDefined();
    await expect(page.locator('.scenario-tag')).toHaveText(scenario!.domain);
    expect(await page.locator('main').textContent()).not.toMatch(/[A-Z]{2,}/);
    await confirmCurrentScenario(page);
  }
});

test('桌面上時間分配題有較寬的操作空間，情境文字仍維持易讀的行長', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openFirstScenario(page);
  await goToScenario(page, '六個晚上，留給哪些事？');
  const board = (await page.locator('.planner-board').boundingBox())!;
  expect(board.width, '分配題寬於一般情境欄').toBeGreaterThan(720);
  expect((await page.locator('.scenario-card .setup').boundingBox())!.width, '情境內文行長').toBeLessThanOrEqual(680);
  expect(await page.locator('[data-planner-slot]').evaluateAll(slots => new Set(slots.map(slot => Math.round(slot.getBoundingClientRect().left))).size), '桌面行程至少三欄').toBeGreaterThanOrEqual(3);
});

test('減少動態效果時情境卡不位移，裝飾不遮住任何控制項', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openFirstScenario(page);
  for (let question = 0; question < 15; question += 1) {
    const card = page.locator('.scenario-card');
    expect(await card.evaluate(element => getComputedStyle(element).animationName)).toBe('none');
    // Every visible control, scrolled into view, receives a click at its center rather than a decoration on top of it.
    const covered = await page.locator('main').evaluate(main => [...main.querySelectorAll<HTMLElement | SVGElement>('button, [role="button"], [role="slider"]')].filter(element => {
      const box = element.getBoundingClientRect();
      if (!box.width || !box.height) return false;
      element.scrollIntoView({ block: 'center' });
      const now = element.getBoundingClientRect();
      const hit = document.elementFromPoint(now.left + now.width / 2, now.top + now.height / 2);
      return !hit || !(element === hit || element.contains(hit));
    }).map(element => element.getAttribute('aria-label') ?? element.textContent));
    expect(covered).toEqual([]);
    await confirmCurrentScenario(page);
    if (await page.getByRole('button', { name: '確認答案', exact: true }).count() === 0) break;
  }
});

/** Walks all fifteen questions, checking each screen before and after it has a draft answer. */
for (const width of [320, 390, 1280]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`情境畫面在 ${width}px ${colorScheme === 'light' ? '淺色' : '深色'}下，未選與已選都不橫向捲動，二選一與刪稿的點擊區至少 44 × 44px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme });
      await openFirstScenario(page);
      const confirm = page.getByRole('button', { name: '確認答案', exact: true });
      const frameControls = page.locator('.scenario-page .actions');
      for (let question = 0; question < 15; question += 1) {
        const choiceScene = page.locator('.play-scene .scene-action');
        await expectNoHorizontalScroll(page);
        await expectTouchTargets(frameControls);
        await expectHorizontalText(page.locator('.scenario-page'));
        await expectLongParagraphsInSans(page.locator('.scenario-page'));
        if (await choiceScene.count()) {
          await expectTouchTargets(page.locator('.play-scene'));
          await expect(confirm).toBeDisabled();
          await choiceScene.nth(question % 2).click();
          await expect(choiceScene.nth(question % 2)).toHaveAttribute('aria-pressed', 'true');
          await expectNoHorizontalScroll(page);
        }
        await confirmCurrentScenario(page);
        if (!await confirm.count()) break;
      }
      await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
    });
  }
}
