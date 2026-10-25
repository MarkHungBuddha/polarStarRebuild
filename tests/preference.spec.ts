import type { Locator, Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { classifyAndRankValues, expectNoHorizontalScroll, openDetailedReport } from './support/experience';

// The preview run (#49, until #56 switches the entry) asks these six questions in this order; A is listed first.
// First act below ranks the core values 自主, 探索刺激, 享受生活, 成就, 主導權, 安全穩定, 遵守規範, 傳承, 照顧身邊的人, 普遍關懷.
const titles = ['下週，照原計畫嗎？', '同一天，兩場活動。', '原本留給自己的那一晚。', '這筆活動預算，誰來決定？'] as const;
type Lean = '強烈偏向 A' | '稍微偏向 A' | '兩者相當' | '稍微偏向 B' | '強烈偏向 B';

const confirm = (page: Page) => page.getByRole('button', { name: '確認答案', exact: true });
const lean = (page: Page, name: Lean) => page.getByRole('radio', { name, exact: true });

async function startPreview(page: Page) {
  await page.goto('/?experience=preference');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
}

async function answer(page: Page, leans: readonly Lean[]) {
  for (const name of leans) { await lean(page, name).click(); await confirm(page).click(); }
  await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
}

/** The second-act column's rows as「名次｜價值（不論順序）｜分數」. */
async function scoreRows(page: Page) {
  const column = page.locator('.conclusion-columns > div').filter({ has: page.getByRole('heading', { name: '情境中的偏向分數' }) });
  return Promise.all((await column.getByRole('listitem').all()).map(async row => {
    const [position, words, score] = await Promise.all(['span', 'strong', 'small'].map(tag => row.locator(tag).textContent()));
    return `${position}｜${words!.split('、').sort().join('、')}｜${score}`;
  }));
}
const row = (position: string, words: string[], score: string) => `${position}｜${[...words].sort().join('、')}｜${score}`;
const evidence = (page: Page, title: string): Locator => page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

test('五段可點選也可用鍵盤，初始未選，兩者相當也要主動選擇並確認', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startPreview(page);
  const options = page.getByRole('radio');
  await expect(options).toHaveCount(5);
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

test('全部兩者相當時沒有排名，也不算相符或不同；預覽不提供題目連結', async ({ page }) => {
  await startPreview(page);
  await answer(page, ['兩者相當', '兩者相當', '兩者相當', '兩者相當', '兩者相當', '兩者相當']);
  await expect(page.getByText('這次作答沒有明確偏向', { exact: true })).toBeVisible();
  await expect(page.getByText('強烈偏向給該側 2 分，稍微偏向給該側 1 分，兩者相當兩側都是 0 分。', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('這次沒有明確偏向原先排序較後的價值。')).toBeVisible();
  await expect(page.getByRole('button', { name: '分享這份題目' })).toHaveCount(0);
  await openDetailedReport(page);
  await expect(page.locator('.evidence-label')).toHaveText(Array(6).fill('無明確偏向'));
  await expect(evidence(page, titles[0])).toContainText('已確認答案：兩者相當。兩側都不加分。');
});

test('同分並列可超過三個價值，零分不列名次；稍微偏向的分數會累加', async ({ page }) => {
  await startPreview(page);
  // 安全穩定 2、探索刺激 2、照顧身邊的人 2、普遍關懷 2、傳承 1 + 1；主導權、遵守規範、享受生活都是 0。
  await answer(page, ['強烈偏向 B', '強烈偏向 A', '強烈偏向 B', '強烈偏向 B', '稍微偏向 B', '稍微偏向 B']);
  expect(await scoreRows(page)).toEqual([row('並列第 1', ['探索刺激', '安全穩定', '照顧身邊的人', '普遍關懷', '傳承'], '各 2 分')]);
});

test('只依總分排競賽名次，逐題依據與排名跟著最新確認答案，兩幕比較只看方向', async ({ page }) => {
  await startPreview(page);
  // 安全穩定 2、探索刺激 2、照顧身邊的人 1、普遍關懷 1，後兩題兩者相當。
  await answer(page, ['強烈偏向 B', '強烈偏向 A', '稍微偏向 B', '稍微偏向 B', '兩者相當', '兩者相當']);
  expect(await scoreRows(page)).toEqual([
    row('並列第 1', ['探索刺激', '安全穩定'], '各 2 分'),
    row('並列第 3', ['照顧身邊的人', '普遍關懷'], '各 1 分'),
  ]);
  await expect(page.getByText('在 3 個情境裡，你偏向原先排序較後的價值。', { exact: false })).toBeVisible();
  await openDetailedReport(page);
  await expect(evidence(page, titles[0]).locator('.evidence-label')).toHaveText('與第一幕不同');
  await expect(evidence(page, titles[0])).toContainText('已確認答案：強烈偏向 B。安全穩定加 2 分。');
  await expect(evidence(page, titles[1]).locator('.evidence-label')).toHaveText('與第一幕相符');
  await expect(evidence(page, titles[2]).locator('.evidence-label')).toHaveText('與第一幕不同');
  await expect(evidence(page, titles[2])).toContainText('已確認答案：稍微偏向 B。照顧身邊的人加 1 分。');

  // Strong and slight in the same direction compare the same way.
  await evidence(page, titles[0]).getByRole('button', { name: '修改這題' }).click();
  await expect(lean(page, '強烈偏向 B')).toBeChecked();
  await lean(page, '稍微偏向 B').click();
  await confirm(page).click();
  await expect(evidence(page, titles[0]).locator('.evidence-label')).toHaveText('與第一幕不同');
  await expect(evidence(page, titles[0])).toContainText('已確認答案：稍微偏向 B。安全穩定加 1 分。');
  // 探索刺激 2 alone; 安全穩定、照顧身邊的人、普遍關懷 1 share second place.
  await page.getByRole('button', { name: '← 返回簡短結論' }).click();
  expect(await scoreRows(page)).toEqual([
    row('第 1', ['探索刺激'], '2 分'),
    row('並列第 2', ['安全穩定', '照顧身邊的人', '普遍關懷'], '各 1 分'),
  ]);
});

test('返回或重新整理會捨棄未確認修改，續答恢復同一題與最近一次已確認答案', async ({ page }) => {
  await startPreview(page);
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

test('新版預覽的紀錄不影響目前的正式作答', async ({ page }) => {
  await startPreview(page);
  await lean(page, '稍微偏向 A').click();
  await confirm(page).click();
  await page.goto('/');
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeEnabled();
});
