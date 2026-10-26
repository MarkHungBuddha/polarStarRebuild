import { redesignCalendar } from './scenarios/redesign-calendar';
import { redesignPriority } from './scenarios/redesign-priority';
import { redesignLinked } from './scenarios/redesign-linked';
import { redesignResources } from './scenarios/redesign-resources';
import type { InteractiveScenario } from './interactiveTypes';

/** Development review bank. Each completed mechanism contributes its own scenarios here. */
export const redesignScenarios: InteractiveScenario[] = [
  redesignCalendar,
  ...redesignLinked,
  ...redesignResources,
  redesignPriority,
];
