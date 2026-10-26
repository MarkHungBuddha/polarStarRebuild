import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { answerInteractiveByTitle, interactivePreviewPath, startInteractiveScenarios } from './support/interactive';
import { corruptHeading as corrupt, expectUnreadable, shareRegion, statedColumn, unsupportedHeading as unsupported } from './support/result-share';
import { noRanking, resultLinksV3, resultLinksV3Catalog } from './support/result-links-v3';
import { interactiveCatalog } from '../src/interactiveCatalog';

// The round's first question at Math.random 0: six days of a trip, each planned by oneself (A, 自主) or spent on a fixed day tour
// (B, 安全穩定). Every other question is answered 目前無法決定.
const trip = '六天的旅程，哪幾天自己排？';
const recipientCounts = '分享者在情境中優先保留的';
const versionLabel = '結果連結版本 3：優先保留次數';

/** The second column of a top-three conclusion, found by its heading. */
const countColumn = (page: Page, heading: string) => page.getByRole('heading', { name: heading, exact: true }).locator('..');

/** Today's interactive bank has this many slots; a plan over it draws the first variant everywhere. */
const slotCount = new Set(interactiveCatalog.scenarios.map(scenario => scenario.slotId)).size;
/** A published version 3 link written against the bank of its day, swapped onto today's bank and all-first-variant plan. */
const current = (fragment: string) => fragment.slice(0, fragment.lastIndexOf(`.${resultLinksV3Catalog}.`)) + `.${interactiveCatalog.version}.${Array(slotCount).fill('0').join('-')}`;

test('互動結果連結在別人的瀏覽器打開，前三名、次數和明確決策題數都和本人結果相同', async ({ page, browser }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } });
  const own = page.getByRole('region', { name: '你的前三名' });
  const stated = await own.getByRole('list').nth(0).getByRole('listitem').allTextContents();
  const counted = await countColumn(page, '情境中優先保留的').getByRole('listitem').allTextContents();
  const decided = await own.locator('.decided-count').textContent();
  expect(counted).toEqual(resultLinksV3.fixedFlow.counted);
  // The sample was shared from a one-question bank; today's bank may hold more questions, all answered without a direction.
  expect(decided).toBe(`明確決策 1 / ${slotCount} 題`);

  const link = await shareRegion(page).getByRole('textbox', { name: '結果連結' }).inputValue();
  // Only the conclusion travels: fixed answers give exactly the published link, with no per-question arrangement or full first-act order.
  expect(new URL(link).search).toBe('');
  expect(new URL(link).hash).toBe(current(resultLinksV3.fixedFlow.fragment));

  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto(link);
  await expect(statedColumn(fresh).getByRole('listitem')).toHaveText(stated);
  await expect(countColumn(fresh, recipientCounts).getByRole('listitem')).toHaveText(counted);
  await expect(fresh.getByText(decided!, { exact: true })).toBeVisible();
  await expect(fresh.getByText(versionLabel)).toBeVisible();
  await fresh.context().close();
});

test('互動定版範例連結的並列、無排名、第一幕並列和自訂價值都照分享當時顯示，並標明版本與整理方式', async ({ page }) => {
  for (const link of Object.values(resultLinksV3)) {
    await page.goto('/' + link.fragment);
    await expect(page.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
    await expect(statedColumn(page).getByRole('listitem')).toHaveText(link.stated);
    await expect(countColumn(page, recipientCounts).getByRole('listitem')).toHaveText(link.counted);
    if (!link.counted.length) await expect(countColumn(page, recipientCounts).getByText(noRanking, { exact: true })).toBeVisible();
    await expect(page.getByText(link.decided, { exact: true })).toBeVisible();
    await expect(page.getByText(versionLabel)).toBeVisible();
    await expect(page.getByText(/平均分配和目前無法決定都不加次數/)).toBeVisible();
    await expect(page.getByText(/偏向分數|舊版計分/)).toHaveCount(0);
    const custom = page.getByRole('heading', { name: '分享者的自訂價值' }).locator('..').getByRole('listitem');
    await expect(custom).toHaveText('custom' in link ? link.custom : []);
  }
});

test('沒有方向明確的決策時，收件者頁和本人結果一樣不產生第二幕排名', async ({ page, browser }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: '目前無法決定' });
  await expect(countColumn(page, '情境中優先保留的').getByText(noRanking, { exact: true })).toBeVisible();
  const link = await shareRegion(page).getByRole('textbox', { name: '結果連結' }).inputValue();
  expect(new URL(link).hash).toBe(current(resultLinksV3.noRanking.fragment.replace('.c0ld.', `.${resultLinksV3Catalog}.`)));
  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto(link);
  await expect(countColumn(fresh, recipientCounts).getByText(noRanking, { exact: true })).toBeVisible();
  await expect(countColumn(fresh, recipientCounts).getByRole('listitem')).toHaveCount(0);
  await expect(fresh.getByText(`明確決策 0 / ${slotCount} 題`, { exact: true })).toBeVisible();
  // Today's bank still holds the questions, so the page does not call them old.
  await expect(fresh.getByText(/舊版題目/)).toHaveCount(0);
  await fresh.context().close();
});

