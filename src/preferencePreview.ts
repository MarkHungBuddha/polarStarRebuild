import { binarySlotScenarios } from './scenarios/choice-slots';
import { preferenceScenarios } from './scenarios/preference';
import type { SessionCatalog } from './sessionStorage';
import type { PreferenceScenario } from './types';

/**
 * PREVIEW ONLY (#49, removed when #56 switches the production entry): `?experience=preference` opens a short
 * all-preference run so the new answer and score flow can be accepted end to end without mixing it into the
 * published fifteen-question test. Besides the authored preference variants, it reuses the first published two-option
 * variant of each binary slot that has none yet, unchanged, so ties beyond three values can be reached through the UI.
 */
const reusedBinaryVariants: PreferenceScenario[] = binarySlotScenarios
  .filter(scenario => !preferenceScenarios.some(authored => authored.slotId === scenario.slotId))
  .filter((scenario, index, all) => all.findIndex(other => other.slotId === scenario.slotId) === index)
  .map(scenario => ({ ...scenario, id: `preview-${scenario.id}`, kind: 'preference' }));

export const preferencePreviewCatalog: SessionCatalog = {
  key: 'polarstar.preference-preview.v1',
  scenarios: [...preferenceScenarios, ...reusedBinaryVariants],
};

/** One variant per slot, in slot order, drawn at random; the preview keeps no seen history. */
export function pickPreferencePreview(): PreferenceScenario[] {
  const slotIds = [...new Set(preferencePreviewCatalog.scenarios.map(scenario => scenario.slotId))].sort();
  return slotIds.map(slotId => {
    const variants = preferencePreviewCatalog.scenarios.filter(scenario => scenario.slotId === slotId) as PreferenceScenario[];
    return variants[Math.floor(Math.random() * variants.length)];
  });
}

export const isPreferencePreview = (search: string) => new URLSearchParams(search).get('experience') === 'preference';
