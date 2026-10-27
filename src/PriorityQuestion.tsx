import { useState } from 'react';
import type { RedesignQuestionProps } from './RedesignQuestion';
import { ScenarioFrame } from './ScenarioFrame';
import { useObjectDrag } from './useObjectDrag';
import type { PriorityInteraction } from './redesignTypes';
import './priority.css';

function PriorityControl({ interaction, order, onChange }: { interaction: PriorityInteraction; order: readonly string[]; onChange: (order: string[]) => void }) {
  const move = (id: string, target: string) => {
    if (id === target) return;
    const next = order.filter(item => item !== id);
    next.splice(order.indexOf(target), 0, id);
    onChange(next);
  };
  const drag = useObjectDrag(move);
  const itemRow = (id: string) => {
    const item = interaction.items.find(entry => entry.id === id)!;
    const index = order.indexOf(id);
    return <li key={id} className="priority-object">
      <button className="priority-pick" {...drag.source(id, item.label, id)}><strong>{index + 1}. {item.label}</strong><span>{item.detail}</span></button>
      <div className="priority-moves">
        <button className="secondary" aria-label={`將${item.label}往前移`} disabled={index === 0} onClick={() => move(id, order[index - 1])}>往前移</button>
        <button className="secondary" aria-label={`將${item.label}往後移`} disabled={index === order.length - 1} onClick={() => move(id, order[index + 1])}>往後移</button>
      </div>
    </li>;
  };
  return <div className="priority-control">
    <p>拖動活動改變順序，或先選活動再選位置；也可以用往前移、往後移調整。按 Esc 取消拿取。</p>
    <p role="status">可保留 {interaction.capacity} {interaction.resourceUnit ?? '項'}，其餘 {order.length - interaction.capacity} 項延後。</p>
    {drag.feedback}
    <section aria-label={interaction.keepLabel}><h2>{interaction.keepLabel}</h2><ol>{order.slice(0, interaction.capacity).map(itemRow)}</ol></section>
    <section aria-label={interaction.deferLabel}><h2>{interaction.deferLabel}</h2><ol start={interaction.capacity + 1}>{order.slice(interaction.capacity).map(itemRow)}</ol></section>
  </div>;
}

/** Ordering is a draft until confirmed, including explicit acceptance of the initial order. */
export function PriorityQuestion({ scenario, answer, onConfirm, onBack, onReview }: RedesignQuestionProps) {
  const interaction = scenario.interaction;
  const original = interaction.kind === 'priority' ? interaction.items.map(item => item.id) : [];
  const confirmed = answer?.kind === 'priority' ? [...answer.order] : original;
  const initial = { order: confirmed, ready: answer?.kind === 'priority', kept: answer?.kind === 'priority' && answer.kept, undecided: answer?.kind === 'undecided' };
  const [draft, setDraft] = useState(initial);
  const [history, setHistory] = useState<typeof initial[]>([]);
  const [version, setVersion] = useState(0);
  const update = (next: typeof initial) => { setHistory(current => [...current, draft]); setDraft(next); };
  if (interaction.kind !== 'priority') return null;
  const confirm = () => {
    if (draft.undecided) onConfirm({ kind: 'undecided', variantId: scenario.id });
    else if (draft.ready) onConfirm({ kind: 'priority', variantId: scenario.id, order: draft.order, kept: draft.kept });
  };
  const reset = (next: typeof initial) => { update(next); setVersion(current => current + 1); };
  return <ScenarioFrame scenario={scenario} caption={draft.undecided ? '已選擇目前無法決定，請確認答案。' : '容量內的活動會保留，其餘延後。調整完成或明確維持後，再確認答案。'} canConfirm={draft.ready || draft.undecided} onConfirm={confirm} onBack={onBack} onReview={onReview}>
    <PriorityControl key={version} interaction={interaction} order={draft.order} onChange={order => update({ order, ready: true, kept: false, undecided: false })} />
    <nav className="actions">
      <button className="secondary" onClick={() => reset({ order: original, ready: true, kept: true, undecided: false })}>維持初始順序</button>
      <button className="secondary" disabled={!history.length} onClick={() => { const previous = history[history.length - 1]; if (previous) { setDraft(previous); setHistory(current => current.slice(0, -1)); setVersion(current => current + 1); } }}>撤回最近一步</button>
      <button className="secondary" onClick={() => reset({ order: original, ready: false, kept: false, undecided: false })}>重設草稿</button>
      {answer && <button className="secondary" onClick={() => reset(initial)}>還原已確認安排</button>}
      <button className="secondary" aria-pressed={draft.undecided} onClick={() => reset({ ...draft, undecided: !draft.undecided })}>目前無法決定</button>
    </nav>
  </ScenarioFrame>;
}
