import { expect } from '@playwright/test';
import { baseValues } from '../../src/data';
import { interactiveScenarios } from '../../src/interactiveScenarios';
import type { InteractiveScenario } from '../../src/interactiveTypes';
import { blueprint } from './blueprint';

export const variantsOf = (slotId: string, scenarios: readonly InteractiveScenario[] = interactiveScenarios) => scenarios.filter(scenario => scenario.slotId === slotId);

// The life settings shown as each question's eyebrow. A new setting is added here on purpose, so parallel batches cannot drift
// into synonyms (住處 beside 居住).
const domains = ['人際', '學習', '家人', '居住', '工作', '旅行', '朋友', '校友', '比賽', '生活', '社區', '社群', '聚會', '進修', '金錢', '飲食'];

/** Every text a variant shows: title, setup, and its cards or its unit, cells and sides. */
function shownText({ title, setup, interaction }: InteractiveScenario): string {
  const sides = (list: readonly { label: string; detail: string }[]) => list.flatMap(side => [side.label, side.detail]);
  let shown: string[];
  switch (interaction.kind) {
    case 'choose': shown = interaction.options.flatMap(option => [option.label, option.content, option.cost]); break;
    case 'allocate': case 'adjust': shown = [interaction.unit, ...interaction.cells, ...sides(interaction.sides)]; break;
    case 'calendar': shown = [...interaction.slots, ...sides(interaction.sides)]; break;
    case 'resources': shown = [interaction.unit, ...interaction.objects, ...sides(interaction.sides)]; break;
    case 'scene': shown = [interaction.object, interaction.transitionLabel ?? '', ...interaction.locations.flatMap(location => [location.label, location.action ?? '', location.consequence])]; break;
    case 'message': shown = interaction.sentences.map(sentence => sentence.text); break;
    case 'priority': shown = [interaction.keepLabel, interaction.deferLabel, interaction.resourceUnit ?? '', ...interaction.items.flatMap(item => [item.label, item.detail])]; break;
    case 'linked': shown = [interaction.unit, interaction.label, interaction.consequence, ...(interaction.resourceSides ? sides(interaction.resourceSides) : [])]; break;
  }
  return [title, setup, ...shown].join('\n');
}

/**
 * The content contract every batch of interactive slots keeps (docs/content-authoring-notes.md): three variants per slot on the
 * blueprint's pair, different settings from the shared list, question titles over setups that end on the situation, each of the three interactions once per slot on average, no value name and no time
 * pressure on screen, and every allocation and adjust side naming its cost.
 */
export function expectSlotContent(slotIds: readonly string[], scenarios: readonly InteractiveScenario[] = interactiveScenarios) {
  const kinds: string[] = [];
  for (const slotId of slotIds) {
    const variants = variantsOf(slotId, scenarios);
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
      if (interaction.kind === 'allocate' || interaction.kind === 'adjust' || interaction.kind === 'calendar' || interaction.kind === 'resources') for (const side of interaction.sides) expect(side.detail, `${variant.id} ${side.id}`).toMatch(/也|就/);
    }
  }
  // The live bank still uses the three original interactions evenly; the redesigned bank picks its mechanism per decision.
  if (scenarios === interactiveScenarios) for (const kind of ['allocate', 'adjust', 'choose']) expect(kinds.filter(item => item === kind), kind).toHaveLength(slotIds.length);
}

/**
 * Mechanism data a redesigned question must carry so shared controls render it without per-question special cases and a direction
 * exists only where the data defines one (#87): both sides of a pair in A, B order, an even number of equal units, and no
 * direction at all for messages. Called by a batch's own spec; not part of the shared slot contract.
 */
export function expectMechanismData({ id, pair, interaction }: InteractiveScenario) {
  const [first, second] = pair;
  const sidesLean = (sides: readonly { valueId: string; detail: string }[]) => {
    expect(sides.map(side => side.valueId), id).toEqual([first, second]);
    // Each side says what it gains and what it gives up; the cost usually follows 「也」, sometimes 「就」.
    for (const side of sides) expect(side.detail, id).toMatch(/也|就/);
  };
  switch (interaction.kind) {
    case 'calendar': expect(interaction.slots.length % 2, `${id} slots can split evenly`).toBe(0); expect(new Set(interaction.slots).size, id).toBe(interaction.slots.length); sidesLean(interaction.sides); break;
    case 'resources':
      expect(interaction.objects.length % 2, `${id} objects can split evenly`).toBe(0); expect(new Set(interaction.objects).size, id).toBe(interaction.objects.length); sidesLean(interaction.sides);
      if (interaction.initial) expect(interaction.initial, id).toHaveLength(interaction.objects.length);
      break;
    case 'scene':
      expect(interaction.locations.map(location => location.valueId), id).toEqual([first, second]);
      for (const location of interaction.locations) { expect(location.action, `${id} ${location.id} names the action`).toBeTruthy(); expect(location.consequence.length, id).toBeGreaterThan(10); }
      break;
    case 'message': {
      expect(interaction.sentences.length, id).toBeGreaterThanOrEqual(5);
      expect(new Set(interaction.sentences.map(sentence => sentence.id)).size, id).toBe(interaction.sentences.length);
      for (const sentence of interaction.sentences) expect(sentence.text, `${id} ${sentence.id} ends as a sentence`).toMatch(/[。！？」]$/);
      break;
    }
    case 'priority': {
      expect(interaction.capacity, id).toBeGreaterThan(0); expect(interaction.capacity, id).toBeLessThan(interaction.items.length);
      expect(interaction.resourceUnit, `${id} names the unit of a kept item`).toBeTruthy();
      for (const valueId of pair) expect(interaction.items.filter(item => item.valueId === valueId).length, `${id} candidates for ${valueId}`).toBeGreaterThanOrEqual(interaction.capacity - 1);
      expect(interaction.items.every(item => item.valueId && pair.includes(item.valueId as never)), id).toBe(true);
      break;
    }
    case 'linked':
      if (interaction.resourceSides) { sidesLean(interaction.resourceSides); expect([interaction.min, interaction.max, interaction.resourceTotal], id).toEqual([0, interaction.resourceTotal, interaction.resourceTotal]); }
      break;
    case 'choose': expect(interaction.options.map(option => option.valueId), id).toEqual([first, second]); break;
    case 'allocate':
    case 'adjust': sidesLean(interaction.sides); break;
  }
}
