import type { InteractiveScenario } from './interactiveTypes';
import { interactiveSlots01To05 } from './scenarios/interactive-slots-01-05';
import { interactiveSlots06To10 } from './scenarios/interactive-slots-06-10';
import { interactiveSlots11To15 } from './scenarios/interactive-slots-11-15';

/**
 * The question bank: fifteen slots, three interactive variants each. Question content lives in the slot files
 * (src/scenarios/interactive-slots-*.ts); this file only composes them. Registry order is part of the bank version hash and of
 * the variant index in question links and result links, so append, never reorder.
 */
export const interactiveScenarios: InteractiveScenario[] = [
  ...interactiveSlots01To05,
  ...interactiveSlots06To10,
  ...interactiveSlots11To15,
];
