import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { scenarios } from '../src/scenarios';
import { classifyAndRankValues, openDetailedReport } from './support/experience';
import { confirmButton as confirm, evidence, leanOption as lean, scoreRow as row, scoreRows, type Lean } from './support/preference';

// Slots 1–5 of the blueprint in docs/scenario-feature-spec.md, written out independently of the catalog (#50).
const pairs: Record<string, [string, string]> = {
  slot01: ['autonomy', 'security'],
  slot02: ['autonomy', 'rules'],
  slot03: ['autonomy', 'care'],
  slot04: ['stimulation', 'security'],
  slot05: ['stimulation', 'tradition'],
};

test('第 1–5 組各恰有三個五段偏向情境，沿用原配對，生活情境可分辨，內容完整', () => {
  const filled = (text: string) => text.trim().length > 0;
  const covered = scenarios.filter(scenario => scenario.slotId in pairs);
  expect(covered).toHaveLength(15);
  expect(covered.map(scenario => scenario.id)).toContain('preference-slot04-work');
  expect(new Set(covered.map(scenario => scenario.id)).size).toBe(15);
  for (const [slotId, pair] of Object.entries(pairs)) {
    const variants = covered.filter(scenario => scenario.slotId === slotId);
    expect(variants, slotId).toHaveLength(3);
    expect(new Set(variants.map(scenario => scenario.title)).size, slotId).toBe(3);
    expect(new Set(variants.map(scenario => scenario.setup)).size, slotId).toBe(3);
    for (const scenario of variants) {
      expect([scenario.kind, ...scenario.pair], scenario.id).toEqual(['preference', ...pair]);
      expect(scenario.options.map(option => option.valueId), scenario.id).toEqual(pair);
      expect([scenario.title, scenario.setup, scenario.domain].every(filled), scenario.id).toBe(true);
      expect(scenario.options.every(option => filled(option.label) && filled(option.consequence)), scenario.id).toBe(true);
      expect(new Set(scenario.options.map(option => option.id)).size, scenario.id).toBe(2);
    }
  }
});

// Titles of slots 1–5 by variant position; scenarioRandom 0, 0.4 and 0.8 draw the first, second and third variant.
const slotTitles = [
  ['固定薪水，還是自己接案？', '這次租約，續住還是搬家？', '五天的旅程，誰來排？'],
  ['這份提案，用誰的方法？', '週末的打掃，照誰的時間？', '這週的共學，讀哪一章？'],
  ['這三週的晚上，留給哪件事？', '這個月的週末下午，留給誰？', '空出來的週六，給誰？'],
  ['下週，照原計畫嗎？', '這次週末，要換條路嗎？', '晚上的課，選哪一門？'],
  ['同一天，兩場活動。', '這次連假，怎麼過？', '今年冬至，煮什麼？'],
] as const;
const heading = (page: Page, title: string) => page.getByRole('heading', { name: title, exact: true });

for (const [position, scenarioRandom] of [0, 0.4, 0.8].entries()) {
  test.describe(`第 ${position + 1} 個情境變體`, () => {
    test.use({ scenarioRandom });
    test('第 1–5 組抽到的變體可確認、續答、修改，逐題依據與偏向分數跟著最新確認答案', async ({ page }) => {
      const titles = slotTitles.map(variants => variants[position]);
      await page.goto('/');
      // First act order: 自主, 探索刺激, 享受生活, 成就, 主導權, 安全穩定, 遵守規範, 傳承, 照顧身邊的人, 普遍關懷.
      await classifyAndRankValues(page);
      await page.getByRole('button', { name: '進入情境中的取捨' }).click();
      await expect(heading(page, titles[0])).toBeVisible();
      await lean(page, '強烈偏向 A').click();
      await confirm(page).click();
      await page.reload();
      await page.getByRole('button', { name: '繼續上次作答' }).click();
      await expect(heading(page, titles[1])).toBeVisible();
      for (const [index, name] of (['稍微偏向 B', '稍微偏向 A', '強烈偏向 B', '稍微偏向 A'] as const).entries()) {
        await expect(heading(page, titles[index + 1])).toBeVisible();
        await lean(page, name).click();
        await confirm(page).click();
      }
      // The slots that #50 does not cover answer neutrally.
      while (await confirm(page).isVisible()) { await lean(page, '兩者相當').click(); await confirm(page).click(); }
      await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
      // 自主 2 + 1、安全穩定 2、遵守規範 1、探索刺激 1.
      expect(await scoreRows(page)).toEqual([
        row('第 1', ['自主'], '3 分'),
        row('第 2', ['安全穩定'], '2 分'),
        row('並列第 3', ['遵守規範', '探索刺激'], '各 1 分'),
      ]);
      await openDetailedReport(page);
      await expect(evidence(page, titles[0])).toContainText('已確認答案：強烈偏向 A。自主加 2 分。');
      await expect(evidence(page, titles[1])).toContainText('已確認答案：稍微偏向 B。遵守規範加 1 分。');
      await expect(evidence(page, titles[2])).toContainText('已確認答案：稍微偏向 A。自主加 1 分。');
      await expect(evidence(page, titles[3])).toContainText('已確認答案：強烈偏向 B。安全穩定加 2 分。');
      await expect(evidence(page, titles[4])).toContainText('已確認答案：稍微偏向 A。探索刺激加 1 分。');

      const edits: [string, Lean, string][] = [
        [titles[0], '稍微偏向 B', '已確認答案：稍微偏向 B。安全穩定加 1 分。'],
        [titles[1], '強烈偏向 A', '已確認答案：強烈偏向 A。自主加 2 分。'],
        [titles[2], '強烈偏向 B', '已確認答案：強烈偏向 B。照顧身邊的人加 2 分。'],
        [titles[3], '兩者相當', '已確認答案：兩者相當。兩側都不加分。'],
        [titles[4], '強烈偏向 B', '已確認答案：強烈偏向 B。傳承加 2 分。'],
      ];
      for (const [title, name, text] of edits) {
        await evidence(page, title).getByRole('button', { name: '修改這題' }).click();
        await expect(heading(page, title)).toBeVisible();
        await lean(page, name).click();
        await confirm(page).click();
        await expect(evidence(page, title)).toContainText(text);
      }
      await page.getByRole('button', { name: '← 返回簡短結論' }).click();
      // 自主 2、照顧身邊的人 2、傳承 2、安全穩定 1 (fourth place, not listed).
      expect(await scoreRows(page)).toEqual([row('並列第 1', ['自主', '照顧身邊的人', '傳承'], '各 2 分')]);
    });
  });
}
