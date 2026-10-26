import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import { ResourceControl } from './ResourceControl';
import type { RedesignQuestionProps } from './RedesignQuestion';
import './resource.css';

interface Draft { placements: number[]; touched: boolean; kept: boolean; undecided: boolean }

/** A resource draft includes all destinations; confirmation is the only boundary that writes an answer. */
export function ResourceQuestion({ scenario, answer, onConfirm, onBack, onReview }: RedesignQuestionProps) {
  const interaction = scenario.interaction;
  const empty = interaction.kind === 'resources' ? [...interaction.initial ?? interaction.objects.map(() => -1)] : [];
  const initial: Draft = { placements: answer?.kind === 'resources' ? [...answer.placements] : empty, touched: answer?.kind === 'resources', kept: answer?.kind === 'resources' && answer.kept, undecided: answer?.kind === 'undecided' };
  const [draft, setDraft] = useState(initial);
  const [history, setHistory] = useState<Draft[]>([]);
  const [version, setVersion] = useState(0);
  const change = (next: Draft) => { setHistory(current => [...current, draft]); setDraft(next); };
  const restore = (next: Draft) => { change(next); setVersion(current => current + 1); };
  const undo = () => {
    if (!history.length) return;
    setDraft(history[history.length - 1]); setHistory(current => current.slice(0, -1)); setVersion(current => current + 1);
  };
  const complete = draft.touched && draft.placements.length > 0 && draft.placements.every(side => side === 0 || side === 1);
  const confirm = () => {
    if (draft.undecided) onConfirm({ kind: 'undecided', variantId: scenario.id });
    else if (complete) onConfirm({ kind: 'resources', variantId: scenario.id, placements: draft.placements as (0 | 1)[], kept: draft.kept });
  };
  return <ScenarioFrame scenario={scenario} caption={draft.undecided ? '已選擇目前無法決定，請確認答案。' : '把全部資源分配完，再確認答案。'} canConfirm={draft.undecided || complete} onConfirm={confirm} onBack={onBack} onReview={onReview}>
    {interaction.kind === 'resources' && <ResourceControl key={`${version}-${draft.undecided}`} interaction={interaction} placements={draft.placements} onChange={placements => change({ placements, touched: true, kept: false, undecided: false })} />}
    <nav className="actions">
      <button className="secondary" disabled={!history.length} onClick={undo}>撤回最近一步</button>
      <button className="secondary" onClick={() => restore({ placements: empty, touched: false, kept: false, undecided: false })}>重設草稿</button>
      {interaction.kind === 'resources' && interaction.initial && <button className="secondary" aria-pressed={draft.kept} onClick={() => restore({ placements: [...interaction.initial!], touched: true, kept: true, undecided: false })}>維持這個安排</button>}
      {answer && <button className="secondary" onClick={() => restore(initial)}>還原已確認安排</button>}
      <button className="secondary" aria-pressed={draft.undecided} onClick={() => restore({ ...draft, undecided: !draft.undecided })}>目前無法決定</button>
    </nav>
  </ScenarioFrame>;
}
