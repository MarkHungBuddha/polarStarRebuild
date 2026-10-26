import { useState } from 'react';
import { interactiveCatalog } from './interactiveCatalog';
import { DecidedCount, priorityColumnText } from './InteractiveResult';
import { clearInteractiveSession } from './interactiveSessionStorage';
import { PageHeader } from './PageHeader';
import { questionShareLink } from './questionPlan';
import type { ResultLinkOutcome, SharedResult } from './resultLink';
import { clearSeenHistory } from './seenHistory';
import { clearSavedSession } from './sessionStorage';
import { ShareFooter } from './ShareFooter';
import { StarIcon } from './StarIcon';
import { storageClearFailedNotice } from './storageNotices';
import { ThemeControl } from './ThemeControl';
import { ConclusionColumns, preferenceColumnText } from './ValueConclusion';
import { columnRows, scoreCount } from './columnRows';
import { preferenceScoringNote } from './preferenceRanking';
import { priorityCountText } from './priorityRanking';
import { chosenCountText } from './valueRanking';
import './techo-result.css';

/** How a version 3 result was put together, in the words of the sharer's own 結果怎麼整理. */
const priorityCountingNote = '每題最多讓一個價值多 1 次：分得多或選擇的一側記 1 次，平均分配和目前無法決定都不加次數。每個價值這一輪出現在 3 題，最多 3 次；同次數並列。次數只描述這一輪情境中的選擇，不代表偏好強度。';

/** The second column and its labels for each format version; versions never share their rows or wording. */
function SharedConclusion({ result }: { result: SharedResult }) {
  const stated = columnRows(result.stated.map(ids => ({ ids })));
  switch (result.scoring) {
    case 'priority-count': return <>
      <ConclusionColumns titles={['分享者最重視的', '分享者在情境中優先保留的']} {...priorityColumnText} stated={stated} chosen={columnRows(result.counted, row => priorityCountText(row.count))} />
      <DecidedCount decided={result.decided} total={result.plan.length} />
      <p>{priorityCountingNote}</p>
      <p className="caption">結果連結版本 3：優先保留次數</p></>;
    case 'preference-score': return <>
      <ConclusionColumns titles={['分享者最重視的', '分享者在情境中的偏向分數']} {...preferenceColumnText} stated={stated} chosen={columnRows(result.scored, scoreCount)} />
      <p>{preferenceScoringNote}</p>
      <p className="caption">結果連結版本 2：五段分數</p></>;
    // A legacy link keeps the counts and positions it was shared with; it is labeled, never rescored.
    case 'legacy-count': return <>
      <ConclusionColumns titles={['分享者最重視的', '分享者在情境中最常選的']} caption="第二幕有偏向一邊的答案" empty="這次沒有偏向一邊的答案，所以沒有排名。"
        stated={stated} chosen={columnRows(result.chosen, row => chosenCountText(row, row.ids.length > 1))} />
      <p className="caption">這份結果使用舊版計分：第二幕依偏向一邊的答案次數排名，不是偏向分數。</p>
      <p className="caption">結果連結版本 1：選邊次數</p></>;
  }
}

function SharedResultPage({ result, questionLink }: { result: SharedResult; questionLink?: string }) {
  // A version 3 link made with today's interactive bank names questions that still exist; interactive question links arrive with #71.
  const currentBank = result.scoring === 'priority-count' && result.catalog === interactiveCatalog.version;
  return <section className="result-page result-cover">
    <PageHeader eyebrow="分享給你的反思 · 一頁摘要" title="這一次，分享者的選擇。" description="這是分享者自己作答的結果。你可以閱讀，也可以用同一份題目作答；你的答案會另外保存在你的瀏覽器，不會改到這份結果。" />
    <section className="conclusion paper-card"><SharedConclusion result={result} /></section>
    {result.custom.length > 0 && <section className="custom-results"><h2>分享者的自訂價值</h2><p>由分享者自行加入，沒有納入兩份前三名。</p><ul>{result.custom.map((word, index) => <li key={index}>{word}</li>)}</ul></section>}
    <p className="sticky-note" role="note">這是分享者在假設情境下的自我回報，不是人格判定，也不代表實際行為。每個價值在一次作答中只出現在三題，改一題就可能換名次。</p>
    {/* The original question set is offered only while today's catalog can still reproduce it; never swap in today's questions under its name. */}
    {questionLink
      ? <nav className="actions"><button className="primary" onClick={() => window.location.assign(questionLink)}>用同一份題目作答</button></nav>
      : <>{!currentBank && <p>這份結果用的是舊版題目。題庫已經更新，沒辦法再做同一份題目。</p>}
        <nav className="actions"><button className="primary" onClick={() => window.location.assign(window.location.pathname)}>用目前題目開始</button></nav></>}
  </section>;
}

/** A corrupt link asks for a new one; a format this copy of the site does not know yet asks for a reload. Neither shows any part of the result. */
function UnreadableResult({ unsupported }: { unsupported: boolean }) {
  return <section className="result-page">
    {unsupported
      ? <header className="section-header"><h1>這條結果連結目前無法顯示</h1><p>這條連結用的是較新的格式，你的瀏覽器可能還在使用舊版網站。請重新整理頁面再試一次。</p></header>
      : <header className="section-header"><h1>這條結果連結不完整</h1><p>連結可能在複製或轉貼時被截斷或改動，所以整份結果都不顯示。請向分享者要一條新的結果連結。</p></header>}
    <nav className="actions">
      {unsupported && <button className="primary" onClick={() => window.location.reload()}>重新整理</button>}
      <button className={unsupported ? 'secondary' : 'primary'} onClick={() => window.location.assign(window.location.pathname)}>開始這次反思</button>
    </nav>
  </section>;
}

/** What a result link opens: the sharer's result, read-only, without reading or writing this browser's answers or seen questions. */
export function SharedResultApp({ outcome }: { outcome: ResultLinkOutcome }) {
  const [storageNotice, setStorageNotice] = useState('');
  const clearLocalRecords = () => {
    const results = [clearInteractiveSession(), clearSavedSession(), clearSeenHistory()];
    setStorageNotice(results.every(Boolean) ? '' : storageClearFailedNotice);
  };
  const questionLink = outcome.kind === 'result' && outcome.questions ? questionShareLink(outcome.questions, window.location) : undefined;
  return <main className="app-shell screen-result">
    <header className="masthead"><a href="./"><StarIcon />北極星</a><span className="notebook-stamp">反思筆記</span></header>
    <ThemeControl />
    {storageNotice && <p role="status" className="storage-notice">{storageNotice}</p>}
    {outcome.kind === 'result' ? <SharedResultPage result={outcome.result} questionLink={questionLink} /> : <UnreadableResult unsupported={outcome.kind === 'unsupported'} />}
    <ShareFooter onClearRecords={clearLocalRecords} />
  </main>;
}
