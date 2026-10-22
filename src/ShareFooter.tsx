import { useState } from 'react';

/** Page footer with the question-only share link and the clear-local-records action. Remount it (key) when the link changes. */
export function ShareFooter({ shareLink, shareDisabled, onClearRecords }: { shareLink?: string; shareDisabled: boolean; onClearRecords: () => void }) {
  const [sharing, setSharing] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const copy = async (link: string) => {
    try { await navigator.clipboard.writeText(link); setCopyNotice('已複製題目連結。'); }
    catch { setCopyNotice('無法自動複製，請選取上方連結並手動複製。'); }
  };
  return <footer>北極星 · 把答案留給自己，把選擇看清楚。
    <button className="text-button" disabled={shareDisabled} onClick={() => setSharing(current => !current)}>分享這份題目</button>
    {sharing && <section className="share-questions">{shareLink ? <>
      <p>只分享題目，不包含你的答案、排序或自訂價值。</p>
      <label>題目分享連結<input readOnly value={shareLink} onFocus={event => event.currentTarget.select()} /></label>
      <button className="secondary" onClick={() => copy(shareLink)}>複製題目連結</button>
      {copyNotice && <p role="status">{copyNotice}</p>}
    </> : <p>這份題目與目前版本不相容，無法產生相同題目的分享連結。請重新開始。</p>}</section>}
    <button className="text-button" onClick={onClearRecords}>清除本機作答紀錄</button><p>清除會同時移除作答與已看題目紀錄；一般重新開始會保留已看紀錄。</p>
  </footer>;
}
