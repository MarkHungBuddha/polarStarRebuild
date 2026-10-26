import type { InteractiveScenario } from './interactiveTypes';
import type { RedesignAnswer } from './redesignTypes';
import { isRecord } from './interactiveAnswers';
import type { ValueId } from './types';
import { linkedArrangement } from './linkedArrangement';

/** Counts only a semantically comparable allocation; never infer direction from distance or text. */
export function redesignDirection({ interaction }: InteractiveScenario, answer: RedesignAnswer): ValueId | undefined {
  if (answer.kind === 'priority' && interaction.kind === 'priority' && interaction.resourceUnit) {
    const kept = answer.order.slice(0, interaction.capacity).map(id => interaction.items.find(item => item.id === id)?.valueId);
    if (kept.some(value => value === undefined)) return undefined;
    const counts = new Map<ValueId, number>();
    for (const value of kept) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    const ranked = [...counts].sort((left, right) => right[1] - left[1]);
    return ranked.length && (!ranked[1] || ranked[0][1] > ranked[1][1]) ? ranked[0][0] : undefined;
  }
  if ((answer.kind === 'calendar' && interaction.kind === 'calendar') || (answer.kind === 'resources' && interaction.kind === 'resources')) {
    const left = answer.placements.filter(side => side === 0).length;
    return left * 2 === answer.placements.length ? undefined : interaction.sides[left * 2 > answer.placements.length ? 0 : 1].valueId;
  }
  if (answer.kind === 'linked' && interaction.kind === 'linked' && interaction.resourceSides && interaction.resourceTotal !== undefined && interaction.min === 0 && interaction.max === interaction.resourceTotal) return answer.value * 2 === interaction.resourceTotal ? undefined : interaction.resourceSides[answer.value * 2 > interaction.resourceTotal ? 0 : 1].valueId;
  return undefined;
}

export function redesignText({ interaction }: InteractiveScenario, answer: RedesignAnswer): string {
  if (answer.kind === 'priority' && interaction.kind === 'priority') {
    const labels = answer.order.map(id => interaction.items.find(item => item.id === id)!.label);
    return `${answer.kept ? '維持初始順序；' : ''}${interaction.keepLabel}：${labels.slice(0, interaction.capacity).join('、')}；${interaction.deferLabel}：${labels.slice(interaction.capacity).join('、')}`;
  }
  if (answer.kind === 'calendar' && interaction.kind === 'calendar') return answer.placements.map((side, index) => `${interaction.slots[index]}：${interaction.sides[side].label}`).join('；');
  if (answer.kind === 'linked' && interaction.kind === 'linked') return `${answer.kept ? '明確維持：' : ''}${linkedArrangement(interaction, answer.value)}。${interaction.consequence}`;
  if (answer.kind === 'resources' && interaction.kind === 'resources') return `${answer.kept ? '維持原本安排。' : ''}${interaction.sides.map((side, index) => `${side.label} ${answer.placements.filter(at => at === index).length} ${interaction.unit}（${side.detail}）`).join('；')}。${answer.placements.map((side, index) => `${interaction.objects[index]}：${interaction.sides[side].label}`).join('；')}`;
  return '';
}

/** Only completed mechanisms accept answers. Each mechanism adds its own validation here. */
export function isRedesignAnswer(answer: unknown, { interaction, id }: InteractiveScenario): answer is RedesignAnswer {
  if (!isRecord(answer) || answer.variantId !== id || answer.kind !== interaction.kind) return false;
  if (interaction.kind === 'priority') {
    const order = answer.order;
    return Array.isArray(order) && order.length === interaction.items.length && new Set(order).size === order.length
      && order.every(item => typeof item === 'string' && interaction.items.some(entry => entry.id === item))
      && typeof answer.kept === 'boolean' && (!answer.kept || order.every((item, index) => item === interaction.items[index].id));
  }
  if (interaction.kind === 'calendar') return Array.isArray(answer.placements) && answer.placements.length === interaction.slots.length && answer.placements.every(side => side === 0 || side === 1);
  if (interaction.kind === 'linked') return typeof answer.value === 'number' && Number.isFinite(answer.value) && answer.value >= interaction.min && answer.value <= interaction.max && Math.abs((answer.value - interaction.min) / interaction.step - Math.round((answer.value - interaction.min) / interaction.step)) < 1e-8 && typeof answer.kept === 'boolean';
  if (interaction.kind === 'resources') return Array.isArray(answer.placements) && answer.placements.length === interaction.objects.length && answer.placements.every(side => side === 0 || side === 1) && typeof answer.kept === 'boolean' && (!answer.kept || Boolean(interaction.initial && interaction.initial.every((side, index) => Array.isArray(answer.placements) && side === answer.placements[index])));
  return false;
}
