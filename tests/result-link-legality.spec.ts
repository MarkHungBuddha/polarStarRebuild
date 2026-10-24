import { expect, test } from './support/fixtures';
import { nonCanonicalResultLinksV1, resultLinksV1, resultLinksV1Catalog } from './support/result-links-v1';
import { chosenColumn, corruptHeading as corrupt, current, expectUnreadable, statedColumn, unsupportedHeading as unsupported } from './support/result-share';
import { catalogVersion } from '../src/questionPlan';

test('網站不認得的格式版本，提示重新整理；超過 2,000 字元一律當作損壞', async ({ page }) => {
  const rest = resultLinksV1.general.fragment.slice('#r=1'.length);
  await expectUnreadable(page, '#r=99' + rest, unsupported);
  await expect(page.getByText('這條連結用的是較新的格式，你的瀏覽器可能還在使用舊版網站。請重新整理頁面再試一次。')).toBeVisible();
  await expect(page.getByRole('button', { name: '重新整理' })).toBeVisible();
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeVisible();
  const tooLong = '#r=99.' + 'a'.repeat(2001 - 'r=99.'.length);
  expect(tooLong.length - 1).toBe(2001);
  await expectUnreadable(page, tooLong, corrupt);
  await expectUnreadable(page, '#r=v1' + rest, corrupt);
});

// Each case breaks exactly one rule of a link that is otherwise the published general link (docs/result-share-spec.md「合法性檢查」).
const plan = '0-0-0-0-0-0-0-0-0-0-0-0-0-0-0';
const link = (stated: string, chosen: string, v = 'c18hay5z', questions = plan) => `#r=1.${stated}.${chosen}..${v}.${questions}`;
const stated = 'autonomy~stimulation~hedonism';
const chosen = '3-3-care~2-3-autonomy-fairness';

test('任何一條合法性規則不通過，整份結果都不顯示', async ({ page }) => {
  const cases: Record<string, string> = {
    '結尾多出欄位': resultLinksV1.general.fragment + '.0',
    '少一個欄位': `#r=1.${stated}.${chosen}.c18hay5z.${plan}`,
    '不認得的 id': link('autonomy~freedom~hedonism', chosen),
    '大寫的 id': link('Autonomy~stimulation~hedonism', chosen),
    '第一幕重複的 id': link('autonomy~autonomy~hedonism', chosen),
    '第二幕重複的 id': link(stated, '3-3-care~2-3-care-fairness'),
    '第一幕少於 3 個': link('autonomy~stimulation', chosen),
    '第一幕多出第 4 名': link('autonomy~stimulation~hedonism~care', chosen),
    '第一幕空的名次列': link('autonomy~~hedonism', chosen),
    '第二幕 N 大於 M': link(stated, '4-3-care'),
    '第二幕 M 超過題數': link(stated, '3-g-care'),
    '第二幕排序顛倒': link(stated, '2-3-autonomy~3-3-care'),
    '第二幕兩列次數相同': link(stated, '3-3-care~3-3-fairness'),
    '第二幕多出第 4 名': link(stated, '3-3-care~2-3-autonomy~2-4-fairness~1-3-tradition'),
    '第二幕次數補前導 0': link(stated, '03-3-care'),
    '第二幕選了 0 次': link(stated, '0-3-care'),
    '第二幕名次列沒有 id': link(stated, '3-3'),
    'v 不合語法': link(stated, chosen, 'C18HAY5Z'),
    '題組不合語法': link(stated, chosen, 'c18hay5z', '0--0-0-0-0-0-0-0-0-0-0-0-0-0-0'),
    '題組補前導 0（題庫版本相同）': link(stated, chosen, catalogVersion, '0-01-0-0-0-0-0-0-0-0-0-0-0-0-0'),
    '題組補前導 0（舊版題目）': link(stated, chosen, 'c0ld', '0-01-0-0-0-0-0-0-0-0-0-0-0-0-0'),
    '定版範例：題組補前導 0（題庫版本相同）': current(nonCanonicalResultLinksV1.planLeadingZero),
    '定版範例：題組補前導 0（舊版題目）': nonCanonicalResultLinksV1.planLeadingZero.replace(`.${resultLinksV1Catalog}.`, '.c0ld.'),
  };
  for (const [rule, fragment] of Object.entries(cases)) await expectUnreadable(page, fragment, corrupt).catch(error => { throw new Error(`${rule}：${error.message}`); });
});

test('兩欄各出現一次同一個價值、第二幕只有一個名次，都是合法的結果', async ({ page }) => {
  await page.goto('/' + link('care~stimulation~hedonism', '3-3-care'));
  await expect(chosenColumn(page).getByRole('listitem')).toHaveText(['第 1照顧身邊的人選了 3 次／共 3 題']);
  await expect(statedColumn(page).getByRole('listitem')).toHaveText(['第 1照顧身邊的人', '第 2探索刺激', '第 3享受生活']);
});

test('第二幕 M 剛好等於原題組題數，是合法的結果', async ({ page }) => {
  // The plan has 15 questions: M = f (15) passes, while「第二幕 M 超過題數」above uses g (16).
  await page.goto('/' + link(stated, '3-f-care'));
  await expect(chosenColumn(page).getByRole('listitem')).toHaveText(['第 1照顧身邊的人選了 3 次／共 15 題']);
});

test('舊版題目的結果照常顯示，改提供用目前題目開始', async ({ page }) => {
  for (const questions of [plan, '0-0-0-0-0-0-0-0-0-0-0-0-0-0']) {
    await page.goto('/' + link(stated, chosen, 'c0ld', questions));
    await expect(statedColumn(page).getByRole('listitem')).toHaveText(resultLinksV1.general.stated);
    await expect(page.getByRole('button', { name: '用同一份題目作答' })).toHaveCount(0);
    await expect(page.getByText('這份結果用的是舊版題目。題庫已經更新，沒辦法再做同一份題目。')).toBeVisible();
  }
  await page.getByRole('button', { name: '用目前題目開始' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /你重視什麼/ })).toBeVisible();
  expect(new URL(page.url()).hash).toBe('');
});

test('題庫版本相同、題組卻對不到題庫，當作損壞', async ({ page }) => {
  for (const questions of ['5-0-0-0-0-0-0-0-0-0-0-0-0-0-0', '0-0-0-0-0-0-0-0-0-0-0-0-0-0']) await expectUnreadable(page, link(stated, chosen, catalogVersion, questions), corrupt);
});
