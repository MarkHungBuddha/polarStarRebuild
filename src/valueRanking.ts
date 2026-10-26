import { categoryOrder } from './data';
import type { ValueItem } from './types';

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

/** How often a legacy (format version 1) second-act row was chosen, as the recipient page shows it; tied rows share the count (各). */
export const chosenCountText = ({ chosen, directional }: { chosen: number; directional: number }, tied: boolean) => `${tied ? '各' : ''}選了 ${chosen} 次／共 ${directional} 題`;