test('分享者逐項選擇自訂價值，勾選的才放進互動結果連結', async ({ page }) => {
  await page.goto(interactivePreviewPath);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const word of ['保有獨處的時間', '這就是我', '不分享的']) {
    await page.getByRole('textbox', { name: '自訂價值' }).fill(word);
    await page.getByRole('button', { name: '新增價值' }).click();
  }
  for (const group of await page.getByRole('group', { name: /的重要性$/ }).all()) await group.getByRole('button', { name: '這就是我', exact: true }).click();
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } });
  const custom = shareRegion(page).getByRole('group', { name: '也分享自訂價值' });
  for (const word of ['保有獨處的時間', '這就是我', '不分享的']) await expect(custom.getByRole('checkbox', { name: word })).not.toBeChecked();
  await custom.getByRole('checkbox', { name: '保有獨處的時間' }).check();
  await custom.getByRole('checkbox', { name: '這就是我' }).check();
  const link = await shareRegion(page).getByRole('textbox', { name: '結果連結' }).inputValue();
  expect(new URL(link).hash).toMatch(/^#r=3\.[^.]+\.[^.]*\.1\.5L-d5pyJ542o6JmV55qE5pmC6ZaT~6YCZ5bCx5piv5oiR\./);
});

// Each case breaks exactly one rule of an otherwise valid link (docs/result-share-spec.md「格式版本 3」); an earlier bank keeps the plan's own length as the question count.
const v3 = (counted: string, decided = '9', v = 'c0ld', plan = '0-0-0-0-0-0-0-0-0') => `#r=3.autonomy~stimulation~hedonism.${counted}.${decided}..${v}.${plan}`;

test('互動格式的任何一條合法性規則不通過，整份結果都不顯示', async ({ page }) => {
  const cases: Record<string, string> = {
    '0 次列入名次': v3('0-care'),
    '次數補前導 0': v3('02-care'),
    '次數超過 3': v3('4-care'),
    '兩列次數相同': v3('2-care~2-fairness'),
    '次數由小到大': v3('1-care~2-fairness'),
    '多出第 4 名': v3('3-care~2-fairness-security~1-tradition'),
    '同一欄重複的 id': v3('2-care~1-care'),
    '不認得的 id': v3('2-freedom'),
    '名次列沒有 id': v3('2'),
    '用版本 2 的分數寫法超過 3': v3('6-care'),
    '明確決策題數超過題數': v3('2-care', 'a'),
    '明確決策題數補前導 0': v3('2-care', '09'),
    '明確決策題數空白': v3('2-care', ''),
    '次數加起來超過明確決策題數': v3('3-care~2-autonomy-fairness', '6'),
    '有明確決策卻沒有排名': v3('', '1'),
    '有排名卻沒有明確決策': v3('1-care', '0'),
    '少了明確決策題數那一欄': `#r=3.autonomy~stimulation~hedonism.2-care..c0ld.0-0-0-0-0-0-0-0-0`,
    '多一欄': v3('2-care') + '.0',
    '題庫版本相同、題組對不到題庫': v3('1-care', '1', interactiveCatalog.version, Array(slotCount).fill('3').join('-')),
    '題庫版本相同、題數不對': v3('1-care', '1', interactiveCatalog.version, Array(slotCount + 1).fill('0').join('-')),
  };
  for (const [rule, fragment] of Object.entries(cases)) await expectUnreadable(page, fragment, corrupt).catch(error => { throw new Error(`${rule}：${error.message}`); });
  await expectUnreadable(page, '#r=4' + resultLinksV3.general.fragment.slice('#r=3'.length), unsupported);
});

test('互動格式的邊界剛好成立：次數 3、明確決策題數等於題數、次數加起來等於明確決策題數', async ({ page }) => {
  await page.goto('/' + v3('3-autonomy-security-care', '9'));
  await expect(countColumn(page, recipientCounts).getByRole('listitem')).toHaveText(['並列第 1自主、安全穩定、照顧身邊的人3 次／3 題']);
  await expect(page.getByText('明確決策 9 / 9 題', { exact: true })).toBeVisible();
  await page.goto('/' + v3('3-care~2-autonomy-fairness', '7'));
  await expect(countColumn(page, recipientCounts).getByRole('listitem')).toHaveText(['第 1照顧身邊的人3 次／3 題', '並列第 2自主、普遍關懷2 次／3 題']);
  await expect(page.getByText('明確決策 7 / 9 題', { exact: true })).toBeVisible();
});

test('反思筆記不會進入結果連結', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [trip]: { allocate: [4, 2] } });
  const linkBox = shareRegion(page).getByRole('textbox', { name: '結果連結' });
  const before = await linkBox.inputValue();
  await page.getByRole('combobox', { name: '選一題有感的情境' }).selectOption({ label: `第 1 題：${trip}` });
  await page.getByRole('textbox', { name: '反思筆記（可不填）' }).fill('朋友那邊其實更急');
  await expect(linkBox).toHaveValue(before);
  expect(decodeURIComponent(before)).not.toContain('朋友那邊');
});
