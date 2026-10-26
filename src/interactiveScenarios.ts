import type { InteractiveScenario } from './interactiveTypes';
import { interactiveSlots01To05 } from './scenarios/interactive-slots-01-05';
import { interactiveSlots06To10 } from './scenarios/interactive-slots-06-10';

/**
 * The interactive question bank, shown only by the development preview until the official entry switches (#71).
 * Each content ticket appends one line for its own slot file (src/scenarios/interactive-slots-*.ts); registry order will
 * key question and result links as in src/scenarios.ts, so append, never reorder.
 */
export const interactiveScenarios: InteractiveScenario[] = [
  ...interactiveSlots01To05,
  ...interactiveSlots06To10,
];
