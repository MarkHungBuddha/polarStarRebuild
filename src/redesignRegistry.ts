import { redesignCalendar } from './scenarios/redesign-calendar';
import { redesignScene } from './scenarios/redesign-scene';
import { redesignMessage } from './scenarios/redesign-message';
import { redesignPriority } from './scenarios/redesign-priority';
import { redesignLinked } from './scenarios/redesign-linked';
import { redesignResources } from './scenarios/redesign-resources';
import { redesignSlots01To05 } from './scenarios/redesign-slots-01-05';
import { redesignSlots06To10 } from './scenarios/redesign-slots-06-10';
import type { InteractiveScenario } from './interactiveTypes';

/** Development review bank. Each completed mechanism contributes its own scenarios here. */
export const redesignScenarios: InteractiveScenario[] = [
  redesignCalendar,
  redesignScene,
  ...redesignLinked,
  ...redesignResources,
  redesignPriority,
  redesignMessage,
  ...redesignSlots01To05,
  ...redesignSlots06To10,
];
