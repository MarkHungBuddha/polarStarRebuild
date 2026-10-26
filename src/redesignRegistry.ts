import { redesignCalendar } from './scenarios/redesign-calendar';
import { redesignScene } from './scenarios/redesign-scene';
import { redesignMessage } from './scenarios/redesign-message';
import { redesignPriority } from './scenarios/redesign-priority';
import { redesignLinked } from './scenarios/redesign-linked';
import { redesignResources } from './scenarios/redesign-resources';
import { interactiveSlots11To15 } from './scenarios/interactive-slots-11-15';
import type { InteractiveScenario } from './interactiveTypes';

/** Development review bank. Each completed mechanism contributes its own scenarios here. */
export const redesignScenarios: InteractiveScenario[] = [
  redesignCalendar,
  redesignScene,
  ...redesignLinked,
  ...redesignResources,
  redesignPriority,
  redesignMessage,
  ...interactiveSlots11To15,
];
