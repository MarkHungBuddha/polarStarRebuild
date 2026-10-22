import { categoryOrder } from './data';
import type { Category, ValueItem } from './types';

/** Positions are chosen within a category, so a category of n values offers positions 1..n. */
export function positionCount(values: readonly ValueItem[], category: Category): number {
  return values.filter(value => value.category === category).length;
}

/** Moving a value to another category puts it back to tied position 1 there and keeps the old category's positions in range. */
export function withCategory(values: readonly ValueItem[], id: string, category: Category): ValueItem[] {
  const moved = values.map(value => value.id === id ? { ...value, category, rank: 1 } : value);
  return moved.map(value => value.category ? { ...value, rank: Math.min(value.rank, positionCount(moved, value.category)) } : value);
}

export interface Act1Pair {
  first: ValueItem;
  second: ValueItem;
  /** The value the user placed ahead in the first act; undefined when the two are tied. */
  ahead?: ValueItem;
  behind?: ValueItem;
}

/** First-act precedence between a scenario's two core values: category order first, then position within the category. */
export function act1Precedence(values: readonly ValueItem[], pair: readonly [string, string]): Act1Pair | undefined {
  const first = values.find(value => value.id === pair[0]);
  const second = values.find(value => value.id === pair[1]);
  if (!first?.category || !second?.category) return undefined;
  const precedence = categoryOrder.indexOf(first.category) - categoryOrder.indexOf(second.category) || first.rank - second.rank;
  if (precedence === 0) return { first, second };
  return precedence < 0 ? { first, second, ahead: first, behind: second } : { first, second, ahead: second, behind: first };
}
