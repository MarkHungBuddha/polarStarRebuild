import { useId, useState } from 'react';
import { categoryOrder } from './data';
import { rankedMembers } from './firstAct';
import { resultLink, sharedResultOf } from './resultLink';
import { ShareActions } from './ShareActions';
import { ShareCustomValues } from './ShareCustomValues';
import type { Session } from './types';

/** The sharer's「分享結果」block: what a result image and link make public, then the image, the link and their actions. */
export function ResultShare({ session }: { session: Session }) {
  const titleId = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const custom = categoryOrder.flatMap(category => rankedMembers(session.values, category)).filter(value => value.custom);
  const result = sharedResultOf(session, custom.filter(value => selected.includes(value.id)).map(value => value.word));
  if (!result) return null;
  return <section className="result-share paper-card" aria-labelledby={titleId}>
    <h2 id={titleId}>分享結果</h2>
    <p>結果圖和結果連結只放兩份前三名，不包含逐題答案和第一幕的完整排序。拿到圖片或連結的人都看得到這些內容。</p>
    <ShareCustomValues custom={custom} selected={selected} onChange={setSelected} />
    <ShareActions result={result} link={resultLink(result, window.location)} />
  </section>;
}
