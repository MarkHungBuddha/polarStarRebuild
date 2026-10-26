import { scenarios } from './scenarios';

export function hash(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  return value >>> 0;
}

/**
 * The question bank and the local records tied to it. Question-set selection, seen history, question links and the saved
 * session all use it; records and links made under another version never apply to it (docs/scenario-feature-spec.md「本機保存」).
 */
export const catalog = {
  /** Hash of the full registry: any text, order or variant change makes a new version. */
  version: `c${hash(JSON.stringify(scenarios)).toString(36)}`,
  scenarios,
  sessionKey: 'polarstar.session.v2',
  /** The mixed-mechanism bank's session record: an unfinished one is offered a restart, never resumed or converted. */
  legacySessionKeys: ['polarstar.session.v1'],
  historyKey: 'polarstar.seen.v2',
  /** The mixed-mechanism bank's seen history: never read, only removed when the user clears local records. */
  legacyHistoryKeys: ['polarstar.seen.v1'],
} as const;
