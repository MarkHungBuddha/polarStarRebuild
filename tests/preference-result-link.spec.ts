import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { classifyAndRankValues } from './support/experience';
import { answerPreferences, scoreColumn, startPreferencePreview } from './support/preference';
import { chosenColumn, corruptHeading as corrupt, expectUnreadable, shareRegion, statedColumn, unsupportedHeading as unsupported } from './support/result-share';
import { resultLinksV1 } from './support/result-links-v1';
import { noScores, resultLinksV2, resultLinksV2Catalog } from './support/result-links-v2';
import { preferencePreviewCatalog, preferencePreviewVersion } from '../src/preferencePreview';

const sharerScores = '情境中的偏向分數';
const recipientScores = '分享者在情境中的偏向分數';
const scoringNote = '強烈偏向給該側 2 分，稍微偏向給該側 1 分，兩者相當兩側都是 0 分。這是產品計分約定，不表示偏好強度具有兩倍關係，也不是百分比。';
const legacyScoring = '這份結果使用舊版計分：第二幕依偏向一邊的答案次數排名，不是偏向分數。';
// Slots 1–4 (自主／安全穩定, 自主／遵守規範, 自主／照顧身邊的人, 探索刺激／安全穩定); every later question is 兩者相當.
const fixedLeans = ['強烈偏向 B', '強烈偏向 A', '稍微偏向 B', '稍微偏向 B'] as const;

/** PREVIEW ONLY (until #56): today's preview slots, and a plan over them that starts with `leading` and draws the first variant elsewhere. */
const previewSlots = new Set(preferencePreviewCatalog.scenarios.map(scenario => scenario.slotId)).size;
const previewPlan = (...leading: string[]) => [...leading, ...Array(previewSlots - leading.length).fill('0')].join('-');
/** A published version 2 link (all first variants) opened against today's preview catalog, so its question set is still reproducible. */
const currentPreview = (fragment: string) => fragment.slice(0, fragment.lastIndexOf(`.${resultLinksV2Catalog}.`)) + `.${preferencePreviewVersion}.${previewPlan()}`;
const storageSnapshot = (page: Page) => page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));

test('新版結果連結在別人的瀏覽器打開，偏向分數、並列和名次都和本人結果相同', async ({ page, browser }) => {
  await startPreferencePreview(page);
  await answerPreferences(page, fixedLeans, '兩者相當');
  const link = await shareRegion(page).getByRole('textbox', { name: '結果連結' }).inputValue();
  const stated = await page.getByRole('region', { name: '你的前三名' }).getByRole('list').nth(0).getByRole('listitem').allTextContents();
  const scores = await scoreColumn(page, sharerScores).getByRole('listitem').allTextContents();
  expect(scores).toEqual(resultLinksV2.fixedFlow.scored);
  // Only the conclusion travels: the same answers give exactly the published link, without per-question answers or the full first-act order.
  expect(new URL(link).search).toBe('');
  expect(new URL(link).hash).toBe(currentPreview(resultLinksV2.fixedFlow.fragment));
  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto(link);
  await expect(statedColumn(fresh).getByRole('listitem')).toHaveText(stated);
  await expect(scoreColumn(fresh, recipientScores).getByRole('listitem')).toHaveText(scores);
  await expect(fresh.getByText(scoringNote)).toBeVisible();
  await expect(fresh.getByText(legacyScoring)).toHaveCount(0);
  await fresh.context().close();
});

