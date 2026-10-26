import type { PreferenceStrength } from './types';

/** Each step of the five-step scale as the question offers it and the result report quotes it. */
export const preferenceLabels: Record<PreferenceStrength, string> = {
  [-2]: '強烈偏向 A', [-1]: '稍微偏向 A', 0: '兩者相當', 1: '稍微偏向 B', 2: '強烈偏向 B',
};
