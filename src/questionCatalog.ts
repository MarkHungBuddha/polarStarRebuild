import { scenarios } from './scenarios';
import { preferenceScenarios } from './scenarios/preference';
import type { Scenario } from './types';

/**
 * A question bank and the local records tied to it. Question-set selection, seen history, question links and the
 * saved session all take one; records and links made under another version never apply to it.
 */
export interface QuestionCatalog {
  /** Hash of the full registry: any text, order or variant change makes a new version. */
  version: string;
  scenarios: readonly Scenario[];
  sessionKey: string;
  /** Session records an earlier bank left behind: an unfinished one there is offered a restart, never converted. */
  legacySessionKeys: readonly string[];
  historyKey: string;
  /** Query parameters that open this bank; question links and leaving a link keep them. */
  entry: Readonly<Record<string, string>>;
}

export function hash(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  return value >>> 0;
}
const versionOf = (bank: readonly Scenario[]) => `c${hash(JSON.stringify(bank)).toString(36)}`;

/** The published bank of mixed answer mechanisms. */
export const publishedCatalog: QuestionCatalog = {
  version: versionOf(scenarios), scenarios, sessionKey: 'polarstar.session.v1', legacySessionKeys: [], historyKey: 'polarstar.seen.v1', entry: {},
};

/** The 45-variant five-step preference bank. #56 makes it the default catalog and drops `entry`. */
export const preferenceCatalog: QuestionCatalog = {
  version: versionOf(preferenceScenarios),
  scenarios: preferenceScenarios,
  sessionKey: 'polarstar.session.v2',
  legacySessionKeys: ['polarstar.session.v1', 'polarstar.preference-preview.v1'],
  historyKey: 'polarstar.seen.v2',
  // PREVIEW ONLY (#49 until #56): the bank opens from `?experience=preference` while the published test stays the default.
  entry: { experience: 'preference' },
};

/** The catalog an address opens. */
export function catalogFor(search: string): QuestionCatalog {
  const params = new URLSearchParams(search);
  return Object.entries(preferenceCatalog.entry).every(([key, value]) => params.get(key) === value) ? preferenceCatalog : publishedCatalog;
}

/** The address that opens `catalog` with no question link. */
export function entryPath(catalog: QuestionCatalog, pathname: string): string {
  const query = new URLSearchParams(catalog.entry).toString();
  return query ? `${pathname}?${query}` : pathname;
}
