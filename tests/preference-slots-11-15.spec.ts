import { expect, test } from './support/fixtures';
import { classifyAndRankValues, openDetailedReport, type Lean } from './support/experience';
import { baseValues } from '../src/data';
import { scenarios } from '../src/scenarios';

// Slots 11–15 keep the original value pairs (docs/scenario-feature-spec.md), written out independently of the catalog.
const pairs = {
  slot11: ['influence', 'fairness'],
  slot12: ['influence', 'care'],
  slot13: ['influence', 'tradition'],
  slot14: ['security', 'fairness'],
  slot15: ['rules', 'tradition'],
} as const;

test('第 11–15 組各恰有三個五段偏向情境，沿用原價值配對，題面不揭露價值名稱', () => {
  const valueWords = baseValues.map(value => value.word);
  for (const [slotId, pair] of Object.entries(pairs)) {
    const variants = scenarios.filter(scenario => scenario.slotId === slotId);
    expect(variants, slotId).toHaveLength(3);
    expect(new Set(variants.map(variant => variant.title)).size, slotId).toBe(3);
    expect(new Set(variants.map(variant => variant.domain)).size, `${slotId} 使用不同生活情境`).toBeGreaterThan(1);
    for (const variant of variants) {
      expect(variant.id.startsWith(`preference-${slotId}-`), variant.id).toBe(true);
      expect([variant.kind, ...variant.pair], variant.id).toEqual(['preference', ...pair]);
      expect(variant.options.map(option => option.valueId), variant.id).toEqual([...pair]);
      expect(variant.setup.length, variant.id).toBeGreaterThan(60);
      // Each side names what it gives up, so neither option reads as free.
      for (const option of variant.options) expect(option.consequence, `${variant.id}/${option.id}`).toContain('也');
      const visible = [variant.title, variant.setup, ...variant.options.flatMap(option => [option.label, option.consequence])].join('');
      for (const word of valueWords) expect(visible, `${variant.id} reveals ${word}`).not.toContain(word);
      // Strike instructions and allocation totals do not survive the rewrite.
      expect(visible, variant.id).not.toMatch(/刪掉|劃掉|排完|分完/);
    }
  }
});

const titlesOf = (index: number) => Object.fromEntries(Object.keys(pairs).map(slotId => [slotId, scenarios.filter(scenario => scenario.slotId === slotId)[index].title]));

// Each run draws one variant per slot with Math.random; fixed values reach each of the three variants in turn.
for (const [index, scenarioRandom] of [0, 0.5, 0.99].entries()) {
  test.describe(`第 ${index + 1} 個變體`, () => {
    test.use({ scenarioRandom });
    test('第 11–15 組可確認、續答、修改，逐題依據與分數跟著已確認答案', async ({ page }) => {
      const titles = titlesOf(index);
      const heading = (title: string) => page.getByRole('heading', { name: title, exact: true });
      const confirm = page.getByRole('button', { name: '確認答案', exact: true });
      const choose = async (lean: Lean) => { await page.getByRole('radio', { name: lean, exact: true }).click(); await confirm.click(); };
      const evidence = (title: string) => page.getByRole('article').filter({ has: heading(title) });

      await page.goto('/');
      await classifyAndRankValues(page);
      await page.getByRole('button', { name: '進入情境中的取捨' }).click();
      // Earlier slots come first; they stay neutral here.
      const current = page.locator('.scenario-card h1');
      while (await current.textContent() !== titles.slot11) {
        const title = (await current.textContent())!;
        await choose('兩者相當');
        await expect(heading(title)).toHaveCount(0);
      }
      await expect(heading(titles.slot11)).toBeVisible();
      await choose('強烈偏向 A');
      await expect(heading(titles.slot12)).toBeVisible();
      await choose('稍微偏向 B');
      await expect(heading(titles.slot13)).toBeVisible();
      await page.reload();
      await page.getByRole('button', { name: '繼續上次作答' }).click();
      await expect(heading(titles.slot13)).toBeVisible();
      await choose('強烈偏向 B');
      await expect(heading(titles.slot14)).toBeVisible();
      await choose('稍微偏向 A');
      await expect(heading(titles.slot15)).toBeVisible();
      await choose('兩者相當');

      await openDetailedReport(page);
      await expect(evidence(titles.slot11)).toContainText('已確認答案：強烈偏向 A。主導權加 2 分。');
      await expect(evidence(titles.slot12)).toContainText('已確認答案：稍微偏向 B。照顧身邊的人加 1 分。');
      await expect(evidence(titles.slot13)).toContainText('已確認答案：強烈偏向 B。傳承加 2 分。');
      await expect(evidence(titles.slot14)).toContainText('已確認答案：稍微偏向 A。安全穩定加 1 分。');
      await expect(evidence(titles.slot15)).toContainText('已確認答案：兩者相當。兩側都不加分。');
      await expect(evidence(titles.slot15).locator('.evidence-label')).toHaveText('無明確偏向');

      await evidence(titles.slot15).getByRole('button', { name: '修改這題' }).click();
      await expect(page.getByRole('radio', { name: '兩者相當', exact: true })).toBeChecked();
      await choose('強烈偏向 A');
      await expect(evidence(titles.slot15)).toContainText('已確認答案：強烈偏向 A。遵守規範加 2 分。');
      // First act ranks 遵守規範 ahead of 傳承, so leaning to the rule matches it.
      await expect(evidence(titles.slot15).locator('.evidence-label')).toHaveText('與第一幕相符');
      await page.getByRole('button', { name: '← 返回簡短結論' }).click();
      const column = page.locator('.conclusion-columns > div').filter({ has: page.getByRole('heading', { name: '情境中的偏向分數' }) });
      // 照顧身邊的人 and 安全穩定 have 1 point each, which would be fourth, so they are not listed.
      await expect(column.getByRole('listitem')).toHaveCount(1);
      await expect(column.getByRole('listitem').nth(0)).toContainText('並列第 1');
      await expect(column.getByRole('listitem').nth(0)).toContainText('各 2 分');
      for (const word of ['主導權', '傳承', '遵守規範']) await expect(column.getByRole('listitem').nth(0)).toContainText(word);
    });
  });
}
