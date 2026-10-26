import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { interactiveScenarios } from '../src/interactiveScenarios';
import { allocationCells, answerInteractiveByTitle, choiceCards, confirmButton, keepButton, priorityRows, questionHeading, startInteractiveScenarios, type InteractiveDecision } from './support/interactive';

// Slots 11–15 keep the original value pairs (docs/scenario-feature-spec.md), written out independently of the catalog.
const pairs = {
  slot11: ['influence', 'fairness'],
  slot12: ['influence', 'care'],
  slot13: ['influence', 'tradition'],
  slot14: ['security', 'fairness'],
  slot15: ['rules', 'tradition'],
} as const;
const slots = Object.keys(pairs) as (keyof typeof pairs)[];
const variantsOf = (slotId: string) => interactiveScenarios.filter(scenario => scenario.slotId === slotId);

test('第 11–15 組各恰有三個互動變體，沿用原價值配對，三種互動都用到，題面不揭露價值也不催時間', () => {
  for (const [slotId, pair] of Object.entries(pairs)) {
    const variants = variantsOf(slotId);
    expect(variants, slotId).toHaveLength(3);
    expect(new Set(variants.map(variant => variant.domain)).size, `${slotId} 使用不同生活情境`).toBeGreaterThan(1);
    for (const variant of variants) {
      expect(variant.id.startsWith(`interactive-${slotId}-`), variant.id).toBe(true);
      expect([...variant.pair], variant.id).toEqual([...pair]);
      expect(variant.setup.length, variant.id).toBeGreaterThan(80);
      const { interaction } = variant;
      const sides = interaction.kind === 'choose'
        ? interaction.options.map(option => [option.label, option.content, option.cost].join(''))
        : interaction.sides.map(side => side.label + side.detail);
      const visible = [variant.title, variant.setup, ...sides].join('');
      expect(visible, variant.id).not.toMatch(/自主|探索刺激|享受生活|成就|主導權|安全穩定|遵守規範|傳承|照顧身邊的人|普遍關懷/);
      expect(visible, variant.id).not.toMatch(/刪掉|劃掉|排完|分完|倒數|計時|秒|限時/);
    }
  }
  const kinds = slots.flatMap(slotId => variantsOf(slotId).map(variant => variant.interaction.kind));
  for (const kind of ['choose', 'allocate', 'adjust']) expect(kinds.filter(item => item === kind), kind).toHaveLength(5);
});

test('有初始安排的題目，現況寫在題面裡', () => {
  for (const variant of slots.flatMap(variantsOf)) {
    if (variant.interaction.kind !== 'adjust') continue;
    // The setup tells what is already arranged, so the question has a 現況 to keep or change.
    expect(variant.setup, variant.id).toMatch(/已經|原本|先說好|初稿/);
    expect(variant.setup, variant.id).toMatch(/來得及|還能改|改也/);
  }
});

const titlesOf = (index: number) => slots.map(slotId => variantsOf(slotId)[index].title);

/** Answers the current question from the keyboard only: focus moves by Tab or arrow, choices by Space and Enter. */
async function answerByKeyboard(page: Page, decision: InteractiveDecision) {
  if (decision === '選 A' || decision === '選 B') {
    await choiceCards(page).first().focus();
    await page.keyboard.press('Space');
    if (decision === '選 B') await page.keyboard.press('ArrowDown');
  } else if (decision === '維持初始安排') {
    await keepButton(page).focus();
    await page.keyboard.press('Enter');
  } else if (decision !== '目前無法決定') {
    const cells = await allocationCells(page).all();
    const toA = decision === '平均分配' ? cells.length / 2 : decision.allocate[0];
    for (const [index, cell] of cells.entries()) {
      await cell.getByRole('button').nth(index < toA ? 0 : 1).focus();
      await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
    }
  } else throw new Error(`keyboard path not written for ${decision}`);
  await confirmButton(page).focus();
  await page.keyboard.press('Enter');
}

// Each run draws one variant per slot with Math.random: 0 reaches the first variant of every slot, 0.5 the second, 0.99 the third.
// Questions outside slots 11–15 are answered 目前無法決定, so the counts come from these five alone.
const runs: { random: number; decisions: InteractiveDecision[]; rows: string[] }[] = [
  {
    random: 0,
    // 主導權 4:2 and 4:0, 照顧 1:3, 平均 (no direction), 傳承 1:3.
    decisions: [{ allocate: [4, 2] }, { allocate: [1, 3] }, { allocate: [4, 0] }, '平均分配', { allocate: [1, 3] }],
    rows: ['第 1｜主導權｜2 次／3 題', '並列第 2｜傳承、照顧身邊的人｜1 次／3 題'],
  },
  {
    random: 0.5,
    decisions: ['選 B', '選 A', '選 B', '選 A', '選 A'],
    rows: ['並列第 1｜主導權、傳承、安全穩定、普遍關懷、遵守規範｜1 次／3 題'],
  },
  {
    random: 0.99,
    // Office kept (3:1 主導權), flat changed to 3:1 主導權, exhibition kept (0:4 傳承), workflow 1:3 普遍關懷, meals kept (3:1 遵守規範).
    decisions: ['維持初始安排', { allocate: [3, 1] }, '維持初始安排', { allocate: [1, 3] }, '維持初始安排'],
    rows: ['第 1｜主導權｜2 次／3 題', '並列第 2｜傳承、普遍關懷、遵守規範｜1 次／3 題'],
  },
];

for (const [index, { random, decisions, rows }] of runs.entries()) {
  test.describe(`第 ${index + 1} 個變體`, () => {
    test.use({ scenarioRandom: random });

    test('只用點選完成，次數依已確認的決策', async ({ page }) => {
      const titles = titlesOf(index);
      await startInteractiveScenarios(page);
      const answered = await answerInteractiveByTitle(page, Object.fromEntries(titles.map((title, slot) => [title, decisions[slot]])), '目前無法決定');
      for (const title of titles) expect(answered).toContain(title);
      expect(await priorityRows(page)).toEqual(rows);
    });

    test('只用鍵盤完成，次數跟點選相同', async ({ page }) => {
      const titles = titlesOf(index);
      await startInteractiveScenarios(page);
      const answered: string[] = [];
      for (;;) {
        const title = (await questionHeading(page).textContent())!;
        const slot = titles.indexOf(title);
        if (slot < 0) {
          // Earlier slots belong to other content tickets; set aside with 目前無法決定.
          await page.getByRole('button', { name: '目前無法決定', exact: true }).focus();
          await page.keyboard.press('Enter');
          await confirmButton(page).focus();
          await page.keyboard.press('Enter');
        } else {
          answered.push(title);
          await answerByKeyboard(page, decisions[slot]);
        }
        await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
        if (answered.length === titles.length) break;
      }
      expect(answered).toEqual(titles);
      expect(await priorityRows(page)).toEqual(rows);
    });
  });
}
