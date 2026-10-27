import { useState } from 'react';
import type { RedesignQuestionProps } from './RedesignQuestion';
import { ScenarioFrame } from './ScenarioFrame';
import { SceneControl } from './SceneControl';

/** Draft positions only become an answer after explicit confirmation. */
export function SceneQuestion({ scenario, answer, onConfirm, onBack, onReview }: RedesignQuestionProps) {
  const interaction = scenario.interaction;
  const initial = { locationId: answer?.kind === 'scene' ? answer.locationId : undefined, undecided: answer?.kind === 'undecided' };
  const [draft, setDraft] = useState(initial);
  const [history, setHistory] = useState<typeof initial[]>([]);
  const [controlVersion, setControlVersion] = useState(0);
  const change = (next: typeof initial, clearControl = false) => {
    setHistory(current => [...current, draft]);
    setDraft(next);
    if (clearControl) setControlVersion(current => current + 1);
  };
  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setDraft(previous);
    setHistory(current => current.slice(0, -1));
    setControlVersion(current => current + 1);
  };
  if (interaction.kind !== 'scene') return null;
  const valid = interaction.locations.some(location => location.id === draft.locationId);
  return <ScenarioFrame scenario={scenario} caption={draft.undecided ? '已選擇目前無法決定，請確認答案。' : valid ? '看看目前的安排，再確認答案。' : '移到明確的位置後，再確認答案。'} canConfirm={draft.undecided || valid} onConfirm={() => {
    if (draft.undecided) onConfirm({ kind: 'undecided', variantId: scenario.id });
    else if (valid && draft.locationId) onConfirm({ kind: 'scene', variantId: scenario.id, locationId: draft.locationId });
  }} onBack={onBack} onReview={onReview}>
    <SceneControl key={controlVersion} interaction={interaction} locationId={draft.locationId} onChange={locationId => change({ locationId, undecided: false })} />
    <nav className="actions">
      <button className="secondary" disabled={!history.length} onClick={undo}>撤回最近一步</button>
      <button className="secondary" onClick={() => change({ locationId: undefined, undecided: false }, true)}>重設草稿</button>
      {answer && <button className="secondary" onClick={() => change(initial, true)}>還原已確認安排</button>}
      <button className="secondary" aria-pressed={draft.undecided} onClick={() => change({ ...draft, undecided: !draft.undecided }, true)}>目前無法決定</button>
    </nav>
  </ScenarioFrame>;
}
