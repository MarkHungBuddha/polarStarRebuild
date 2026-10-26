import type { Session, ValueItem } from './types';
import { leaningValue, topThree, type Placed } from './valueRanking';

export const preferenceScoringNote = '強烈偏向給該側 2 分，稍微偏向給該側 1 分，兩者相當兩側都是 0 分。這只是計分方式，2 分不代表偏好多一倍，也不是百分比。';
/** A score as every preference conclusion shows it; tied rows share it (各). */
export const preferenceScoreText = (score: number, tied: boolean) => `${tied ? '各 ' : ''}${score} 分`;
export interface PreferenceScore { value: ValueItem; score: number }

/** Only confirmed answers contribute: 2 to the side of a strong lean, 1 to the side of a slight one, nothing for 兩者相當. */
export function preferenceScores(session: Pick<Session, 'values' | 'scenarios' | 'answers'>): PreferenceScore[] {
  return session.values.filter(value => !value.custom).map(value => ({ value, score: session.scenarios.reduce((sum, scenario) => {
    const answer = session.answers[scenario.id];
    return sum + (answer?.variantId === scenario.id && leaningValue(scenario, answer) === value.id ? Math.abs(answer.strength) : 0);
  }, 0) }));
}

/** Total score is the only ranking key. Competition positions retain every positive tie at positions 1–3; zero is never placed. */
export const preferenceTopThree = (scores: readonly PreferenceScore[]): Placed<PreferenceScore>[] =>
  topThree(scores.filter(item => item.score > 0), (left, right) => right.score - left.score);
