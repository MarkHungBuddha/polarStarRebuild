import { useState } from 'react';
import { baseValues } from './data';
import { PageHeader } from './PageHeader';
import { questionShareLink } from './questionPlan';
import type { ResultLinkOutcome, SharedResult } from './resultLink';
import { clearSeenHistory } from './seenHistory';
import { clearSavedSession } from './sessionStorage';
import { ShareFooter } from './ShareFooter';
import { StarIcon } from './StarIcon';
import { storageClearFailedNotice } from './storageNotices';
import { ThemeControl } from './ThemeControl';
import { ConclusionColumns, type ColumnRow } from './ValueConclusion';
import './techo-result.css';

const wordOf = (id: string) => baseValues.find(value => value.id === id)!.word;

/** Positions follow row order and row sizes (1, 1, 3…). */
function positioned<T extends { ids: string[] }>(rows: readonly T[], count?: (row: T) => string): ColumnRow[] {
  let position = 1;
  return rows.map(row => {
    const shown = { position, words: row.ids.map(wordOf), count: count?.(row) };
    position += row.ids.length;
    return shown;
  });
}

function SharedResultPage({ result, questionLink }: { result: SharedResult; questionLink?: string }) {
  return <section className="result-page result-cover">
    <PageHeader eyebrow="分享給你的反思 · 一頁摘要" title="這一次，分享者的選擇。" description="這是分享者自己作答的結果。你可以閱讀，也可以用同一份題目作答；你的答案會另外保存在你的瀏覽器，不會改到這份結果。" />
    <section className="conclusion paper-card"><ConclusionColumns titles={['分享者最重視的', '分享者在情境中最常選的']}
      stated={positioned(result.stated.map(ids => ({ ids })))}
      chosen={positioned(result.chosen, row => `${row.ids.length > 1 ? '各' : ''}選了 ${row.chosen} 次／共 ${row.directional} 題`)} /></section>
    <p className="sticky-note" role="note">這是分享者在假設情境下的自我回報，不是人格判定，也不代表實際行為。每個價值只出現在約三題，改一題就可能換名次。</p>
    {/* The original question set is offered only while today's catalog can still reproduce it; never swap in today's questions under its name. */}
    {questionLink
      ? <nav className="actions"><button className="primary" onClick={() => window.location.assign(questionLink)}>用同一份題目作答</button></nav>
      : <><p>這份結果用的是舊版題目。題庫已經更新，沒辦法再做同一份題目。</p>
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
  const clearLocalRecords = () => setStorageNotice(clearSavedSession() && clearSeenHistory() ? '' : storageClearFailedNotice);
  const questionLink = outcome.kind === 'result' && outcome.questions ? questionShareLink(outcome.questions, window.location) : undefined;
  return <main className="app-shell screen-result">
    <header className="masthead"><a href="./"><StarIcon />北極星</a><span className="notebook-stamp">反思筆記</span></header>
    <ThemeControl />
    {storageNotice && <p role="status" className="storage-notice">{storageNotice}</p>}
    {outcome.kind === 'result' ? <SharedResultPage result={outcome.result} questionLink={questionLink} /> : <UnreadableResult unsupported={outcome.kind === 'unsupported'} />}
    <ShareFooter questionShare={false} shareDisabled onClearRecords={clearLocalRecords} />
  </main>;
}
