import type { InteractiveAnswer, InteractiveScenario } from './interactiveTypes';
import type { ValueId } from './types';

/**
 * The value a confirmed answer keeps first (優先保留), or undefined when it has no direction.
 * An allocation leans to the side with more cells, however large the gap; an even split leans to neither.
 * An answer for another question never counts.
 */
export function answerDirection(scenario: InteractiveScenario, answer: InteractiveAnswer | undefined): ValueId | undefined {
  if (!answer || answer.variantId !== scenario.id) return undefined;
  const [a, b] = answer.counts;
  return a === b ? undefined : scenario.interaction.sides[a > b ? 0 : 1].valueId;
}

/**
 * How the result's question list records a confirmed answer: 維持原本安排 when it was kept through 維持這個安排, otherwise each
 * side's count (「做攝影小誌 4 晚、陪朋友練面試 2 晚」), also when an adjustment ends back on the initial counts.
 */
export function answerRecord(scenario: InteractiveScenario, answer: InteractiveAnswer): string {
  const { interaction } = scenario;
  if (answer.kind === 'adjust' && answer.kept) return '維持原本安排';
  return interaction.sides.map((side, at) => `${side.label} ${answer.counts[at]} ${interaction.unit}`).join('、');
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;

/** Whether a stored value is a complete answer to this very question; restored records are checked with it before any use. */
export function isAnswerTo(answer: unknown, scenario: InteractiveScenario): answer is InteractiveAnswer {
  if (!isRecord(answer) || answer.variantId !== scenario.id || answer.kind !== scenario.interaction.kind) return false;
  const { interaction } = scenario;
  const counts = answer.counts;
  if (!Array.isArray(counts) || counts.length !== 2 || !counts.every(isCount) || counts[0] + counts[1] !== interaction.cells.length) return false;
  if (interaction.kind !== 'adjust') return true;
  // A kept answer must end on the initial arrangement's counts.
  return typeof answer.kept === 'boolean' && (!answer.kept || [0, 1].every(side => interaction.initial.filter(cell => cell === side).length === counts[side]));
}
