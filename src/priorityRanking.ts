import { answerDirection } from './interactiveAnswers';
import type { InteractiveSession } from './interactiveTypes';
import type { ValueItem } from './types';
import { topThree, type Placed } from './valueRanking';

/** 優先保留次數 of one core value: confirmed questions this round whose answer kept it first (0–3, each value appears in three slots). */
export interface PriorityCount { value: ValueItem; count: number }

/** How many questions each core value meets in a full round; the denominator of every count shown. */
export const appearancesPerValue = 3;

/** A count as the second act shows it: 「N 次／3 題」. */
export const priorityCountText = (count: number) => `${count} 次／${appearancesPerValue} 題`;

/** A count in the full list of core values, where 0 reads 本輪未優先保留 (not 不重要). */
export const fullListCountText = (count: number) => count ? priorityCountText(count) : '本輪未優先保留';

/** 明確決策: confirmed answers this round that lean to one side; even splits and 目前無法決定 are not among them. */
export const decidedCount = (session: Pick<InteractiveSession, 'scenarios' | 'answers'>) =>
  session.scenarios.filter(scenario => answerDirection(scenario, session.answers[scenario.id])).length;

/** Every core value's count. Each question adds at most 1, to the value its confirmed answer leans to; gaps and cell counts never weigh in. */
export function priorityCounts(session: Pick<InteractiveSession, 'values' | 'scenarios' | 'answers'>): PriorityCount[] {
  const directions = session.scenarios.map(scenario => answerDirection(scenario, session.answers[scenario.id]));
  return session.values.filter(value => !value.custom).map(value => ({ value, count: directions.filter(id => id === value.id).length }));
}

/** The count is the only ranking key: competition positions, every tie kept within positions 1–3, and 0 never placed (so no direction means no ranking). */
export const priorityTopThree = (counts: readonly PriorityCount[]): Placed<PriorityCount>[] =>
  topThree(counts.filter(item => item.count > 0), (left, right) => right.count - left.count);
