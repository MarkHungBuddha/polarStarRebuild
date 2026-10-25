import { useState } from 'react';
import { differsFromFirstAct } from './valueRanking';
import { categoryLabels, categoryOrder } from './data';
import { PageHeader } from './PageHeader';
import { ResultShare } from './ResultShare';
import { evidenceId, ResultEvidence } from './ResultEvidence';
import { TopThreeColumns, ValueConclusion } from './ValueConclusion';
import type { Scenario, Session } from './types';
import { isPreferenceSession, preferenceScoringNote } from './preferenceRanking';
import './techo-result.css';

/** The result page: the top-three conclusion, first-act categories and positions, custom values, and the evidence for each confirmed answer. */
export function ResultReport({ session, onEdit, onRevisitFirstAct, onRestart, initialDetail = false }: { initialDetail?: boolean; session: Session; onEdit: (scenario: Scenario, index: number) => void; onRevisitFirstAct: () => void; onRestart: () => void }) {
  const [detail, setDetail] = useState(initialDetail);
  const preference = isPreferenceSession(session);
  const changePage = (next: boolean) => { setDetail(next); window.scrollTo({ top: 0 }); };
  const differing = session.scenarios.filter(item => differsFromFirstAct(item, session.answers[item.id], session.values)).length;
  if (!detail) return <section className="result-page result-cover">
    <PageHeader eyebrow="本次反思 · 一頁摘要" title="這一次，你的選擇。" description={preference ? '對照你原先的排序，回顧這次情境中的偏向。' : '對照你原先的排序，看看這次常選了什麼。'} />
    <section className="conclusion paper-card" aria-labelledby="cover-top-three"><h2 id="cover-top-three">你的前三名</h2><TopThreeColumns session={session} onRevisitFirstAct={onRevisitFirstAct} /></section>
    <p className="summary-takeaway"><span className="marker">{differing ? '有些情境裡，你先顧了原本排在後面的事。' : preference ? '這次沒有明確偏向原先排序較後的價值。' : '這次沒有明確選擇原先排序較後的價值。'}</span></p>
    <p>{differing ? `在 ${differing} 個情境裡，你${preference ? '偏向' : '選了'}原先排序較後的價值。可以從其中一題開始，看看當時有哪些條件影響你的選擇。` : '挑一個最猶豫的場景想想：如果條件改變，你還會做同樣的安排嗎？'}</p>
    <p className="sticky-note" role="note">這裡只整理本次答案，不是人格判定。沒有偏向任何一邊的答案，不算在差異裡。</p>
    {/* PREVIEW ONLY until #54/#55: the new scores have no result-link format or result image yet, so neither is offered. */}
    {preference ? <><p className="sticky-note">{preferenceScoringNote}</p><p className="caption">新版結果暫時不能產生結果連結或結果圖。</p></> : <ResultShare session={session} />}
    <nav className="actions"><button className="primary" onClick={() => changePage(true)}>閱讀詳細報告 →</button><button className="secondary" onClick={onRestart}>重新開始</button></nav>
  </section>;
  const coreValues = session.values.filter(value => !value.custom);
  const customValues = session.values.filter(value => value.custom);
  return <section className="result-page result-detail">
    <button className="text-button report-back" onClick={() => changePage(false)}>← 返回簡短結論</button>
    <PageHeader eyebrow="本次反思 · 詳細報告" title="這一次，你的選擇。" description="把你排出的順序和情境中的答案放在一起看。這些只是回顧的線索，不能用來判定人格或實際行為。" />
    {preference ? <section className="conclusion paper-card" aria-labelledby="conclusion-title"><h2 id="conclusion-title">你的前三名</h2><TopThreeColumns session={session} onRevisitFirstAct={onRevisitFirstAct} /><p>{preferenceScoringNote}</p></section> : <ValueConclusion session={session} onRevisitFirstAct={onRevisitFirstAct} />}
    <section className="result-values"><h2>你重視的</h2>
      {categoryOrder.map(category => <div className="result-category" key={category}><h3>{categoryLabels[category]}</h3>{coreValues.filter(value => value.category === category).sort((a, b) => a.rank - b.rank).map(value => {
        const tied = coreValues.filter(item => item.category === category && item.rank === value.rank).length > 1;
        return <p key={value.id}><span>{tied ? '並列位置 ' : '位置 '}{value.rank}</span><strong>{value.word}</strong></p>;
      })}</div>)}
    </section>
    {customValues.length > 0 && <section className="custom-results"><h2>你的自訂價值</h2><p>這裡保留你自訂的價值、分類和順序。情境題與兩幕對照不包含這些項目。</p><ul>{customValues.sort((a, b) => categoryOrder.indexOf(a.category!) - categoryOrder.indexOf(b.category!) || a.rank - b.rank).map(value => <li key={value.id}><strong>{value.word}</strong> · {categoryLabels[value.category!]} · 位置 {value.rank}</li>)}</ul></section>}
    <section className="result-evidence"><h2>情境中的取捨</h2><p className="caption">只有你排出先後、答案也偏向其中一邊，才會比較兩幕是否相符。這裡比較的是兩次回答，不能用來判斷你是否言行一致。</p>
      <nav className="evidence-contents" aria-label="本次十五個情境"><ol>{session.scenarios.map((item, index) => <li key={item.id}><a href={`#${evidenceId(item)}`}>第 {index + 1} 題 · {item.title}</a></li>)}</ol></nav>
      {session.scenarios.map((item, index) => session.answers[item.id] && <ResultEvidence key={item.id} scenario={item} answer={session.answers[item.id]} values={session.values} position={index + 1} onEdit={() => onEdit(item, index)} />)}</section>
    <p className="sticky-note" role="note">{preference ? '題目與解讀尚未驗證。偏向分數只整理本次已確認答案，無法說明你為什麼這樣選。你可以回看答案，想想換個條件會不會選得不同。' : '題目與解讀尚未驗證。前三名只整理你選了幾次，無法說明你為什麼這樣選。你可以回看答案，想想換個條件會不會選得不同。'}</p>
    <nav className="actions"><button className="secondary" onClick={onRevisitFirstAct}>回顧第一幕</button><button className="primary" onClick={onRestart}>重新開始</button></nav>
  </section>;
}
