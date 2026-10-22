import { expect, test } from '@playwright/test';
import { scenarios } from '../src/scenarios';

test('題庫變體識別唯一，槽位 4 有兩個可分辨的二選一變體', () => {
  const ids = scenarios.map(scenario => scenario.id);
  expect(new Set(ids).size).toBe(ids.length);
  const slot04 = scenarios.filter(scenario => scenario.slotId === 'slot04');
  expect(slot04.map(scenario => [scenario.id, scenario.kind])).toEqual([['slot04-work', 'choice'], ['slot04-weekend', 'choice']]);
  expect(new Set(slot04.map(scenario => scenario.title)).size).toBe(2);
});
