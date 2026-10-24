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

/** A category's values in ranking order, as groups of tied values (same rank). Within a group, values keep their list order. */
export function rankGroups(values: readonly ValueItem[], category: Category): ValueItem[][] {
  const groups: ValueItem[][] = [];
  for (const value of values.filter(item => item.category === category).sort((a, b) => a.rank - b.rank)) {
    const last = groups[groups.length - 1];
    if (last && last[0].rank === value.rank) last.push(value);
    else groups.push([value]);
  }
  return groups;
}

/**
 * Writes the groups back as positions 1..n, one position per group. The category's values are also put in
 * group order within the slots they hold in the list, so tied values stay in the order they were arranged.
 */
function withGroups(values: readonly ValueItem[], groups: readonly (readonly ValueItem[])[]): ValueItem[] {
  const ordered = groups.flatMap((group, index) => group.map(value => ({ ...value, rank: index + 1 })));
  const ids = new Set(ordered.map(value => value.id));
  let next = 0;
  return values.map(value => ids.has(value.id) ? ordered[next++] : value);
}

/** The groups with `id` taken out; groups left empty disappear. */
function withoutValue(groups: readonly ValueItem[][], id: string): ValueItem[][] {
  return groups.map(group => group.filter(value => value.id !== id)).filter(group => group.length > 0);
}

/**
 * Keyboard move. Up/down: a tied value first leaves its group on that side; a value on its own moves past the
 * neighbouring group. First/last give it a position of its own at the top or bottom.
 */
export function moveValue(values: readonly ValueItem[], category: Category, id: string, move: 'up' | 'down' | 'first' | 'last'): ValueItem[] {
  const groups = rankGroups(values, category);
  const index = groups.findIndex(group => group.some(value => value.id === id));
  if (index < 0) return [...values];
  const value = groups[index].find(item => item.id === id)!;
  const alone = groups[index].length === 1;
  const rest = withoutValue(groups, id);
  // In `rest`, the value's old group (or, when it was alone, the group after it) sits at `index`.
  const target = move === 'first' ? 0
    : move === 'last' ? rest.length
    : move === 'up' ? Math.max(0, alone ? index - 1 : index)
    : Math.min(rest.length, index + 1);
  rest.splice(target, 0, [value]);
  return withGroups(values, rest);
}

/**
 * Drops a dragged value at `gap` (0 = above the first of the other values). Dropping between two values
 * that are tied joins their group; anywhere else the value gets a position of its own.
 */
export function dropValue(values: readonly ValueItem[], category: Category, id: string, gap: number): ValueItem[] {
  const groups = rankGroups(values, category);
  const value = groups.flat().find(item => item.id === id);
  if (!value) return [...values];
  const rest = withoutValue(groups, id);
  let seen = 0;
  for (const [index, group] of rest.entries()) {
    if (gap === seen) { rest.splice(index, 0, [value]); return withGroups(values, rest); }
    if (gap < seen + group.length) { group.splice(gap - seen, 0, value); return withGroups(values, rest); }
    seen += group.length;
  }
  rest.push([value]);
  return withGroups(values, rest);
}

/** Ties a value with the one above it, or, when already tied, splits the group so it and those below it move down one position. */
export function toggleTieWithAbove(values: readonly ValueItem[], category: Category, id: string): ValueItem[] {
  const groups = rankGroups(values, category);
  const index = groups.findIndex(group => group.some(value => value.id === id));
  if (index < 0) return [...values];
  const at = groups[index].findIndex(value => value.id === id);
  if (at > 0) groups.splice(index, 1, groups[index].slice(0, at), groups[index].slice(at));
  else if (index > 0) groups.splice(index - 1, 2, [...groups[index - 1], ...groups[index]]);
  return withGroups(values, groups);
}
