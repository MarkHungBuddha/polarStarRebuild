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
export type Scenario = ChoiceScenario;
export type Answer = { kind: 'choice'; variantId: string; optionId: string };
export interface Session {
  screen: Screen;
  values: ValueItem[];
  scenarios: Scenario[];
  answers: Record<string, Answer>;
  scenarioIndex: number;
}
