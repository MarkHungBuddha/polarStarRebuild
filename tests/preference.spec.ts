import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { expectNoHorizontalScroll, openDetailedReport } from './support/experience';
import { answerByTitle, confirmButton as confirm, evidence, leanOption as lean, scoreRow as row, scoreRows, startScenarios, type Lean } from './support/preference';

// With the fixed randomness each slot draws its first variant, in slot order. These are slots 1–5, 8, 11, 13 and 15; the others are answered 兩者相當. A is listed first.
// First act below ranks the core values 自主, 探索刺激, 享受生活, 成就, 主導權, 安全穩定, 遵守規範, 傳承, 照顧身邊的人, 普遍關懷.
const titles = ['固定薪水，還是自己接案？', '這份提案，用誰的方法？', '這三週的晚上，留給哪件事？', '下週，照原計畫嗎？', '同一天，兩場活動。', '原本留給自己的那一晚。', '這筆活動預算，誰來決定？', '今年的活動，誰說了算？', '新約定遇上紀念聚會。'] as const;

/** Answers the whole run: the listed questions with their lean, every other question with 兩者相當. */
const answer = (page: Page, leans: Partial<Record<typeof titles[number], Lean>>) => answerByTitle(page, leans as Record<string, Lean>);

test('五段可點選也可用鍵盤，初始未選，兩者相當也要主動選擇並確認', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startScenarios(page);
  const options = page.getByRole('radio');
  await expect(options).toHaveCount(5);
  await expect(page.getByText('選擇你的偏向程度，再按確認答案。覺得兩者相當，也請選它。')).toBeVisible();
  for (const option of await options.all()) await expect(option).not.toBeChecked();
  await expect(confirm(page)).toBeDisabled();
  await page.getByText('稍微偏向 B', { exact: true }).click();
  await expect(lean(page, '稍微偏向 B')).toBeChecked();
  await lean(page, '稍微偏向 B').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(lean(page, '兩者相當')).toBeChecked();
  await expectNoHorizontalScroll(page);
  await confirm(page).click();
  await expect(page.getByRole('heading', { name: titles[1], exact: true })).toBeVisible();
  for (const option of await options.all()) await expect(option).not.toBeChecked();
});

test('全部兩者相當時沒有排名，也不算相符或不同', async ({ page }) => {
  await startScenarios(page);
  await answer(page, {});
  await expect(page.getByText('這次作答沒有明確偏向。', { exact: true })).toBeVisible();
  await expect(page.getByText('強烈偏向給該側 2 分，稍微偏向給該側 1 分，兩者相當兩側都是 0 分。', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('這次沒有明確偏向原先排序較後的價值。')).toBeVisible();
  await openDetailedReport(page);
  await expect(page.locator('.evidence-label').first()).toBeVisible();
  await expect(page.locator('.evidence-label').filter({ hasNotText: '無明確偏向' })).toHaveCount(0);
  await expect(evidence(page, titles[0])).toContainText('已確認答案：兩者相當。兩側都不加分。');
});

test('同分並列可超過三個價值，零分不列名次；稍微偏向的分數會累加', async ({ page }) => {
  await startScenarios(page);
  // 安全穩定 2、探索刺激 2、照顧身邊的人 2、普遍關懷 2、傳承 1 + 1；主導權、遵守規範、享受生活都是 0。
  await answer(page, { [titles[3]]: '強烈偏向 B', [titles[4]]: '強烈偏向 A', [titles[5]]: '強烈偏向 B', [titles[6]]: '強烈偏向 B', [titles[7]]: '稍微偏向 B', [titles[8]]: '稍微偏向 B' });
  expect(await scoreRows(page)).toEqual([row('並列第 1', ['探索刺激', '安全穩定', '照顧身邊的人', '普遍關懷', '傳承'], '各 2 分')]);
});

test('只依總分排競賽名次，逐題依據與排名跟著最新確認答案，兩幕比較只看方向', async ({ page }) => {
  await startScenarios(page);
  // 安全穩定 2、探索刺激 2、照顧身邊的人 1、普遍關懷 1，其餘兩者相當。
  await answer(page, { [titles[3]]: '強烈偏向 B', [titles[4]]: '強烈偏向 A', [titles[5]]: '稍微偏向 B', [titles[6]]: '稍微偏向 B' });
  expect(await scoreRows(page)).toEqual([
    row('並列第 1', ['探索刺激', '安全穩定'], '各 2 分'),
    row('並列第 3', ['照顧身邊的人', '普遍關懷'], '各 1 分'),
  ]);
  await expect(page.getByText('在 3 個情境裡，你偏向原先排序較後的價值。', { exact: false })).toBeVisible();
  await openDetailedReport(page);
  await expect(evidence(page, titles[3]).locator('.evidence-label')).toHaveText('與第一幕不同');
  await expect(evidence(page, titles[3])).toContainText('已確認答案：強烈偏向 B。安全穩定加 2 分。');
  await expect(evidence(page, titles[4]).locator('.evidence-label')).toHaveText('與第一幕相符');
  await expect(evidence(page, titles[5]).locator('.evidence-label')).toHaveText('與第一幕不同');
  await expect(evidence(page, titles[5])).toContainText('已確認答案：稍微偏向 B。照顧身邊的人加 1 分。');

  // Strong and slight in the same direction compare the same way.
  await evidence(page, titles[3]).getByRole('button', { name: '修改這題' }).click();
  await expect(lean(page, '強烈偏向 B')).toBeChecked();
  await lean(page, '稍微偏向 B').click();
  await confirm(page).click();
  await expect(evidence(page, titles[3]).locator('.evidence-label')).toHaveText('與第一幕不同');
  await expect(evidence(page, titles[3])).toContainText('已確認答案：稍微偏向 B。安全穩定加 1 分。');
  // 探索刺激 2 alone; 安全穩定、照顧身邊的人、普遍關懷 1 share second place.
  await page.getByRole('button', { name: '← 返回簡短結論' }).click();
  expect(await scoreRows(page)).toEqual([
    row('第 1', ['探索刺激'], '2 分'),
    row('並列第 2', ['安全穩定', '照顧身邊的人', '普遍關懷'], '各 1 分'),
  ]);
});

test('返回或重新整理會捨棄未確認修改，續答恢復同一題與最近一次已確認答案', async ({ page }) => {
  await startScenarios(page);
  await lean(page, '稍微偏向 A').click();
  await confirm(page).click();
  await lean(page, '強烈偏向 B').click();
  // Back drops the second question's unconfirmed choice and shows the first question's confirmed answer.
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(page.getByRole('heading', { name: titles[0], exact: true })).toBeVisible();
  await expect(lean(page, '稍微偏向 A')).toBeChecked();
  await lean(page, '強烈偏向 A').click();
  await confirm(page).click();
  await expect(page.getByRole('heading', { name: titles[1], exact: true })).toBeVisible();
  for (const option of await page.getByRole('radio').all()) await expect(option).not.toBeChecked();

  await page.getByRole('button', { name: '返回上一頁' }).click();
  await lean(page, '兩者相當').click();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByRole('heading', { name: titles[0], exact: true })).toBeVisible();
  await expect(lean(page, '強烈偏向 A')).toBeChecked();
});
