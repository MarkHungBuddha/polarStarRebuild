import type { ColumnRow } from './columnRows';

/** What the second column says above preference scores, and when no value scored. */
export const preferenceColumnText = { caption: '第二幕的偏向分數', empty: '這次作答沒有明確偏向。' };

/** The two top-three columns as shown, whoever's they are; the second column's caption and empty text say what its numbers mean. */
export function ConclusionColumns({ titles, stated, chosen, caption, empty }: { titles: [string, string]; stated: ColumnRow[]; chosen: ColumnRow[]; caption: string; empty: string }) {
  const label = (row: ColumnRow) => (row.words.length > 1 ? '並列第 ' : '第 ') + row.position;
  return <div className="conclusion-columns">
    <div><h3>{titles[0]}</h3><p className="caption">第一幕的分類與排序</p>
      <ol>{stated.map(row => <li key={row.position}><span>{label(row)}</span><strong>{row.words.join('、')}</strong></li>)}</ol></div>
    <div><h3>{titles[1]}</h3><p className="caption">{caption}</p>
      {chosen.length ? <ol>{chosen.map(row => <li key={row.position}><span>{label(row)}</span><strong>{row.words.join('、')}</strong><small>{row.count}</small></li>)}</ol> : <p>{empty}</p>}</div>
  </div>;
}
