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
