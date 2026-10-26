import { interactiveScenarios } from './interactiveScenarios';
import type { InteractiveScenario } from './interactiveTypes';
import { hash } from './questionCatalog';

/**
 * The interactive question bank and its version, as the five-step bank has in questionCatalog.ts. Format version 3 result links
 * carry this version and the variant drawn in each slot (the plan); interactive question links (#71) will use the same pair.
 */
export const interactiveCatalog = {
  /** Hash of the full interactive registry: any text, order or variant change makes a new version. */
  version: `c${hash(JSON.stringify(interactiveScenarios)).toString(36)}`,
  scenarios: interactiveScenarios,
} as const;

function slots(): InteractiveScenario[][] {
  const groups = new Map<string, InteractiveScenario[]>();
  for (const scenario of interactiveCatalog.scenarios) groups.set(scenario.slotId, [...(groups.get(scenario.slotId) ?? []), scenario]);
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, variants]) => variants);
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
