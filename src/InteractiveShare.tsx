import { useId, useState } from 'react';
import { categoryOrder } from './data';
import { rankedMembers } from './firstAct';
import type { InteractiveSession } from './interactiveTypes';
import { priorityResultLink, prioritySharedResultOf } from './resultLink';
import { ShareActions } from './ShareActions';
import { ShareCustomValues } from './ShareCustomValues';

/**
 * The interactive result's「分享結果」block: what the result image and format version 4 result link make public, then the image, the
 * link and their actions. Both come from one public conclusion, so per-question arrangements and reflection notes never enter either.
 */
export function InteractiveShare({ session }: { session: InteractiveSession }) {
  const titleId = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const custom = categoryOrder.flatMap(category => rankedMembers(session.values, category)).filter(value => value.custom);
  const result = prioritySharedResultOf(session, custom.filter(value => selected.includes(value.id)).map(value => value.word));
  if (!result) return null;
  return <section className="result-share paper-card" aria-labelledby={titleId}>
    <h2 id={titleId}>分享結果</h2>
    <p>結果圖和結果連結只放兩份前三名、明確決策題數和你勾選的自訂價值，不包含逐題安排、反思筆記和第一幕的完整排序。拿到圖片或連結的人都看得到這些內容。</p>
    <ShareCustomValues custom={custom} selected={selected} onChange={setSelected} />
    <ShareActions result={result} link={priorityResultLink(result, window.location)} />
  </section>;
}
