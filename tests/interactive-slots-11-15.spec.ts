import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { expectSlotContent, variantsOf } from './support/interactive-content';
import { allocationCells, answerInteractiveByTitle, choiceCards, confirmButton, keepButton, priorityRows, questionHeading, startInteractiveScenarios, type InteractiveDecision } from './support/interactive';

const slots = ['slot11', 'slot12', 'slot13', 'slot14', 'slot15'] as const;

test('第 11–15 組各恰有三個互動變體，沿用藍圖配對，三種互動各用五次，題面不寫出價值名稱也不催時間', () => {
  expectSlotContent(slots);
  // Slots 11–15 were drafted under one more rule: no wording of crossing out or finishing a sort.
  for (const variant of slots.flatMap(slotId => variantsOf(slotId))) expect([variant.title, variant.setup].join(''), variant.id).not.toMatch(/刪掉|劃掉|排完|分完/);
});

test('有初始安排的題目，現況寫在題面裡', () => {
  for (const variant of slots.flatMap(slotId => variantsOf(slotId))) {
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
