import { useId, useState } from 'react';
import { copyLink } from './clipboard';
import { categoryOrder } from './data';
import { rankedMembers } from './firstAct';
import type { InteractiveSession } from './interactiveTypes';
import { priorityResultLink, prioritySharedResultOf } from './resultLink';
import { ShareCustomValues } from './ShareCustomValues';

/**
 * The interactive result's「分享結果」block: what a format version 3 result link makes public, and the link itself. Per-question
 * arrangements and reflection notes never enter it. The result image and system share join in #67.
 */
export function InteractiveShare({ session }: { session: InteractiveSession }) {
  const titleId = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const custom = categoryOrder.flatMap(category => rankedMembers(session.values, category)).filter(value => value.custom);
  const result = prioritySharedResultOf(session, custom.filter(value => selected.includes(value.id)).map(value => value.word));
  if (!result) return null;
  const link = priorityResultLink(result, window.location);
  return <section className="result-share paper-card" aria-labelledby={titleId}>
    <h2 id={titleId}>分享結果</h2>
    <p>結果連結只放兩份前三名和明確決策題數，不包含逐題安排、反思筆記和第一幕的完整排序。拿到連結的人都看得到這些內容。</p>
    <ShareCustomValues custom={custom} selected={selected} onChange={setSelected} imageNote={false} />
    <nav className="actions"><button className="secondary" onClick={() => copyLink(link, '已複製結果連結。', setStatus)}>複製結果連結</button></nav>
    <label>結果連結<input readOnly value={link} onFocus={event => event.currentTarget.select()} /></label>
    <p role="status">{status}</p>
  </section>;
}
