import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import { answerInteractiveByTitle, priorityRows, resultHeading, startInteractiveScenarios } from './support/interactive';

// The preview's samples: six evenings between a photo zine of one's own (A, 自主) and a friend's interview practice (B, 照顧身邊的人),
// and four weekends that open on a current plan (1 陌生小鎮, 3 熟悉路線).
const evenings = '六個晚上，留給誰？';
const weekends = '四個週末，照原本排的走嗎？';

const reflection = (page: Page) => page.getByRole('region', { name: '回想一題（可略過）' });
const questionPicker = (page: Page) => reflection(page).getByLabel('選一題有感的情境');
const noteField = (page: Page) => reflection(page).getByLabel('反思筆記（可不填）');

/** Picks the reflection question by its title, wherever it falls in the round (options read 「第 N 題：title」). */
async function pickQuestion(page: Page, title: string) {
  const label = await questionPicker(page).getByRole('option').filter({ hasText: new RegExp(`^第 \\d+ 題：${title}$`) }).textContent();
  await questionPicker(page).selectOption({ label: label! });
}

test('反思步驟可以略過；自選一題後帶出那題的情境與原始決策', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [evenings]: { allocate: [4, 2] } });
  // Nothing is picked or required: the step only offers a question to look back on.
  await expect(questionPicker(page)).toHaveValue('');
  await expect(noteField(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: '重新開始' })).toBeEnabled();

  await pickQuestion(page, evenings);
  await expect(reflection(page)).toContainText('你有六個可以自由安排的晚上');
  await expect(reflection(page)).toContainText('做攝影小誌 4 晚、陪朋友練面試 2 晚');
  await expect(reflection(page)).toContainText('這次情境選擇與原先排序一致');
  await expect(reflection(page)).toContainText(/情境條件/);
  await expect(reflection(page)).toContainText(/原先的排序/);
  await expect(reflection(page)).toContainText(/下次/);
  await expect(noteField(page)).toHaveValue('');
});

test('反思筆記存在本機，重新整理後還在，不改寫原始紀錄、次數或排名', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [evenings]: { allocate: [4, 2] } });
  const before = await priorityRows(page);
  await pickQuestion(page, evenings);
  await noteField(page).fill('朋友沒有急事，所以我才先顧自己的小誌。');

  await page.reload();
  await expect(resultHeading(page)).toBeVisible();
  await expect(questionPicker(page)).toHaveValue(/.+/);
  await expect(noteField(page)).toHaveValue('朋友沒有急事，所以我才先顧自己的小誌。');
  expect(await priorityRows(page)).toEqual(before);
  await expect(reflection(page)).toContainText('做攝影小誌 4 晚、陪朋友練面試 2 晚');
});

for (const action of ['重新開始', '清除本機作答紀錄'] as const) {
  test(`「${action}」一併刪除反思筆記`, async ({ page }) => {
    await startInteractiveScenarios(page);
    await answerInteractiveByTitle(page, { [evenings]: { allocate: [4, 2] } });
    await pickQuestion(page, evenings);
    await noteField(page).fill('下次想先問朋友需要幾晚。');

    await page.getByRole('button', { name: action }).click();
    await page.reload();
    await startInteractiveScenarios(page);
    await answerInteractiveByTitle(page, { [evenings]: { allocate: [4, 2] } });
    await expect(questionPicker(page)).toHaveValue('');
    await pickQuestion(page, evenings);
    await expect(noteField(page)).toHaveValue('');
  });
}

test('反思步驟照實帶出調整題的決策：維持原本安排或調整後的次數', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [weekends]: '維持初始安排' });
  await pickQuestion(page, weekends);
  await expect(reflection(page)).toContainText('你當時的決策：維持原本安排');

  await page.getByRole('button', { name: '重新開始' }).click();
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [weekends]: { allocate: [3, 1] } });
  await pickQuestion(page, weekends);
  await expect(reflection(page)).toContainText('去陌生小鎮體驗 3 個週末、走熟悉的路線 1 個週末');
  await expect(reflection(page)).not.toContainText('維持原本安排');
});

test('手機上反思步驟不橫向捲動，控制項夠大', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [evenings]: '目前無法決定' });
  await pickQuestion(page, evenings);
  await expect(reflection(page)).toContainText('目前無法決定');
  await expectNoHorizontalScroll(page);
  await expectTouchTargets(reflection(page));
});
