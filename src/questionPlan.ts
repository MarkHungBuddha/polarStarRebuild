import { catalog, hash } from './questionCatalog';
import type { Scenario } from './types';

function groups(): Scenario[][] {
  const slots = new Map<string, Scenario[]>();
  for (const scenario of catalog.scenarios) slots.set(scenario.slotId, [...(slots.get(scenario.slotId) ?? []), scenario]);
  return [...slots.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, variants]) => variants);
}

/**
 * One variant per slot, in slot order. A seed reproduces a question set and ignores `seen`; without one, each slot
 * draws from its variants not in `seen`, and from all of them once every variant has been seen.
 */
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

export const outdatedQuestionLinkNotice = '這份題目連結建立時用的題庫和目前不同，題目已經改過，無法重現原本的題組。你可以開始新版測驗。';

export function requestedQuestions(search: string): { questions?: Scenario[]; notice?: string; specified: boolean } {
  const params = new URLSearchParams(search);
  const seed = params.get('seed');
  if (seed === null) return { specified: false };
  if (params.get('v') !== catalog.version) return { specified: true, notice: outdatedQuestionLinkNotice };
  try {
    if (!seed || seed.length > 1024) throw new Error('Invalid seed');
    return { specified: true, questions: selectQuestions(new Set(), seed) };
  } catch { return { specified: true, notice: '這份題目連結的題目資料無法使用。你可以開始新版測驗。' }; }
}

/** The variant chosen in each slot, in slot order and base36; a question link's seed is `p.` followed by these joined with dots. */
export function questionPlan(questions: readonly Scenario[]): string[] | undefined {
  const slots = groups();
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
  url.searchParams.set('v', catalog.version);
  return url.href;
}
