import { expect, test } from './support/fixtures';
import { classifyAndRankValues, openDetailedReport } from './support/experience';
import { confirmButton as confirm, evidence, leanOption as lean, resultHeading, scoreRow as row, scoreRows, type Lean } from './support/preference';
import type { Scenario } from '../src/types';
import { baseValues } from '../src/data';
import { scenarios } from '../src/scenarios';

// Slots 6–10 of the blueprint in docs/scenario-feature-spec.md, written out independently of the catalog; A is the first value.
const slots = {
  slot06: ['stimulation', 'achievement'],
  slot07: ['hedonism', 'achievement'],
  slot08: ['hedonism', 'care'],
  slot09: ['hedonism', 'rules'],
  slot10: ['achievement', 'fairness'],
} as const;

test('第 6–10 組各恰有三個五段偏向情境，沿用原價值配對，題面不揭露價值名稱', () => {
  const valueWords = baseValues.map(value => value.word);
  for (const [slotId, pair] of Object.entries(slots)) {
    const variants = scenarios.filter(scenario => scenario.slotId === slotId);
    expect(variants, slotId).toHaveLength(3);
    expect(new Set(variants.map(variant => variant.title)).size, slotId).toBe(3);
    expect(new Set(variants.map(variant => variant.domain)).size, `${slotId} uses different life settings`).toBeGreaterThan(1);
    for (const variant of variants) {
      expect([variant.kind, ...variant.pair], variant.id).toEqual(['preference', ...pair]);
      expect(variant.id.startsWith(`preference-${slotId}-`), variant.id).toBe(true);
      expect(variant.setup.length, variant.id).toBeGreaterThan(60);
      expect(variant.options.map(option => option.valueId), variant.id).toEqual([...pair]);
      // Each side states what it gains and what it gives up.
      for (const option of variant.options) expect(option.consequence, `${variant.id} ${option.id}`).toContain('也');
      const visible = [variant.title, variant.setup, ...variant.options.flatMap(option => [option.label, option.consequence])].join('');
      for (const word of valueWords) expect(visible, `${variant.id} reveals ${word}`).not.toContain(word);
    }
  }
});

// One lean per slot; the evidence and labels follow the first act below (自主, 探索刺激, 享受生活, 成就, …, 照顧身邊的人, 普遍關懷).
const plan: Record<keyof typeof slots, { lean: Lean; evidence: string; label: string }> = {
  slot06: { lean: '強烈偏向 A', evidence: '已確認答案：強烈偏向 A。探索刺激加 2 分。', label: '與第一幕相符' },
  slot07: { lean: '稍微偏向 B', evidence: '已確認答案：稍微偏向 B。成就加 1 分。', label: '與第一幕不同' },
  slot08: { lean: '強烈偏向 B', evidence: '已確認答案：強烈偏向 B。照顧身邊的人加 2 分。', label: '與第一幕不同' },
  slot09: { lean: '稍微偏向 A', evidence: '已確認答案：稍微偏向 A。享受生活加 1 分。', label: '與第一幕相符' },
  slot10: { lean: '強烈偏向 B', evidence: '已確認答案：強烈偏向 B。普遍關懷加 2 分。', label: '與第一幕不同' },
};



// Each run draws each slot's variant with Math.random, so these three fixed values reach every variant in catalog order.
for (const [index, random] of [0, 0.4, 0.8].entries()) test.describe(`第 ${index + 1} 個變體`, () => {
  test.use({ scenarioRandom: random });
  const variants = Object.fromEntries(Object.keys(slots).map(slotId => [slotId, scenarios.filter(scenario => scenario.slotId === slotId)[index]])) as Record<keyof typeof slots, Scenario>;
  const slotOf = (title: string) => (Object.keys(variants) as (keyof typeof slots)[]).find(slotId => variants[slotId].title === title);

  test('第 6–10 組的變體可確認、續答、修改，逐題依據與分數跟著最新確認答案', async ({ page }) => {
    await page.goto('/');
    await classifyAndRankValues(page);
    await page.getByRole('button', { name: '進入情境中的取捨' }).click();
    const reached = new Set<string>();
    while (!await resultHeading(page).isVisible()) {
      const title = (await page.locator('.scenario-card h1').textContent())!;
      const slotId = slotOf(title);
      if (slotId === 'slot09' && !reached.has('resumed')) {
        // Reload before answering: the same question comes back unanswered, and the previous one keeps its confirmed lean.
        reached.add('resumed');
        await lean(page, '強烈偏向 A').click();
        await page.reload();
        await page.getByRole('button', { name: '繼續上次作答' }).click();
        await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
        for (const option of await page.getByRole('radio').all()) await expect(option).not.toBeChecked();
        await page.getByRole('button', { name: '返回上一頁' }).click();
        await expect(page.getByRole('heading', { name: variants.slot08.title, exact: true })).toBeVisible();
        await expect(lean(page, plan.slot08.lean)).toBeChecked();
        await confirm(page).click();
        continue;
      }
      if (slotId) {
        reached.add(slotId);
        // Both sides and their costs are on the page.
        for (const option of variants[slotId].options) await expect(page.getByText(option.consequence, { exact: true })).toBeVisible();
      }
      await lean(page, slotId ? plan[slotId].lean : '兩者相當').click();
      await confirm(page).click();
      await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
    }
    expect([...reached].filter(slotId => slotId !== 'resumed').sort()).toEqual(Object.keys(slots));
    // Three values share first place, so the 1-point values fall outside the top three.
    expect(await scoreRows(page)).toEqual([row('並列第 1', ['探索刺激', '照顧身邊的人', '普遍關懷'], '各 2 分')]);

    await openDetailedReport(page);
    for (const slotId of Object.keys(slots) as (keyof typeof slots)[]) {
      await expect(evidence(page, variants[slotId].title)).toContainText(plan[slotId].evidence);
      await expect(evidence(page, variants[slotId].title).locator('.evidence-label')).toHaveText(plan[slotId].label);
    }
    await evidence(page, variants.slot10.title).getByRole('button', { name: '修改這題' }).click();
    await expect(lean(page, '強烈偏向 B')).toBeChecked();
    await lean(page, '兩者相當').click();
    await confirm(page).click();
    await expect(evidence(page, variants.slot10.title).locator('.evidence-label')).toHaveText('無明確偏向');
    await expect(evidence(page, variants.slot10.title)).toContainText('已確認答案：兩者相當。兩側都不加分。');
    await page.getByRole('button', { name: '← 返回簡短結論' }).click();
    expect(await scoreRows(page)).toEqual([
      row('並列第 1', ['探索刺激', '照顧身邊的人'], '各 2 分'),
      row('並列第 3', ['成就', '享受生活'], '各 1 分'),
    ]);
  });
});
