import { useState } from 'react';
import type { RedesignQuestionProps } from './RedesignQuestion';
import { ScenarioFrame } from './ScenarioFrame';
import './message.css';

interface MessageDraft { keptIds: string[]; undecided: boolean }

/** Sent messages, not sentence counts, are the decision. Draft edits never leave this question until confirmation. */
export function MessageQuestion({ scenario, answer, onConfirm, onBack, onReview }: RedesignQuestionProps) {
  const interaction = scenario.interaction;
  const allIds = interaction.kind === 'message' ? interaction.sentences.map(sentence => sentence.id) : [];
  const confirmed: MessageDraft = { keptIds: answer?.kind === 'message' ? [...answer.keptIds] : allIds, undecided: answer?.kind === 'undecided' };
  const [draft, setDraft] = useState<MessageDraft>(confirmed);
  const [history, setHistory] = useState<MessageDraft[]>([]);
  if (interaction.kind !== 'message') return null;
  const retained = interaction.sentences.filter(sentence => draft.keptIds.includes(sentence.id));
  const change = (next: MessageDraft) => {
    setHistory(current => [...current, draft]);
    setDraft(next);
  };
  const toggle = (id: string) => change({ keptIds: draft.keptIds.includes(id) ? draft.keptIds.filter(kept => kept !== id) : allIds.filter(kept => kept === id || draft.keptIds.includes(kept)), undecided: false });
  const undo = () => {
    const previous = history[history.length - 1];
    if (previous) { setDraft(previous); setHistory(current => current.slice(0, -1)); }
  };
  const confirm = () => onConfirm(draft.undecided
    ? { kind: 'undecided', variantId: scenario.id }
    : { kind: 'message', variantId: scenario.id, keptIds: retained.map(sentence => sentence.id), sent: retained.length > 0 });
  const confirmLabel = draft.undecided ? '確認答案' : retained.length ? '傳送這段訊息' : '這次不傳';
  return <ScenarioFrame scenario={scenario} caption={draft.undecided ? '已選擇目前無法決定，請確認答案。' : '確認前都只是草稿。留下的話可能同時表達不同考量，這題保留訊息，不判方向。'} canConfirm onConfirm={confirm} confirmLabel={confirmLabel} onBack={onBack} onReview={onReview}>
    <p id="message-instruction">點一句就劃掉，再點一次還原。可以保留多句、整段照傳，或全部刪掉後決定這次不傳。</p>
    <div className="message-bubble paper-card" role="group" aria-label="尚未傳送的訊息" aria-describedby="message-instruction">
      {interaction.sentences.map(sentence => <button className="message-sentence" type="button" key={sentence.id} aria-pressed={draft.keptIds.includes(sentence.id)} onClick={() => toggle(sentence.id)}>{sentence.text}</button>)}
    </div>
    <section className="message-preview paper-card" role="status" aria-label="訊息預覽">
      <h2>訊息預覽</h2>
      <p>{`會傳出 ${retained.length} 句`}</p>
      <p className="message-full-text">{retained.length ? retained.map(sentence => sentence.text).join('') : '沒有留下的內容。確認「這次不傳」後，會記下不傳訊息的決定。'}</p>
      {draft.undecided && <p>目前選擇無法決定，確認後不會傳送上面的草稿。</p>}
    </section>
    <nav className="actions">
      <button className="secondary" disabled={!history.length} onClick={undo}>撤回最近一步</button>
      <button className="secondary" onClick={() => change({ keptIds: allIds, undecided: false })}>重設草稿</button>
      {answer && <button className="secondary" onClick={() => change(confirmed)}>還原已確認安排</button>}
      <button className="secondary" aria-pressed={draft.undecided} onClick={() => change({ ...draft, undecided: !draft.undecided })}>目前無法決定</button>
    </nav>
  </ScenarioFrame>;
}
