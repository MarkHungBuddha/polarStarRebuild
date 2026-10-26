import { expect } from '@playwright/test';
import { baseValues } from '../../src/data';
import { interactiveScenarios } from '../../src/interactiveScenarios';
import type { InteractiveScenario } from '../../src/interactiveTypes';
import { blueprint } from './blueprint';

export const variantsOf = (slotId: string) => interactiveScenarios.filter(scenario => scenario.slotId === slotId);

// The life settings shown as each question's eyebrow. A new setting is added here on purpose, so parallel batches cannot drift
// into synonyms (住處 beside 居住).
const domains = ['人際', '學習', '家人', '居住', '工作', '旅行', '朋友', '校友', '比賽', '生活', '社區', '社群', '聚會', '進修', '金錢', '飲食'];

/** Every text a variant shows: title, setup, and its cards or its unit, cells and sides. */
function shownText({ title, setup, interaction }: InteractiveScenario): string {
  const shown = interaction.kind === 'choose'
    ? interaction.options.flatMap(option => [option.label, option.content, option.cost])
    : [interaction.unit, ...interaction.cells, ...interaction.sides.flatMap(side => [side.label, side.detail])];
  return [title, setup, ...shown].join('\n');
}

/**
 * The content contract every batch of interactive slots keeps (docs/content-authoring-notes.md): three variants per slot on the
 * blueprint's pair, different settings from the shared list, question titles over setups that end on the situation, each of the three interactions once per slot on average, no value name and no time
 * pressure on screen, and every allocation and adjust side naming its cost.
 */
export function expectSlotContent(slotIds: readonly string[]) {
  const kinds: string[] = [];
  for (const slotId of slotIds) {
    const variants = variantsOf(slotId);
    expect(variants, slotId).toHaveLength(3);
    expect(new Set(variants.map(variant => variant.setup)).size, `${slotId} has three different setups`).toBe(3);
    expect(new Set(variants.map(variant => variant.domain)).size, `${slotId} uses different life settings`).toBeGreaterThan(1);
    for (const variant of variants) {
      kinds.push(variant.interaction.kind);
      expect(variant.id.startsWith(`interactive-${slotId}-`), variant.id).toBe(true);
      expect([...variant.pair], variant.id).toEqual(blueprint[slotId]);
      expect(variant.setup.length, variant.id).toBeGreaterThan(80);
      // Titles ask the decision; the setup only describes the situation, since the controls already show how to answer.
      expect(variant.title, `${variant.id} title is a question`).toMatch(/？$/);
      expect(variant.setup, `${variant.id} setup ends on the situation, not a question`).not.toMatch(/？$/);
      expect(domains, `${variant.id} domain`).toContain(variant.domain);
      const text = shownText(variant);
      for (const { word } of baseValues) expect(text, `${variant.id} reveals ${word}`).not.toContain(word);
      expect(text, variant.id).not.toMatch(/倒數|計時|秒|限時/);
      // Each allocation side says what one more cell gains and what it gives up; the cost usually follows 「也」, sometimes 「就」.
      const { interaction } = variant;
      if (interaction.kind !== 'choose') for (const side of interaction.sides) expect(side.detail, `${variant.id} ${side.id}`).toMatch(/也|就/);
    }
  }
  for (const kind of ['allocate', 'adjust', 'choose']) expect(kinds.filter(item => item === kind), kind).toHaveLength(slotIds.length);
}
