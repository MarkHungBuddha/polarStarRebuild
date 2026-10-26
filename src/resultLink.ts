import { baseValues } from './data';
import { act1TopThree, byPosition } from './valueRanking';
import { interactiveCatalog, interactivePlan, questionsOfPlan } from './interactiveCatalog';
import type { InteractiveScenario, InteractiveSession } from './interactiveTypes';
import { decidedCount, priorityCounts, priorityTopThree } from './priorityRanking';

/** A legacy second-act row: the values sharing one position, with the leans and leaning appearances they share. */
export interface SharedChosenRow { ids: string[]; chosen: number; directional: number }
/** A preference second-act row: the values sharing one position and the total score they share. */
export interface SharedScoreRow { ids: string[]; score: number }

/** An interactive second-act row: the values sharing one position and the 優先保留次數 they share (1–3). */
export interface SharedCountRow { ids: string[]; count: number }

/** What every result link carries, as it was when shared: positions come from row order and row sizes. */
interface SharedConclusion {
  stated: string[][];
  custom: string[];
  catalog: string;
  plan: string[];
}
/**
 * Format version 1, legacy scoring from the mixed-mechanism bank: second-act rows count leans. The site no longer writes it;
 * a published link is shown as shared and never turned into scores.
 */
export interface LegacySharedResult extends SharedConclusion { scoring: 'legacy-count'; chosen: SharedChosenRow[] }
/**
 * Format version 2, preference scoring (2／1／0 per confirmed answer) from the five-step bank: no rows means every score was zero.
 * The site no longer writes it or keeps that bank; a published link is shown as shared.
 */
export interface PreferenceSharedResult extends SharedConclusion { scoring: 'preference-score'; scored: SharedScoreRow[] }
/**
 * Format version 3, interactive questions: each row's 優先保留次數 out of the three questions a value meets, plus 明確決策題數 (confirmed
 * answers with a direction). No rows means no answer had a direction. Version 1 also counted, but had no even split or 目前無法決定.
 */
export interface PrioritySharedResult extends SharedConclusion { scoring: 'priority-count'; counted: SharedCountRow[]; decided: number }
/** The conclusion a result link carries; `scoring` tells the meanings apart, and each keeps its numbers in its own rows. */
export type SharedResult = LegacySharedResult | PreferenceSharedResult | PrioritySharedResult;

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

/** A readable result offers its original question set when `questions` holds it, which only today's interactive bank can reproduce. */
export type ResultLinkOutcome =
  | { kind: 'result'; result: SharedResult; questions?: InteractiveScenario[] }
  | { kind: 'corrupt' }
  | { kind: 'unsupported' };

const coreIds = new Set(baseValues.map(value => value.id));
// The one correct spelling of a base36 number: lowercase, no leading zero (docs/result-share-spec.md「只有一種正確寫法」).
const positiveBase36 = /^[1-9a-z][0-9a-z]*$/;
const base36 = /^(0|[1-9a-z][0-9a-z]*)$/;

/** The interactive session's public conclusion: no per-question answer or reflection note, only the two top threes and 明確決策題數. */
export function prioritySharedResultOf(session: InteractiveSession, custom: readonly string[]): PrioritySharedResult | undefined {
  const plan = interactivePlan(session.scenarios);
  if (!plan) return undefined;
  return {
    scoring: 'priority-count',
    stated: byPosition(act1TopThree(session.values)).map(row => row.items.map(value => value.id)),
    counted: byPosition(priorityTopThree(priorityCounts(session))).map(row => ({ ids: row.items.map(item => item.value.id), count: row.items[0].count })),
    decided: decidedCount(session),
    custom: [...custom],
    catalog: interactiveCatalog.version,
    plan,
  };
}

/** Format version 3 (優先保留次數): `r=3.<first act>.<count>-<id>….<decided>.<custom values>.<v>.<plan>` (docs/result-share-spec.md). */
export function priorityResultLink(result: PrioritySharedResult, location: Pick<Location, 'origin' | 'pathname'>): string {
  const stated = result.stated.map(row => row.join('-')).join('~');
  const counted = result.counted.map(row => [row.count.toString(36), ...row.ids].join('-')).join('~');
  return `${new URL(location.pathname, location.origin).href}#r=3.${stated}.${counted}.${result.decided.toString(36)}.${result.custom.map(encodeCustom).join('~')}.${result.catalog}.${result.plan.join('-')}`;
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
  if (fields[0] === '3') return readVersion3(fields);
  if (fields[0] !== '1' && fields[0] !== '2') return { kind: 'unsupported' };
  if (fields.length !== 6) return { kind: 'corrupt' };
  return fields[0] === '1' ? readVersion1(fields) : readVersion2(fields);
}

/**
 * Format version 1, read and checked as it was published (CODING_STANDARDS「舊版結果」); keep it apart from version 2 rather
 * than share code with it. Its question bank is gone, so it never offers the original question set.
 */
