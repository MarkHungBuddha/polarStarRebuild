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
export interface ChoiceOption { id: string; label: string; consequence: string; valueId: ValueId }
/** A five-step preference question: two options, each with its cost; option A (first) and B lean to the slot's pair in order. */
export interface Scenario {
  id: string;
  slotId: string;
  pair: readonly [ValueId, ValueId];
  kind: 'preference';
  domain: string;
  title: string;
  setup: string;
  options: readonly [ChoiceOption, ChoiceOption];
}
/** Negative leans to A, positive to B; zero is an explicitly confirmed neutral answer. */
export type PreferenceStrength = -2 | -1 | 0 | 1 | 2;
export type Answer = { kind: 'preference'; variantId: string; strength: PreferenceStrength };
export interface Session {
  screen: Screen;
  values: ValueItem[];
  scenarios: Scenario[];
  answers: Record<string, Answer>;
  scenarioIndex: number;
}
