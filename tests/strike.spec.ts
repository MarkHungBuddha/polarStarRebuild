import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { completeRemainingScenarios, expectNoHorizontalScroll, goToScenario, rankValuesInListedOrder } from './support/experience';

async function openStrike(page: Page, tied = false) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const select of await page.getByRole('combobox').all()) await select.selectOption('core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await rankValuesInListedOrder(page);
  if (tied) await page.getByRole('combobox', { name: '遵守規範的位置' }).selectOption('1');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '這份提案，用誰的方法？');
}

test('刪稿需明確刪去一段才可確認，並呈現實際保留的回覆', async ({ page }) => {
  await openStrike(page);
  await expect(page.getByRole('heading', { name: '這份提案，用誰的方法？' })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案' })).toBeDisabled();
  await page.getByRole('radio', { name: '刪掉 A 段' }).check();
  await expect(page.getByText('保留 B 段', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '這份提案，用誰的方法？' }) });
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(evidence.getByText('這次我先沿用共同約定的格式，讓大家可以直接對照；我會把自己的呈現方式留到另一次提案。', { exact: true })).toBeVisible();
});

test('刪稿可用鍵盤修正，未確認的修改不改變結果', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStrike(page);
  await page.getByRole('radio', { name: '刪掉 A 段' }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: '確認答案' }).focus();
  await page.keyboard.press('Enter');
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '這份提案，用誰的方法？' }) });
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('radio', { name: '刪掉 A 段' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByText('保留 A 段', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('radio', { name: '刪掉 B 段' }).check();
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evidence.getByText('這次我想用自己設計的方式說明，讓觀點依我的想法展開；我知道這會偏離共同約定，也需要大家多花時間熟悉。', { exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test('第一幕將自主與遵守規範並列時，刪稿只描述保留的回覆', async ({ page }) => {
  await openStrike(page, true);
  await page.getByRole('radio', { name: '刪掉 A 段' }).check();
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '這份提案，用誰的方法？' }) });
  await expect(evidence.getByText('第一幕並列 · 只描述本次選擇', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
});
