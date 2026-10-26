import { comparisonLabel, decisionText, firstActComparison } from './interactiveAnswers';
import { reflectionDirections, reflectionNoteLimit, type InteractiveSession, type Reflection, type ReflectionDirection } from './interactiveTypes';

/** Each direction's name in the picker and the one prompt shown once it is picked. */
const directionText: Record<ReflectionDirection, { label: string; prompt: string }> = {
  conditions: { label: '情境條件', prompt: '是這題的情境條件，讓你做了這個決定嗎？' },
  order: { label: '原先排序', prompt: '原先的排序，是不是需要調整？' },
  next: { label: '下次做法', prompt: '下次遇到類似的情況，想換個做法嗎？' },
};

/**
 * The skippable reflection after the result: the user picks one question, sees its situation and raw decision again, may pick
 * one direction to think from (情境條件, 原先排序 or 下次做法) to see its prompt, and may leave a one-sentence 反思筆記. `onChange` stores the reflection beside the answers; it never touches the answers themselves.
 */
export function ReflectionStep({ session, onChange }: { session: InteractiveSession; onChange: (reflection: Reflection | undefined) => void }) {
  const { reflection } = session;
  const index = session.scenarios.findIndex(scenario => scenario.id === reflection?.variantId);
  const scenario = session.scenarios[index];
  const comparison = scenario && firstActComparison(scenario, session.answers[scenario.id], session.values);
  // Switching questions keeps what was written and the direction: they belong to this round, and nothing is dropped silently.
  const pick = (variantId: string) => onChange(variantId ? { ...reflection, variantId, note: reflection?.note ?? '' } : undefined);
  const turn = (direction: string) => {
    if (!reflection) return;
    const picked = reflectionDirections.find(item => item === direction);
    onChange({ variantId: reflection.variantId, note: reflection.note, ...(picked && { direction: picked }) });
  };
  return <section className="reflection-step" aria-labelledby="reflection-heading">
    <h2 id="reflection-heading">回想一題（可略過）</h2>
    <p>想再看哪一題，可以挑出來。這一步可以略過，不影響結果。</p>
    <label>選一題想再看一次的情境
      <select value={scenario ? scenario.id : ''} onChange={event => pick(event.target.value)}>
        <option value="">先不選</option>
        {session.scenarios.map((item, itemIndex) => <option key={item.id} value={item.id}>第 {itemIndex + 1} 題：{item.title}</option>)}
      </select>
    </label>
    {scenario && reflection && <article className="reflection-card paper-card">
      <p className="eyebrow">第 {index + 1} 題 · {scenario.domain}</p>
      <h3>{scenario.title}</h3>
      <p>{scenario.setup}</p>
      <p className="evidence-quote">你當時的決策：{decisionText(scenario, session.answers[scenario.id])}</p>
      <span className="evidence-label">{comparisonLabel(comparison)}</span>
      <label>從哪個方向想（可不選）
        <select value={reflection.direction ?? ''} onChange={event => turn(event.target.value)}>
          <option value="">先不選</option>
          {reflectionDirections.map(direction => <option key={direction} value={direction}>{directionText[direction].label}</option>)}
        </select>
      </label>
      {reflection.direction && <p className="reflection-prompt">{directionText[reflection.direction].prompt}</p>}
      <label>反思筆記（可不填）
        <textarea rows={3} maxLength={reflectionNoteLimit} value={reflection.note} placeholder="寫一句給自己的話"
          onChange={event => onChange({ ...reflection, note: event.target.value })} />
      </label>
      <p className="caption">筆記只存在這台裝置，不會放進結果連結或結果圖，也不會改變上面的決策與次數。</p>
    </article>}
  </section>;
}
