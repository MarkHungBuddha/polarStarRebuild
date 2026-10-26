import type { InteractiveAnswer, InteractiveScenario } from './interactiveTypes';
import type { ValueId } from './types';

/**
 * The value a confirmed answer keeps first (優先保留), or undefined when it has no direction.
 * An allocation leans to the side with more cells, however large the gap; an even split leans to neither. A picked card leans to its value.
 * An answer for another question never counts.
 */
export function answerDirection(scenario: InteractiveScenario, answer: InteractiveAnswer | undefined): ValueId | undefined {
  if (!answer || answer.variantId !== scenario.id) return undefined;
  const { interaction } = scenario;
  if (answer.kind === 'choose') return interaction.kind === 'choose' ? interaction.options.find(option => option.id === answer.optionId)?.valueId : undefined;
  if (interaction.kind !== 'allocate') return undefined;
  const [a, b] = answer.counts;
  return a === b ? undefined : interaction.sides[a > b ? 0 : 1].valueId;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;

/** Whether a stored value is a complete answer to this very question; restored records are checked with it before any use. */
export function isAnswerTo(answer: unknown, scenario: InteractiveScenario): answer is InteractiveAnswer {
  const { interaction } = scenario;
  if (!isRecord(answer) || answer.variantId !== scenario.id || answer.kind !== interaction.kind) return false;
  if (interaction.kind === 'choose') return interaction.options.some(option => option.id === answer.optionId);
  const counts = answer.counts;
  return Array.isArray(counts) && counts.length === 2 && counts.every(isCount) && counts[0] + counts[1] === interaction.cells.length;
}