test('新版定版範例連結的全零分、超過三個並列、第一幕並列和自訂價值都照分享當時顯示', async ({ page }) => {
  for (const link of Object.values(resultLinksV2)) {
    await page.goto('/' + link.fragment);
    await expect(page.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
    await expect(statedColumn(page).getByRole('listitem')).toHaveText(link.stated);
    await expect(scoreColumn(page, recipientScores).getByRole('listitem')).toHaveText(link.scored);
    if (!link.scored.length) await expect(scoreColumn(page, recipientScores).getByText(noScores, { exact: true })).toBeVisible();
    await expect(page.getByText(scoringNote)).toBeVisible();
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

test('分享者逐項選擇自訂價值；新版結果暫時只提供結果連結，結果圖按鈕不能用', async ({ page }) => {
  await page.goto('/?experience=preference');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const word of ['保有獨處的時間', '這就是我', '不分享的']) {
    await page.getByRole('textbox', { name: '自訂價值' }).fill(word);
    await page.getByRole('button', { name: '新增價值' }).click();
  }
  for (const group of await page.getByRole('group', { name: /的重要性$/ }).all()) await group.getByRole('button', { name: '這就是我', exact: true }).click();
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerPreferences(page, fixedLeans, '兩者相當');
  const share = shareRegion(page);
  const custom = share.getByRole('group', { name: '也分享自訂價值' });
  for (const word of ['保有獨處的時間', '這就是我', '不分享的']) await expect(custom.getByRole('checkbox', { name: word })).not.toBeChecked();
  await custom.getByRole('checkbox', { name: '保有獨處的時間' }).check();
  await custom.getByRole('checkbox', { name: '這就是我' }).check();
  const link = await share.getByRole('textbox', { name: '結果連結' }).inputValue();
  expect(new URL(link).hash).toMatch(/^#r=2\.[^.]+\.[^.]*\.5L-d5pyJ542o6JmV55qE5pmC6ZaT~6YCZ5bCx5piv5oiR\./);

  await expect(share.getByRole('img')).toHaveCount(0);
  for (const name of ['分享結果', '下載結果圖']) {
    await expect(share.getByRole('button', { name })).toHaveAttribute('aria-disabled', 'true');
    await share.getByRole('button', { name }).focus();
    await share.getByRole('button', { name }).press('Enter');
    await expect(share.getByRole('status')).toHaveText('新版結果暫時不能產生結果圖，可以先複製結果連結。');
  }
});

test('原題組還能重現時用同一份題目作答；題庫不同時改提供用目前題目開始', async ({ page }) => {
  // Slot 1's third variant and slot 2's second: the fixed randomness alone would draw the first of each.
  await page.goto('/' + v2('3-security', preferencePreviewVersion, previewPlan('2', '1')));
  await page.getByRole('button', { name: '用同一份題目作答' }).click();
  await expect(page).toHaveURL(`/?experience=preference&seed=p.${previewPlan('2', '1').replace(/-/g, '.')}&v=${preferencePreviewVersion}`);
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '五天的旅程，誰來排？' })).toBeVisible();
  await page.getByRole('radio', { name: '兩者相當', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '週末的打掃，照誰的時間？' })).toBeVisible();

  await page.goto('/' + resultLinksV2.fixedFlow.fragment.replace(`.${resultLinksV2Catalog}.`, '.c0ld.'));
  await expect(scoreColumn(page, recipientScores).getByRole('listitem')).toHaveText(resultLinksV2.fixedFlow.scored);
  await expect(page.getByRole('button', { name: '用同一份題目作答' })).toHaveCount(0);
  await expect(page.getByText('這份結果用的是舊版題目。題庫已經更新，沒辦法再做同一份題目。')).toBeVisible();
  await page.getByRole('button', { name: '用目前題目開始' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /你重視什麼/ })).toBeVisible();
  expect(new URL(page.url()).hash).toBe('');
});

test('打開新版結果連結不讀也不寫本機的作答紀錄', async ({ page }) => {
  await startPreferencePreview(page);
  await page.getByRole('radio', { name: '稍微偏向 A', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  const before = await storageSnapshot(page);
  expect(before).not.toBe('[]');
  await page.goto('/' + resultLinksV2.fixedFlow.fragment);
  await expect(page.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
  await page.reload();
  await expect(scoreColumn(page, recipientScores).getByRole('listitem')).toHaveText(resultLinksV2.fixedFlow.scored);
  expect(await storageSnapshot(page)).toBe(before);
  await page.goto('/?experience=preference');
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toBeVisible();
});

// Each case breaks exactly one rule of an otherwise valid link (docs/result-share-spec.md「格式版本 2」); an old catalog keeps the plan's own length as the question count.
const v2 = (scored: string, v = 'c0ld', plan = '0-0-0-0-0-0-0-0-0') => `#r=2.autonomy~stimulation~hedonism.${scored}..${v}.${plan}`;

test('新版格式的任何一條合法性規則不通過，整份結果都不顯示', async ({ page }) => {
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
    '預覽題庫的題組對不到': v2('2-care', preferencePreviewVersion, previewPlan('3')),
    '預覽題庫的題數不對': v2('2-care', preferencePreviewVersion, previewPlan().slice(2)),
  };
  for (const [rule, fragment] of Object.entries(cases)) await expectUnreadable(page, fragment, corrupt).catch(error => { throw new Error(`${rule}：${error.message}`); });
  await expectUnreadable(page, '#r=3' + resultLinksV2.fixedFlow.fragment.slice('#r=2'.length), unsupported);
});

test('新版分數剛好等於題數的 2 倍，是合法的結果', async ({ page }) => {
  // Nine questions: 18 (i) passes, while「分數超過題數的 2 倍」above uses 19 (j).
  await page.goto('/' + v2('i-care~1-fairness'));
  await expect(scoreColumn(page, recipientScores).getByRole('listitem')).toHaveText(['第 1照顧身邊的人18 分', '第 2普遍關懷1 分']);
});
