import { categoryOrder } from './data';
import { act1Precedence } from './firstAct';
import { sliderLeans } from './scenarios/slider-leans';
import type { Answer, Scenario, ValueId, ValueItem } from './types';

/** The value a confirmed answer leans to: a choice, the kept reply, the larger share of an allocation, or a slider condition beyond its authored cut-off. */
export function leaningValue(scenario: Scenario, answer: Answer): ValueId | undefined {
  if (scenario.kind === 'slider') {
    const lean = sliderLeans[scenario.id];
    if (answer.kind !== 'slider' || !lean) return undefined;
    return answer.value <= lean.atMost ? lean.lowValue : answer.value >= lean.atLeast ? lean.highValue : undefined;
  }
  if (scenario.kind === 'allocate') {
    if (answer.kind !== 'allocate') return undefined;
    const [firstAmount, secondAmount] = answer.allocations;
    return firstAmount > secondAmount ? scenario.options[0].valueId : secondAmount > firstAmount ? scenario.options[1].valueId : undefined;
  }
  if (answer.kind !== scenario.kind || (answer.kind !== 'choice' && answer.kind !== 'strike')) return undefined;
  const { optionId } = answer;
  return scenario.options.find(option => option.id === optionId)?.valueId;
}

export interface Placed<T> { item: T; position: number }

/** Competition positions (1, 1, 3…): equal keys share a position, and only positions 1–3 are kept. */
function topThree<T>(items: readonly T[], compare: (a: T, b: T) => number): Placed<T>[] {
  const sorted = [...items].sort(compare);
  return sorted.map(item => ({ item, position: 1 + sorted.findIndex(other => compare(other, item) === 0) }))
    .filter(placed => placed.position <= 3);
}

const act1Compare = (a: ValueItem, b: ValueItem) => categoryOrder.indexOf(a.category!) - categoryOrder.indexOf(b.category!) || a.rank - b.rank;

/** The first act's three highest core values across categories; ties can make the list longer than three. */
export const act1TopThree = (values: readonly ValueItem[]) => topThree(values.filter(value => !value.custom && value.category), act1Compare);

export interface ScenarioTally { value: ValueItem; chosen: number; directional: number }

/** For each core value, how many leaning answers leaned to it out of the leaning answers it appeared in. */
export function scenarioTallies(session: { values: readonly ValueItem[]; scenarios: readonly Scenario[]; answers: Record<string, Answer> }): ScenarioTally[] {
  return session.values.filter(value => !value.custom).map(value => {
    const leans = session.scenarios.filter(scenario => (scenario.pair as readonly string[]).includes(value.id) && session.answers[scenario.id]).map(scenario => leaningValue(scenario, session.answers[scenario.id])).filter(Boolean);
    return { value, chosen: leans.filter(lean => lean === value.id).length, directional: leans.length };
  });
}

// More leans first; with equal leans, fewer leaning appearances means it won more of the times it came up.
const tallyCompare = (a: ScenarioTally, b: ScenarioTally) => b.chosen - a.chosen || a.directional - b.directional;

/** The three values chosen most often in the scenarios; a value never chosen is not placed. */
export const scenarioTopThree = (tallies: readonly ScenarioTally[]) => topThree(tallies.filter(tally => tally.chosen > 0), tallyCompare);

/** Placed items gathered into one row per position, in position order. */
export const byPosition = <T,>(placed: readonly Placed<T>[]) => [...new Set(placed.map(entry => entry.position))].map(position => ({ position, items: placed.filter(entry => entry.position === position).map(entry => entry.item) }));

/** Whether a confirmed answer leans away from the value the first act put ahead; ties and non-leaning answers are neither. */
export function differsFromFirstAct(scenario: Scenario, answer: Answer, values: readonly ValueItem[]) {
  const ahead = act1Precedence(values, scenario.pair)?.ahead;
  const leaning = leaningValue(scenario, answer);
  return Boolean(ahead && leaning && leaning !== ahead.id);
}

/** How often a second-act row was chosen, as every conclusion shows it; tied rows share the count (各). */
export const chosenCountText = ({ chosen, directional }: { chosen: number; directional: number }, tied: boolean) => `${tied ? '各' : ''}選了 ${chosen} 次／共 ${directional} 題`;
