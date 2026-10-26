import { expect, test } from './support/fixtures';
import { scenarios } from '../src/scenarios';
import { catalog } from '../src/questionCatalog';

// The blueprint table from docs/scenario-feature-spec.md, written out independently of the catalog: option A leans to the first value.
const blueprint: Record<string, [string, string]> = {
  slot01: ['autonomy', 'security'],
  slot02: ['autonomy', 'rules'],
  slot03: ['autonomy', 'care'],
  slot04: ['stimulation', 'security'],
  slot05: ['stimulation', 'tradition'],
  slot06: ['stimulation', 'achievement'],
  slot07: ['hedonism', 'achievement'],
  slot08: ['hedonism', 'care'],
  slot09: ['hedonism', 'rules'],
  slot10: ['achievement', 'fairness'],
  slot11: ['influence', 'fairness'],
  slot12: ['influence', 'care'],
  slot13: ['influence', 'tradition'],
  slot14: ['security', 'fairness'],
  slot15: ['rules', 'tradition'],
};

test('題庫依藍圖有十五槽、每槽三個五段偏向變體共 45 題，識別唯一，十個核心價值各出現三次', () => {
  expect(scenarios).toHaveLength(45);
  const ids = scenarios.map(scenario => scenario.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect([...new Set(scenarios.map(scenario => scenario.slotId))].sort()).toEqual(Object.keys(blueprint));
  for (const [slotId, pair] of Object.entries(blueprint)) {
    const variants = scenarios.filter(scenario => scenario.slotId === slotId);
    expect(variants.map(variant => [variant.kind, ...variant.pair]), slotId).toEqual(Array(3).fill(['preference', ...pair]));
    expect(new Set(variants.map(variant => variant.title)).size, slotId).toBe(3);
  }
  const appearances = new Map<string, number>();
  for (const value of Object.values(blueprint).flat()) appearances.set(value, (appearances.get(value) ?? 0) + 1);
  expect(appearances.size).toBe(10);
  expect([...appearances.values()].every(count => count === 3)).toBe(true);
});

test('每個變體都有完整題意與雙方代價，A／B 依序偏向價值對的兩邊，題面不寫出價值名稱', () => {
  const filled = (text: string) => text.trim().length > 0;
  for (const scenario of scenarios) {
    expect([scenario.title, scenario.setup, scenario.domain].every(filled), scenario.id).toBe(true);
    expect(scenario.setup, scenario.id).not.toMatch(/自主|探索刺激|享受生活|成就|主導權|安全穩定|遵守規範|傳承|照顧身邊的人|普遍關懷/);
    expect(scenario.options.every(option => filled(option.label) && filled(option.consequence)), scenario.id).toBe(true);
    expect(scenario.options.map(option => option.valueId), scenario.id).toEqual([...scenario.pair]);
    expect(new Set(scenario.options.map(option => option.id)).size, scenario.id).toBe(2);
  }
});

// Pinned on purpose: the version keys question links, saved sessions and the result links already shared. Editing or
// reordering questions changes it; when that is intended, update this value and the launch version in docs/result-share-spec.md.
test('題庫版本維持上線版本，改題目時要一併更新這裡和結果分享規格', () => {
  expect(catalog.version).toBe('c2gdvoe');
});
