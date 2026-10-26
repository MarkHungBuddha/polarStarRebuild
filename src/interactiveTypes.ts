import type { Screen, ValueId, ValueItem } from './types';

/*
 * The interactive second act's question and answer contracts (docs/interactive-scenario-spec.md, ADR 0007).
 * Each question declares one interaction; each confirmed answer is one of a few shapes whose direction needs no guessing
 * (interactiveAnswers.ts). Only allocation exists so far: 選方案 (#62) and 初始安排 (#63) add their members to `Interaction`,
 * and they and 目前無法決定 (#64) add theirs to `InteractiveAnswer`; every consumer switches on `kind`.
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

export type Interaction = AllocationInteraction | AdjustInteraction;

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
 * A confirmed answer to an adjust question: the counts it ends on, as for an allocation. It counts as 維持原本安排 whenever they equal
 * the initial arrangement's counts, whether kept outright or adjusted and changed back.
 */
export interface AdjustAnswer { kind: 'adjust'; variantId: string; counts: readonly [number, number] }

/** Only confirmed answers are ever stored in a session; drafts stay in the question's own state. */
export type InteractiveAnswer = AllocationAnswer | AdjustAnswer;

export interface InteractiveSession {
  screen: Screen;
  values: ValueItem[];
  scenarios: InteractiveScenario[];
  answers: Record<string, InteractiveAnswer>;
  scenarioIndex: number;
}
