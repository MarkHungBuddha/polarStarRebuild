import { useId, useState } from 'react';
import { categoryOrder } from './data';
import { rankedMembers } from './firstAct';
import { resultLink, sharedResultOf } from './resultLink';
import type { Session } from './types';
import { imagePreparing, resultImageAlt, useResultImage } from './useResultImage';

/** The sharer's「分享結果」block: what a result link makes public, the link itself, and one status line for its feedback. */
export function ResultShare({ session }: { session: Session }) {
  const titleId = useId();
  const customHintId = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const result = sharedResultOf(session);

  const custom = categoryOrder.flatMap(category => rankedMembers(session.values, category)).filter(value => value.custom);
  if (result) result.custom = custom.filter(value => selected.includes(value.id)).map(value => value.word);
  const { image, failed, retry } = useResultImage(result, setStatus);
  if (!result) return null;
  const link = resultLink(result, window.location);
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setStatus('已複製結果連結。'); }
    catch { setStatus('無法自動複製，請選取上方連結並手動複製。'); }
  };
  const download = () => {
    if (!image) { setStatus(imagePreparing); if (failed) retry(); return; }
    const anchor = document.createElement('a');
    anchor.href = image.url; anchor.download = image.file.name; anchor.click();
  };
  return <section className="result-share paper-card" aria-labelledby={titleId}>
    <h2 id={titleId}>分享結果</h2>
    <p>結果圖和結果連結只放兩份前三名，不包含逐題答案和第一幕的完整排序。拿到圖片或連結的人都看得到這些內容。</p>
    {custom.length > 0 && <fieldset aria-describedby={customHintId}>
      <legend>也分享自訂價值</legend>
      <p id={customHintId}>預設不分享。勾選的項目會放進結果連結；結果圖最多放 3 個，其餘寫成「另有 N 個自訂價值」。{selected.length >= 10 && '最多 10 個。'}</p>
      {custom.map(value => <label className="share-custom-value" key={value.id}>
        <input type="checkbox" checked={selected.includes(value.id)} disabled={selected.length >= 10 && !selected.includes(value.id)} onChange={event => setSelected(current => event.target.checked ? [...current, value.id] : current.filter(id => id !== value.id))} />
        <span>{value.word}</span>
      </label>)}
    </fieldset>}
    {image ? <img className="result-image-preview" src={image.url} alt={resultImageAlt(result.custom)} /> : !failed && <div className="result-image-placeholder" aria-hidden="true" />}
    <nav className="actions"><button className="secondary" aria-disabled={!image} onClick={download}>下載結果圖</button><button className="secondary" onClick={copy}>複製結果連結</button></nav>
    <label>結果連結<input readOnly value={link} onFocus={event => event.currentTarget.select()} /></label>
    <p role="status">{status}</p>
  </section>;
}

