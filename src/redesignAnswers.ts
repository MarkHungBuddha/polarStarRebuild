import type { InteractiveScenario } from './interactiveTypes';
import type { RedesignAnswer } from './redesignTypes';
import { isRecord } from './interactiveAnswers';
import type { ValueId } from './types';

/** Counts only a semantically comparable allocation; never infer direction from distance or text. */
export function redesignDirection({ interaction }: InteractiveScenario, answer: RedesignAnswer): ValueId | undefined {
  if (answer.kind === 'calendar' && interaction.kind === 'calendar') {
    const left = answer.placements.filter(side => side === 0).length;
    return left * 2 === answer.placements.length ? undefined : interaction.sides[left * 2 > answer.placements.length ? 0 : 1].valueId;
  }
  return undefined;
}

export function redesignText({ interaction }: InteractiveScenario, answer: RedesignAnswer): string {
  if (answer.kind === 'calendar' && interaction.kind === 'calendar') return answer.placements.map((side, index) => `${interaction.slots[index]}：${interaction.sides[side].label}`).join('；');
  if (answer.kind === 'message' && interaction.kind === 'message') return answer.sent ? `傳送的訊息：${interaction.sentences.filter(sentence => answer.keptIds.includes(sentence.id)).map(sentence => sentence.text).join('')}` : '這次不傳訊息';
  return '';
}

/** Only completed mechanisms accept answers. Each mechanism adds its own validation here. */
export function isRedesignAnswer(answer: unknown, { interaction, id }: InteractiveScenario): answer is RedesignAnswer {
  if (!isRecord(answer) || answer.variantId !== id || answer.kind !== interaction.kind) return false;
  if (interaction.kind === 'calendar') return Array.isArray(answer.placements) && answer.placements.length === interaction.slots.length && answer.placements.every(side => side === 0 || side === 1);
  if (interaction.kind === 'message') return Array.isArray(answer.keptIds) && new Set(answer.keptIds).size === answer.keptIds.length && answer.keptIds.every(id => typeof id === 'string' && interaction.sentences.some(sentence => sentence.id === id)) && typeof answer.sent === 'boolean' && answer.sent === (answer.keptIds.length > 0);
  return false;
}
