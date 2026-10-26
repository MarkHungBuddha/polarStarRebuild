import { categoryOrder } from './data';
import { act1Precedence } from './firstAct';
import type { Answer, Scenario, ValueId, ValueItem } from './types';

/** The value a confirmed answer leans to: option A for a negative strength, B for a positive one; 兩者相當 leans to neither. */
export function leaningValue(scenario: Scenario, answer: Answer): ValueId | undefined {
  if (answer.kind !== 'preference' || answer.strength === 0) return undefined;
  return scenario.options[answer.strength < 0 ? 0 : 1].valueId;
}

export interface Placed<T> { item: T; position: number }

/** Competition positions (1, 1, 3…): equal keys share a position, and only positions 1–3 are kept. */
export function topThree<T>(items: readonly T[], compare: (a: T, b: T) => number): Placed<T>[] {
  const sorted = [...items].sort(compare);
  return sorted.map(item => ({ item, position: 1 + sorted.findIndex(other => compare(other, item) === 0) }))
    .filter(placed => placed.position <= 3);
}

const act1Compare = (a: ValueItem, b: ValueItem) => categoryOrder.indexOf(a.category!) - categoryOrder.indexOf(b.category!) || a.rank - b.rank;

/** The first act's three highest core values across categories; ties can make the list longer than three. */
export const act1TopThree = (values: readonly ValueItem[]) => topThree(values.filter(value => !value.custom && value.category), act1Compare);

/** Placed items gathered into one row per position, in position order. */
export const byPosition = <T,>(placed: readonly Placed<T>[]) => [...new Set(placed.map(entry => entry.position))].map(position => ({ position, items: placed.filter(entry => entry.position === position).map(entry => entry.item) }));

/** Whether a confirmed answer leans away from the value the first act put ahead; 兩者相當 and first-act ties are neither. */
export function differsFromFirstAct(scenario: Scenario, answer: Answer, values: readonly ValueItem[]) {
  const ahead = act1Precedence(values, scenario.pair)?.ahead;
  const leaning = leaningValue(scenario, answer);
  return Boolean(ahead && leaning && leaning !== ahead.id);
}

/** How often a legacy (format version 1) second-act row was chosen, as the recipient page shows it; tied rows share the count (各). */
export const chosenCountText = ({ chosen, directional }: { chosen: number; directional: number }, tied: boolean) => `${tied ? '各' : ''}選了 ${chosen} 次／共 ${directional} 題`;
