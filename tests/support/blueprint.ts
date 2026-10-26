// The blueprint table from docs/scenario-feature-spec.md, written out independently of the catalog: option A leans to the first value.
export const blueprint: Record<string, [string, string]> = {
  slot01: ['autonomy', 'security'],
  slot02: ['autonomy', 'rules'],
  slot03: ['autonomy', 'care'],
  slot04: ['stimulation', 'security'],
  slot05: ['stimulation', 'tradition'],
  slot06: ['stimulation', 'achievement'],
  slot07: ['hedonism', 'achievement'],
  slot08: ['hedonism', 'care'],
  slot09: ['hedonism', 'rules'],
  slot10: ['achievement', 'fairness'],
  slot11: ['influence', 'fairness'],
  slot12: ['influence', 'care'],
  slot13: ['influence', 'tradition'],
  slot14: ['security', 'fairness'],
  slot15: ['rules', 'tradition'],
};
