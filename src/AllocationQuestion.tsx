import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { AdjustAnswer, AdjustInteraction, AllocationAnswer, AllocationInteraction, InteractiveScenario, UndecidedAnswer } from './interactiveTypes';
import { UndecidedButton } from './UndecidedButton';
import './interactive.css';

type Side = 0 | 1;

const countsOf = (draft: readonly (Side | null)[]) => [0, 1].map(side => draft.filter(cell => cell === side).length) as [number, number];
const emptyDraft = (cells: number): (Side | null)[] => Array.from({ length: cells }, () => null);

/**
 * The draft a question opens with. A confirmed answer reopens as its A cells first, then its B cells, since only the counts were
 * confirmed; an adjust question whose answer keeps the initial counts reopens on the initial arrangement itself, as it does unanswered.
 * 目前無法決定 reopens with every cell cleared, as it was confirmed.
 */
function draftOf(interaction: AllocationInteraction | AdjustInteraction, answer?: AllocationAnswer | AdjustAnswer | UndecidedAnswer): (Side | null)[] {
  if (answer?.kind === 'undecided') return emptyDraft(interaction.cells.length);
  const initial = interaction.kind === 'adjust' ? [...interaction.initial] : undefined;
  if (initial && (!answer || countsOf(initial).every((count, side) => count === answer.counts[side]))) return initial;
  return interaction.cells.map((_, index) => !answer ? null : index < answer.counts[0] ? 0 : 1);
}

/**
 * 分配同一種有限資源, and 從初始安排調整 when the interaction carries a current arrangement: every cell offers both sides as buttons,
 * so clicking or the keyboard alone completes it (no dragging). The live totals show what each side gets and what is left; 確認答案
 * opens once every cell is placed, or once 目前無法決定 is pressed (which clears the cells). An adjust question opens on its 現況 and
 * confirms only after a placement, an explicit 維持這個安排 or 目前無法決定, so leaving it untouched never becomes an answer.
 * The draft is never stored.
 */
export function AllocationQuestion({ scenario, interaction, answer, onConfirm, onBack, onReview }: {
  scenario: InteractiveScenario; interaction: AllocationInteraction | AdjustInteraction; answer?: AllocationAnswer | AdjustAnswer | UndecidedAnswer;
  onConfirm: (answer: AllocationAnswer | AdjustAnswer | UndecidedAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const initial = interaction.kind === 'adjust' ? interaction.initial : undefined;
  const [draft, setDraft] = useState(() => draftOf(interaction, answer));
  // An allocation starts empty, so placing every cell is already a decision; an adjust question starts complete and needs one.
  const [decided, setDecided] = useState(Boolean(answer) || !initial);
  // Set only by 維持這個安排 (or a reopened kept answer); any change to a cell clears it, even one that ends on the initial counts.
  const [kept, setKept] = useState(answer?.kind === 'adjust' && answer.kept);
  // Set only by 目前無法決定; any other operation clears it.
  const [undecided, setUndecided] = useState(answer?.kind === 'undecided');
  const counts = countsOf(draft);
  const remaining = draft.length - counts[0] - counts[1];
  const { unit, sides } = interaction;
  const update = (next: (current: (Side | null)[]) => (Side | null)[], keeps = false) => { setDraft(next); setDecided(true); setKept(keeps); setUndecided(false); };
  const place = (index: number, side: Side) => update(current => current.map((cell, at) => at === index ? side : cell));
  const markUndecided = () => { setDraft(emptyDraft(draft.length)); setDecided(true); setKept(false); setUndecided(true); };
  const ready = undecided || (decided && remaining === 0);
  const caption = undecided ? '確認後記為目前無法決定，可以繼續下一題。'
    : remaining ? `每一${unit}都安排好，或選目前無法決定，才能確認答案。`
    : !decided ? '這是現在的安排。可以直接維持，也可以調整；按「確認答案」才算作答。'
    : kept ? '目前維持原本安排，按「確認答案」才算作答。'
    : '確認前都可以再調整。';
  const confirmed = (): AllocationAnswer | AdjustAnswer | UndecidedAnswer => undecided ? { kind: 'undecided', variantId: scenario.id }
    : interaction.kind === 'adjust' ? { kind: 'adjust', variantId: scenario.id, counts, kept }
    : { kind: 'allocate', variantId: scenario.id, counts };
  return <ScenarioFrame scenario={scenario} caption={caption} canConfirm={ready}
    onConfirm={() => ready && onConfirm(confirmed())} onBack={onBack} onReview={onReview}>
    <div className="allocation-sides">{sides.map(side => <section className="paper-card" key={side.id}><h2>{side.label}</h2><p>{side.detail}</p></section>)}</div>
    {/* One string, so the sentence wraps as one run of text. */}
    {initial && <p className="allocation-current">{`現況：${sides.map((side, at) => `${side.label} ${countsOf(initial)[at]} ${unit}`).join('、')}。每格標著現在排的是哪一邊。`}</p>}
    <div className="allocation-cells">{interaction.cells.map((cell, index) => <fieldset className="allocation-cell" key={cell}>
      <legend>{cell}</legend>
      {sides.map((side, at) => <button type="button" key={side.id} aria-pressed={draft[index] === at} onClick={() => place(index, at as Side)}>{side.label}</button>)}
      {initial && <small className="allocation-cell-current">現況：{sides[initial[index]].label}</small>}
    </fieldset>)}</div>
    <div className="allocation-totals" role="status">
      {sides.map((side, at) => <p key={side.id}><span>{side.label}</span><b>{counts[at]} {unit}</b></p>)}
      <p><span>還沒安排</span><b>{remaining} {unit}</b></p>
      <div className="allocation-meter" aria-hidden="true"><span style={{ flexGrow: counts[0] }} /><span style={{ flexGrow: counts[1] }} /><span style={{ flexGrow: remaining }} /></div>
    </div>
    <div className="mechanic-extras">
      {initial && <button type="button" className="secondary" onClick={() => update(() => [...initial], true)}>維持這個安排</button>}
      <button type="button" className="text-button" disabled={remaining === draft.length} onClick={() => update(current => current.map(() => null))}>全部清空，重新安排</button>
      <UndecidedButton pressed={undecided} onPress={markUndecided} />
    </div>
  </ScenarioFrame>;
}
