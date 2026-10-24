// Throwaway: four disclosure scopes on the existing root route, ?prototype=share&variant=A-D.
import { useEffect, useState } from 'react';
import { baseValues, categoryLabels, categoryOrder } from './data';
import { selectQuestions, questionShareLink } from './questionPlan';
import { TopThreeColumns } from './ValueConclusion';
import { StarIcon } from './StarIcon';
import type { Answer, Session } from './types';
import './techo-result.css';
import './result-share-prototype.css';

const variants = ['A', 'B', 'C', 'D'] as const;
type Variant = typeof variants[number];
const names = { A: '只看兩份前三名', B: '加上第一幕分類與排序', C: '全部，含逐題答案', D: '由分享者每次選擇' };
const questions = selectQuestions(new Set(), 'share-prototype');
const session: Session = {
  screen: 'result', scenarioIndex: 14, scenarios: questions,
  values: [...baseValues.map((value, index) => ({ ...value, category: categoryOrder[Math.floor(index / 4)], rank: index % 4 + 1 })),
    { id: 'custom-demo', word: '保有獨處的時間', description: '示範自訂價值', custom: true, category: 'core', rank: 5 }],
  answers: Object.fromEntries(questions.map((q, i): [string, Answer] => [q.id,
    q.kind === 'slider' ? { kind: q.kind, variantId: q.id, value: q.initial } :
    q.kind === 'allocate' ? { kind: q.kind, variantId: q.id, allocations: [q.total, 0] } :
    { kind: q.kind, variantId: q.id, optionId: q.options[i % 2].id }])),
};
const getVariant = (): Variant => { const key = new URLSearchParams(location.search).get('variant'); return variants.find(v => v === key) ?? 'A'; };

