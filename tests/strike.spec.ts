import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { classifyAll, completeRemainingScenarios, expectNoHorizontalScroll, goToScenario, rankValuesInListedOrder, sceneOptions } from './support/experience';

async function openStrike(page: Page, tied = false) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await classifyAll(page, 'core');
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
  await sceneOptions(page).nth(1).click();
  await expect(sceneOptions(page).nth(1)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '這份提案，用誰的方法？' }) });
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(evidence.getByText('這次我先用大家約好的格式，方便直接對照；我自己的寫法留到下次提案再試。', { exact: true })).toBeVisible();
});

test('刪稿可用鍵盤修正，未確認的修改不改變結果', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStrike(page);
  await sceneOptions(page).nth(1).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: '確認答案' }).focus();
  await page.keyboard.press('Enter');
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '這份提案，用誰的方法？' }) });
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await sceneOptions(page).nth(0).focus();
  await page.keyboard.press('Space');
  await expect(sceneOptions(page).nth(0)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await sceneOptions(page).nth(0).click();
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evidence.getByText('這次我想用自己設計的方式說明觀點。我知道這沒照共同約定，大家也得多花點時間熟悉。', { exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test('第一幕將自主與遵守規範並列時，刪稿只描述保留的回覆', async ({ page }) => {
  await openStrike(page, true);
  await sceneOptions(page).nth(1).click();
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '這份提案，用誰的方法？' }) });
  await expect(evidence.getByText('第一幕並列 · 只描述本次選擇', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
});
