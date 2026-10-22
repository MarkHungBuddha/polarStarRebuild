import { expect, test } from './support/fixtures';
import { scenarios } from '../src/scenarios';

// The blueprint table from docs/scenario-feature-spec.md, written out independently of the catalog.
const blueprint: Record<string, [string, string, string]> = {
  slot01: ['autonomy', 'security', 'slider'],
  slot02: ['autonomy', 'rules', 'strike'],
  slot03: ['autonomy', 'care', 'allocate'],
  slot04: ['stimulation', 'security', 'choice'],
  slot05: ['stimulation', 'tradition', 'choice'],
  slot06: ['stimulation', 'achievement', 'allocate'],
  slot07: ['hedonism', 'achievement', 'slider'],
  slot08: ['hedonism', 'care', 'choice'],
  slot09: ['hedonism', 'rules', 'strike'],
  slot10: ['achievement', 'fairness', 'slider'],
  slot11: ['influence', 'fairness', 'choice'],
  slot12: ['influence', 'care', 'strike'],
  slot13: ['influence', 'tradition', 'choice'],
  slot14: ['security', 'fairness', 'allocate'],
  slot15: ['rules', 'tradition', 'choice'],
};

test('題庫變體識別唯一，槽位 4 有兩個可分辨的二選一變體', () => {
  const ids = scenarios.map(scenario => scenario.id);
  expect(new Set(ids).size).toBe(ids.length);
  const slot04 = scenarios.filter(scenario => scenario.slotId === 'slot04');
  expect(slot04.map(scenario => [scenario.id, scenario.kind])).toEqual([['slot04-work', 'choice'], ['slot04-weekend', 'choice']]);
  expect(new Set(slot04.map(scenario => scenario.title)).size).toBe(2);
});

test('完整題庫依藍圖有十五槽、每槽至少兩個同機制變體，十個核心價值各出現三次', () => {
  expect(scenarios.length).toBeGreaterThanOrEqual(30);
  expect([...new Set(scenarios.map(scenario => scenario.slotId))].sort()).toEqual(Object.keys(blueprint));
  for (const [slotId, [first, second, kind]] of Object.entries(blueprint)) {
    const variants = scenarios.filter(scenario => scenario.slotId === slotId);
    expect(variants.length, slotId).toBeGreaterThanOrEqual(2);
    for (const variant of variants) expect([variant.id, variant.pair, variant.kind]).toEqual([variant.id, [first, second], kind]);
    expect(new Set(variants.map(variant => variant.title)).size, slotId).toBe(variants.length);
  }
  const appearances = new Map<string, number>();
  for (const [first, second] of Object.values(blueprint)) for (const value of [first, second]) appearances.set(value, (appearances.get(value) ?? 0) + 1);
  expect(appearances.size).toBe(10);
  expect([...appearances.values()].every(count => count === 3)).toBe(true);
});

test('每個變體都有完整題意、雙方代價與結果文案，方向只來自價值對內的明確選項', () => {
  const filled = (text: unknown) => typeof text === 'string' && text.trim().length > 0;
  for (const scenario of scenarios) {
    expect([scenario.title, scenario.setup, scenario.domain].every(filled), scenario.id).toBe(true);
    expect(scenario.setup, scenario.id).not.toMatch(/自主|探索刺激|享受生活|成就|主導權|安全穩定|遵守規範|傳承|照顧身邊的人|普遍關懷/);
    if (scenario.kind === 'slider') {
      expect([scenario.question, scenario.unit, scenario.resultPrefix].every(filled), scenario.id).toBe(true);
      expect(scenario.min < scenario.max && scenario.step > 0 && scenario.initial >= scenario.min && scenario.initial <= scenario.max, scenario.id).toBe(true);
      continue;
    }
    if (scenario.kind === 'allocate') expect(Number.isInteger(scenario.total) && scenario.total > 0 && filled(scenario.unit), scenario.id).toBe(true);
    expect(scenario.options.every(option => filled(option.label) && filled(option.consequence)), scenario.id).toBe(true);
    expect(scenario.options.map(option => option.valueId), scenario.id).toEqual([...scenario.pair]);
    expect(new Set(scenario.options.map(option => option.id)).size, scenario.id).toBe(2);
  }
});
