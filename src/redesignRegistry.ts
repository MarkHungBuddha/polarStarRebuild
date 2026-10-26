import { redesignCalendar } from './scenarios/redesign-calendar';
import { redesignMessage } from './scenarios/redesign-message';
import type { InteractiveScenario } from './interactiveTypes';

/** Development review bank. Each completed mechanism contributes its own scenarios here. */
export const redesignScenarios: InteractiveScenario[] = [
  redesignCalendar,
  redesignMessage,
];
