import { baseValues } from './data';
import { catalogVersion, questionPlan, selectQuestions } from './questionPlan';
import { act1TopThree, byPosition, scenarioTallies, scenarioTopThree } from './valueRanking';
import type { Scenario, Session } from './types';

/** A second-act row: the values sharing one position, with the leans and leaning appearances they share. */
export interface SharedChosenRow { ids: string[]; chosen: number; directional: number }

/** The conclusion a result link carries, as it was when shared: positions come from row order and row sizes. */
export interface SharedResult {
  stated: string[][];
  chosen: SharedChosenRow[];
  custom: string[];
  catalog: string;
  plan: string[];
}

/** At most this many custom values go into one result link (docs/result-share-spec.md). */
export const maxSharedCustomValues = 10;

/** Positions follow row order and row sizes (1, 1, 3…): each row's position is one past the values in the rows before it. */
export function withPositions<T extends { ids: readonly string[] }>(rows: readonly T[]): (T & { position: number })[] {
  let position = 1;
  return rows.map(row => {
    const placed = { ...row, position };
    position += row.ids.length;
    return placed;
  });
}

export type ResultLinkOutcome =
  | { kind: 'result'; result: SharedResult; questions?: Scenario[] }
  | { kind: 'corrupt' }
  | { kind: 'unsupported' };

const coreIds = new Set(baseValues.map(value => value.id));
// The one correct spelling of a base36 number: lowercase, no leading zero (docs/result-share-spec.md「只有一種正確寫法」).
const positiveBase36 = /^[1-9a-z][0-9a-z]*$/;
const base36 = /^(0|[1-9a-z][0-9a-z]*)$/;

/** The session's public conclusion, with the custom values the sharer chose to include (already in first-act order). */
export function sharedResultOf(session: Session, custom: readonly string[]): SharedResult | undefined {
  const plan = questionPlan(session.scenarios);
  if (!plan) return undefined;
  return {
    stated: byPosition(act1TopThree(session.values)).map(row => row.items.map(value => value.id)),
    chosen: byPosition(scenarioTopThree(scenarioTallies(session))).map(row => ({ ids: row.items.map(tally => tally.value.id), chosen: row.items[0].chosen, directional: row.items[0].directional })),
    catalog: catalogVersion,
    custom: [...custom],
    plan,
  };
}

/** Format version 1: `r=1.<first act>.<second act>.<custom values>.<v>.<plan>` (docs/result-share-spec.md). */
export function resultLink(result: SharedResult, location: Pick<Location, 'origin' | 'pathname'>): string {
  const stated = result.stated.map(row => row.join('-')).join('~');
  const chosen = result.chosen.map(row => [row.chosen.toString(36), row.directional.toString(36), ...row.ids].join('-')).join('~');
  return `${new URL(location.pathname, location.origin).href}#r=1.${stated}.${chosen}.${result.custom.map(encodeCustom).join('~')}.${result.catalog}.${result.plan.join('-')}`;
}

function encodeCustom(word: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(word))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function readCustom(field: string): string[] | undefined {
  if (field === '') return [];
  const encodedValues = field.split('~');
  if (encodedValues.length > maxSharedCustomValues || encodedValues.some(value => !/^[A-Za-z0-9_-]+$/.test(value))) return undefined;
  try {
    const words = encodedValues.map(encoded => new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0))));
    // Re-encoding rejects alternate base64 spellings, including nonzero unused bits.
    if (words.some((word, index) => encodeCustom(word) !== encodedValues[index] || /\p{Cc}/u.test(word) || [...word.trim()].length < 1 || [...word.trim()].length > 24)) return undefined;
    return words.map(word => word.trim());
  } catch { return undefined; }
}

/** Rows of one column hold a top three: every row starts at position 3 or better (1, 1, 3…), and no value appears twice. */
function placesTopThree(rows: readonly string[][]) {
  if (rows.length === 0) return true;
  const ids = rows.flat();
  return new Set(ids).size === ids.length && ids.length - rows[rows.length - 1].length < 3;
}

/** Reads a result link from the address fragment; anything that is not `#r=…` is not a result link. Every field is checked before any of it is shown. */
export function readResultLink(hash: string): ResultLinkOutcome | undefined {
  if (!hash.startsWith('#r=')) return undefined;
  // The longest valid link is about 1,200 characters; anything past 2,000 is not decoded at all.
  if (hash.length - 1 > 2000) return { kind: 'corrupt' };
  const fields = hash.slice(3).split('.');
  if (!/^(0|[1-9][0-9]*)$/.test(fields[0])) return { kind: 'corrupt' };
  if (fields[0] !== '1') return { kind: 'unsupported' };
  if (fields.length !== 6) return { kind: 'corrupt' };
  const [, statedField, chosenField, customField, catalog, planField] = fields;
  const plan = planField.split('-');
  const custom = readCustom(customField);
  if (!custom || !/^c[0-9a-z]+$/.test(catalog) || !plan.every(selector => base36.test(selector))) return { kind: 'corrupt' };
  const ids = (text: string[]) => text.length > 0 && text.every(id => coreIds.has(id)) ? text : undefined;
  const stated = statedField.split('~').map(row => ids(row.split('-')));
  const chosen = chosenField === '' ? [] : chosenField.split('~').map(row => {
    const [chosenCount, directional, ...rowIds] = row.split('-');
    if (!positiveBase36.test(chosenCount) || !positiveBase36.test(directional) || !ids(rowIds)) return undefined;
    const counts = { chosen: parseInt(chosenCount, 36), directional: parseInt(directional, 36) };
    return counts.chosen <= counts.directional && counts.directional <= plan.length ? { ids: rowIds, ...counts } : undefined;
  });
  if (stated.some(row => !row) || chosen.some(row => !row)) return { kind: 'corrupt' };
  const result: SharedResult = { stated: stated as string[][], chosen: chosen as SharedChosenRow[], custom, catalog, plan };
  if (!placesTopThree(result.stated) || result.stated.flat().length < 3 || !placesTopThree(result.chosen.map(row => row.ids))) return { kind: 'corrupt' };
  // Second-act rows are strictly ordered: more leans first, then fewer leaning appearances; equal counts would have been one tied row.
  if (result.chosen.some((row, index) => index > 0 && !(row.chosen < result.chosen[index - 1].chosen || (row.chosen === result.chosen[index - 1].chosen && row.directional > result.chosen[index - 1].directional)))) return { kind: 'corrupt' };
  if (catalog !== catalogVersion) return { kind: 'result', result };
  try { return { kind: 'result', result, questions: selectQuestions(new Set(), `p.${plan.join('.')}`) }; }
  catch { return { kind: 'corrupt' }; }
}
