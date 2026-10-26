import { act1Precedence } from './firstAct';
import type { InteractiveAnswer, InteractiveScenario } from './interactiveTypes';
import type { ValueId, ValueItem } from './types';

/**
 * The value a confirmed answer keeps first (優先保留), or undefined when it has no direction.
 * An allocation leans to the side with more cells, however large the gap; an even split and 目前無法決定 lean to neither.
 * A picked card leans to its value. An answer for another question never counts.
 */
export function answerDirection(scenario: InteractiveScenario, answer: InteractiveAnswer | undefined): ValueId | undefined {
  if (!answer || answer.variantId !== scenario.id || answer.kind === 'undecided') return undefined;
  const { interaction } = scenario;
  if (answer.kind === 'choose') return interaction.kind === 'choose' ? interaction.options.find(option => option.id === answer.optionId)?.valueId : undefined;
  if (interaction.kind !== 'allocate') return undefined;
  const [a, b] = answer.counts;
  return a === b ? undefined : interaction.sides[a > b ? 0 : 1].valueId;
}

/**
 * The confirmed decision in the question's own words, so the user can check where each count came from
 * (「做攝影小誌 4 晚、陪朋友練面試 2 晚」, 「選了「去幫朋友打包」」). Only called with an answer to this very question (`isAnswerTo`).
 */
export function decisionText({ interaction }: InteractiveScenario, answer: InteractiveAnswer): string {
  switch (answer.kind) {
    case 'undecided': return '目前無法決定';
    case 'choose': {
      if (interaction.kind !== 'choose') return '';
      return `選了「${interaction.options.find(option => option.id === answer.optionId)?.label ?? ''}」`;
    }
    case 'allocate': {
      if (interaction.kind !== 'allocate') return '';
      const { sides, unit } = interaction;
      const split = sides.map((side, at) => `${side.label} ${answer.counts[at]} ${unit}`).join('、');
      return answer.counts[0] === answer.counts[1] ? `平均分配：${split}` : split;
    }
  }
}

/**
 * How a directed answer compares with the first act's order of the question's pair: 一致 when it keeps the value ranked ahead,
 * 不同 otherwise. Answers without a direction are neither; custom values are never in a pair, so they never take part.
 */
export function firstActComparison(scenario: InteractiveScenario, answer: InteractiveAnswer | undefined, values: readonly ValueItem[]): '一致' | '不同' | undefined {
  const direction = answerDirection(scenario, answer);
  const ahead = act1Precedence(values, scenario.pair)?.ahead;
  if (!direction || !ahead) return undefined;
  return direction === ahead.id ? '一致' : '不同';
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;

/** Whether a stored value is a complete answer to this very question; restored records are checked with it before any use. */
export function isAnswerTo(answer: unknown, scenario: InteractiveScenario): answer is InteractiveAnswer {
  const { interaction } = scenario;
  if (!isRecord(answer) || answer.variantId !== scenario.id) return false;
  if (answer.kind === 'undecided') return Object.keys(answer).length === 2;
  if (answer.kind !== interaction.kind) return false;
  if (interaction.kind === 'choose') return interaction.options.some(option => option.id === answer.optionId);
  const counts = answer.counts;
  return Array.isArray(counts) && counts.length === 2 && counts.every(isCount) && counts[0] + counts[1] === interaction.cells.length;
}
