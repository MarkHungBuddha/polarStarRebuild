import { redesignCalendar } from './scenarios/redesign-calendar';
import { redesignPriority } from './scenarios/redesign-priority';
import type { InteractiveScenario } from './interactiveTypes';

/** Development review bank. Each completed mechanism contributes its own scenarios here. */
export const redesignScenarios: InteractiveScenario[] = [
  redesignCalendar,
  redesignPriority,
];
