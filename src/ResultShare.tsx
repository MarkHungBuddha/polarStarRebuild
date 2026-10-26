import { useId, useRef, useState } from 'react';
import { copyLink } from './clipboard';
import { categoryOrder } from './data';
import { rankedMembers } from './firstAct';
import { resultLink, sharedResultOf } from './resultLink';
import { ShareCustomValues } from './ShareCustomValues';
import type { Session } from './types';
import { imagePreparing, resultImageAlt, useResultImage } from './useResultImage';

const shareUnavailable = '這個瀏覽器無法直接分享圖片。請先下載結果圖，再複製結果連結一起貼出。';

/** The sharer's「分享結果」block: what a result link makes public, the link itself, and one status line for its feedback. */
export function ResultShare({ session }: { session: Session }) {
  const titleId = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const sharing = useRef(false);
  const custom = categoryOrder.flatMap(category => rankedMembers(session.values, category)).filter(value => value.custom);
  const result = sharedResultOf(session, custom.filter(value => selected.includes(value.id)).map(value => value.word));
  const { image, failed, retry } = useResultImage(result, setStatus);
  if (!result) return null;
  const link = resultLink(result, window.location);
  // Before the image is ready, share and download only report it (and retry after a failure); a click never waits for the image.
  const reportPreparing = () => { setStatus(imagePreparing); if (failed) retry(); };
  const shareResult = () => {
    if (!image) { reportPreparing(); return; }
    const data = { files: [image.file], title: '北極星 · 我的選擇', text: '這是我在北極星的兩份前三名。', url: link };
    // Feature-detect at click time; share() must be called synchronously here to keep the user's activation.
    if (!navigator.share || !navigator.canShare?.(data)) { setStatus(shareUnavailable); return; }
    if (sharing.current) return;
    sharing.current = true;
    setStatus('');
    // Cancelling (AbortError) is the user's choice and gets no message; any other failure falls back to download and copy.
    navigator.share(data)
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus(shareUnavailable); })
      .finally(() => { sharing.current = false; });
  };
  const download = () => {
    if (!image) { reportPreparing(); return; }
    const anchor = document.createElement('a');
    anchor.href = image.url; anchor.download = image.file.name; anchor.click();
  };
  return <section className="result-share paper-card" aria-labelledby={titleId}>
    <h2 id={titleId}>分享結果</h2>
    <p>結果圖和結果連結只放兩份前三名，不包含逐題答案和第一幕的完整排序。拿到圖片或連結的人都看得到這些內容。</p>
    <ShareCustomValues custom={custom} selected={selected} onChange={setSelected} />
    {image ? <img className="result-image-preview" src={image.url} alt={resultImageAlt(result.custom)} /> : !failed && <div className="result-image-placeholder" aria-hidden="true" />}
    <nav className="actions"><button className="primary" aria-disabled={!image} onClick={shareResult}>分享結果</button><button className="secondary" aria-disabled={!image} onClick={download}>下載結果圖</button><button className="secondary" onClick={() => copyLink(link, '已複製結果連結。', setStatus)}>複製結果連結</button></nav>
    <label>結果連結<input readOnly value={link} onFocus={event => event.currentTarget.select()} /></label>
    <p role="status">{status}</p>
  </section>;
}

