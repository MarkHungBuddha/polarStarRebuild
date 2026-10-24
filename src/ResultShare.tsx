import { useId, useState } from 'react';
import { resultLink, sharedResultOf } from './resultLink';
import type { Session } from './types';

/** The sharer's「分享結果」block: what a result link makes public, the link itself, and one status line for its feedback. */
export function ResultShare({ session }: { session: Session }) {
  const titleId = useId();
  const [status, setStatus] = useState('');
  const result = sharedResultOf(session);
  if (!result) return null;
  const link = resultLink(result, window.location);
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setStatus('已複製結果連結。'); }
    catch { setStatus('無法自動複製，請選取上方連結並手動複製。'); }
  };
  return <section className="result-share paper-card" aria-labelledby={titleId}>
    <h2 id={titleId}>分享結果</h2>
    <p>結果圖和結果連結只放兩份前三名，不包含逐題答案和第一幕的完整排序。拿到圖片或連結的人都看得到這些內容。</p>
    <nav className="actions"><button className="secondary" onClick={copy}>複製結果連結</button></nav>
    <label>結果連結<input readOnly value={link} onFocus={event => event.currentTarget.select()} /></label>
    <p role="status">{status}</p>
  </section>;
}
