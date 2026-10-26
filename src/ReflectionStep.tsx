import { decisionText, firstActComparison } from './interactiveAnswers';
import { reflectionNoteLimit, type InteractiveSession, type Reflection } from './interactiveTypes';

const comparisonText = { 一致: '這次情境選擇與原先排序一致', 不同: '這次情境選擇與原先排序不同' };

/**
 * The skippable reflection after the result: the user picks one question, sees its situation and raw decision again, and may
 * leave a one-sentence 反思筆記. `onChange` stores the reflection beside the answers; it never touches the answers themselves.
 */
export function ReflectionStep({ session, onChange }: { session: InteractiveSession; onChange: (reflection: Reflection | undefined) => void }) {
  const { reflection } = session;
  const index = session.scenarios.findIndex(scenario => scenario.id === reflection?.variantId);
  const scenario = session.scenarios[index];
  const comparison = scenario && firstActComparison(scenario, session.answers[scenario.id], session.values);
  // Switching questions keeps what was written: the note belongs to this round, and nothing typed is dropped silently.
  const pick = (variantId: string) => onChange(variantId ? { variantId, note: reflection?.note ?? '' } : undefined);
  return <section className="reflection-step" aria-labelledby="reflection-heading">
    <h2 id="reflection-heading">回想一題（可略過）</h2>
    <p>如果有哪一題讓你有感覺，可以挑出來再看一次。不想做也沒關係，結果不受影響。</p>
    <label>選一題有感的情境
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
      {comparison && <span className="evidence-label">{comparisonText[comparison]}</span>}
      <ul className="reflection-prompts">
        <li>是這題的情境條件，讓你做了這個決定嗎？</li>
        <li>原先的排序，是不是需要調整？</li>
        <li>下次遇到類似的情況，想換個做法嗎？</li>
      </ul>
      <label>反思筆記（可不填）
        <textarea rows={3} maxLength={reflectionNoteLimit} value={reflection.note} placeholder="寫一句給自己的話"
          onChange={event => onChange({ ...reflection, note: event.target.value })} />
      </label>
      <p className="caption">筆記只存在這台裝置，不會放進結果連結或結果圖，也不會改變上面的決策與次數。</p>
    </article>}
  </section>;
}
