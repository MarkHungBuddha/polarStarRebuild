import { expect, test } from './support/fixtures';
import { classifyAndRankValues } from './support/experience';
import { allocationCells, answerInteractiveByTitle, applyDecision, confirmButton, confirmDecision, editQuestion, priorityRows, resultHeading, startInteractiveScenarios } from './support/interactive';

// The round's first question at Math.random 0: six days of a trip, each planned by oneself (A, 自主) or spent on a fixed day tour
// (B, 安全穩定). Every other question is answered 目前無法決定, so the counts come from this one.
const trip = '六天的旅程，哪幾天自己排？';

test('開發預覽：分配題從第一幕走到結果，分得多的一側記 1 次並與第一幕並列', async ({ page }) => {
  await startInteractiveScenarios(page);
  expect(await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } })).toContain(trip);
  await expect(resultHeading(page)).toBeVisible();
  await expect(page.getByRole('heading', { name: '你最重視的', exact: true })).toBeVisible();
  expect(await priorityRows(page)).toEqual(['第 1｜自主｜1 次／3 題']);
});

test('平均分配兩側都不加次數，沒有方向時不產生第二幕排名', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: '平均分配' });
  expect(await priorityRows(page)).toEqual([]);
  await expect(page.getByText('這次沒有方向明確的決策，不產生第二幕排名。')).toBeVisible();
});

test('分配差距不加權：六比零和四比二一樣只記 1 次', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: { allocate: [0, 6] } });
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
});

test('操作時即時顯示兩側數量與剩下的格數，排滿前不能確認，畫面不出現價值名稱或計時', async ({ page }) => {
  await startInteractiveScenarios(page);
  const totals = page.locator('.scenario-mechanic').getByRole('status');
  await expect(totals).toHaveText(/自己排行程\s*0 天.*跟一日團\s*0 天.*還沒安排\s*6 天/);
  await expect(allocationCells(page)).toHaveCount(6);
  await allocationCells(page).nth(1).getByRole('button', { name: '跟一日團' }).click();
  await allocationCells(page).nth(2).getByRole('button', { name: '跟一日團' }).click();
  await expect(totals).toHaveText(/自己排行程\s*0 天.*跟一日團\s*2 天.*還沒安排\s*4 天/);
  await expect(confirmButton(page)).toBeDisabled();
  await applyDecision(page, { allocate: [3, 3] });
  await expect(totals).toHaveText(/自己排行程\s*3 天.*跟一日團\s*3 天.*還沒安排\s*0 天/);
  await expect(confirmButton(page)).toBeEnabled();
  const screen = page.locator('.scenario-page');
  await expect(screen).not.toContainText(/自主|探索刺激|享受生活|成就|主導權|安全穩定|遵守規範|傳承|照顧身邊的人|普遍關懷/);
  await expect(screen).not.toContainText(/倒數|計時|秒|很好|答對|答錯/);
});

test('只用鍵盤也能完成分配並確認', async ({ page }) => {
  await startInteractiveScenarios(page);
  const cells = await allocationCells(page).all();
  for (const [index, cell] of cells.entries()) {
    await cell.getByRole('button').nth(index < 5 ? 0 : 1).focus();
    await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
  }
  await confirmButton(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: trip, exact: true })).toHaveCount(0);
  await answerInteractiveByTitle(page);
  expect(await priorityRows(page)).toEqual(['第 1｜自主｜1 次／3 題']);
});

test('返回修改要重新確認才覆蓋；重新整理保留上次已確認的版本，不保存未確認的修改', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } });
  await editQuestion(page, trip);
  const totals = page.locator('.scenario-mechanic').getByRole('status');
  await expect(totals).toHaveText(/自己排行程\s*4 天.*跟一日團\s*2 天/);
  await applyDecision(page, { allocate: [1, 5] });
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  expect(await priorityRows(page)).toEqual(['第 1｜自主｜1 次／3 題']);

  await editQuestion(page, trip);
  await applyDecision(page, { allocate: [1, 5] });
  await page.reload();
  await expect(totals).toHaveText(/自己排行程\s*4 天.*跟一日團\s*2 天/);
  await confirmDecision(page, { allocate: [1, 5] });
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await page.reload();
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
});

test('新版結果只分享結果連結，還沒有結果圖或題目連結的分享入口', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } });
  // The result link arrives with #66; the result image (#67) and question links (#71) come later.
  await expect(page.getByRole('button', { name: /分享|結果圖|複製/ })).toHaveText(['複製結果連結']);
  await expect(page.getByRole('link', { name: /分享|結果圖/ })).toHaveCount(0);
  await expect(page.getByRole('textbox')).toHaveCount(1);
  await expect(page.getByRole('textbox', { name: '結果連結' })).toHaveValue(/#r=3\./);
});

test('沒有預覽參數時，正式入口仍是五段偏向作答', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await expect(page.getByRole('radio', { name: '兩者相當', exact: true })).toBeVisible();
  await expect(allocationCells(page)).toHaveCount(0);
});
