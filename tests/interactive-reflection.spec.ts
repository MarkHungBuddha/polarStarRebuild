import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import { answerInteractiveByTitle, priorityRows, resultHeading, startInteractiveScenarios, reopenAndContinue } from './support/interactive';

// Questions of the round Math.random 0 draws: six days of a trip, each planned by oneself (A, 自主) or spent on a fixed day tour
// (B, 安全穩定), and four weekend afternoons that open on a current plan (3 走自己的路線, 1 陪長輩整理相片). Every other question
// is answered 目前無法決定.
const trip = '六天的旅程，哪幾天自己排？';
const afternoons = '這個月的週末下午，照原本排的嗎？';

const reflection = (page: Page) => page.getByRole('region', { name: '回想一題（可略過）' });
const questionPicker = (page: Page) => reflection(page).getByLabel('選一題想再看一次的情境');
const noteField = (page: Page) => reflection(page).getByLabel('反思筆記（可不填）');
const directionPicker = (page: Page) => reflection(page).getByLabel('從哪個方向想（可不選）');
const prompts = { 情境條件: '是這題的情境條件，讓你做了這個決定嗎？', 原先排序: '原先的排序，是不是需要調整？', 下次做法: '下次遇到類似的情況，想換個做法嗎？' };

/** Picks the reflection question by its title, wherever it falls in the round (options read 「第 N 題：title」). */
async function pickQuestion(page: Page, title: string) {
  const label = await questionPicker(page).getByRole('option').filter({ hasText: new RegExp(`^第 \\d+ 題：${title}$`) }).textContent();
  await questionPicker(page).selectOption({ label: label! });
}

test('反思步驟可以略過；自選一題後帶出那題的情境與原始決策', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } });
  // Nothing is picked or required: the step only offers a question to look back on.
  await expect(questionPicker(page)).toHaveValue('');
  await expect(noteField(page)).toHaveCount(0);
  await expect(reflection(page).getByText('想再看哪一題，可以挑出來。這一步可以略過，不影響結果。', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '重新開始' })).toBeEnabled();

  await pickQuestion(page, trip);
  await expect(reflection(page)).toContainText('住宿已經訂好');
  await expect(reflection(page)).toContainText('自己排行程 4 天、跟一日團 2 天');
  await expect(reflection(page)).toContainText('這次情境選擇與原先排序一致');
  await expect(noteField(page)).toHaveValue('');

  // The person may pick one of three directions to think from; only that direction's prompt shows.
  await expect(directionPicker(page)).toHaveValue('');
  for (const prompt of Object.values(prompts)) await expect(reflection(page).getByText(prompt)).toHaveCount(0);
  for (const [direction, prompt] of Object.entries(prompts)) {
    await directionPicker(page).selectOption({ label: direction });
    await expect(reflection(page).getByText(prompt, { exact: true })).toBeVisible();
    for (const other of Object.values(prompts).filter(item => item !== prompt)) await expect(reflection(page).getByText(other)).toHaveCount(0);
  }
});

test('反思筆記存在本機，重新整理後還在，不改寫原始紀錄、次數或排名', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } });
  const before = await priorityRows(page);
  await pickQuestion(page, trip);
  await directionPicker(page).selectOption({ label: '情境條件' });
  await noteField(page).fill('臨時狀況不多，所以我多排了幾天自己走。');

  await reopenAndContinue(page);
  await expect(reflection(page).getByText(prompts.情境條件, { exact: true })).toBeVisible();
  await expect(resultHeading(page)).toBeVisible();
  await expect(questionPicker(page)).toHaveValue(/.+/);
  await expect(noteField(page)).toHaveValue('臨時狀況不多，所以我多排了幾天自己走。');
  expect(await priorityRows(page)).toEqual(before);
  await expect(reflection(page)).toContainText('自己排行程 4 天、跟一日團 2 天');
});

for (const action of ['重新開始', '清除本機作答紀錄'] as const) {
  test(`「${action}」一併刪除反思筆記`, async ({ page }) => {
    await startInteractiveScenarios(page);
    await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } });
    await pickQuestion(page, trip);
    await noteField(page).fill('下次想先查一日團去哪些地方。');

    await page.getByRole('button', { name: action }).click();
    await page.reload();
    await startInteractiveScenarios(page);
    // 重新開始 keeps the seen history, so the next round may draw other variants; any of its questions shows an empty note.
    const [first] = await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } });
    await expect(questionPicker(page)).toHaveValue('');
    await pickQuestion(page, first);
    await expect(noteField(page)).toHaveValue('');
  });
}

test('反思步驟照實帶出調整題的決策：維持原本安排或調整後的次數', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [afternoons]: '維持初始安排' });
  await pickQuestion(page, afternoons);
  await expect(reflection(page)).toContainText('你當時的決策：維持原本安排');

  // Clearing also resets the seen history, so the next round draws the same questions again.
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [afternoons]: { allocate: [1, 3] } });
  await pickQuestion(page, afternoons);
  await expect(reflection(page)).toContainText('走自己的路線 1 個下午、陪長輩整理相片 3 個下午');
  await expect(reflection(page)).not.toContainText('維持原本安排');
});

test('手機上反思步驟不橫向捲動，控制項夠大', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: '目前無法決定' });
  await pickQuestion(page, trip);
  await expect(reflection(page)).toContainText('目前無法決定');
  await expectNoHorizontalScroll(page);
  await expectTouchTargets(reflection(page));
});