function readVersion1(fields: readonly string[]): ResultLinkOutcome {
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
  const result: LegacySharedResult = { scoring: 'legacy-count', stated: stated as string[][], chosen: chosen as SharedChosenRow[], custom, catalog, plan };
  if (!placesTopThree(result.stated) || result.stated.flat().length < 3 || !placesTopThree(result.chosen.map(row => row.ids))) return { kind: 'corrupt' };
  // Second-act rows are strictly ordered: more leans first, then fewer leaning appearances; equal counts would have been one tied row.
  if (result.chosen.some((row, index) => index > 0 && !(row.chosen < result.chosen[index - 1].chosen || (row.chosen === result.chosen[index - 1].chosen && row.directional > result.chosen[index - 1].directional)))) return { kind: 'corrupt' };
  return { kind: 'result', result };
}

const knownIds = (ids: readonly string[]) => ids.length > 0 && ids.every(id => coreIds.has(id));

/** The five-step bank the site launched with (removed in #71): fifteen slots of three variants under this version. */
const fiveStepLaunchBank = { version: 'c2gdvoe', slots: 15, variants: 3 };

/** Format version 2: second-act rows are `<score>-<id>…`, 1 ≤ score ≤ 2 × questions, strictly falling; zero-score values are never listed. */
function readVersion2(fields: readonly string[]): ResultLinkOutcome {
  const [, statedField, scoredField, customField, catalog, planField] = fields;
  const plan = planField.split('-');
  const custom = readCustom(customField);
  if (!custom || !/^c[0-9a-z]+$/.test(catalog) || !plan.every(selector => base36.test(selector))) return { kind: 'corrupt' };
  const stated = statedField.split('~').map(row => row.split('-'));
  if (!stated.every(knownIds) || !placesTopThree(stated) || stated.flat().length < 3) return { kind: 'corrupt' };
  const rows = scoredField === '' ? [] : scoredField.split('~').map(row => {
    const [score, ...ids] = row.split('-');
    if (!positiveBase36.test(score) || !knownIds(ids)) return undefined;
    const value = parseInt(score, 36);
    return value <= 2 * plan.length ? { ids, score: value } : undefined;
  });
  if (rows.some(row => !row)) return { kind: 'corrupt' };
  const scored = rows as SharedScoreRow[];
  if (!placesTopThree(scored.map(row => row.ids))) return { kind: 'corrupt' };
  // Equal scores would have been one tied row.
  if (scored.some((row, index) => index > 0 && row.score >= scored[index - 1].score)) return { kind: 'corrupt' };
  // A plan of the bank the five-step version launched with must still name one of its variants in every slot, as when that bank was here.
  if (catalog === fiveStepLaunchBank.version && (plan.length !== fiveStepLaunchBank.slots || plan.some(selector => parseInt(selector, 36) >= fiveStepLaunchBank.variants))) return { kind: 'corrupt' };
  // Its question bank is gone, so, like version 1, it never offers the original question set.
  return { kind: 'result', result: { scoring: 'preference-score', stated, scored, custom, catalog, plan } };
}

/** Each value meets this many questions in a round, so no row of a version 3 link counts more. */
const maxPriorityCount = 3;

/**
 * Format version 3: seven fields, rows `<count>-<id>…` with 1 ≤ count ≤ 3 strictly falling, then 明確決策題數 (≤ questions). Each
 * decided question adds 1 to one value, so the listed counts never add up to more than it, and rows exist exactly when it is not 0.
 * A link made with today's bank offers its question set again.
 */
function readVersion3(fields: readonly string[]): ResultLinkOutcome {
  if (fields.length !== 7) return { kind: 'corrupt' };
  const [, statedField, countedField, decidedField, customField, catalog, planField] = fields;
  const plan = planField.split('-');
  const custom = readCustom(customField);
  if (!custom || !/^c[0-9a-z]+$/.test(catalog) || !plan.every(selector => base36.test(selector)) || !base36.test(decidedField)) return { kind: 'corrupt' };
  const decided = parseInt(decidedField, 36);
  const stated = statedField.split('~').map(row => row.split('-'));
  if (!stated.every(knownIds) || !placesTopThree(stated) || stated.flat().length < 3) return { kind: 'corrupt' };
  const rows = countedField === '' ? [] : countedField.split('~').map(row => {
    const [count, ...ids] = row.split('-');
    if (!positiveBase36.test(count) || !knownIds(ids)) return undefined;
    const value = parseInt(count, 36);
    return value <= maxPriorityCount ? { ids, count: value } : undefined;
  });
  if (rows.some(row => !row)) return { kind: 'corrupt' };
  const counted = rows as SharedCountRow[];
  if (!placesTopThree(counted.map(row => row.ids))) return { kind: 'corrupt' };
  // Equal counts would have been one tied row.
  if (counted.some((row, index) => index > 0 && row.count >= counted[index - 1].count)) return { kind: 'corrupt' };
  const listed = counted.reduce((sum, row) => sum + row.count * row.ids.length, 0);
  if (decided > plan.length || listed > decided || (counted.length === 0) !== (decided === 0)) return { kind: 'corrupt' };
  const result: PrioritySharedResult = { scoring: 'priority-count', stated, counted, decided, custom, catalog, plan };
  // An earlier bank's plan only has its syntax checked; a link made with today's bank must name one of its variants in every slot.
  if (catalog !== interactiveCatalog.version) return { kind: 'result', result };
  const questions = questionsOfPlan(plan);
  return questions ? { kind: 'result', result, questions } : { kind: 'corrupt' };
}
