import type { Screen, ValueId, ValueItem } from './types';

/*
 * The interactive second act's question and answer contracts (docs/interactive-scenario-spec.md, ADR 0007).
 * Each question declares one interaction; each confirmed answer is one of a few shapes whose direction needs no guessing
 * (interactiveAnswers.ts). Interactions: allocation (#61), 從初始安排調整 (#63) and 選方案 (#62). Answers: one per interaction,
 * plus 目前無法決定 (#64), which any question accepts. A new kind adds its members to `Interaction` and `InteractiveAnswer`;
 * every consumer switches on `kind` (`answerDirection`, `decisionText`, `isAnswerTo`, the question dispatch in App.tsx).
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

/**
 * 從初始安排調整: an allocation whose situation already has a current arrangement (現況), which may be uneven. `initial` names the
 * side each cell is on now (0 = A, 1 = B), one entry per cell. The question opens on it; keeping it is an explicit choice.
 */
export interface AdjustInteraction extends Omit<AllocationInteraction, 'kind'> {
  kind: 'adjust';
  initial: readonly (0 | 1)[];
}

/** One card of a 選方案 question: what the plan does and what it costs. Option A (first) and B lean to the slot's pair in order. */
export interface ChoiceOption { id: string; label: string; content: string; cost: string; valueId: ValueId }

/** 選一個方案: two mutually exclusive plans shown as cards; the user picks one. */
export interface ChoiceInteraction {
  kind: 'choose';
  options: readonly [ChoiceOption, ChoiceOption];
}

export type Interaction = AllocationInteraction | AdjustInteraction | ChoiceInteraction;

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

/**
 * A confirmed answer to an adjust question: the counts it ends on, which give its direction as for an allocation. `kept` records
 * that it was confirmed through 維持這個安排 with no cell changed afterwards; adjusting and changing back to the initial counts
 * leans the same way but is not kept.
 */
export interface AdjustAnswer { kind: 'adjust'; variantId: string; counts: readonly [number, number]; kept: boolean }

/** A confirmed 選方案 answer: the id of the card picked, which leans to that card's value. */
export interface ChoiceAnswer { kind: 'choose'; variantId: string; optionId: string }

/** 目前無法決定, confirmed like any answer and open to every interaction. It has no direction, unlike an unanswered question it counts as answered. */
export interface UndecidedAnswer { kind: 'undecided'; variantId: string }

/** Only confirmed answers are ever stored in a session; drafts stay in the question's own state. */
export type InteractiveAnswer = AllocationAnswer | AdjustAnswer | ChoiceAnswer | UndecidedAnswer;

/** The three directions the reflection step offers to think from: 情境條件, 原先排序, 下次做法. */
export const reflectionDirections = ['conditions', 'order', 'next'] as const;
export type ReflectionDirection = typeof reflectionDirections[number];

/**
 * The optional 反思筆記 after the result: the question the user picked to look back on, the direction they chose to think from
 * (if any) and what they wrote, possibly nothing. It sits beside the answers and never changes them, the counts or the ranking;
 * it stays on this device, out of result links and images.
 */
export interface Reflection { variantId: string; note: string; direction?: ReflectionDirection }

/** A note is meant to be one sentence; the field stops here. */
export const reflectionNoteLimit = 200;

export interface InteractiveSession {
  screen: Screen;
  values: ValueItem[];
  scenarios: InteractiveScenario[];
  answers: Record<string, InteractiveAnswer>;
  scenarioIndex: number;
  /** Missing until the user picks a question in the reflection step, which can be skipped. */
  reflection?: Reflection;
}
