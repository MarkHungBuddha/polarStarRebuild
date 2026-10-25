import { binarySlotScenarios } from './scenarios/choice-slots';
import { preferenceScenarios } from './scenarios/preference';
import { catalogVersionOf, questionPlan } from './questionPlan';
import type { SessionCatalog } from './sessionStorage';
import type { PreferenceScenario } from './types';

/**
 * PREVIEW ONLY (#49, removed when #56 switches the production entry): `?experience=preference` opens a short
 * all-preference run so the new answer and score flow can be accepted end to end without mixing it into the
 * published fifteen-question test. Besides the authored preference variants, it reuses the first published
 * two-option variant of each binary slot no preference variant covers yet, so ties beyond three values can be reached.
 */
const coveredSlots = new Set(preferenceScenarios.map(scenario => scenario.slotId));
const reusedBinaryVariants: PreferenceScenario[] = binarySlotScenarios
  .filter(scenario => !coveredSlots.has(scenario.slotId))
  .filter((scenario, index, all) => all.findIndex(other => other.slotId === scenario.slotId) === index)
  .map(scenario => ({ ...scenario, id: `preview-${scenario.id}`, kind: 'preference' }));

export const preferencePreviewCatalog: SessionCatalog = {
  key: 'polarstar.preference-preview.v1',
  scenarios: [...preferenceScenarios, ...reusedBinaryVariants],
};

/** One variant per slot, in slot order. The preview leaves the seen history alone; #53 brings unseen-first draws. */
export function drawPreferencePreview(): PreferenceScenario[] {
  const slots = new Map<string, PreferenceScenario[]>();
  for (const scenario of [...preferenceScenarios, ...reusedBinaryVariants]) slots.set(scenario.slotId, [...(slots.get(scenario.slotId) ?? []), scenario]);
  return [...slots.entries()].sort(([left], [right]) => left.localeCompare(right))
    .map(([, variants]) => variants[Math.floor(Math.random() * variants.length)]);
}

export const isPreferencePreview = (search: string) => new URLSearchParams(search).get('experience') === 'preference';

/**
 * PREVIEW ONLY (#54, consolidated into the published catalog by #56): a preview result link names the preview catalog
 * by its own version, and the preview always asks the same questions, so that version and plan can be answered again
 * through the preview entry.
 */
export const preferencePreviewVersion = catalogVersionOf(preferencePreviewCatalog.scenarios);
export const preferencePreviewPlan = questionPlan(preferencePreviewCatalog.scenarios, preferencePreviewCatalog.scenarios)!;
export const preferencePreviewSearch = '?experience=preference';
