import { expect, test } from './support/fixtures';
import { interactiveCatalog } from '../src/interactiveCatalog';
import { interactiveScenarios } from '../src/interactiveScenarios';
import { blueprint } from './support/blueprint';

test('題庫依藍圖有十五組、每組三個互動變體共 45 題，每輪每個核心價值出現三次', () => {
  expect(interactiveScenarios).toHaveLength(45);
  expect([...new Set(interactiveScenarios.map(scenario => scenario.slotId))].sort()).toEqual(Object.keys(blueprint));
  for (const slotId of Object.keys(blueprint)) {
    expect(interactiveScenarios.filter(scenario => scenario.slotId === slotId), slotId).toHaveLength(3);
  }
  // A round draws one variant per slot, so a value meets as many questions as it has slots in the blueprint.
  const appearances = new Map<string, number>();
  for (const value of Object.values(blueprint).flat()) appearances.set(value, (appearances.get(value) ?? 0) + 1);
  expect(appearances.size).toBe(10);
  expect([...appearances.values()]).toEqual(Array(10).fill(3));
  expect(new Set(interactiveScenarios.map(scenario => scenario.interaction.kind))).toEqual(new Set(['allocate', 'adjust', 'choose']));
});

// Pinned on purpose: the version keys question links, saved sessions, seen history and the result links already shared. Editing or
// reordering questions changes it; when that is intended, update this value and the launch version in docs/result-share-spec.md.
test('題庫版本維持上線版本，改題目時要一併更新這裡和結果分享規格', () => {
  expect(interactiveCatalog.version).toBe('c1lx1667');
});

test('互動題沿用藍圖的價值配對，識別與標題唯一，題面不寫出價值名稱', () => {
  const ids = interactiveScenarios.map(scenario => scenario.id);
  expect(new Set(ids).size).toBe(ids.length);
  // Answering helpers find questions by title, so a title must identify one variant.
  expect(new Set(interactiveScenarios.map(scenario => scenario.title)).size).toBe(ids.length);
  for (const scenario of interactiveScenarios) {
    expect(blueprint[scenario.slotId], scenario.id).toEqual([...scenario.pair]);
    expect([scenario.title, scenario.setup, scenario.domain].every(text => text.trim().length > 0), scenario.id).toBe(true);
    expect(scenario.setup, scenario.id).not.toMatch(/自主|探索刺激|享受生活|成就|主導權|安全穩定|遵守規範|傳承|照顧身邊的人|普遍關懷/);
  }
});

test('分配題的總格數為偶數，格子標籤唯一，A／B 兩側依序對應價值配對', () => {
  for (const scenario of interactiveScenarios.filter(item => item.interaction.kind === 'allocate')) {
    const { cells, sides, unit } = scenario.interaction;
    expect(cells.length > 0 && cells.length % 2 === 0, scenario.id).toBe(true);
    expect(new Set(cells).size, scenario.id).toBe(cells.length);
    expect(unit.trim().length > 0, scenario.id).toBe(true);
    expect(sides.map(side => side.valueId), scenario.id).toEqual([...scenario.pair]);
    expect(sides.every(side => side.label.trim() && side.detail.trim()), scenario.id).toBe(true);
    expect(new Set(sides.map(side => side.id)).size, scenario.id).toBe(2);
  }
});

test('初始安排題的現況每格標一側，格數為偶數，A／B 兩側依序對應價值配對', () => {
  for (const scenario of interactiveScenarios) {
    if (scenario.interaction.kind !== 'adjust') continue;
    const { cells, sides, unit, initial } = scenario.interaction;
    expect(cells.length > 0 && cells.length % 2 === 0, scenario.id).toBe(true);
    expect(new Set(cells).size, scenario.id).toBe(cells.length);
    expect(unit.trim().length > 0, scenario.id).toBe(true);
    expect(initial.length, scenario.id).toBe(cells.length);
    expect(initial.every(side => side === 0 || side === 1), scenario.id).toBe(true);
    expect(sides.map(side => side.valueId), scenario.id).toEqual([...scenario.pair]);
    expect(sides.every(side => side.label.trim() && side.detail.trim()), scenario.id).toBe(true);
    expect(new Set(sides.map(side => side.id)).size, scenario.id).toBe(2);
  }
});

test('選方案題恰有兩張卡片，各有方案內容與代價，A／B 依序對應價值配對，卡片文字不寫出價值名稱', () => {
  for (const scenario of interactiveScenarios) {
    if (scenario.interaction.kind !== 'choose') continue;
    const { options } = scenario.interaction;
    expect(options.map(option => option.valueId), scenario.id).toEqual([...scenario.pair]);
    expect(new Set(options.map(option => option.id)).size, scenario.id).toBe(2);
    for (const option of options) {
      expect([option.label, option.content, option.cost].every(text => text.trim().length > 0), option.id).toBe(true);
      expect(`${option.label}${option.content}${option.cost}`, option.id).not.toMatch(/自主|探索刺激|享受生活|成就|主導權|安全穩定|遵守規範|傳承|照顧身邊的人|普遍關懷/);
    }
  }
});
