import type { ValueId } from '../types';

/** Where a slider condition counts as leaning to one value; anything strictly between the two cut-offs leans to neither. */
export interface SliderLean { atMost: number; lowValue: ValueId; atLeast: number; highValue: ValueId }

// Kept apart from the slider registry: the cut-offs interpret confirmed raw values, so changing them must not alter the catalog version or break share links.
// Cut-offs are listed in docs/content-authoring-notes.md; change both together.
export const sliderLeans: Record<string, SliderLean> = {
  'slot01-work': { atMost: 3, lowValue: 'autonomy', atLeast: 12, highValue: 'security' },
  'slot01-home': { atMost: 3, lowValue: 'autonomy', atLeast: 12, highValue: 'security' },
  'slot07-study': { atMost: 2, lowValue: 'achievement', atLeast: 8, highValue: 'hedonism' },
  'slot07-weekends': { atMost: 2, lowValue: 'achievement', atLeast: 7, highValue: 'hedonism' },
  'slot10-accessible': { atMost: 1, lowValue: 'fairness', atLeast: 5, highValue: 'achievement' },
  'slot10-environment': { atMost: 1, lowValue: 'fairness', atLeast: 4, highValue: 'achievement' },
};
