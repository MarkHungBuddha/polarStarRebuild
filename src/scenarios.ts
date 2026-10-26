import type { Scenario } from './types';
import { preferenceSlot04Work, preferenceSlots01To05 } from './scenarios/preference-slots-01-05';
import { preferenceSlots06To10 } from './scenarios/preference-slots-06-10';
import { preferenceSlots11To15 } from './scenarios/preference-slots-11-15';

/**
 * The question bank: fifteen slots, three variants each. Registry order (slot04-work first, then the slot files) is part of
 * the catalog version hash and of the variant index in question links and result links; append, never reorder.
 */
export const scenarios: Scenario[] = [preferenceSlot04Work, ...preferenceSlots01To05, ...preferenceSlots06To10, ...preferenceSlots11To15];
