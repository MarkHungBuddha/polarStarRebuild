import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { classifyAll, confirmCurrentScenario, expectPosition, pressOnHandle, rankValuesInListedOrder } from './support/experience';
import { confirmButton, interactivePreviewPath, questionHeading } from './support/interactive';
import { chosenColumn } from './support/result-share';
import { resultLinksV1 } from './support/result-links-v1';
import { resultLinksV2 } from './support/result-links-v2';

const keptFirstAct = '已沿用你上次的價值分類、排序與自訂價值。第二幕已經改版，舊版的答案不會換算成新版，請重新作答第二幕。';
const unusableLegacy = '上次留下的作答紀錄來自舊版或已經損壞，無法沿用，這次從頭開始。舊版的答案不會換算成新版。';

/** Leaves a five-step record the way a user would: a custom value, 安全穩定 ranked first, and one confirmed five-step answer. */
async function answerFiveStepVersion(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await rankValuesInListedOrder(page);
  await pressOnHandle(page, '安全穩定', 'Home');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await confirmCurrentScenario(page);
}

test('五段偏向版的紀錄只沿用第一幕：分類、排序與自訂價值保留，第二幕重新作答', async ({ page }) => {
  await answerFiveStepVersion(page);
  await page.goto(interactivePreviewPath);
  await expect(page.getByRole('status').filter({ hasText: keptFirstAct })).toBeVisible();
  await expect(questionHeading(page)).toHaveText('六個晚上，留給誰？');
  // Nothing from the five-step answers is carried over as an interactive answer.
  await expect(confirmButton(page)).toBeDisabled();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expectPosition(page, '安全穩定', 1);
  await expectPosition(page, '創作', 2);
  // The carried first act is now the interactive record: reopening resumes it without the notice.
  await page.reload();
  await expect(page.getByText(keptFirstAct)).toHaveCount(0);
  await expectPosition(page, '創作', 2);
});

// Opaque stand-ins for a damaged record or one an earlier version left; they do not mirror any record format.
for (const [name, key, notice] of [
  ['損壞的五段偏向版紀錄', 'polarstar.session.v2', unusableLegacy],
  ['混合機制題庫留下的紀錄', 'polarstar.session.v1', unusableLegacy],
  ['損壞的互動版紀錄', 'polarstar.session.v3', '先前的作答紀錄無法讀取或題目已改版，這次從頭開始；重新作答後會取代它。'],
] as const) {
  test(`${name}不會被當成可以續答的答案，並說明原因`, async ({ page }) => {
    await page.addInitScript(storageKey => localStorage.setItem(storageKey, 'damaged{'), key);
    await page.goto(interactivePreviewPath);
    await expect(page.getByRole('status')).toHaveText(notice);
    await page.getByRole('button', { name: '開始這次反思' }).click();
    await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(10);
  });
}

test('題庫版本不同的舊題目連結說明無法重現原本的題組，提供用目前題目開始', async ({ page }) => {
  // A question link the five-step version shared: its catalog version is not the interactive bank's.
  await page.goto(`${interactivePreviewPath}&seed=p.1.0.2.0.1.0.2.0.1.0.2.0.1.0.2&v=c1oezm4`);
  const outdated = page.getByRole('status').filter({ hasText: '這份題目連結建立後，題目已經改版，無法重現原本的題組。你可以用目前題目開始。' });
  await expect(outdated).toBeVisible();
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeDisabled();
  await page.getByRole('button', { name: '用目前題目開始' }).click();
  await expect(outdated).toHaveCount(0);
  await expect(page).toHaveURL(interactivePreviewPath);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(10);
});

test('清除本機作答紀錄同時刪除新舊版本的作答與已看紀錄，重新開啟不再沿用', async ({ page }) => {
  await answerFiveStepVersion(page);
  await page.evaluate(() => {
    localStorage.setItem('polarstar.session.v1', 'earlier bank');
    localStorage.setItem('polarstar.seen.v1', 'earlier bank');
  });
  await page.goto(interactivePreviewPath);
  await expect(questionHeading(page)).toBeVisible();
  const records = () => page.evaluate(() => Object.keys(localStorage).filter(key => /^polarstar\.(session|seen|interactive)/.test(key)).sort());
  expect(await records()).toEqual(['polarstar.seen.v1', 'polarstar.seen.v2', 'polarstar.session.v1', 'polarstar.session.v2', 'polarstar.session.v3']);
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  expect(await records()).toEqual([]);
  await page.reload();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(10);
});

test('已發布的 v1、v2 結果連結照原規則顯示，並標明結果連結版本', async ({ page }) => {
  await page.goto('/' + resultLinksV1.general.fragment);
  await expect(chosenColumn(page).getByRole('listitem')).toHaveText(resultLinksV1.general.chosen);
  await expect(page.getByText('結果連結版本 1：選邊次數', { exact: true })).toBeVisible();
  await page.goto('/' + resultLinksV2.fixedFlowAtRelease.fragment);
  await expect(page.getByRole('heading', { name: '分享者在情境中的偏向分數' }).locator('..').getByRole('listitem')).toHaveText(resultLinksV2.fixedFlowAtRelease.scored);
  await expect(page.getByText('結果連結版本 2：五段分數', { exact: true })).toBeVisible();
  await expect(page.getByText('結果連結版本 1：選邊次數')).toHaveCount(0);
});

test('在結果連結頁清除本機作答紀錄，也刪除互動版的作答紀錄', async ({ page }) => {
  await page.goto(interactivePreviewPath);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await page.goto('/' + resultLinksV2.fixedFlowAtRelease.fragment);
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  await page.goto(interactivePreviewPath);
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeVisible();
  await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(0);
});
