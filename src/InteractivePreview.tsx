import { useEffect, useState } from 'react';
import { AllocationQuestion } from './AllocationQuestion';
import { ChoiceQuestion } from './ChoiceQuestion';
import { baseValues } from './data';
import { withCategory, withStrictOrder } from './firstAct';
import { ClassifyScreen, RankScreen } from './FirstActScreens';
import { HomeIntro } from './HomeIntro';
import { interactiveScenarios } from './interactiveScenarios';
import { clearInteractiveSession, loadInteractiveSession, saveInteractiveSession } from './interactiveSessionStorage';
import type { InteractiveAnswer, InteractiveScenario, InteractiveSession } from './interactiveTypes';
import { InteractiveResult } from './InteractiveResult';
import { ScenarioProgress } from './ScenarioFrame';
import { ShareFooter } from './ShareFooter';
import { StarIcon } from './StarIcon';
import { storageClearFailedNotice, storageSaveFailedNotice } from './storageNotices';
import { ThemeControl } from './ThemeControl';
import type { Screen } from './types';

/** One variant per slot of the interactive bank, in slot order. Seen history and question links join when the entry switches (#71). */
function drawQuestions(): InteractiveScenario[] {
  const slots = [...new Set(interactiveScenarios.map(scenario => scenario.slotId))].sort();
  return slots.map(slot => {
    const variants = interactiveScenarios.filter(scenario => scenario.slotId === slot);
    return variants[Math.floor(Math.random() * variants.length)];
  });
}

/** The question for `scenario`'s interaction, reopened with its confirmed answer when that answer has the same kind. */
function InteractiveQuestion({ scenario, answer, ...actions }: {
  scenario: InteractiveScenario; answer?: InteractiveAnswer; onConfirm: (answer: InteractiveAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const { interaction } = scenario;
  return interaction.kind === 'choose'
    ? <ChoiceQuestion scenario={scenario} interaction={interaction} answer={answer?.kind === 'choose' ? answer : undefined} {...actions} />
    : <AllocationQuestion scenario={scenario} interaction={interaction} answer={answer?.kind === 'allocate' ? answer : undefined} {...actions} />;
}

const createSession = (): InteractiveSession => ({ screen: 'intro', values: baseValues.map(value => ({ ...value })), scenarios: drawQuestions(), answers: {}, scenarioIndex: 0 });

/**
 * The development-only entry (?preview=interactive) for the interactive second act: the first act as today, then interactive
 * questions, then both acts side by side. It keeps its own local record and offers no result link, result image or question link yet.
 */
export default function InteractivePreview() {
  const [initial] = useState(loadInteractiveSession);
  const [session, setSession] = useState<InteractiveSession>(() => initial.session ?? createSession());
  const [saveEnabled, setSaveEnabled] = useState(Boolean(initial.session));
  const [storageNotice, setStorageNotice] = useState(initial.notice ?? '');
  const [customWord, setCustomWord] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (saveEnabled && !saveInteractiveSession(session)) setStorageNotice(storageSaveFailedNotice);
  }, [session, saveEnabled]);
  const go = (screen: Screen) => { setSaveEnabled(true); setSession(current => ({ ...current, screen })); window.scrollTo({ top: 0 }); };
  const restart = () => {
    const cleared = clearInteractiveSession();
    setSaveEnabled(false); setSession(createSession()); setCustomWord(''); setNotice('');
    setStorageNotice(cleared ? '' : storageClearFailedNotice);
    window.scrollTo({ top: 0 });
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
  const confirm = (answer: InteractiveSession['answers'][string]) => {
    setSession(current => {
      const answers = { ...current.answers, [answer.variantId]: answer };
      // Once every question has a confirmed answer, a confirmation returns to the result instead of walking the remaining questions again.
      return current.scenarios.every(item => answers[item.id]) ? { ...current, answers, screen: 'result' } : { ...current, answers, scenarioIndex: Math.min(current.scenarioIndex + 1, current.scenarios.length - 1) };
    });
    window.scrollTo({ top: 0 });
  };
  return <main className={`app-shell screen-${session.screen}`}>
    <header className="masthead"><a href="./?preview=interactive" onClick={event => { event.preventDefault(); go('intro'); }}><StarIcon />北極星</a><span className="notebook-stamp">開發預覽</span></header>
    <ThemeControl />
    {storageNotice && <p role="status" className="storage-notice">{storageNotice}</p>}
    {session.screen === 'intro' && <HomeIntro actions={<><p className="storage-notice">開發預覽：第二幕改用互動情境題，結果還不能分享。</p><button className="primary" onClick={() => go('classify')}>開始這次反思</button></>} />}
    {session.screen === 'classify' && <ClassifyScreen values={session.values} customWord={customWord} notice={notice} onCustomWordChange={setCustomWord} onAddCustom={addCustom} onCategory={(id, category) => setSession(current => ({ ...current, values: withCategory(current.values, id, category) }))} onBack={() => go('intro')} onNext={() => go('rank')} />}
    {session.screen === 'rank' && <RankScreen values={session.values} onArrange={arrange => setSession(current => ({ ...current, values: arrange(current.values) }))} onBack={() => go('classify')} onNext={() => { setSession(current => ({ ...current, values: withStrictOrder(current.values) })); go('scenario'); }} />}
    {session.screen === 'scenario' && scenario && <>
      <ScenarioProgress current={session.scenarioIndex + 1} total={session.scenarios.length} />
      <InteractiveQuestion key={scenario.id} scenario={scenario} answer={session.answers[scenario.id]} onBack={back} onReview={complete ? () => go('result') : undefined} onConfirm={confirm} />
    </>}
    {session.screen === 'result' && complete && <InteractiveResult session={session} onRestart={restart} onEdit={index => { setSession(current => ({ ...current, screen: 'scenario', scenarioIndex: index })); window.scrollTo({ top: 0 }); }} />}
    <ShareFooter onClearRecords={restart} />
  </main>;
}
