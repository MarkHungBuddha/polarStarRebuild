import { columnRows } from './columnRows';
import type { InteractiveSession } from './interactiveTypes';
import { PageHeader } from './PageHeader';
import { priorityCounts, priorityCountText, priorityTopThree } from './priorityRanking';
import { act1TopThree, byPosition } from './valueRanking';
import { ConclusionColumns } from './ValueConclusion';
import './techo-result.css';

/** What the second column says above 優先保留次數, and when no confirmed answer has a direction (no ranking then). */
export const priorityColumnText = { caption: '第二幕的優先保留次數', empty: '這次的決策都沒有偏向哪一邊，不產生排名。' };

/**
 * The interactive result: the first act's top three beside the values kept first most often, then every question with a way back
 * to change it. Per-question records, 明確決策題數, reflection and sharing are later tickets (#64–#67).
 */
export function InteractiveResult({ session, onEdit, onRestart }: { session: InteractiveSession; onEdit: (index: number) => void; onRestart: () => void }) {
  const chosen = byPosition(priorityTopThree(priorityCounts(session))).map(row => ({ ids: row.items.map(item => item.value.id), count: row.items[0].count }));
  return <section className="result-page result-cover">
    <PageHeader eyebrow="本次反思 · 開發預覽" title="這一次，你的選擇。" description="對照你原先的排序，看看這次情境中你優先保留了什麼。" />
    <section className="conclusion paper-card" aria-labelledby="interactive-top-three"><h2 id="interactive-top-three">你的前三名</h2>
      <ConclusionColumns titles={['你最重視的', '情境中優先保留的']} {...priorityColumnText}
        stated={columnRows(byPosition(act1TopThree(session.values)).map(row => ({ ids: row.items.map(value => value.id) })))}
        chosen={columnRows(chosen, row => priorityCountText(row.count))} />
    </section>
    <p className="sticky-note" role="note">每題最多讓一個價值多 1 次：分得多的一側記 1 次，平均分配兩邊都不加，分配差距也不加權。次數只描述這一輪的選擇，不代表偏好強度。</p>
    <section className="result-evidence"><h2>這次的情境</h2>
      <ol>{session.scenarios.map((scenario, index) => <li key={scenario.id}>第 {index + 1} 題 · {scenario.title} <button className="text-button" onClick={() => onEdit(index)}>修改這題</button></li>)}</ol>
    </section>
    <nav className="actions"><button className="secondary" onClick={onRestart}>重新開始</button></nav>
  </section>;
}
