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
/** Identity, slot pair and framing every scenario shares, whatever its mechanic. */
interface ScenarioBase {
  id: string;
  slotId: string;
  pair: readonly [ValueId, ValueId];
  domain: string;
  title: string;
  setup: string;
}
export interface ChoiceScenario extends ScenarioBase {
  kind: 'choice';
  options: readonly [ChoiceOption, ChoiceOption];
}
export interface PreferenceScenario extends ScenarioBase {
  kind: 'preference';
  options: readonly [ChoiceOption, ChoiceOption];
}
/** Negative leans to A, positive to B; zero is an explicitly confirmed neutral answer. */
export type PreferenceStrength = -2 | -1 | 0 | 1 | 2;
export type PreferenceAnswer = { kind: 'preference'; variantId: string; strength: PreferenceStrength };
export interface StrikeScenario extends ScenarioBase {
  kind: 'strike';
  options: readonly [ChoiceOption, ChoiceOption];
}
export interface SliderScenario extends ScenarioBase {
  kind: 'slider';
  question: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  unit: string;
  resultPrefix: string;
  resultSuffix: string;
}
export interface AllocationScenario extends ScenarioBase {
  kind: 'allocate';
  total: number;
  unit: string;
  options: readonly [ChoiceOption, ChoiceOption];
}
export type Scenario = ChoiceScenario | StrikeScenario | SliderScenario | AllocationScenario | PreferenceScenario;
export type ChoiceAnswer = { kind: 'choice'; variantId: string; optionId: string };
export type StrikeAnswer = { kind: 'strike'; variantId: string; optionId: string };
export type SliderAnswer = { kind: 'slider'; variantId: string; value: number };
export type AllocationAnswer = { kind: 'allocate'; variantId: string; allocations: readonly [number, number]; placements?: readonly number[] };
export type Answer = ChoiceAnswer | StrikeAnswer | SliderAnswer | AllocationAnswer | PreferenceAnswer;
export interface Session {
  screen: Screen;
  values: ValueItem[];
  scenarios: Scenario[];
  answers: Record<string, Answer>;
  scenarioIndex: number;
}
