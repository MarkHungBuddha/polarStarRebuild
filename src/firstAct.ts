import { categoryOrder } from './data';
import type { Category, ValueItem } from './types';

/** A category's values in ranking order. Saved sessions from before ties were removed may share a position; those keep their list order. */
export function rankedMembers(values: readonly ValueItem[], category: Category): ValueItem[] {
  return values.filter(value => value.category === category).sort((a, b) => a.rank - b.rank);
}

/** Gives the category's values positions 1..n in the given order. */
function withOrder(values: readonly ValueItem[], ordered: readonly ValueItem[]): ValueItem[] {
  const rankById = new Map(ordered.map((value, index) => [value.id, index + 1]));
  return values.map(value => rankById.has(value.id) ? { ...value, rank: rankById.get(value.id)! } : value);
}

/** Every category numbered 1..n in its shown order, so ties kept by sessions saved before they were removed become the order the page showed. */
export function withStrictOrder(values: readonly ValueItem[]): ValueItem[] {
  return categoryOrder.reduce((current, category) => withOrder(current, rankedMembers(current, category)), [...values]);
}

/** A value moved to another category goes to the bottom of it; both categories close up to positions 1..n. Choosing the current category changes nothing. */
export function withCategory(values: readonly ValueItem[], id: string, category: Category): ValueItem[] {
  const value = values.find(item => item.id === id);
  if (!value || value.category === category) return [...values];
  const moved = values.map(item => item.id === id ? { ...item, category } : item);
  return withStrictOrder(withOrder(moved, [...rankedMembers(values, category), value]));
}

/** Puts a value at `index` among the other values of its category (0 = top), then renumbers every category. */
function placeAt(values: readonly ValueItem[], category: Category, id: string, index: (others: readonly ValueItem[], from: number) => number): ValueItem[] {
  const ordered = rankedMembers(values, category);
  const from = ordered.findIndex(value => value.id === id);
  if (from < 0) return [...values];
  const others = ordered.filter(value => value.id !== id);
  others.splice(index(others, from), 0, ordered[from]);
  return withStrictOrder(withOrder(values, others));
}

/** Keyboard move: one step up or down, or to the top or bottom of the category. */
export function moveValue(values: readonly ValueItem[], category: Category, id: string, move: 'up' | 'down' | 'first' | 'last'): ValueItem[] {
  return placeAt(values, category, id, (others, from) => ({ up: Math.max(0, from - 1), down: Math.min(others.length, from + 1), first: 0, last: others.length })[move]);
}

/** Drops a dragged value at `gap` among the other values of its category (0 = above the first). */
export function dropValue(values: readonly ValueItem[], category: Category, id: string, gap: number): ValueItem[] {
  return placeAt(values, category, id, () => gap);
}

export interface Act1Pair {
  first: ValueItem;
  second: ValueItem;
  /** The value the user placed ahead in the first act; undefined when the two are tied, which only sessions saved before ties were removed can hold. */
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

