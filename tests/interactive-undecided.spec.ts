import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { allocationCells, answerInteractiveByTitle, confirmButton, confirmDecision, editQuestion, priorityRows, resultHeading, startInteractiveScenarios, undecidedButton } from './support/interactive';

// The round's first question at Math.random 0: six days of a trip, each planned by oneself (A, 自主) or spent on a fixed day tour
// (B, 安全穩定). The round's other questions are answered 目前無法決定 unless a test says otherwise.
const trip = '六天的旅程，哪幾天自己排？';

/** Answers every remaining question with a direction: card A on a 選方案 question, every cell to side A otherwise. Returns how many. */
async function answerAllWithDirection(page: Page) {
  let answered = 0;
  while (!await resultHeading(page).isVisible()) {
    const cells = await allocationCells(page).count();
    await confirmDecision(page, cells ? { allocate: [cells, 0] } : '選 A');
    answered += 1;
  }
  return answered;
}

test('目前無法決定也要確認才算數，兩側都不加次數，也不產生第二幕排名', async ({ page }) => {
  await startInteractiveScenarios(page);
  await undecidedButton(page).click();
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: trip, exact: true })).toBeVisible();
  await confirmButton(page).click();
  await answerInteractiveByTitle(page);
  expect(await priorityRows(page)).toEqual([]);
  await expect(page.getByText('這次沒有方向明確的決策，不產生第二幕排名。')).toBeVisible();
});

test('重新整理保留已確認的目前無法決定，回到題目時仍標示；改去安排格子就取消它', async ({ page }) => {
  await startInteractiveScenarios(page);
  const titles = await answerInteractiveByTitle(page, { [trip]: '目前無法決定' });
  await page.reload();
  await expect(page.getByText(`明確決策 0 / ${titles.length} 題`)).toBeVisible();
  await editQuestion(page, trip);
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(confirmButton(page)).toBeEnabled();
  await allocationCells(page).first().getByRole('button').first().click();
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(confirmButton(page)).toBeDisabled();
});

test('結果一律顯示明確決策題數；平均分配與目前無法決定不計入時補一句說明', async ({ page }) => {
  await startInteractiveScenarios(page);
  const total = await answerAllWithDirection(page);
  await expect(page.getByText(`明確決策 ${total} / ${total} 題`, { exact: true })).toBeVisible();
  await expect(page.getByText(/不計入/)).toHaveCount(0);

  await editQuestion(page, trip);
  await answerInteractiveByTitle(page, { [trip]: '平均分配' });
  await expect(page.getByText(`明確決策 ${total - 1} / ${total} 題`, { exact: true })).toBeVisible();
  await expect(page.getByText('平均分配和目前無法決定的 1 題沒有方向，不計入優先保留次數。')).toBeVisible();
});
