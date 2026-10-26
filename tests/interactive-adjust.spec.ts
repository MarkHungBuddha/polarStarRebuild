import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { allocationCells, answerInteractiveByTitle, confirmButton, confirmDecision, decisionRecord, editQuestion, keepButton, priorityRows, questionHeading, startInteractiveScenarios, undecidedButton } from './support/interactive';

// The preview's adjust sample: four weekends already planned (1 新地方, 3 熟悉路線), between a small-town day trip (A, 探索刺激)
// and the familiar route (B, 安全穩定). Its current arrangement puts the third weekend on A and the rest on B.
const weekends = '四個週末，照原本排的走嗎？';
const evenings = '六個晚上，留給誰？';

/** Answers the questions before the weekends one evenly, so the adjust question is on screen. */
async function openWeekends(page: Page) {
  await startInteractiveScenarios(page);
  await expect(questionHeading(page)).toHaveText(evenings);
  await confirmDecision(page, '平均分配');
  await expect(questionHeading(page)).toHaveText(weekends);
}

test('有初始安排時一開始就顯示現況，沒操作也沒按維持就不能確認', async ({ page }) => {
  await openWeekends(page);
  const totals = page.locator('.scenario-mechanic').getByRole('status');
  await expect(totals).toHaveText(/去陌生小鎮體驗\s*1 個週末.*走熟悉的路線\s*3 個週末.*還沒安排\s*0 個週末/);
  const pressed = await Promise.all((await allocationCells(page).all()).map(cell => cell.getByRole('button', { pressed: true }).textContent()));
  expect(pressed).toEqual(['走熟悉的路線', '走熟悉的路線', '去陌生小鎮體驗', '走熟悉的路線']);
  await expect(page.locator('.scenario-mechanic')).toContainText('現況');
  await expect(keepButton(page)).toBeVisible();
  await expect(confirmButton(page)).toBeDisabled();
});

test('按「維持這個安排」後還要確認才提交；維持照初始配置判方向，逐題紀錄寫成維持原本安排', async ({ page }) => {
  await openWeekends(page);
  await keepButton(page).click();
  await expect(questionHeading(page)).toHaveText(weekends);
  await confirmButton(page).click();
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await expect(await decisionRecord(page, weekends)).toContainText('維持原本安排');
  await expect(await decisionRecord(page, evenings)).not.toContainText('維持原本安排');
});

test('作答輔助依標題維持初始安排', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [weekends]: '維持初始安排' });
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
});

test('調整後再改回初始配置，計數跟直接維持相同，但紀錄寫實際格數；按維持後再改格子也不算維持', async ({ page }) => {
  await openWeekends(page);
  const third = allocationCells(page).nth(2);
  await third.getByRole('button', { name: '走熟悉的路線' }).click();
  await third.getByRole('button', { name: '去陌生小鎮體驗' }).click();
  await confirmButton(page).click();
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await expect(await decisionRecord(page, weekends)).toContainText('去陌生小鎮體驗 1 個週末、走熟悉的路線 3 個週末');
  await expect(await decisionRecord(page, weekends)).not.toContainText('維持原本安排');

  await editQuestion(page, weekends);
  await keepButton(page).click();
  await allocationCells(page).nth(2).getByRole('button', { name: '走熟悉的路線' }).click();
  await allocationCells(page).nth(2).getByRole('button', { name: '去陌生小鎮體驗' }).click();
  await confirmButton(page).click();
  await expect(await decisionRecord(page, weekends)).not.toContainText('維持原本安排');

  await editQuestion(page, weekends);
  await keepButton(page).click();
  await confirmButton(page).click();
  await expect(await decisionRecord(page, weekends)).toContainText('維持原本安排');
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await page.reload();
  await expect(await decisionRecord(page, weekends)).toContainText('維持原本安排');

  await editQuestion(page, weekends);
  const pressed = await Promise.all((await allocationCells(page).all()).map(cell => cell.getByRole('button', { pressed: true }).textContent()));
  expect(pressed, 'a kept answer reopens on the current arrangement').toEqual(['走熟悉的路線', '走熟悉的路線', '去陌生小鎮體驗', '走熟悉的路線']);
  await confirmButton(page).click();
  await expect(await decisionRecord(page, weekends), 'confirming a reopened kept answer unchanged keeps it').toContainText('維持原本安排');

  await editQuestion(page, weekends);
  await confirmDecision(page, { allocate: [3, 1] });
  expect(await priorityRows(page)).toEqual(['第 1｜探索刺激｜1 次／3 題']);
  await expect(await decisionRecord(page, weekends)).toContainText('去陌生小鎮體驗 3 個週末、走熟悉的路線 1 個週末');
});

test('沒確認就離開或重新整理，初始安排不會算成答案', async ({ page }) => {
  await openWeekends(page);
  await keepButton(page).click();
  await page.reload();
  await expect(questionHeading(page)).toHaveText(weekends);
  await expect(confirmButton(page)).toBeDisabled();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(questionHeading(page)).toHaveText(evenings);
  await confirmDecision(page, '平均分配');
  await expect(confirmButton(page)).toBeDisabled();
});

test('初始安排題也能確認目前無法決定：不加次數，紀錄寫成目前無法決定；回到題目按維持這個安排就取消它', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [weekends]: '目前無法決定' });
  expect(await priorityRows(page)).toEqual([]);
  await expect(page.getByText('明確決策 0 / 2 題', { exact: true })).toBeVisible();
  await expect(await decisionRecord(page, weekends)).toContainText('目前無法決定');

  await editQuestion(page, weekends);
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(confirmButton(page)).toBeEnabled();
  await keepButton(page).click();
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'false');
  await confirmButton(page).click();
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await expect(await decisionRecord(page, weekends)).toContainText('維持原本安排');

  await editQuestion(page, weekends);
  await undecidedButton(page).click();
  await allocationCells(page).nth(0).getByRole('button', { name: '去陌生小鎮體驗' }).click();
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(confirmButton(page), 'a cell edit after 目前無法決定 needs every cell placed again').toBeDisabled();
});
