import { useState } from 'react';
import type { RedesignQuestionProps } from './RedesignQuestion';
import { ScenarioFrame } from './ScenarioFrame';
import { LinkedControl } from './LinkedControl';
import './linked.css';

interface Draft { value: number; touched: boolean; kept: boolean; undecided: boolean }
export function LinkedQuestion({ scenario, answer, onConfirm, onBack, onReview }: RedesignQuestionProps) {
  const interaction = scenario.interaction;
  const empty: Draft = { value: interaction.kind === 'linked' ? interaction.initial : 0, touched: false, kept: false, undecided: false };
  const initial: Draft = answer?.kind === 'linked' ? { value: answer.value, touched: true, kept: answer.kept, undecided: false } : { ...empty, undecided: answer?.kind === 'undecided' };
  const [draft, setDraft] = useState(initial);
  const [history, setHistory] = useState<Draft[]>([]);
  const change = (next: Draft) => { setHistory(current => [...current, draft]); setDraft(next); };
  const valueDraft = (value: number): Draft => ({ value, touched: true, kept: false, undecided: false });
  const undo = () => { if (history.length) { setDraft(history[history.length - 1]); setHistory(current => current.slice(0, -1)); } };
  return <ScenarioFrame scenario={scenario} caption={draft.undecided ? '已選擇目前無法決定，請確認答案。' : '確認前可以調整條件或明確維持目前安排。'} canConfirm={draft.undecided || draft.touched} onBack={onBack} onReview={onReview} onConfirm={() => onConfirm(draft.undecided ? { kind: 'undecided', variantId: scenario.id } : { kind: 'linked', variantId: scenario.id, value: draft.value, kept: draft.kept })}>
    {interaction.kind === 'linked' && <LinkedControl interaction={interaction} value={draft.value} onChange={value => change(valueDraft(value))} onDragStart={() => setHistory(current => [...current, draft])} onDragValue={value => setDraft(valueDraft(value))} />}
    <nav className="actions">
      <button className="secondary" onClick={undo} disabled={!history.length}>撤回最近一步</button>
      <button className="secondary" onClick={() => change(empty)}>重設草稿</button>
      <button className="secondary" aria-pressed={draft.kept} onClick={() => change({ ...draft, touched: true, kept: true, undecided: false })}>維持這個安排</button>
      {answer && <button className="secondary" onClick={() => change(initial)}>還原已確認安排</button>}
      <button className="secondary" aria-pressed={draft.undecided} onClick={() => change({ ...draft, undecided: !draft.undecided })}>目前無法決定</button>
    </nav>
  </ScenarioFrame>;
}
