import { act1Precedence } from './firstAct';
import type { AdjustInteraction, AllocationInteraction, InteractiveAnswer, InteractiveScenario } from './interactiveTypes';
import type { ValueId, ValueItem } from './types';
import { isRedesignAnswer, redesignDirection, redesignText } from './redesignAnswers';

/**
 * The value a confirmed answer keeps first (優先保留), or undefined when it has no direction.
 * An allocation or adjustment leans to the side with more cells, however large the gap (維持這個安排 included, by the initial
 * counts); an even split and 目前無法決定 lean to neither.
 * A picked card leans to its value. An answer for another question never counts.
 */
export function answerDirection(scenario: InteractiveScenario, answer: InteractiveAnswer | undefined): ValueId | undefined {
  if (!answer || answer.variantId !== scenario.id) return undefined;
  const { interaction } = scenario;
  switch (answer.kind) {
    case 'calendar':
    case 'resources':
    case 'scene':
    case 'message':
    case 'priority':
    case 'linked': return redesignDirection(scenario, answer);
    case 'undecided': return undefined;
    case 'choose': return interaction.kind === 'choose' ? interaction.options.find(option => option.id === answer.optionId)?.valueId : undefined;
    case 'allocate':
    case 'adjust': {
      if (interaction.kind !== 'allocate' && interaction.kind !== 'adjust') return undefined;
      const [a, b] = answer.counts;
      return a === b ? undefined : interaction.sides[a > b ? 0 : 1].valueId;
    }
  }
}

/**
 * The confirmed decision in the question's own words, so the user can check where each count came from
 * (「做攝影小誌 4 晚、陪朋友練面試 2 晚」, 「選了「去幫朋友整理新家」」). An adjustment kept through 維持這個安排 reads 維持原本安排;
 * one that was changed reads as its counts, also when it ends back on the initial counts.
 * Only called with an answer to this very question (`isAnswerTo`).
 */
export function decisionText(scenario: InteractiveScenario, answer: InteractiveAnswer): string {
  const { interaction } = scenario;
  switch (answer.kind) {
    case 'calendar':
    case 'resources':
    case 'scene':
    case 'message':
    case 'priority':
    case 'linked': return redesignText(scenario, answer);
    case 'undecided': return '目前無法決定';
    case 'choose': {
      if (interaction.kind !== 'choose') return '';
      return `選了「${interaction.options.find(option => option.id === answer.optionId)?.label ?? ''}」`;
    }
    case 'adjust':
      if (interaction.kind !== 'adjust') return '';
      return answer.kept ? '維持原本安排' : splitText(interaction, answer.counts);
    case 'allocate':
      if (interaction.kind !== 'allocate') return '';
      return splitText(interaction, answer.counts);
  }
}

/** Each side's count in the question's unit, prefixed 平均分配 when even. */
function splitText({ sides, unit }: AllocationInteraction | AdjustInteraction, counts: readonly [number, number]): string {
  const split = sides.map((side, at) => `${side.label} ${counts[at]} ${unit}`).join('、');
  return counts[0] === counts[1] ? `平均分配：${split}` : split;
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

/** A comparison as the result and the reflection step label it; an even split or 目前無法決定 reads 無法對照. */
export const comparisonLabel = (comparison: '一致' | '不同' | undefined) => comparison ? `這次情境選擇與原先排序${comparison}` : '無法對照';

/** A plain object (not null, not an array): the shape every stored record and answer must have before its fields are read. */
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;

/** Whether a stored value is a complete answer to this very question; restored records are checked with it before any use. */
export function isAnswerTo(answer: unknown, scenario: InteractiveScenario): answer is InteractiveAnswer {
  const { interaction } = scenario;
  if (!isRecord(answer) || answer.variantId !== scenario.id) return false;
  if (answer.kind === 'undecided') return Object.keys(answer).length === 2;
  if (answer.kind !== interaction.kind) return false;
  if (interaction.kind === 'choose') return interaction.options.some(option => option.id === answer.optionId);
  if (interaction.kind !== 'allocate' && interaction.kind !== 'adjust') return isRedesignAnswer(answer, scenario);
  const counts = answer.counts;
  if (!Array.isArray(counts) || counts.length !== 2 || !counts.every(isCount) || counts[0] + counts[1] !== interaction.cells.length) return false;
  if (interaction.kind !== 'adjust') return true;
  // A kept answer must end on the initial arrangement's counts.
  return typeof answer.kept === 'boolean' && (!answer.kept || [0, 1].every(side => interaction.initial.filter(cell => cell === side).length === counts[side]));
}
