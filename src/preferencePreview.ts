import { binarySlotScenarios } from './scenarios/choice-slots';
import { preferenceScenarios } from './scenarios/preference';
import type { SessionCatalog } from './sessionStorage';
import type { PreferenceScenario } from './types';

/**
 * PREVIEW ONLY (#49, removed when #56 switches the production entry): `?experience=preference` opens a short
 * all-preference run so the new answer and score flow can be accepted end to end without mixing it into the
 * published fifteen-question test. Besides the authored slot-4 demo, it reuses the first published two-option
 * variant of each remaining binary slot unchanged, so ties beyond three values can be reached through the UI.
 */
const reusedBinaryVariants: PreferenceScenario[] = binarySlotScenarios
  .filter((scenario, index, all) => all.findIndex(other => other.slotId === scenario.slotId) === index)
  .map(scenario => ({ ...scenario, id: `preview-${scenario.id}`, kind: 'preference' }));

export const preferencePreviewCatalog: SessionCatalog = {
  key: 'polarstar.preference-preview.v1',
  scenarios: [...preferenceScenarios, ...reusedBinaryVariants],
};

export const isPreferencePreview = (search: string) => new URLSearchParams(search).get('experience') === 'preference';
