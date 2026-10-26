import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { confirmDecision, startInteractiveScenarios } from './support/interactive';
import { chosenColumn, corruptHeading as corrupt, expectUnreadable, statedColumn, unsupportedHeading as unsupported } from './support/result-share';
import { resultLinksV1 } from './support/result-links-v1';
import { noScores, resultLinksV2 } from './support/result-links-v2';

// Format version 2 came from the five-step version, whose questions and answer controls are gone (#71). Its links are still read as shared.
const recipientScores = '分享者在情境中的偏向分數';
const scoringNote = '強烈偏向給該側 2 分，稍微偏向給該側 1 分，兩者相當兩側都是 0 分。這只是計分方式，2 分不代表偏好多一倍，也不是百分比。';
const legacyScoring = '這份結果使用舊版計分：第二幕依偏向一邊的答案次數排名，不是偏向分數。';
/** The five-step bank the site launched with: fifteen slots of three variants. */
const launchCatalog = 'c2gdvoe';
const launchPlan = (...leading: string[]) => [...leading, ...Array(15 - leading.length).fill('0')].join('-');
const scoreColumn = (page: Page) => page.getByRole('heading', { name: recipientScores, exact: true }).locator('..');
const storageSnapshot = (page: Page) => page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));

test('格式版本 2 的定版範例連結：全零分、超過三個並列、第一幕並列和自訂價值都照分享當時顯示', async ({ page }) => {
  for (const link of Object.values(resultLinksV2)) {
    await page.goto('/' + link.fragment);
    await expect(page.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
    await expect(statedColumn(page).getByRole('listitem')).toHaveText(link.stated);
    await expect(scoreColumn(page).getByRole('listitem')).toHaveText(link.scored);
    if (!link.scored.length) await expect(scoreColumn(page).getByText(noScores, { exact: true })).toBeVisible();
    await expect(page.getByText(scoringNote)).toBeVisible();
    await expect(page.getByText('結果連結版本 2：五段分數', { exact: true })).toBeVisible();
    const custom = page.getByRole('heading', { name: '分享者的自訂價值' }).locator('..').getByRole('listitem');
    await expect(custom).toHaveText('custom' in link ? link.custom : []);
  }
});

test('舊版結果連結標明舊版計分，次數與排名不重算', async ({ page }) => {
  const link = resultLinksV1.general;
  await page.goto('/' + link.fragment);
  await expect(chosenColumn(page).getByRole('listitem')).toHaveText(link.chosen);
  await expect(page.getByText(legacyScoring)).toBeVisible();
  await expect(page.getByText(scoringNote)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: recipientScores })).toHaveCount(0);
});

test('五段偏向題已移除，格式版本 2 的連結不再提供用同一份題目作答，改提供用目前題目開始', async ({ page }) => {
  for (const fragment of [resultLinksV2.fixedFlowAtRelease.fragment, resultLinksV2.fixedFlow.fragment]) {
    await page.goto('/' + fragment);
    await expect(scoreColumn(page).getByRole('listitem')).toHaveText(resultLinksV2.fixedFlow.scored);
    await expect(page.getByRole('button', { name: '用同一份題目作答' })).toHaveCount(0);
    await expect(page.getByText('這是分享者自己作答的結果。你可以閱讀，也可以用目前的題目自己作答；你的答案會另外保存在你的瀏覽器，不會改到這份結果。')).toBeVisible();
    await expect(page.getByText(/同一份題目作答/)).toHaveCount(0);
    await expect(page.getByText('這份結果用的是舊版題目。題庫已經更新，沒辦法再做同一份題目。')).toBeVisible();
  }
  await page.getByRole('button', { name: '用目前題目開始' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /你重視什麼/ })).toBeVisible();
  expect(new URL(page.url()).hash).toBe('');
});

test('打開格式版本 2 的結果連結不讀也不寫本機的作答紀錄', async ({ page }) => {
  await startInteractiveScenarios(page);
  await confirmDecision(page, '目前無法決定');
  const before = await storageSnapshot(page);
  expect(before).not.toBe('[]');
  await page.goto('/' + resultLinksV2.fixedFlow.fragment);
  await expect(page.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
  await page.reload();
  await expect(scoreColumn(page).getByRole('listitem')).toHaveText(resultLinksV2.fixedFlow.scored);
  expect(await storageSnapshot(page)).toBe(before);
  await page.goto('/');
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
});

// Each case breaks exactly one rule of an otherwise valid link (docs/result-share-spec.md「格式版本 2」); an old catalog keeps the plan's own length as the question count.
const v2 = (scored: string, v = 'c0ld', plan = '0-0-0-0-0-0-0-0-0') => `#r=2.autonomy~stimulation~hedonism.${scored}..${v}.${plan}`;

test('格式版本 2 的任何一條合法性規則不通過，整份結果都不顯示', async ({ page }) => {
  const cases: Record<string, string> = {
    '0 分列入名次': v2('0-care'),
    '分數補前導 0': v2('02-care'),
    '大寫的分數': v2('C-care'),
    '分數超過題數的 2 倍': v2('j-care'),
    '兩列分數相同': v2('2-care~2-fairness'),
    '分數由小到大': v2('1-care~2-fairness'),
    '多出第 4 名': v2('4-care~3-fairness~2-security~1-tradition'),
    '同一欄重複的 id': v2('2-care~1-care'),
    '不認得的 id': v2('2-freedom'),
    '名次列沒有 id': v2('2'),
    '用舊版次數寫法': v2('3-3-care'),
    '欄位數不對': v2('2-care') + '.0',
    '上線題庫、題組對不到題庫': v2('2-care', launchCatalog, launchPlan('3')),
    '上線題庫、題數不對': v2('2-care', launchCatalog, launchPlan().slice(2)),
  };
  for (const [rule, fragment] of Object.entries(cases)) await expectUnreadable(page, fragment, corrupt).catch(error => { throw new Error(`${rule}：${error.message}`); });
  await expectUnreadable(page, '#r=5' + resultLinksV2.fixedFlow.fragment.slice('#r=2'.length), unsupported);
});

test('格式版本 2 的分數剛好等於題數的 2 倍，是合法的結果；上線題庫的其他變體也照常顯示', async ({ page }) => {
  // Nine questions: 18 (i) passes, while「分數超過題數的 2 倍」above uses 19 (j).
  await page.goto('/' + v2('i-care~1-fairness'));
  await expect(scoreColumn(page).getByRole('listitem')).toHaveText(['第 1照顧身邊的人18 分', '第 2普遍關懷1 分']);
  await page.goto('/' + v2('2-care', launchCatalog, launchPlan('2', '1')));
  await expect(scoreColumn(page).getByRole('listitem')).toHaveText(['第 1照顧身邊的人2 分']);
});
