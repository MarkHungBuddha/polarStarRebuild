import { expect, test } from './support/fixtures';
import { interactiveScenarios } from '../src/interactiveScenarios';
import { blueprint } from './support/blueprint';

// The interactive bank's contract so far; the full 15 × 3 count joins when the content is complete (#71).
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
