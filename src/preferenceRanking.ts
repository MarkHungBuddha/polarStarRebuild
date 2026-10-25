import type { Session, ValueItem } from './types';
import { leaningValue, type Placed } from './valueRanking';

export const preferenceScoringNote = '強烈偏向給該側 2 分，稍微偏向給該側 1 分，兩者相當兩側都是 0 分。這是產品計分約定，不表示偏好強度具有兩倍關係，也不是百分比。';
export interface PreferenceScore { value: ValueItem; score: number }
export const isPreferenceSession = (session: Pick<Session, 'scenarios'>) => session.scenarios.length > 0 && session.scenarios.every(scenario => scenario.kind === 'preference');

/** Only confirmed explicit preference answers contribute; neutral adds no points. */
export function preferenceScores(session: Pick<Session, 'values' | 'scenarios' | 'answers'>): PreferenceScore[] {
  return session.values.filter(value => !value.custom).map(value => ({ value, score: session.scenarios.reduce((sum, scenario) => {
    const answer = session.answers[scenario.id];
    return sum + (answer?.kind === 'preference' && answer.variantId === scenario.id && leaningValue(scenario, answer) === value.id ? Math.abs(answer.strength) : 0);
  }, 0) }));
}

/** Total score is the only ranking key. Competition positions retain every positive tie at positions 1–3. */
export function preferenceTopThree(scores: readonly PreferenceScore[]): Placed<PreferenceScore>[] {
  const sorted = scores.filter(item => item.score > 0).sort((left, right) => right.score - left.score);
  return sorted.map(item => ({ item, position: sorted.findIndex(other => other.score === item.score) + 1 })).filter(item => item.position <= 3);
}
