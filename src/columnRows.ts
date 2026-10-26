import { coreValueWord } from './data';
import { preferenceScoreText } from './preferenceRanking';
import { withPositions } from './resultLink';

/** One position in a top-three column: the words sharing it and, in the second act, the score or legacy count beside them. */
export interface ColumnRow { position: number; words: string[]; count?: string }

/** Rows of core value ids, in position order, as a column shows them; positions follow row order and row sizes. */
export function columnRows<T extends { ids: readonly string[] }>(rows: readonly T[], count?: (row: T) => string): ColumnRow[] {
  return withPositions(rows).map(row => ({ position: row.position, words: row.ids.map(coreValueWord), count: count?.(row) }));
}

/** A score row's text as every preference conclusion shows it; tied rows share the score (各). */
export const scoreCount = (row: { ids: readonly string[]; score: number }) => preferenceScoreText(row.score, row.ids.length > 1);
