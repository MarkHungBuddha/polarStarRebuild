import { interactiveScenarios } from './interactiveScenarios';
import type { InteractiveScenario } from './interactiveTypes';

/** 32-bit FNV-1a of `text`; the bank version is this hash of the registry. */
function fnv1a(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  return value >>> 0;
}

/**
 * The question bank and its version. Drawing a round, seen history, question links, the saved session and format version 3
 * result links all use it; records and links made under another version never apply to it (docs/scenario-feature-spec.md「本機保存」).
 */
export const interactiveCatalog = {
  /** Hash of the full registry: any text, order or variant change makes a new version. */
  version: `c${fnv1a(JSON.stringify(interactiveScenarios)).toString(36)}`,
  scenarios: interactiveScenarios,
} as const;

function slots(): InteractiveScenario[][] {
  const groups = new Map<string, InteractiveScenario[]>();
  for (const scenario of interactiveCatalog.scenarios) groups.set(scenario.slotId, [...(groups.get(scenario.slotId) ?? []), scenario]);
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, variants]) => variants);
}

/** One variant per slot, in slot order: each slot draws from its variants not in `seen`, and from all of them once every variant has been seen. */
export function drawInteractiveQuestions(seen: ReadonlySet<string> = new Set()): InteractiveScenario[] {
  return slots().map(variants => {
    const unseen = variants.filter(variant => !seen.has(variant.id));
    const candidates = unseen.length ? unseen : variants;
    return candidates[Math.floor(Math.random() * candidates.length)];
  });
}

/** The variant drawn in each slot, in slot order and base36; undefined unless `questions` is exactly one bank variant per slot. */
export function interactivePlan(questions: readonly InteractiveScenario[]): string[] | undefined {
  const groups = slots();
  if (questions.length !== groups.length) return undefined;
  const selectors: string[] = [];
  for (const variants of groups) {
    const selected = questions.filter(question => question.slotId === variants[0].slotId);
    if (selected.length !== 1) return undefined;
    const index = variants.findIndex(variant => variant.id === selected[0].id);
    if (index < 0) return undefined;
    selectors.push(index.toString(36));
  }
  return selectors;
}

/** Whether `plan` names one variant of today's bank in every slot, so the question set it records still exists. */
export function isInteractivePlan(plan: readonly string[]): boolean {
  const groups = slots();
  return plan.length === groups.length && plan.every((selector, index) => /^(0|[1-9a-z][0-9a-z]*)$/.test(selector) && Boolean(groups[index][parseInt(selector, 36)]));
}

/** The questions a plan of today's bank names, or undefined when it names none (see `isInteractivePlan`). */
export function questionsOfPlan(plan: readonly string[]): InteractiveScenario[] | undefined {
  if (!isInteractivePlan(plan)) return undefined;
  const groups = slots();
  return plan.map((selector, index) => groups[index][parseInt(selector, 36)]);
}
