import { useEffect, useState } from 'react';
import { baseValues, categoryLabels, categoryOrder } from './data';
import { questionShareLink, requestedQuestions, selectQuestions } from './questionPlan';
import { positionCount, withCategory } from './firstAct';
import { clearSeenHistory, loadSeenHistory, markQuestionSeen } from './seenHistory';
import { ScenarioQuestion } from './ScenarioQuestion';
import { evidenceId } from './ResultEvidence';
import { ResultReport } from './ResultReport';
import { HomeIntro } from './HomeIntro';
import { PageHeader } from './PageHeader';
import { ThemeControl } from './ThemeControl';
import { ShareFooter } from './ShareFooter';
import { clearSavedSession, loadSavedSession, saveSession } from './sessionStorage';
import { storageClearFailedNotice, storageSaveFailedNotice } from './storageNotices';
import type { Scenario, Screen, Session, ValueItem } from './types';

export function createSession(questions: Scenario[] = selectQuestions()): Session {
  return { screen: 'intro', values: baseValues.map(value => ({ ...value })), scenarios: questions, answers: {}, scenarioIndex: 0 };
}
const sameQuestions = (left: readonly Scenario[], right: readonly Scenario[]) => left.length === right.length && left.every((scenario, index) => scenario.id === right[index].id);

