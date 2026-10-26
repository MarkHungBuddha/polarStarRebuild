import { expect, test } from './support/fixtures';
import { allocationCells, answerInteractiveByTitle, confirmButton, editQuestion, priorityRows, startInteractiveScenarios, undecidedButton } from './support/interactive';

// The preview's sample: six evenings between a photo zine of one's own (A, 自主) and a friend's interview practice (B, 照顧身邊的人).
const evenings = '六個晚上，留給誰？';

test('目前無法決定也要確認才算數，兩側都不加次數，也不產生第二幕排名', async ({ page }) => {
  await startInteractiveScenarios(page);
  await undecidedButton(page).click();
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: evenings, exact: true })).toBeVisible();
  await confirmButton(page).click();
  expect(await priorityRows(page)).toEqual([]);
  await expect(page.getByText('這次沒有方向明確的決策，不產生第二幕排名。')).toBeVisible();
});

test('重新整理保留已確認的目前無法決定，回到題目時仍標示；改去安排格子就取消它', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [evenings]: '目前無法決定' });
  await page.reload();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
  await editQuestion(page, evenings);
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(confirmButton(page)).toBeEnabled();
  await allocationCells(page).first().getByRole('button').first().click();
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(confirmButton(page)).toBeDisabled();
});

test('結果一律顯示明確決策題數；平均分配與目前無法決定不計入時補一句說明', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [evenings]: { allocate: [4, 2] } });
  await expect(page.getByText('明確決策 1 / 1 題', { exact: true })).toBeVisible();
  await expect(page.getByText(/不計入/)).toHaveCount(0);

  await editQuestion(page, evenings);
  await answerInteractiveByTitle(page, { [evenings]: '平均分配' });
  await expect(page.getByText('明確決策 0 / 1 題', { exact: true })).toBeVisible();
  await expect(page.getByText('平均分配和目前無法決定的 1 題沒有方向，不計入優先保留次數。')).toBeVisible();
});
