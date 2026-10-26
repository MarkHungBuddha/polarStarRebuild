import { expect, test } from './support/fixtures';
import { classifyValues, completeRemainingScenarios, confirmCurrentScenario, goToScenario } from './support/experience';

test('分享連結只重現同一份題目，不帶自己的答案或價值詞', async ({ page, browser }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
  const link = await page.getByRole('textbox', { name: '題目分享連結' }).inputValue();
  const url = new URL(link);
  expect([...url.searchParams.keys()].sort()).toEqual(['seed', 'v']);
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '下週，照原計畫嗎？');
  await confirmCurrentScenario(page, '強烈偏向 B');
  await completeRemainingScenarios(page);
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '這次週末，要換條路嗎？');
  await page.goto(link);
  await page.getByRole('button', { name: '改做分享的題目' }).click();
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '下週，照原計畫嗎？');
  const freshContext = await browser.newContext();
  const fresh = await freshContext.newPage();
  await fresh.goto(link);
  await classifyValues(fresh);
  await fresh.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(fresh, '下週，照原計畫嗎？');
  await freshContext.close();
});

test('指定分享題目中途重新開啟，仍可續答同一份已確認進度', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
  const link = await page.getByRole('textbox', { name: '題目分享連結' }).inputValue();
  await page.goto(link);
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await confirmCurrentScenario(page);
  const nextTitle = await page.getByRole('heading', { level: 1 }).textContent();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(nextTitle!);
});

test('開啟不同題目的分享連結時，仍可選擇繼續本機進度，不會悄悄覆寫', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
  const own = new URL(await page.getByRole('textbox', { name: '題目分享連結' }).inputValue());
  const other = new URL(own);
  other.searchParams.set('seed', 'p.' + own.searchParams.get('seed')!.slice(2).split('.').map(selector => selector === '0' ? '1' : '0').join('.'));
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await confirmCurrentScenario(page);
  const savedTitle = await page.getByRole('heading', { level: 1 }).textContent();

  await page.goto(other.href);
  await expect(page.getByRole('button', { name: '開始這次反思' })).toHaveCount(0);
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(savedTitle!);
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();

  await page.goto(other.href);
  await page.getByRole('button', { name: '改做分享的題目' }).click();
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  const sharedTitle = await page.getByRole('heading', { level: 1 }).textContent();
  await page.goto('/');
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(sharedTitle!);
});

test('版本不相容時說明原因並明確選擇新版測驗，不能悄悄換題開始', async ({ page }) => {
  await page.goto('/?seed=example&v=unavailable');
  await expect(page.getByRole('status')).toContainText('這份題目連結建立時用的題庫和目前不同');
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '分享這份題目', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '開始新版測驗' }).click();
  expect(new URL(page.url()).search).toBe('');
  await classifyValues(page);
  await expect(page.getByRole('button', { name: '進入情境中的取捨' })).toBeVisible();
});

test('無法自動複製時仍能取得只含題目的分享連結', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }));
  await page.goto('/?private-answer=not-for-sharing#my-result');
  await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
  const link = await page.getByRole('textbox', { name: '題目分享連結' }).inputValue();
  expect(link).not.toContain('private-answer');
  expect(link).not.toContain('my-result');
  await page.getByRole('button', { name: '複製題目連結', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('請選取上方連結並手動複製');
  await expect(page.getByRole('textbox', { name: '題目分享連結' })).toHaveValue(link);
});

test('一般重新開始保留已看紀錄，清除則同時重設題目新鮮感', async ({ page }) => {
  await page.goto('/');
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '下週，照原計畫嗎？');
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '下週，照原計畫嗎？');
  await completeRemainingScenarios(page);
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '這次週末，要換條路嗎？');
});

test('已看紀錄無法讀取時仍能完成作答並告知無法保存', async ({ page }) => {
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
      if (key === 'polarstar.seen.v2') throw new DOMException('Denied', 'SecurityError');
      return getItem.call(this, key);
    };
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('目前無法讀取本機紀錄');
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await completeRemainingScenarios(page);
  await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('目前無法保存本機紀錄');
});
