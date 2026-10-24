import type { Category, ValueItem } from './types';
export const categoryOrder: Category[] = ['core', 'good', 'low'];
export const categoryLabels: Record<Category, string> = { core: '這就是我', good: '還不錯', low: '不太在乎' };
// Ranks are set when a value is sorted into a category: it joins at the bottom (see withCategory), so classifying in list order gives the list order.
export const baseValues: ValueItem[] = [
  { id: 'autonomy', word: '自主', description: '自己決定想法、方向與行動。', rank: 1 },
  { id: 'stimulation', word: '探索刺激', description: '追求新鮮、變化與挑戰。', rank: 1 },
  { id: 'hedonism', word: '享受生活', description: '在意生活中的樂趣和感官享受。', rank: 1 },
  { id: 'achievement', word: '成就', description: '發揮能力、做出成果，達到自己認定的成功。', rank: 1 },
  { id: 'influence', word: '主導權', description: '希望由自己做決定、安排人力或分配資源。', rank: 1 },
  { id: 'security', word: '安全穩定', description: '希望生活、關係和環境安定，少一些難以預料的變化。', rank: 1 },
  { id: 'rules', word: '遵守規範', description: '按照共同規則行事，也顧及別人合理的期待。', rank: 1 },
  { id: 'tradition', word: '傳承', description: '尊重並延續所屬文化、信仰或群體的習俗。', rank: 1 },
  { id: 'care', word: '照顧身邊的人', description: '關心親近的人，也願意照顧他們的需要。', rank: 1 },
  { id: 'fairness', word: '普遍關懷', description: '關心不同群體能否受到公平對待，也在意自然環境。', rank: 1 },
];
