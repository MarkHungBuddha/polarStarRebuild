import { redesignCalendar } from './scenarios/redesign-calendar';
import { redesignLinked } from './scenarios/redesign-linked';
import type { InteractiveScenario } from './interactiveTypes';

/** Development review bank. Each completed mechanism contributes its own scenarios here. */
export const redesignScenarios: InteractiveScenario[] = [
  redesignCalendar,
  ...redesignLinked,
];
