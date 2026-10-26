import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { AllocationAnswer, AllocationInteraction, InteractiveScenario, UndecidedAnswer } from './interactiveTypes';
import { UndecidedButton } from './UndecidedButton';
import './interactive.css';

type Side = 0 | 1;

/** The draft a confirmed answer reopens as: its A cells first, then its B cells. Only the counts were confirmed, not the arrangement. */
const draftOf = (cells: number, answer?: AllocationAnswer | UndecidedAnswer): (Side | null)[] =>
  Array.from({ length: cells }, (_, index) => answer?.kind !== 'allocate' ? null : index < answer.counts[0] ? 0 : 1);

/**
 * 分配同一種有限資源: every cell offers both sides as buttons, so clicking or the keyboard alone completes it (no dragging).
 * The live totals show what each side gets and what is left; 確認答案 opens once every cell is placed, or once 目前無法決定 is
 * pressed (which clears the cells). The draft is never stored.
 */
export function AllocationQuestion({ scenario, interaction, answer, onConfirm, onBack, onReview }: {
  scenario: InteractiveScenario; interaction: AllocationInteraction; answer?: AllocationAnswer | UndecidedAnswer;
  onConfirm: (answer: AllocationAnswer | UndecidedAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [draft, setDraft] = useState(() => draftOf(interaction.cells.length, answer));
  const [undecided, setUndecided] = useState(answer?.kind === 'undecided');
  const counts = [0, 1].map(side => draft.filter(cell => cell === side).length) as [number, number];
  const remaining = draft.length - counts[0] - counts[1];
  const { unit, sides } = interaction;
  const place = (index: number, side: Side) => { setUndecided(false); setDraft(current => current.map((cell, at) => at === index ? side : cell)); };
  const ready = undecided || remaining === 0;
  const caption = undecided ? '確認後記為目前無法決定，可以繼續下一題。' : remaining ? `每一${unit}都安排好，或選目前無法決定，才能確認答案。` : '確認前都可以再調整。';
  return <ScenarioFrame scenario={scenario} caption={caption} canConfirm={ready}
    onConfirm={() => ready && onConfirm(undecided ? { kind: 'undecided', variantId: scenario.id } : { kind: 'allocate', variantId: scenario.id, counts })} onBack={onBack} onReview={onReview}>
    <div className="allocation-sides">{sides.map(side => <section className="paper-card" key={side.id}><h2>{side.label}</h2><p>{side.detail}</p></section>)}</div>
    <div className="allocation-cells">{interaction.cells.map((cell, index) => <fieldset className="allocation-cell" key={cell}>
      <legend>{cell}</legend>
      {sides.map((side, at) => <button type="button" key={side.id} aria-pressed={draft[index] === at} onClick={() => place(index, at as Side)}>{side.label}</button>)}
    </fieldset>)}</div>
    <div className="allocation-totals" role="status">
      {sides.map((side, at) => <p key={side.id}><span>{side.label}</span><b>{counts[at]} {unit}</b></p>)}
      <p><span>還沒安排</span><b>{remaining} {unit}</b></p>
      <div className="allocation-meter" aria-hidden="true"><span style={{ flexGrow: counts[0] }} /><span style={{ flexGrow: counts[1] }} /><span style={{ flexGrow: remaining }} /></div>
    </div>
    <div className="mechanic-extras">
      <button type="button" className="text-button" disabled={remaining === draft.length} onClick={() => setDraft(draftOf(draft.length))}>全部清空，重新安排</button>
      <UndecidedButton pressed={undecided} onPress={() => { setUndecided(true); setDraft(draftOf(draft.length)); }} />
    </div>
  </ScenarioFrame>;
}
