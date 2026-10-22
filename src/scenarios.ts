import type { Scenario } from './types';
import { sliderScenarios } from './scenarios/slider';
import { strikeScenarios } from './scenarios/strike';
import { allocationScenarios } from './scenarios/allocation';
import { binarySlotScenarios } from './scenarios/choice-slots';
import { slot04Scenarios } from './scenarios/slot04';
// Registry order is part of the catalog version hash; append new registries rather than reordering.
export const scenarios: Scenario[] = [...sliderScenarios, ...strikeScenarios, ...allocationScenarios, ...binarySlotScenarios, ...slot04Scenarios];
