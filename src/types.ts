export type ValueId = 'autonomy' | 'stimulation' | 'hedonism' | 'achievement' | 'influence' | 'security' | 'rules' | 'tradition' | 'care' | 'fairness';
export type Category = 'core' | 'good' | 'low';
export type Screen = 'intro' | 'classify' | 'rank' | 'scenario' | 'result';
export interface ValueItem {
  id: string;
  word: string;
  description: string;
  custom?: boolean;
  category?: Category;
  rank: number;
}
