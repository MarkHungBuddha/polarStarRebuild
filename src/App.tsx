import { useState } from 'react';
import { baseValues, categoryLabels, categoryOrder } from './data';
import { scenarios } from './scenarios';
import { ScenarioQuestion } from './ScenarioQuestion';
import { ResultEvidence } from './ResultEvidence';
import type { Category, Scenario, Screen, Session, ValueItem } from './types';

export function createSession(): Session {
  const slots = new Map<string, Scenario[]>();
  for (const scenario of scenarios) slots.set(scenario.slotId, [...(slots.get(scenario.slotId) ?? []), scenario]);
  const selected = [...slots.entries()].sort(([left], [right]) => left.localeCompare(right))
    .map(([, variants]) => variants[Math.floor(Math.random() * variants.length)]);
  return { screen: 'intro', values: baseValues.map(value => ({ ...value })), scenarios: selected, answers: {}, scenarioIndex: 0 };
}
export function App() {
  const [session, setSession] = useState<Session>(createSession);
  const [customWord, setCustomWord] = useState('');
  const [notice, setNotice] = useState('');
  const go = (screen: Screen) => { setSession(current => ({ ...current, screen })); window.scrollTo({ top: 0 }); };
  const updateValue = (id: string, change: Partial<ValueItem>) => setSession(current => ({ ...current, values: current.values.map(value => value.id === id ? { ...value, ...change } : value) }));
  const addCustom = () => {
    const word = customWord.trim();
    if (!word) return;
    if (session.values.some(value => value.word === word)) { setNotice('這個價值已在清單中。'); return; }
    setSession(current => ({ ...current, values: [...current.values, { id: 'custom-' + crypto.randomUUID(), word, description: '你自行提出的重要事物。', custom: true, rank: current.values.length + 1 }] }));
    setCustomWord(''); setNotice('');
  };
  const scenario = session.scenarios[session.scenarioIndex];
  return <main className="app-shell">
    <header className="masthead"><a href="./" onClick={event => { event.preventDefault(); go('intro'); }}>北極星</a><span>一份關於選擇的自我專題</span></header>
    {session.screen === 'intro' && <section className="hero">
      <p className="eyebrow">SELF PORTRAIT · 反思練習</p><h1>你重視的，<br />在選擇裡相遇。</h1>
      <p className="lead">先整理你重視的事物，再走進有代價的日常情境。看看這一次，你如何取捨。</p>
      <div className="intro-columns"><p><b>第一幕 · 你重視的</b><br />分類與排序十個價值，重要的可以並列。</p><p><b>第二幕 · 情境中的取捨</b><br />在具體條件下選擇，再回顧自己的答案。</p></div>
      <p className="disclaimer">這是參考 Schwartz 價值理論設計的自編反思工具，題目與解讀尚未驗證。兩幕都是假設性的自我回報，不是診斷，也不代表真實行為。</p>
      <p className="caption">目前為情境原型，不涵蓋十個價值的情境。完整體驗的設計目標約十五分鐘。</p>
      <button className="primary" onClick={() => go('classify')}>開始這次反思</button>
    </section>}
    {session.screen === 'classify' && <section>
      <PageHeader eyebrow="第一幕 · 01" title="哪些事，對你重要？" description="為每個價值選擇一個類別。沒有正確答案，這是你此刻的看法。" />
      <form className="custom-row" onSubmit={event => { event.preventDefault(); addCustom(); }}><label htmlFor="custom-value">自訂價值</label><input id="custom-value" value={customWord} onChange={event => setCustomWord(event.target.value)} maxLength={24} placeholder="也可以加入自己的詞" /><button className="secondary">新增價值</button></form>
      {notice && <p role="status">{notice}</p>}
      <div className="value-list">{session.values.map(value => <article className="value-row" key={value.id}><div><h2>{value.word}</h2><p>{value.description}</p>{value.custom && <small>自訂價值 · 獨立呈現</small>}</div><label className="select-label">{value.word}的重要性<select value={value.category ?? ''} onChange={event => updateValue(value.id, { category: event.target.value as Category })}><option value="" disabled>請選擇</option>{categoryOrder.map(category => <option key={category} value={category}>{categoryLabels[category]}</option>)}</select></label></article>)}</div>
      <nav className="actions"><button className="secondary" onClick={() => go('intro')}>返回說明</button><button className="primary" disabled={session.values.some(value => !value.category)} onClick={() => go('rank')}>下一步：排出順序</button></nav>
    </section>}
    {session.screen === 'rank' && <section>
      <PageHeader eyebrow="第一幕 · 02" title="重要，也可以一樣重要。" description="在每個類別內選擇位置，數字越小越靠前。同一位置代表並列，不必硬分高下。" />
      {categoryOrder.map(category => <section className="rank-section" key={category}><h2>{categoryLabels[category]}</h2>{session.values.filter(value => value.category === category).sort((a,b) => a.rank - b.rank).map(value => <article className="rank-row" key={value.id}><span>{value.word}{value.custom && <small>（自訂）</small>}</span><label className="select-label">{value.word}的位置<select value={value.rank} onChange={event => updateValue(value.id, { rank: Number(event.target.value) })}>{session.values.map((_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></article>)}</section>)}
      <nav className="actions"><button className="secondary" onClick={() => go('classify')}>返回分類</button><button className="primary" onClick={() => go('scenario')}>進入情境中的取捨</button></nav>
    </section>}
    {session.screen === 'scenario' && scenario && <ScenarioQuestion key={scenario.id} scenario={scenario} answer={session.answers[scenario.id]} onBack={() => session.scenarioIndex === 0 ? go('rank') : setSession(current => ({ ...current, scenarioIndex: current.scenarioIndex - 1 }))} onReview={session.answers[scenario.id] ? () => go('result') : undefined} onConfirm={answer => setSession(current => ({ ...current, answers: { ...current.answers, [scenario.id]: answer }, screen: current.scenarioIndex === current.scenarios.length - 1 ? 'result' : 'scenario', scenarioIndex: Math.min(current.scenarioIndex + 1, current.scenarios.length - 1) }))} />}
    {session.screen === 'result' && <section>
      <PageHeader eyebrow="本次反思 · 專題報導" title="這一次，你的選擇。" description="把你重視的事，與情境中的答案放在一起看看。這些是反思線索，不是人格或真實行為的判定。" />
      <section className="result-values"><h2>你重視的</h2>
        {categoryOrder.map(category => <div className="result-category" key={category}><h3>{categoryLabels[category]}</h3>{session.values.filter(value => value.category === category && !value.custom).sort((a,b) => a.rank-b.rank).map(value => {
          const peers = session.values.filter(item => !item.custom && item.category === category && item.rank === value.rank);
          return <p key={value.id}><span>{peers.length > 1 ? '並列位置 ' : '位置 '}{value.rank}</span><strong>{value.word}</strong></p>;
        })}</div>)}
      </section>
      {session.values.some(value => value.custom) && <section className="custom-results"><h2>你的自訂價值</h2><p>保留你的分類與順序，獨立呈現；自訂價值不參與情境題及兩幕對照。</p>{session.values.filter(value => value.custom).sort((a,b) => categoryOrder.indexOf(a.category!) - categoryOrder.indexOf(b.category!) || a.rank-b.rank).map(value => <p key={value.id}><strong>{value.word}</strong> · {categoryLabels[value.category!]} · 位置 {value.rank}</p>)}</section>}
      <section><h2>情境中的取捨</h2><p className="caption">有明確先後與選擇方向時，才標示相符或不同。不同不代表言行不一，相符也不代表更真實。</p>{session.scenarios.map((item, index) => session.answers[item.id] && <ResultEvidence key={item.id} scenario={item} answer={session.answers[item.id]} values={session.values} onEdit={() => setSession(current => ({ ...current, screen: 'scenario', scenarioIndex: index }))} />)}</section>
      <p className="disclaimer">題目與解讀尚未驗證。你可以用這些具體答案，想想在什麼條件下會做不同的選擇；本次作答不會推論你的原因。</p>
      <nav className="actions"><button className="secondary" onClick={() => go('rank')}>回顧第一幕</button><button className="primary" onClick={() => setSession(createSession())}>重新開始</button></nav>
    </section>}
    <footer>北極星 · 把答案留給自己，把選擇看清楚。</footer>
  </main>;
}
function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="section-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>;
}
export default App;
