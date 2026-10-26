import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { allocationCells, answerInteractiveByTitle, choiceCards, confirmButton, decisionRecord, keepButton, priorityRows, questionHeading, resultHeading, startInteractiveScenarios, undecidedButton, type InteractiveDecision } from './support/interactive';
import { interactiveScenarios } from '../src/interactiveScenarios';
import { baseValues } from '../src/data';

// Slots 6–10 of the blueprint in docs/scenario-feature-spec.md, written out independently of the catalog; side A is the first value.
const slots = {
  slot06: ['stimulation', 'achievement'],
  slot07: ['hedonism', 'achievement'],
  slot08: ['hedonism', 'care'],
  slot09: ['hedonism', 'rules'],
  slot10: ['achievement', 'fairness'],
} as const;
type SlotId = keyof typeof slots;

const variantsOf = (slotId: string) => interactiveScenarios.filter(scenario => scenario.slotId === slotId);

test('第 6–10 組各恰有三個互動變體，沿用原價值配對，三種互動都用上，題面不揭露價值名稱', () => {
  const valueWords = baseValues.map(value => value.word);
  const kinds = new Set<string>();
  for (const [slotId, pair] of Object.entries(slots)) {
    const variants = variantsOf(slotId);
    expect(variants, slotId).toHaveLength(3);
    expect(new Set(variants.map(variant => variant.domain)).size, `${slotId} uses different life settings`).toBeGreaterThan(1);
    for (const variant of variants) {
      kinds.add(variant.interaction.kind);
      expect(variant.pair, variant.id).toEqual(pair);
      expect(variant.id.startsWith(`interactive-${slotId}-`), variant.id).toBe(true);
      expect(variant.setup.length, variant.id).toBeGreaterThan(80);
      expect(variant.setup, `${variant.id} ends on the decision it asks for`).toMatch(/？$/);
      const { interaction } = variant;
      const visible = interaction.kind === 'choose'
        ? interaction.options.flatMap(option => [option.label, option.content, option.cost])
        : [...interaction.cells, interaction.unit, ...interaction.sides.flatMap(side => [side.label, side.detail])];
      // Each allocation side says what one more cell gains and what it gives up.
      if (interaction.kind !== 'choose') for (const side of interaction.sides) expect(side.detail, `${variant.id} ${side.id}`).toContain('也');
      const text = [variant.title, variant.setup, ...visible].join('');
      for (const word of valueWords) expect(text, `${variant.id} reveals ${word}`).not.toContain(word);
      expect(text, variant.id).not.toMatch(/倒數|計時|秒/);
    }
  }
  expect([...kinds].sort()).toEqual(['adjust', 'allocate', 'choose']);
});

// One decision per variant, in catalog order, with the record the result page should show for it. Every round leans 成就 three
// times (slots 6, 7 and 10) and 享受生活 twice (slots 8 and 9); the other slots of the round are answered 目前無法決定.
const plans: Record<SlotId, readonly { decision: InteractiveDecision; record: string }[]> = {
  slot06: [
    { decision: { allocate: [1, 5] }, record: '上沒試過的短課 1 次、練技能做作品 5 次' },
    { decision: '選 B', record: '選了「接擅長類型的大案子」' },
    { decision: '維持初始安排', record: '維持原本安排' },
  ],
  slot07: [
    { decision: '維持初始安排', record: '維持原本安排' },
    { decision: '選 B', record: '選了「報名密集認證課程」' },
    { decision: { allocate: [2, 6] }, record: '照常休閒 2 週、上課做作業 6 週' },
  ],
  slot08: [
    { decision: { allocate: [3, 1] }, record: '留給自己 3 個下午、陪朋友熟悉新家 1 個下午' },
    { decision: '選 A', record: '選了「照原計畫去看電影」' },
    { decision: { allocate: [3, 1] }, record: '做自己排的事 3 晚、去陪弟弟拆箱 1 晚' },
  ],
  slot09: [
    { decision: { allocate: [3, 1] }, record: '再待半小時 3 晚、十點收拾下樓 1 晚' },
    { decision: '選 A', record: '選了「拿出手機拍幾張，拍完就收」' },
    { decision: { allocate: [3, 1] }, record: '多留半小時再走 3 次、照約定九點散場 1 次' },
  ],
  slot10: [
    { decision: { allocate: [4, 2] }, record: '打磨主要功能 4 天、做多語和報讀支援 2 天' },
    { decision: '選 A', record: '選了「照原定日期發表，把原版修好」' },
    { decision: '維持初始安排', record: '維持原本安排' },
  ],
};
const expectedRows = ['第 1｜成就｜3 次／3 題', '第 2｜享受生活｜2 次／3 題'];

/** Sets `decision` on the current question and confirms it with the keyboard only: focus, then Enter, Space or the arrow keys. */
async function confirmByKeyboard(page: Page, decision: InteractiveDecision) {
  const title = await questionHeading(page).textContent();
  if (decision === '目前無法決定' || decision === '維持初始安排') {
    await (decision === '目前無法決定' ? undecidedButton(page) : keepButton(page)).focus();
    await page.keyboard.press('Enter');
  } else if (decision === '選 A' || decision === '選 B') {
    await choiceCards(page).first().focus();
    await page.keyboard.press('Space');
    if (decision === '選 B') await page.keyboard.press('ArrowDown');
    await expect(choiceCards(page).nth(decision === '選 A' ? 0 : 1)).toBeChecked();
  } else {
    const cells = await allocationCells(page).all();
    const [a, b] = decision === '平均分配' ? [cells.length / 2, cells.length / 2] : decision.allocate;
    expect(a + b, 'an allocation fills every cell').toBe(cells.length);
    for (const [index, cell] of cells.entries()) {
      await cell.getByRole('button').nth(index < a ? 0 : 1).focus();
      await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
    }
  }
  await confirmButton(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: title!, exact: true })).toHaveCount(0);
}

// The preview draws each slot's variant with Math.random, so these three fixed values reach every variant in catalog order.
for (const [index, random] of [0, 0.4, 0.8].entries()) test.describe(`第 ${index + 1} 個變體`, () => {
  test.use({ scenarioRandom: random });
  const slotIds = Object.keys(slots) as SlotId[];
  const decisions = Object.fromEntries(slotIds.map(slotId => [variantsOf(slotId)[index].title, plans[slotId][index].decision]));

  async function expectRecords(page: Page) {
    expect(await priorityRows(page)).toEqual(expectedRows);
    for (const slotId of slotIds) await expect(await decisionRecord(page, variantsOf(slotId)[index].title)).toContainText(plans[slotId][index].record);
  }

  test('只靠點選就能完成第 6–10 組的變體，次數與逐題紀錄正確', async ({ page }) => {
    await startInteractiveScenarios(page);
    const titles = await answerInteractiveByTitle(page, decisions, '目前無法決定');
    expect(titles, 'every slot 6–10 variant of this draw is in the round').toEqual(expect.arrayContaining(Object.keys(decisions)));
    await expectRecords(page);
  });

  test('只靠鍵盤就能完成第 6–10 組的變體，次數與逐題紀錄正確', async ({ page }) => {
    await startInteractiveScenarios(page);
    while (!await resultHeading(page).isVisible()) {
      const title = (await questionHeading(page).textContent())!;
      await confirmByKeyboard(page, decisions[title] ?? '目前無法決定');
    }
    await expectRecords(page);
  });
});
