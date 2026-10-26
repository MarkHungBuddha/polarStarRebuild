import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { AdjustAnswer, AdjustInteraction, AllocationAnswer, AllocationInteraction, InteractiveScenario } from './interactiveTypes';
import './interactive.css';

type Side = 0 | 1;

const countsOf = (draft: readonly (Side | null)[]) => [0, 1].map(side => draft.filter(cell => cell === side).length) as [number, number];

/**
 * The draft a question opens with. A confirmed answer reopens as its A cells first, then its B cells, since only the counts were
 * confirmed; an adjust question whose answer keeps the initial counts reopens on the initial arrangement itself, as it does unanswered.
 */
function draftOf(interaction: AllocationInteraction | AdjustInteraction, answer?: AllocationAnswer | AdjustAnswer): (Side | null)[] {
  const initial = interaction.kind === 'adjust' ? [...interaction.initial] : undefined;
  if (initial && (!answer || countsOf(initial).every((count, side) => count === answer.counts[side]))) return initial;
  return interaction.cells.map((_, index) => !answer ? null : index < answer.counts[0] ? 0 : 1);
}

/**
 * 分配同一種有限資源, and 從初始安排調整 when the interaction carries a current arrangement: every cell offers both sides as buttons,
 * so clicking or the keyboard alone completes it (no dragging). The live totals show what each side gets and what is left; 確認答案
 * opens once every cell is placed. An adjust question opens on its 現況 and confirms only after a placement or an explicit
 * 維持這個安排, so leaving it untouched never becomes an answer. The draft is never stored.
 */
export function AllocationQuestion({ scenario, interaction, answer, onConfirm, onBack, onReview }: {
  scenario: InteractiveScenario; interaction: AllocationInteraction | AdjustInteraction; answer?: AllocationAnswer | AdjustAnswer;
  onConfirm: (answer: AllocationAnswer | AdjustAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const initial = interaction.kind === 'adjust' ? interaction.initial : undefined;
  const [draft, setDraft] = useState(() => draftOf(interaction, answer));
  // An allocation starts empty, so placing every cell is already a decision; an adjust question starts complete and needs one.
  const [decided, setDecided] = useState(Boolean(answer) || !initial);
  const counts = countsOf(draft);
  const remaining = draft.length - counts[0] - counts[1];
  const { unit, sides } = interaction;
  const update = (next: (current: (Side | null)[]) => (Side | null)[]) => { setDraft(next); setDecided(true); };
  const place = (index: number, side: Side) => update(current => current.map((cell, at) => at === index ? side : cell));
  const keeps = initial !== undefined && countsOf(initial).every((count, side) => count === counts[side]);
  const caption = remaining ? `每一${unit}都安排好，才能確認答案。`
    : !decided ? '這是現在的安排。可以直接維持，也可以調整；按「確認答案」才算作答。'
    : keeps ? '目前維持原本安排，按「確認答案」才算作答。'
    : '確認前都可以再調整。';
  return <ScenarioFrame scenario={scenario} caption={caption} canConfirm={decided && remaining === 0}
    onConfirm={() => decided && remaining === 0 && onConfirm({ kind: interaction.kind, variantId: scenario.id, counts })} onBack={onBack} onReview={onReview}>
    <div className="allocation-sides">{sides.map(side => <section className="paper-card" key={side.id}><h2>{side.label}</h2><p>{side.detail}</p></section>)}</div>
    {initial && <p className="allocation-current">現況：{sides.map((side, at) => `${side.label} ${countsOf(initial)[at]} ${unit}`).join('、')}。每格標著現在排的是哪一邊。</p>}
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
    {initial && <button type="button" className="secondary" onClick={() => update(() => [...initial])}>維持這個安排</button>}
    <button type="button" className="text-button" disabled={remaining === draft.length} onClick={() => update(current => current.map(() => null))}>全部清空，重新安排</button>
  </ScenarioFrame>;
}
