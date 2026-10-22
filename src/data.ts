import type { Category, ValueItem } from './types';
export const categoryOrder: Category[] = ['core', 'good', 'low'];
export const categoryLabels: Record<Category, string> = { core: '這就是我', good: '還不錯', low: '不太在乎' };
export const baseValues: ValueItem[] = [
  { id: 'autonomy', word: '自主', description: '自己決定想法、方向與行動。', rank: 1 },
  { id: 'stimulation', word: '探索刺激', description: '追求新鮮、變化與挑戰。', rank: 2 },
  { id: 'hedonism', word: '享受生活', description: '重視愉悅與感官上的滿足。', rank: 3 },
  { id: 'achievement', word: '成就', description: '透過能力與成果，達到自己重視的成功標準。', rank: 4 },
  { id: 'influence', word: '主導權', description: '重視對決策、人員或資源的掌握。', rank: 5 },
  { id: 'security', word: '安全穩定', description: '維持生活、關係與環境的安定及可預期性。', rank: 6 },
  { id: 'rules', word: '遵守規範', description: '約束行動，以遵守共同規則與他人合理期待。', rank: 7 },
  { id: 'tradition', word: '傳承', description: '尊重並延續所屬文化、信仰或群體的習俗。', rank: 8 },
  { id: 'care', word: '照顧身邊的人', description: '關心並維護親近者的福祉。', rank: 9 },
  { id: 'fairness', word: '普遍關懷', description: '關心不同群體、公平待遇與自然環境的福祉。', rank: 10 },
];
