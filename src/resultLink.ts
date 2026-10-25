import { baseValues } from './data';
import { catalogVersion, questionPlan, selectQuestions } from './questionPlan';
import { act1TopThree, byPosition, scenarioTallies, scenarioTopThree } from './valueRanking';
import { isPreferenceSession, preferenceScores, preferenceTopThree } from './preferenceRanking';
import { preferencePreviewCatalog, preferencePreviewPlan, preferencePreviewVersion } from './preferencePreview';
import type { Scenario, Session } from './types';

/** A legacy second-act row: the values sharing one position, with the leans and leaning appearances they share. */
export interface SharedChosenRow { ids: string[]; chosen: number; directional: number }
/** A preference second-act row: the values sharing one position and the total score they share. */
export interface SharedScoreRow { ids: string[]; score: number }

/** What every result link carries, as it was when shared: positions come from row order and row sizes. */
interface SharedConclusion {
  stated: string[][];
  custom: string[];
  catalog: string;
  plan: string[];
}
/** Format version 1, legacy scoring: second-act rows count leans. It is shown as shared and never turned into scores. */
export interface LegacySharedResult extends SharedConclusion { scoring: 'legacy-count'; chosen: SharedChosenRow[] }
/** Format version 2, preference scoring (2／1／0 per confirmed answer): no rows means every score was zero. */
export interface PreferenceSharedResult extends SharedConclusion { scoring: 'preference-score'; scored: SharedScoreRow[] }
/** The conclusion a result link carries; `scoring` tells the two meanings apart, and each keeps its numbers in its own rows. */
export type SharedResult = LegacySharedResult | PreferenceSharedResult;

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

/**
 * A readable result may offer its original question set: `questions` from today's catalog, or `preview` when it was
 * shared from the preference preview, which always asks the same questions (PREVIEW ONLY until #56).
 */
export type ResultLinkOutcome =
  | { kind: 'result'; result: SharedResult; questions?: Scenario[]; preview?: boolean }
  | { kind: 'corrupt' }
  | { kind: 'unsupported' };

const coreIds = new Set(baseValues.map(value => value.id));
// The one correct spelling of a base36 number: lowercase, no leading zero (docs/result-share-spec.md「只有一種正確寫法」).
const positiveBase36 = /^[1-9a-z][0-9a-z]*$/;
const base36 = /^(0|[1-9a-z][0-9a-z]*)$/;

/** The session's public conclusion, with the custom values the sharer chose to include (already in first-act order). */
export function sharedResultOf(session: Session, custom: readonly string[]): SharedResult | undefined {
  const stated = byPosition(act1TopThree(session.values)).map(row => row.items.map(value => value.id));
  if (isPreferenceSession(session)) {
    // PREVIEW ONLY (until #56): every preference session is the preview run, so its plan is read against the preview catalog.
    const plan = questionPlan(session.scenarios, preferencePreviewCatalog.scenarios);
    if (!plan) return undefined;
    const scored = byPosition(preferenceTopThree(preferenceScores(session))).map(row => ({ ids: row.items.map(item => item.value.id), score: row.items[0].score }));
    return { scoring: 'preference-score', stated, scored, custom: [...custom], catalog: preferencePreviewVersion, plan };
  }
  // A mixed session has no published scoring; preference scores must never be encoded as legacy counts.
  if (session.scenarios.some(scenario => scenario.kind === 'preference')) return undefined;
  const plan = questionPlan(session.scenarios);
  if (!plan) return undefined;
  return {
    scoring: 'legacy-count',
    stated,
    chosen: byPosition(scenarioTopThree(scenarioTallies(session))).map(row => ({ ids: row.items.map(tally => tally.value.id), chosen: row.items[0].chosen, directional: row.items[0].directional })),
    catalog: catalogVersion,
    custom: [...custom],
    plan,
  };
}

/**
 * Format version 1 (legacy counts): `r=1.<first act>.<N>-<M>-<id>….<custom values>.<v>.<plan>`;
 * format version 2 (preference scores): `r=2.<first act>.<score>-<id>….<custom values>.<v>.<plan>` (docs/result-share-spec.md).
 */
