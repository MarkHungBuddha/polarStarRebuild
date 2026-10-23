import { useState } from 'react';
import { act1TopThree, scenarioTallies, scenarioTopThree, differsFromFirstAct } from './valueRanking';
import { categoryLabels, categoryOrder } from './data';
import { PageHeader } from './PageHeader';
import { evidenceId, ResultEvidence } from './ResultEvidence';
import { ValueConclusion } from './ValueConclusion';
import type { Scenario, Session } from './types';

/** The result page: the top-three conclusion, first-act categories and positions, custom values, and the evidence for each confirmed answer. */
export function ResultReport({ session, onEdit, onRevisitFirstAct, onRestart, initialDetail = false }: { initialDetail?: boolean; session: Session; onEdit: (scenario: Scenario, index: number) => void; onRevisitFirstAct: () => void; onRestart: () => void }) {
  const [detail, setDetail] = useState(initialDetail);
  const changePage = (next: boolean) => { setDetail(next); window.scrollTo({ top: 0 }); };
  const stated = act1TopThree(session.values).filter(item => item.position === 1).map(item => item.item.word);
  const chosen = scenarioTopThree(scenarioTallies(session)).filter(item => item.position === 1).map(item => item.item.value.word);
  const differing = session.scenarios.filter(item => differsFromFirstAct(item, session.answers[item.id], session.values)).length;
  const briefNames = (words: string[]) => words.slice(0, 3).join('、') + (words.length > 3 ? `等 ${words.length} 項（並列）` : '');
  if (!detail) return <section className="result-cover">
    <PageHeader eyebrow="本次反思 · 一頁摘要" title="這一次，你的選擇。" description="先帶走一個發現，再慢慢讀懂每次取捨。" />
    <div className="summary-pair"><div><p className="eyebrow">你最重視的</p><h2>{briefNames(stated) || '尚未排序'}</h2></div><div><p className="eyebrow">情境裡最常選的</p><h2>{briefNames(chosen) || '沒有明確偏向'}</h2></div></div>
    <p className="summary-takeaway">{differing ? '有些選擇，讓你重視的另一面浮現。' : '這次的選擇，沒有明確偏離你原先的排序。'}</p>
    <p>{differing ? '在 ' + differing + ' 個情境裡，你選了原先排序較後的價值。可以從其中一題開始，看看是什麼條件改變了你的取捨。' : '挑一個最猶豫的場景想想：如果條件改變，你還會做同樣的安排嗎？'}</p>
    <p className="caption">這是本次答案的整理，不是人格判定；並列與沒有偏向的答案不算落差。</p>
    <nav className="actions"><button className="primary" onClick={() => changePage(true)}>閱讀詳細報告 →</button><button className="secondary" onClick={onRestart}>重新開始</button></nav>
  </section>;
  const coreValues = session.values.filter(value => !value.custom);
  const customValues = session.values.filter(value => value.custom);
  return <section>
    <button className="text-button report-back" onClick={() => changePage(false)}>← 返回簡短結論</button>
    <PageHeader eyebrow="本次反思 · 詳細報告" title="這一次，你的選擇。" description="把你重視的事，與情境中的答案放在一起看看。這些是反思線索，不是人格或真實行為的判定。" />
    <ValueConclusion session={session} onRevisitFirstAct={onRevisitFirstAct} />
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
    <p className="disclaimer">題目與解讀尚未驗證。你可以用這些具體答案，想想在什麼條件下會做不同的選擇；前三名只是次數整理，不會推論你的原因。</p>
    <nav className="actions"><button className="secondary" onClick={onRevisitFirstAct}>回顧第一幕</button><button className="primary" onClick={onRestart}>重新開始</button></nav>
  </section>;
}
