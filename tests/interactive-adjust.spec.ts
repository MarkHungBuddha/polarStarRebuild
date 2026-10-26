import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { allocationCells, answerInteractiveByTitle, confirmButton, confirmDecision, decisionRecord, editQuestion, keepButton, priorityRows, questionHeading, startInteractiveScenarios, undecidedButton, reopenAndContinue } from './support/interactive';

// Math.random 0.5 draws every slot's second variant; slot 1's is the round's first question, an adjust question: next year's four
// quarters, each on a fixed salary (B, 安全穩定) or freelancing (A, 自主). Its draft puts the third quarter on A and the rest on B.
// Every other question is answered 目前無法決定, so the counts come from this one.
test.use({ scenarioRandom: 0.5 });
const quarters = '明年的合作，照草案走嗎？';

/** Opens a round whose first question is the quarters. */
async function openQuarters(page: Page) {
  await startInteractiveScenarios(page);
  await expect(questionHeading(page)).toHaveText(quarters);
}

test('有初始安排時一開始就顯示現況，沒操作也沒按維持就不能確認', async ({ page }) => {
  await openQuarters(page);
  const totals = page.locator('.scenario-mechanic').getByRole('status');
  await expect(totals).toHaveText(/按件接案\s*1 季.*領固定月薪\s*3 季.*還沒安排\s*0 季/);
  const pressed = await Promise.all((await allocationCells(page).all()).map(cell => cell.getByRole('button', { pressed: true }).textContent()));
  expect(pressed).toEqual(['領固定月薪', '領固定月薪', '按件接案', '領固定月薪']);
  await expect(page.locator('.scenario-mechanic')).toContainText('現況');
  await expect(keepButton(page)).toBeVisible();
  await expect(confirmButton(page)).toBeDisabled();
});

test('按「維持這個安排」後還要確認才提交；維持照初始配置判方向，逐題紀錄寫成維持原本安排', async ({ page }) => {
  await openQuarters(page);
  await keepButton(page).click();
  await expect(questionHeading(page)).toHaveText(quarters);
  await confirmButton(page).click();
  await expect(questionHeading(page)).not.toHaveText(quarters);
  await answerInteractiveByTitle(page);
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await expect(await decisionRecord(page, quarters)).toContainText('維持原本安排');
});

test('作答輔助依標題維持初始安排', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [quarters]: '維持初始安排' });
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
});

test('調整後再改回初始配置，計數跟直接維持相同，但紀錄寫實際格數；按維持後再改格子也不算維持', async ({ page }) => {
  await openQuarters(page);
  const third = allocationCells(page).nth(2);
  await third.getByRole('button', { name: '領固定月薪' }).click();
  await third.getByRole('button', { name: '按件接案' }).click();
  await confirmButton(page).click();
  await expect(questionHeading(page)).not.toHaveText(quarters);
  await answerInteractiveByTitle(page);
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await expect(await decisionRecord(page, quarters)).toContainText('按件接案 1 季、領固定月薪 3 季');
  await expect(await decisionRecord(page, quarters)).not.toContainText('維持原本安排');

  await editQuestion(page, quarters);
  await keepButton(page).click();
  await allocationCells(page).nth(2).getByRole('button', { name: '領固定月薪' }).click();
  await allocationCells(page).nth(2).getByRole('button', { name: '按件接案' }).click();
  await confirmButton(page).click();
  await expect(await decisionRecord(page, quarters)).not.toContainText('維持原本安排');

  await editQuestion(page, quarters);
  await keepButton(page).click();
  await confirmButton(page).click();
  await expect(await decisionRecord(page, quarters)).toContainText('維持原本安排');
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await reopenAndContinue(page);
  await expect(await decisionRecord(page, quarters)).toContainText('維持原本安排');

  await editQuestion(page, quarters);
  const pressed = await Promise.all((await allocationCells(page).all()).map(cell => cell.getByRole('button', { pressed: true }).textContent()));
  expect(pressed, 'a kept answer reopens on the current arrangement').toEqual(['領固定月薪', '領固定月薪', '按件接案', '領固定月薪']);
  await confirmButton(page).click();
  await expect(await decisionRecord(page, quarters), 'confirming a reopened kept answer unchanged keeps it').toContainText('維持原本安排');

  await editQuestion(page, quarters);
  await confirmDecision(page, { allocate: [3, 1] });
  expect(await priorityRows(page)).toEqual(['第 1｜自主｜1 次／3 題']);
  await expect(await decisionRecord(page, quarters)).toContainText('按件接案 3 季、領固定月薪 1 季');
});

test('沒確認就離開或重新整理，初始安排不會算成答案', async ({ page }) => {
  await openQuarters(page);
  await keepButton(page).click();
  await reopenAndContinue(page);
  await expect(questionHeading(page)).toHaveText(quarters);
  await expect(confirmButton(page)).toBeDisabled();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await expect(questionHeading(page)).toHaveText(quarters);
  await expect(confirmButton(page)).toBeDisabled();
});

test('初始安排題也能確認目前無法決定：不加次數，紀錄寫成目前無法決定；回到題目按維持這個安排就取消它', async ({ page }) => {
  await startInteractiveScenarios(page);
  const titles = await answerInteractiveByTitle(page, { [quarters]: '目前無法決定' });
  expect(await priorityRows(page)).toEqual([]);
  await expect(page.getByText(`明確決策 0 / ${titles.length} 題`, { exact: true })).toBeVisible();
  await expect(await decisionRecord(page, quarters)).toContainText('目前無法決定');

  await editQuestion(page, quarters);
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(confirmButton(page)).toBeEnabled();
  await keepButton(page).click();
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'false');
  await confirmButton(page).click();
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await expect(await decisionRecord(page, quarters)).toContainText('維持原本安排');

  await editQuestion(page, quarters);
  await undecidedButton(page).click();
  await allocationCells(page).nth(0).getByRole('button', { name: '按件接案' }).click();
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(confirmButton(page), 'a cell edit after 目前無法決定 needs every cell placed again').toBeDisabled();
});
