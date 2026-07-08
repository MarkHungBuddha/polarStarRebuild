export type Screen = 'intro' | 'classify' | 'rank' | 'battle' | 'result' | 'reflect';

export type Category = 'core' | 'good' | 'low';

export type ValueItem = {
  id: string;
  word: string;
  description: string;
  dimension: 'work' | 'relationship' | 'growth' | 'life' | 'custom';
};

export type BattlePair = [string, string];
