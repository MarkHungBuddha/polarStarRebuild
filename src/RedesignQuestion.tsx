import type { InteractiveAnswer, InteractiveScenario } from './interactiveTypes';
import { CalendarQuestion } from './CalendarQuestion';
import { PriorityQuestion } from './PriorityQuestion';

export interface RedesignQuestionProps {
  scenario: InteractiveScenario; answer?: InteractiveAnswer; onConfirm: (answer: InteractiveAnswer) => void; onBack: () => void; onReview?: () => void;
}

/** Mechanisms keep their drafts local; the registry contains only completed mechanisms. */
export function RedesignQuestion(props: RedesignQuestionProps) {
  if (props.scenario.interaction.kind === 'calendar') return <CalendarQuestion {...props} />;
  if (props.scenario.interaction.kind === 'priority') return <PriorityQuestion {...props} />;
  return null;
}
