import type { Screen, ValueId, ValueItem } from './types';

/*
 * The interactive second act's question and answer contracts (docs/interactive-scenario-spec.md, ADR 0007).
 * Each question declares one interaction; each confirmed answer is one of a few shapes whose direction needs no guessing
 * (interactiveAnswers.ts). Allocation (#61), 選方案 (#62) and 目前無法決定 (#64) exist so far: 初始安排 (#63) adds its members
 * to `Interaction` and `InteractiveAnswer`; every consumer switches on `kind` (`decisionText` included).
 */

/** One side of an allocation: what the cells given to it are spent on. Side A (first) and B lean to the slot's pair in order. */
export interface AllocationSide { id: string; label: string; detail: string; valueId: ValueId }

/**
 * 分配同一種有限資源: an even number of cells (evenings, budget shares…) split between two sides, so an even split is possible.
 * `cells` are the labels shown on each cell; `unit` counts them in the live totals (「4 晚」).
 */
export interface AllocationInteraction {
  kind: 'allocate';
  unit: string;
  cells: readonly string[];
  sides: readonly [AllocationSide, AllocationSide];
}

/** One card of a 選方案 question: what the plan does and what it costs. Option A (first) and B lean to the slot's pair in order. */
export interface ChoiceOption { id: string; label: string; content: string; cost: string; valueId: ValueId }

/** 選一個方案: two mutually exclusive plans shown as cards; the user picks one. */
export interface ChoiceInteraction {
  kind: 'choose';
  options: readonly [ChoiceOption, ChoiceOption];
}

export type Interaction = AllocationInteraction | ChoiceInteraction;

/** An interactive question variant. Slot, pair and three variants per slot work as in the five-step bank; `interaction` replaces its `kind: 'preference'`. */
export interface InteractiveScenario {
  id: string;
  slotId: string;
  pair: readonly [ValueId, ValueId];
  domain: string;
  title: string;
  setup: string;
  interaction: Interaction;
}

/**
 * A confirmed allocation: how many cells went to side A and to side B, summing to the question's cell count. The cell-by-cell
 * arrangement is not part of the answer. `variantId` ties the answer to its question, as in the five-step answers.
 */
export interface AllocationAnswer { kind: 'allocate'; variantId: string; counts: readonly [number, number] }

/** A confirmed 選方案 answer: the id of the card picked, which leans to that card's value. */
export interface ChoiceAnswer { kind: 'choose'; variantId: string; optionId: string }

/** 目前無法決定, confirmed like any answer and open to every interaction. It has no direction, unlike an unanswered question it counts as answered. */
export interface UndecidedAnswer { kind: 'undecided'; variantId: string }

/** Only confirmed answers are ever stored in a session; drafts stay in the question's own state. */
export type InteractiveAnswer = AllocationAnswer | ChoiceAnswer | UndecidedAnswer;

export interface InteractiveSession {
  screen: Screen;
  values: ValueItem[];
  scenarios: InteractiveScenario[];
  answers: Record<string, InteractiveAnswer>;
  scenarioIndex: number;
}
