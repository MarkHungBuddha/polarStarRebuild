import { useState } from 'react';
import type { InteractiveAnswer, InteractiveScenario } from './interactiveTypes';
import { ScenarioFrame } from './ScenarioFrame';
import { CalendarControl } from './CalendarControl';
import './redesign.css';

/** Each control owns an unconfirmed draft. Only this frame's confirmation can replace an answer. */
export function CalendarQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: InteractiveScenario; answer?: InteractiveAnswer; onConfirm: (answer: InteractiveAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const interaction = scenario.interaction;
  const empty = interaction.kind === 'calendar' ? interaction.slots.map(() => -1) : [];
  const initial = answer?.kind === 'calendar' ? [...answer.placements] : empty;
  const [draft, setDraft] = useState<number[]>(initial);
  const [history, setHistory] = useState<{ placements: number[]; undecided: boolean }[]>([]);
  const [undecided, setUndecided] = useState(answer?.kind === 'undecided');
  const [controlVersion, setControlVersion] = useState(0);
  const change = (placements: number[], nextUndecided = false) => {
    setHistory(current => [...current, { placements: draft, undecided }]);
    setDraft(placements); setUndecided(nextUndecided);
  };
  const undo = () => {
    const previous = history[history.length - 1];
    if (previous) { setDraft(previous.placements); setUndecided(previous.undecided); setHistory(current => current.slice(0, -1)); setControlVersion(current => current + 1); }
  };
  const confirm = () => {
    if (undecided) onConfirm({ kind: 'undecided', variantId: scenario.id });
    else if (interaction.kind === 'calendar' && draft.every(side => side === 0 || side === 1)) onConfirm({ kind: 'calendar', variantId: scenario.id, placements: draft as (0 | 1)[] });
  };
  return <ScenarioFrame scenario={scenario} caption={undecided ? '已選擇目前無法決定，請確認答案。' : '每個空格都安排好後，再確認答案。'} canConfirm={undecided || draft.length > 0 && draft.every(side => side >= 0)} onConfirm={confirm} onBack={onBack} onReview={onReview}>
    {interaction.kind === 'calendar' && <CalendarControl key={`${controlVersion}-${undecided}`} interaction={interaction} placements={draft} onChange={change} />}
    <nav className="actions">
      <button className="secondary" disabled={!history.length} onClick={undo}>撤回最近一步</button>
      <button className="secondary" onClick={() => { change(empty); setControlVersion(current => current + 1); }}>重設草稿</button>
      {answer && <button className="secondary" onClick={() => { change(initial, answer.kind === 'undecided'); setControlVersion(current => current + 1); }}>還原已確認安排</button>}
      <button className="secondary" aria-pressed={undecided} onClick={() => change(draft, !undecided)}>目前無法決定</button>
    </nav>
  </ScenarioFrame>;
}


