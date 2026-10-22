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
export interface ChoiceScenario {
  id: string;
  slotId: string;
  pair: readonly [ValueId, ValueId];
  kind: 'choice';
  domain: string;
  title: string;
  setup: string;
  options: readonly [ChoiceOption, ChoiceOption];
}
export interface SliderScenario {
  id: string;
  slotId: string;
  pair: readonly [ValueId, ValueId];
  kind: 'slider';
  domain: string;
  title: string;
  setup: string;
  question: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  unit: string;
  resultPrefix: string;
  resultSuffix: string;
}
export interface StrikeScenario extends Omit<ChoiceScenario, 'kind'> { kind: 'strike' }
export type Scenario = ChoiceScenario | StrikeScenario | SliderScenario;
export type ChoiceAnswer = { kind: 'choice'; variantId: string; optionId: string };
export type StrikeAnswer = { kind: 'strike'; variantId: string; optionId: string };
export type SliderAnswer = { kind: 'slider'; variantId: string; value: number };
export type Answer = ChoiceAnswer | StrikeAnswer | SliderAnswer;
export interface Session {
  screen: Screen;
  values: ValueItem[];
  scenarios: Scenario[];
  answers: Record<string, Answer>;
  scenarioIndex: number;
}