export function ResultSharePrototype() {
  const [variant, setVariant] = useState<Variant>(getVariant);
  const [custom, setCustom] = useState(false);
  const [ranking, setRanking] = useState(false);
  const [answers, setAnswers] = useState(false);
  const [view, setView] = useState<'owner' | 'recipient'>('owner');
  const [notice, setNotice] = useState('');
  const showRanking = variant === 'B' || variant === 'C' || (variant === 'D' && ranking);
  const showAnswers = variant === 'C' || (variant === 'D' && answers);
  const change = (next: Variant) => {
    setVariant(next); setNotice('');
    const url = new URL(location.href); url.searchParams.set('variant', next); history.replaceState(null, '', url);
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest('input,textarea,select,[contenteditable],button')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); change(variants[(variants.indexOf(variant) + (event.key === 'ArrowLeft' ? 3 : 1)) % 4]);
      }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [variant]);
  const scope = ['兩份前三名', ...(showRanking ? ['第一幕分類與排序'] : []), ...(showAnswers ? ['15 題已確認答案'] : []), ...(custom ? ['自訂價值'] : [])];
  const summary = <section className="paper-card"><h2>{view === 'owner' ? '你的前三名' : '分享者的兩份前三名'}</h2><TopThreeColumns session={session} onRevisitFirstAct={() => {}} /><p className="caption">以下「你」指作答的分享者。每個價值只出現在少數幾題，改一題就可能換名次；不是人格判定，也不能代表實際行為。</p></section>;
  const firstAct = <section className="proto-ranking"><h2>第一幕：你重視的</h2>{categoryOrder.map(category => <div key={category}><h3>{categoryLabels[category]}</h3><ol>{session.values.filter(v => !v.custom && v.category === category).map(v => <li key={v.id}>{v.word}</li>)}</ol></div>)}</section>;
  const evidence = <section><h2>逐題答案 · 15 題</h2><p>可展開查看題目背景、選項與分享者的答案。</p>{questions.map((q, i) => {
    const answer = session.answers[q.id];
    return <details key={q.id} className="proto-answer"><summary>第 {i + 1} 題 · {q.title}</summary><p>{q.setup}</p>
      {'options' in q && q.options.map(option => <p key={option.id}><strong>{option.label}</strong><br />{option.consequence}</p>)}
      <p className="sticky-note">{answer.kind === 'slider' && q.kind === 'slider' ? `${q.resultPrefix} ${answer.value} ${q.unit}${q.resultSuffix}` :
        answer.kind === 'allocate' && q.kind === 'allocate' ? q.options.map((option, n) => `${option.label}：${answer.allocations[n]} ${q.unit}`).join('；') :
        (answer.kind === 'choice' || answer.kind === 'strike') && 'options' in q ? `分享者${answer.kind === 'strike' ? '留下的回覆' : '選擇'}：${q.options.find(o => o.id === answer.optionId)?.label}` : ''}</p></details>;
  })}</section>;
  const customSection = <section className="sticky-note"><h2>自訂價值</h2><p>保有獨處的時間 · 這就是我 · 位置 5</p><p className="caption">由分享者自行加入，未納入兩份前三名或情境對照。</p></section>;
  return <main className={`app-shell proto-share proto-${variant}`}>
    <header className="masthead"><a href="?prototype=share"><StarIcon />北極星</a><span>反思筆記</span></header>
    <aside className="proto-banner"><strong>公開範圍原型 · {variant}／{names[variant]}</strong><p>全部使用同一份示範答案；此頁只預覽，不會建立結果連結或分享圖片。</p><div className="actions"><button aria-pressed={view === 'owner'} onClick={() => setView('owner')}>分享者的結果頁</button><button aria-pressed={view === 'recipient'} onClick={() => setView('recipient')}>收件者的唯讀頁</button></div></aside>
    <h1>{view === 'owner' ? '這一次，你的選擇。' : '一份分享給你的反思。'}</h1>
    {view === 'recipient' && <p>這是分享者自己作答的結果。你可以閱讀，也可以用同一份題目作答；你的答案會另外保存。</p>}
    {summary}
    {view === 'owner' ? <>
      <section className="proto-share-panel"><p className="eyebrow">把這次反思帶走</p><h2>分享結果</h2>
        <p>{variant === 'D' ? '選擇這次結果連結要公開的內容。' : `結果連結會公開：${names[variant]}。`}</p>
        {variant === 'D' && <fieldset><legend>結果連結包含</legend><label><input type="checkbox" checked disabled />兩份前三名（固定包含）</label><label><input type="checkbox" checked={ranking} onChange={e => setRanking(e.target.checked)} />第一幕分類與排序</label><label><input type="checkbox" checked={answers} onChange={e => setAnswers(e.target.checked)} />逐題答案（含接受條件與時間分配）</label></fieldset>}
        <label><input type="checkbox" checked={custom} onChange={e => setCustom(e.target.checked)} />一併分享自訂價值</label><p className="caption">預設不分享。勾選後，結果連結與結果圖都會包含「保有獨處的時間」。</p>
        <p className="proto-scope" role="status">收件者會看到：{scope.join('、')}。</p>
        <div className="actions"><button className="primary" onClick={() => { setView('recipient'); window.scrollTo(0, 0); }}>預覽收件者畫面 →</button><button className="secondary" onClick={() => setNotice('結果圖預計使用系統分享選單，不支援時提供下載。圖片內容與版面另案決定；這裡只示意入口。')}>分享結果圖（示意）</button></div>{notice && <p role="status">{notice}</p>}
      </section>
      <details className="proto-own"><summary>你的完整報告（自己始終看得到）</summary>{firstAct}{customSection}{evidence}</details>
      <footer><h2>只想讓對方做同一份題目？</h2><p>題目連結不包含你的答案、排名或自訂價值。</p><a href={questionShareLink(questions, location)}>開啟同一份題目</a></footer>
    </> : <>
      <p className="proto-scope">這份結果包含：{scope.join('、')}。</p>
      {showRanking && firstAct}{custom && customSection}{showAnswers && evidence}
      <footer><h2>換你想想，你會怎麼選？</h2><a className="primary" href={questionShareLink(questions, location)}>用同一份題目作答 →</a><p>將開啟正式作答流程。這份示範結果不會寫入你的作答紀錄。</p></footer>
    </>}
    <nav className="proto-switcher" aria-label="原型方案"><button aria-label="上一個方案" onClick={() => change(variants[(variants.indexOf(variant) + 3) % 4])}>←</button><select aria-label="選擇方案" value={variant} onChange={e => change(e.target.value as Variant)}>{variants.map(v => <option key={v} value={v}>{v} · {names[v]}</option>)}</select><button aria-label="下一個方案" onClick={() => change(variants[(variants.indexOf(variant) + 1) % 4])}>→</button></nav>
  </main>;
}
