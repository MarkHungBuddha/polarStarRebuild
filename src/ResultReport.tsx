import { categoryLabels, categoryOrder } from './data';
import { PageHeader } from './PageHeader';
import { evidenceId, ResultEvidence } from './ResultEvidence';
import type { Scenario, Session } from './types';

/** The result page: first-act categories and positions, custom values, and the evidence for each confirmed answer. */
export function ResultReport({ session, onEdit, onRevisitFirstAct, onRestart }: { session: Session; onEdit: (scenario: Scenario, index: number) => void; onRevisitFirstAct: () => void; onRestart: () => void }) {
  const coreValues = session.values.filter(value => !value.custom);
  const customValues = session.values.filter(value => value.custom);
  return <section>
    <PageHeader eyebrow="本次反思 · 專題報導" title="這一次，你的選擇。" description="把你重視的事，與情境中的答案放在一起看看。這些是反思線索，不是人格或真實行為的判定。" />
    <section className="result-values"><h2>你重視的</h2>
      {categoryOrder.map(category => <div className="result-category" key={category}><h3>{categoryLabels[category]}</h3>{coreValues.filter(value => value.category === category).sort((a, b) => a.rank - b.rank).map(value => {
        const tied = coreValues.filter(item => item.category === category && item.rank === value.rank).length > 1;
        return <p key={value.id}><span>{tied ? '並列位置 ' : '位置 '}{value.rank}</span><strong>{value.word}</strong></p>;
      })}</div>)}
    </section>
    {customValues.length > 0 && <section className="custom-results"><h2>你的自訂價值</h2><p>保留你的分類與順序，獨立呈現；自訂價值不參與情境題及兩幕對照。</p>{customValues.sort((a, b) => categoryOrder.indexOf(a.category!) - categoryOrder.indexOf(b.category!) || a.rank - b.rank).map(value => <p key={value.id}><strong>{value.word}</strong> · {categoryLabels[value.category!]} · 位置 {value.rank}</p>)}</section>}
    <section><h2>情境中的取捨</h2><p className="caption">有明確先後與選擇方向時，才標示相符或不同。不同不代表言行不一，相符也不代表更真實。</p>
      <nav className="evidence-contents" aria-label="本次十五個情境"><ol>{session.scenarios.map((item, index) => <li key={item.id}><a href={`#${evidenceId(item)}`}>第 {index + 1} 題 · {item.title}</a></li>)}</ol></nav>
      {session.scenarios.map((item, index) => session.answers[item.id] && <ResultEvidence key={item.id} scenario={item} answer={session.answers[item.id]} values={session.values} position={index + 1} onEdit={() => onEdit(item, index)} />)}</section>
    <p className="disclaimer">題目與解讀尚未驗證。你可以用這些具體答案，想想在什麼條件下會做不同的選擇；本次作答不會推論你的原因。</p>
    <nav className="actions"><button className="secondary" onClick={onRevisitFirstAct}>回顧第一幕</button><button className="primary" onClick={onRestart}>重新開始</button></nav>
  </section>;
}
