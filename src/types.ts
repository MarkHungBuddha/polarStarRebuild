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
/** One side of a five-step question: the option, its cost, and the value a lean to it scores for. */
export interface PreferenceOption { id: string; label: string; consequence: string; valueId: ValueId }
/** A five-step preference question: two options, each with its cost; option A (first) and B lean to the slot's pair in order. */
export interface Scenario {
  id: string;
  slotId: string;
  pair: readonly [ValueId, ValueId];
  /** Only one kind remains, but it stays: it is part of the catalog version hash and of every saved question snapshot. */
  kind: 'preference';
  domain: string;
  title: string;
  setup: string;
  options: readonly [PreferenceOption, PreferenceOption];
}
/** Negative leans to A, positive to B; zero is an explicitly confirmed neutral answer. */
export type PreferenceStrength = -2 | -1 | 0 | 1 | 2;
/** Only one kind remains, but it stays: saved sessions carry it, and a copy of the site still checking for it on load would reject records without it. */
export type Answer = { kind: 'preference'; variantId: string; strength: PreferenceStrength };
export interface Session {
  screen: Screen;
  values: ValueItem[];
  scenarios: Scenario[];
  answers: Record<string, Answer>;
  scenarioIndex: number;
}
