import { useEffect, useState } from 'react';
import { AllocationQuestion } from './AllocationQuestion';
import { ChoiceQuestion } from './ChoiceQuestion';
import { baseValues } from './data';
import { withCategory, withStrictOrder } from './firstAct';
import { ClassifyScreen, RankScreen } from './FirstActScreens';
import { HomeIntro } from './HomeIntro';
import { drawInteractiveQuestions } from './interactiveCatalog';
import { leaveQuestionLink, questionShareLink, requestedQuestions } from './interactiveQuestionLink';
import { clearInteractiveSession, loadInteractiveSession, saveInteractiveSession } from './interactiveSessionStorage';
import type { InteractiveAnswer, InteractiveScenario, InteractiveSession } from './interactiveTypes';
import { InteractiveResult } from './InteractiveResult';
import { ScenarioProgress } from './ScenarioFrame';
import { clearSeenHistory, loadSeenHistory, markQuestionSeen } from './seenHistory';
import { ShareFooter } from './ShareFooter';
import { StarIcon } from './StarIcon';
import { storageClearFailedNotice, storageSaveFailedNotice } from './storageNotices';
import { ThemeControl } from './ThemeControl';
import type { Screen } from './types';

/** The question for `scenario`'s interaction, reopened with its confirmed answer when that answer has the same kind or is 目前無法決定. */
function InteractiveQuestion({ scenario, answer, ...actions }: {
  scenario: InteractiveScenario; answer?: InteractiveAnswer; onConfirm: (answer: InteractiveAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const { interaction } = scenario;
  const undecided = answer?.kind === 'undecided' ? answer : undefined;
  return interaction.kind === 'choose'
    ? <ChoiceQuestion scenario={scenario} interaction={interaction} answer={answer?.kind === 'choose' ? answer : undecided} {...actions} />
    : <AllocationQuestion scenario={scenario} interaction={interaction} answer={answer?.kind === 'allocate' || answer?.kind === 'adjust' ? answer : undecided} {...actions} />;
}

const createSession = (questions: InteractiveScenario[]): InteractiveSession => ({ screen: 'intro', values: baseValues.map(value => ({ ...value })), scenarios: questions, answers: {}, scenarioIndex: 0 });
const sameQuestions = (left: readonly InteractiveScenario[], right: readonly InteractiveScenario[]) => left.length === right.length && left.every((scenario, index) => scenario.id === right[index].id);

/**
 * The site: the first act, then fifteen interactive questions (one variant per slot, unseen ones first), then both acts side by
 * side with the reflection step and sharing. A question link (?seed=…&v=…) sets the questions; a saved session for other questions
 * is never replaced without the user's choice.
 */
export function App() {
  const [request, setRequest] = useState(() => requestedQuestions(window.location.search));
  const [initialHistory] = useState(loadSeenHistory);
  const [initial] = useState(() => loadInteractiveSession(() => createSession(request.questions ?? drawInteractiveQuestions(initialHistory.ids))));
  // A saved session under a link for other questions waits on the home page until the user continues it or takes the link's questions.
  const [resumable, setResumable] = useState(() => initial.session && request.questions && !sameQuestions(initial.session.scenarios, request.questions) ? initial.session : undefined);
  const [session, setSession] = useState<InteractiveSession>(() => (!resumable && initial.session) || createSession(request.questions ?? drawInteractiveQuestions(initialHistory.ids)));
  const [saveEnabled, setSaveEnabled] = useState(Boolean(initial.session && !resumable));
  const [storageNotice, setStorageNotice] = useState(initial.notice ?? initialHistory.notice ?? '');
  const [customWord, setCustomWord] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (saveEnabled && !saveInteractiveSession(session)) setStorageNotice(storageSaveFailedNotice);
  }, [session, saveEnabled]);
  useEffect(() => {
    if (session.screen === 'scenario' && !markQuestionSeen(session.scenarios[session.scenarioIndex].id)) setStorageNotice(storageSaveFailedNotice);
  }, [session.screen, session.scenarioIndex, session.scenarios]);
  const go = (screen: Screen) => { setSaveEnabled(true); setSession(current => ({ ...current, screen })); window.scrollTo({ top: 0 }); };
  // The question set comes from the link unless the user leaves it; leaving drops the link from the address bar.
  const leaveRequest = () => { leaveQuestionLink(); setRequest({ specified: false }); };
  const startOver = ({ clearHistory = false, useCurrentVersion = false } = {}) => {
    const sessionCleared = clearInteractiveSession();
    const historyCleared = !clearHistory || clearSeenHistory();
    const history = loadSeenHistory();
    if (useCurrentVersion) leaveRequest();
    setSaveEnabled(false); setResumable(undefined);
    setSession(createSession(!useCurrentVersion && request.questions ? request.questions : drawInteractiveQuestions(history.ids)));
    setCustomWord(''); setNotice('');
    setStorageNotice(sessionCleared && historyCleared ? history.notice ?? '' : storageClearFailedNotice);
    window.scrollTo({ top: 0 });
  };
  const restart = () => startOver();
  // Clearing local records also removes the seen history every version left; 重新開始 keeps it.
  const clearLocalRecords = () => startOver({ clearHistory: true });
  const restartWithCurrentVersion = () => startOver({ useCurrentVersion: true });
  const resume = () => {
    if (!resumable) return;
    // Continuing keeps the saved questions, so the link for other questions no longer applies.
    leaveRequest();
    setSession(resumable); setResumable(undefined); setSaveEnabled(true);
  };
  const addCustom = () => {
    const word = customWord.trim();
    if (!word) return;
    if (session.values.some(value => value.word === word)) { setNotice('這個價值已在清單中。'); return; }
    setSession(current => ({ ...current, values: [...current.values, { id: 'custom-' + crypto.randomUUID(), word, description: '你自己加入的價值。', custom: true, rank: 1 }] }));
    setCustomWord(''); setNotice('');
  };
  const scenario = session.scenarios[session.scenarioIndex];
  const complete = session.scenarios.every(item => session.answers[item.id]);
  const back = () => session.scenarioIndex === 0 ? go('rank') : setSession(current => ({ ...current, scenarioIndex: current.scenarioIndex - 1 }));
  const confirm = (answer: InteractiveAnswer) => {
    setSession(current => {
      const answers = { ...current.answers, [answer.variantId]: answer };
      // Once every question has a confirmed answer, a confirmation returns to the result instead of walking the remaining questions again.
      return current.scenarios.every(item => answers[item.id]) ? { ...current, answers, screen: 'result' } : { ...current, answers, scenarioIndex: Math.min(current.scenarioIndex + 1, current.scenarios.length - 1) };
    });
    window.scrollTo({ top: 0 });
  };
  const shareLink = questionShareLink(session.scenarios, window.location);
  return <main className={`app-shell screen-${session.screen}`}>
    <header className="masthead"><a href="./" onClick={event => { event.preventDefault(); go('intro'); }}><StarIcon />北極星</a><span className="notebook-stamp">反思筆記</span></header>
    <ThemeControl />
    {storageNotice && <p role="status" className="storage-notice">{storageNotice}</p>}
    {request.notice && <section className="storage-notice"><p role="status">{request.notice}</p><button className="secondary" onClick={restartWithCurrentVersion}>用目前題目開始</button></section>}
    {session.screen === 'intro' && <HomeIntro actions={resumable
      ? <section className="resume-panel" aria-labelledby="resume-title"><h2 id="resume-title">上次的進度已保留。</h2>
        <p>這份分享連結的題目與你上次作答的不同；繼續會沿用上次的題目，改做分享的題目則會取代上次的進度。</p>
        <nav className="actions"><button className="primary" onClick={resume}>繼續上次作答</button><button className="secondary" onClick={restart}>改做分享的題目</button></nav></section>
      : <button className="primary" disabled={Boolean(request.notice)} onClick={() => go('classify')}>開始這次反思</button>} />}
    {session.screen === 'classify' && <ClassifyScreen values={session.values} customWord={customWord} notice={notice} onCustomWordChange={setCustomWord} onAddCustom={addCustom} onCategory={(id, category) => setSession(current => ({ ...current, values: withCategory(current.values, id, category) }))} onBack={() => go('intro')} onNext={() => go('rank')} />}
    {session.screen === 'rank' && <RankScreen values={session.values} onArrange={arrange => setSession(current => ({ ...current, values: arrange(current.values) }))} onBack={() => go('classify')} onNext={() => { setSession(current => ({ ...current, values: withStrictOrder(current.values) })); go('scenario'); }} />}
    {session.screen === 'scenario' && scenario && <>
      <ScenarioProgress current={session.scenarioIndex + 1} total={session.scenarios.length} />
      <InteractiveQuestion key={scenario.id} scenario={scenario} answer={session.answers[scenario.id]} onBack={back} onReview={complete ? () => go('result') : undefined} onConfirm={confirm} />
    </>}
    {session.screen === 'result' && complete && <InteractiveResult session={session} onRestart={restart} onReflect={reflection => setSession(current => ({ ...current, reflection }))} onEdit={index => { setSession(current => ({ ...current, screen: 'scenario', scenarioIndex: index })); window.scrollTo({ top: 0 }); }} />}
    <ShareFooter key={shareLink ?? 'unavailable'} questionShare={{ link: shareLink, disabled: Boolean(request.notice) }} onClearRecords={clearLocalRecords} />
  </main>;
}
export default App;