export function resultLink(result: SharedResult, location: Pick<Location, 'origin' | 'pathname'>): string {
  const stated = result.stated.map(row => row.join('-')).join('~');
  const [version, second] = result.scoring === 'legacy-count'
    ? ['1', result.chosen.map(row => [row.chosen.toString(36), row.directional.toString(36), ...row.ids].join('-')).join('~')]
    : ['2', result.scored.map(row => [row.score.toString(36), ...row.ids].join('-')).join('~')];
  return `${new URL(location.pathname, location.origin).href}#r=${version}.${stated}.${second}.${result.custom.map(encodeCustom).join('~')}.${result.catalog}.${result.plan.join('-')}`;
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

const knownIds = (ids: readonly string[]) => ids.length > 0 && ids.every(id => coreIds.has(id));

/** Version 1 rows are `<N>-<M>-<id>…`: 1 ≤ N ≤ M ≤ questions, more leans first, then fewer leaning appearances. */
function readChosen(field: string, conclusion: SharedConclusion): LegacySharedResult | undefined {
  const rows = field === '' ? [] : field.split('~').map(row => {
    const [chosenCount, directional, ...ids] = row.split('-');
    if (!positiveBase36.test(chosenCount) || !positiveBase36.test(directional) || !knownIds(ids)) return undefined;
    const counts = { chosen: parseInt(chosenCount, 36), directional: parseInt(directional, 36) };
    return counts.chosen <= counts.directional && counts.directional <= conclusion.plan.length ? { ids, ...counts } : undefined;
  });
  if (rows.some(row => !row)) return undefined;
  const chosen = rows as SharedChosenRow[];
  if (!placesTopThree(chosen.map(row => row.ids))) return undefined;
  // Strictly ordered: equal counts would have been one tied row.
  if (chosen.some((row, index) => index > 0 && !(row.chosen < chosen[index - 1].chosen || (row.chosen === chosen[index - 1].chosen && row.directional > chosen[index - 1].directional)))) return undefined;
  return { scoring: 'legacy-count', ...conclusion, chosen };
}

/** Version 2 rows are `<score>-<id>…`: 1 ≤ score ≤ 2 × questions, strictly falling; zero-score values are never listed. */
function readScored(field: string, conclusion: SharedConclusion): PreferenceSharedResult | undefined {
  const rows = field === '' ? [] : field.split('~').map(row => {
    const [score, ...ids] = row.split('-');
    if (!positiveBase36.test(score) || !knownIds(ids)) return undefined;
    const value = parseInt(score, 36);
    return value <= 2 * conclusion.plan.length ? { ids, score: value } : undefined;
  });
  if (rows.some(row => !row)) return undefined;
  const scored = rows as SharedScoreRow[];
  if (!placesTopThree(scored.map(row => row.ids))) return undefined;
  // Equal scores would have been one tied row.
  if (scored.some((row, index) => index > 0 && row.score >= scored[index - 1].score)) return undefined;
  return { scoring: 'preference-score', ...conclusion, scored };
}

/** Reads a result link from the address fragment; anything that is not `#r=…` is not a result link. Every field is checked before any of it is shown. */
export function readResultLink(hash: string): ResultLinkOutcome | undefined {
  if (!hash.startsWith('#r=')) return undefined;
  // The longest valid link is about 1,200 characters; anything past 2,000 is not decoded at all.
  if (hash.length - 1 > 2000) return { kind: 'corrupt' };
  const fields = hash.slice(3).split('.');
  if (!/^(0|[1-9][0-9]*)$/.test(fields[0])) return { kind: 'corrupt' };
  if (fields[0] !== '1' && fields[0] !== '2') return { kind: 'unsupported' };
  if (fields.length !== 6) return { kind: 'corrupt' };
  const [version, statedField, secondField, customField, catalog, planField] = fields;
  const plan = planField.split('-');
  const custom = readCustom(customField);
  if (!custom || !/^c[0-9a-z]+$/.test(catalog) || !plan.every(selector => base36.test(selector))) return { kind: 'corrupt' };
  const stated = statedField.split('~').map(row => row.split('-'));
  if (!stated.every(knownIds) || !placesTopThree(stated) || stated.flat().length < 3) return { kind: 'corrupt' };
  const conclusion = { stated, custom, catalog, plan };
  const result = version === '1' ? readChosen(secondField, conclusion) : readScored(secondField, conclusion);
  if (!result) return { kind: 'corrupt' };
  // PREVIEW ONLY (until #56): a preference result from the preview is answered again through the preview entry, never under today's catalog.
  if (result.scoring === 'preference-score' && catalog === preferencePreviewVersion) return plan.join('-') === preferencePreviewPlan.join('-') ? { kind: 'result', result, preview: true } : { kind: 'corrupt' };
  if (catalog !== catalogVersion) return { kind: 'result', result };
  try { return { kind: 'result', result, questions: selectQuestions(new Set(), `p.${plan.join('.')}`) }; }
  catch { return { kind: 'corrupt' }; }
}
