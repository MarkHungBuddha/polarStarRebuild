import { scenarios } from './scenarios';
import type { Scenario } from './types';

function hash(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  return value >>> 0;
}

/** A catalog's version: a hash of its full registry JSON, so any change to text, order or variants changes it. */
export const catalogVersionOf = (catalog: readonly Scenario[]) => `c${hash(JSON.stringify(catalog)).toString(36)}`;
export const catalogVersion = catalogVersionOf(scenarios);

function groups(catalog: readonly Scenario[] = scenarios): Scenario[][] {
  const slots = new Map<string, Scenario[]>();
  for (const scenario of catalog) slots.set(scenario.slotId, [...(slots.get(scenario.slotId) ?? []), scenario]);
  return [...slots.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, variants]) => variants);
}

export function selectQuestions(seen: ReadonlySet<string> = new Set(), seed?: string): Scenario[] {
  const slots = groups();
  if (seed?.startsWith('p.')) {
    const selectors = seed.slice(2).split('.');
    if (selectors.length !== slots.length) throw new Error('Unknown question plan');
    return slots.map((variants, index) => {
      const selector = selectors[index];
      if (!/^[0-9a-z]+$/.test(selector)) throw new Error('Unknown question plan');
      const variant = variants[parseInt(selector, 36)];
      if (!variant) throw new Error('Unknown question plan');
      return variant;
    });
  }
  return slots.map(variants => {
    if (seed !== undefined) return variants[hash(`${seed}:${variants[0].slotId}`) % variants.length];
    const unseen = variants.filter(variant => !seen.has(variant.id));
    const candidates = unseen.length ? unseen : variants;
    return candidates[Math.floor(Math.random() * candidates.length)];
  });
}

export function requestedQuestions(search: string): { questions?: Scenario[]; notice?: string; specified: boolean } {
  const params = new URLSearchParams(search);
  const seed = params.get('seed');
  if (seed === null) return { specified: false };
  if (params.get('v') !== catalogVersion) return { specified: true, notice: '這份分享題目的版本目前無法使用。你可以改用目前的版本重新開始。' };
  try {
    if (!seed || seed.length > 1024) throw new Error('Invalid seed');
    return { specified: true, questions: selectQuestions(new Set(), seed) };
  } catch { return { specified: true, notice: '這份分享連結的題目資料無法使用。你可以改用目前的版本重新開始。' }; }
}

/** The variant chosen in each slot, in slot order and base36; a question link's seed is `p.` followed by these joined with dots. */
export function questionPlan(questions: readonly Scenario[], catalog: readonly Scenario[] = scenarios): string[] | undefined {
  const slots = groups(catalog);
  if (questions.length !== slots.length) return undefined;
  const selectors: string[] = [];
  for (const variants of slots) {
    const selected = questions.filter(question => question.slotId === variants[0].slotId);
    if (selected.length !== 1) return undefined;
    // Session questions are catalog entries (restored sessions are checked against the catalog), so the id identifies the variant.
    const index = variants.findIndex(variant => variant.id === selected[0].id);
    if (index < 0) return undefined;
    selectors.push(index.toString(36));
  }
  return selectors;
}

export function questionShareLink(questions: readonly Scenario[], location: Pick<Location, 'origin' | 'pathname'>): string | undefined {
  const selectors = questionPlan(questions);
  if (!selectors) return undefined;
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('seed', `p.${selectors.join('.')}`);
  url.searchParams.set('v', catalogVersion);
  return url.href;
}