export function App() {
  const [request, setRequest] = useState(() => requestedQuestions(window.location.search));
  const [initialHistory] = useState(loadSeenHistory);
  // A saved session is always offered, even under a share link for other questions: replacing it must be the user's explicit choice.
  const [initialSaved] = useState(loadSavedSession);
  const [resumable, setResumable] = useState(initialSaved.session);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [storageNotice, setStorageNotice] = useState(initialSaved.notice ?? initialHistory.notice ?? '');
  const [session, setSession] = useState<Session>(() => createSession(request.questions ?? selectQuestions(initialHistory.ids)));
  const [customWord, setCustomWord] = useState('');
  const [notice, setNotice] = useState('');
  const [editedEvidence, setEditedEvidence] = useState<string>();
  useEffect(() => {
    if (saveEnabled && !resumable && !saveSession(session)) {
      setStorageNotice(storageSaveFailedNotice);
    }
  }, [session, saveEnabled, resumable]);
  useEffect(() => {
    if (session.screen === 'scenario' && !markQuestionSeen(session.scenarios[session.scenarioIndex].id)) setStorageNotice(storageSaveFailedNotice);
  }, [session.screen, session.scenarioIndex, session.scenarios]);
  useEffect(() => {
    if (session.screen !== 'result' || !editedEvidence) return;
    // Returning from an edit lands on the evidence that was edited, not the top of a long report.
    const target = document.getElementById(editedEvidence);
    target?.scrollIntoView({ block: 'start' });
    target?.focus({ preventScroll: true });
    setEditedEvidence(undefined);
  }, [session.screen, editedEvidence]);
  // The question set comes from the share link unless the user leaves it; leaving drops the link from the address bar.
  const leaveShareRequest = () => { window.history.replaceState(null, '', window.location.pathname); setRequest({ specified: false }); };
  const startOver = ({ clearHistory = false, useCurrentVersion = false }: { clearHistory?: boolean; useCurrentVersion?: boolean } = {}) => {
    const cleared = clearSavedSession();
    const historyCleared = !clearHistory || clearSeenHistory();
    const history = loadSeenHistory();
    if (useCurrentVersion) leaveShareRequest();
    setSaveEnabled(false); setResumable(undefined); setSession(createSession(!useCurrentVersion && request.questions ? request.questions : selectQuestions(history.ids)));
    setCustomWord(''); setNotice('');
    setStorageNotice(cleared && historyCleared ? history.notice ?? '' : storageClearFailedNotice);
    window.scrollTo({ top: 0 });
  };
  const restart = () => startOver();
  const clearLocalRecords = () => startOver({ clearHistory: true });
  const restartWithCurrentVersion = () => startOver({ useCurrentVersion: true });
  const resume = () => {
    if (!resumable) return;
    // Continuing keeps the saved questions, so a share link for other questions no longer applies.
    if (request.specified) leaveShareRequest();
    setSession(resumable); setResumable(undefined); setSaveEnabled(true);
  };
  const sharedDiffers = Boolean(resumable && request.questions && !sameQuestions(resumable.scenarios, request.questions));
  const go = (screen: Screen) => { setSaveEnabled(true); setSession(current => ({ ...current, screen })); window.scrollTo({ top: 0 }); };
  const updateValue = (id: string, change: Partial<ValueItem>) => setSession(current => ({ ...current, values: current.values.map(value => value.id === id ? { ...value, ...change } : value) }));
  const addCustom = () => {
    const word = customWord.trim();
    if (!word) return;
    if (session.values.some(value => value.word === word)) { setNotice('這個價值已在清單中。'); return; }
    setSession(current => ({ ...current, values: [...current.values, { id: 'custom-' + crypto.randomUUID(), word, description: '你自己加入的價值。', custom: true, rank: 1 }] }));
    setCustomWord(''); setNotice('');
  };
  const scenario = session.scenarios[session.scenarioIndex];
  const complete = session.scenarios.every(item => session.answers[item.id]);
  const shareLink = questionShareLink(session.scenarios, window.location);
  return <main className={`app-shell screen-${session.screen}`}>
    <header className="masthead"><a href="./" onClick={event => { event.preventDefault(); go('intro'); }}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 2 2.8 6.4 7 .7-5.3 4.6 1.6 6.8-6.1-3.6-6.1 3.6 1.6-6.8L2.2 9.1l7-.7Z" /></svg>北極星</a><span className="notebook-stamp">反思筆記 · 01</span></header>
    <ThemeControl />
    {storageNotice && <p role="status" className="storage-notice">{storageNotice}</p>}
    {request.notice && <section className="storage-notice"><p role="status">{request.notice}</p><button className="secondary" onClick={restartWithCurrentVersion}>使用目前版本重新開始</button></section>}
    {session.screen === 'intro' && <HomeIntro actions={resumable ? <section className="resume-panel" aria-labelledby="resume-title"><h2 id="resume-title">上次的進度已保留。</h2><p>繼續原本的題目與已確認答案，或重新開始。</p>{sharedDiffers && <p>這份分享連結的題目與你上次作答的不同；繼續會沿用上次的題目，改做分享的題目則會取代上次的進度。</p>}<nav className="actions"><button className="primary" onClick={resume}>繼續上次作答</button>{!request.notice && <button className="secondary" onClick={restart}>{sharedDiffers ? '改做分享的題目' : '重新開始'}</button>}</nav></section> : <button className="primary" disabled={Boolean(request.notice)} onClick={() => go('classify')}>開始這次反思</button>} />}
    {session.screen === 'classify' && <section>
      <PageHeader eyebrow="第一幕 · 01" title="哪些事，對你重要？" description="照你現在的想法，把每個價值放進適合的類別。沒有標準答案。" />
      <form className="custom-row" onSubmit={event => { event.preventDefault(); addCustom(); }}><label htmlFor="custom-value">自訂價值</label><input id="custom-value" value={customWord} onChange={event => setCustomWord(event.target.value)} maxLength={24} placeholder="也可以加入自己的詞" /><button className="secondary">新增價值</button></form>
      {notice && <p role="status">{notice}</p>}
      <div className="value-list">{session.values.map(value => <article className="value-row" key={value.id}><div><h2>{value.word}</h2><p>{value.description}</p>{value.custom && <small>自訂價值 · 獨立呈現</small>}</div><fieldset className="value-segments"><legend>{value.word}的重要性</legend><div>{categoryOrder.map(category => <button type="button" key={category} aria-pressed={value.category === category} onClick={() => setSession(current => ({ ...current, values: withCategory(current.values, value.id, category) }))}>{categoryLabels[category]}</button>)}</div></fieldset></article>)}</div>
      <nav className="actions"><button className="secondary" onClick={() => go('intro')}>返回說明</button><button className="primary" disabled={session.values.some(value => !value.category)} onClick={() => go('rank')}>下一步：排出順序</button></nav>
    </section>}
    {session.screen === 'rank' && <section>
      <PageHeader eyebrow="第一幕 · 02" title="排個順序，也可以並列。" description="在各類別裡排出順序，數字越小越重要。一樣重要的，就選相同的位置。" />
      {categoryOrder.map(category => <section className="rank-section" key={category}><h2>{categoryLabels[category]}</h2>{session.values.filter(value => value.category === category).sort((a,b) => a.rank - b.rank).map(value => <article className="rank-row" key={value.id}><span>{value.word}{value.custom && <small>（自訂）</small>}</span><label className="select-label">{value.word}的位置<select value={value.rank} onChange={event => updateValue(value.id, { rank: Number(event.target.value) })}>{Array.from({ length: positionCount(session.values, category) }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></article>)}</section>)}
      <nav className="actions"><button className="secondary" onClick={() => go('classify')}>返回分類</button><button className="primary" onClick={() => go('scenario')}>進入情境中的取捨</button></nav>
    </section>}
    {session.screen === 'scenario' && scenario && <p className="scenario-progress"><span>第 {session.scenarioIndex + 1} 題，共 {session.scenarios.length} 題</span><span className="progress-track" aria-hidden="true"><span style={{ width: `${(session.scenarioIndex + 1) / session.scenarios.length * 100}%` }} /></span></p>}
    {session.screen === 'scenario' && scenario && <ScenarioQuestion key={scenario.id} scenario={scenario} answer={session.answers[scenario.id]} onBack={() => session.scenarioIndex === 0 ? go('rank') : setSession(current => ({ ...current, scenarioIndex: current.scenarioIndex - 1 }))} onReview={complete ? () => go('result') : undefined} onConfirm={answer => { setSession(current => {
      const answers = { ...current.answers, [scenario.id]: answer };
      // Once every question has a confirmed answer, a confirmation returns to the result instead of walking the remaining questions again.
      return current.scenarios.every(item => answers[item.id]) ? { ...current, answers, screen: 'result' } : { ...current, answers, scenarioIndex: Math.min(current.scenarioIndex + 1, current.scenarios.length - 1) };
    }); window.scrollTo({ top: 0 }); }} />}
    {session.screen === 'result' && complete && <ResultReport initialDetail={Boolean(editedEvidence)} session={session} onRevisitFirstAct={() => go('rank')} onRestart={restart} onEdit={(item, index) => { setEditedEvidence(evidenceId(item)); setSession(current => ({ ...current, screen: 'scenario', scenarioIndex: index })); window.scrollTo({ top: 0 }); }} />}
    <ShareFooter key={shareLink ?? 'unavailable'} shareLink={shareLink} shareDisabled={Boolean(request.notice)} onClearRecords={clearLocalRecords} />
  </main>;
}
export default App;
