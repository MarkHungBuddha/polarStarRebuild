import { columnRows } from './columnRows';
import { decisionText, firstActComparison } from './interactiveAnswers';
import type { InteractiveSession, Reflection } from './interactiveTypes';
import { InteractiveShare } from './InteractiveShare';
import { PageHeader } from './PageHeader';
import { ReflectionStep } from './ReflectionStep';
import { decidedCount, fullListCountText, priorityCounts, priorityCountText, priorityTopThree } from './priorityRanking';
import { act1TopThree, byPosition } from './valueRanking';
import { ConclusionColumns } from './ValueConclusion';
import './techo-result.css';

/** What the second column says above 優先保留次數, and when no confirmed answer has a direction (no ranking then). */
export const priorityColumnText = { caption: '第二幕的優先保留次數', empty: '這次沒有方向明確的決策，不產生第二幕排名。' };

/** 明確決策 N / M 題, and why the rest add no count; the sharer's result and a version 3 result link show it the same way. */
export function DecidedCount({ decided, total }: { decided: number; total: number }) {
  return <>
    <p className="decided-count"><strong>明確決策 {decided} / {total} 題</strong></p>
    {decided < total && <p className="caption">平均分配和目前無法決定的 {total - decided} 題沒有方向，不計入優先保留次數。</p>}
  </>;
}

const comparisonText = { 一致: '這次情境選擇與原先排序一致', 不同: '這次情境選擇與原先排序不同' };

/**
 * The interactive result: the first act's top three beside the values kept first most often, 明確決策 N / 15 題, every core value's
 * count, then the question-by-question comparison with each raw decision. The counting rules sit in 結果怎麼整理, folded away.
 * Then the skippable reflection step, and 分享結果 with the result image and format version 3 result link (never the notes).
 */
export function InteractiveResult({ session, onEdit, onReflect, onRestart }: {
  session: InteractiveSession; onEdit: (index: number) => void; onReflect: (reflection: Reflection | undefined) => void; onRestart: () => void;
}) {
  const counts = priorityCounts(session);
  const decided = decidedCount(session);
  const total = session.scenarios.length;
  const chosen = byPosition(priorityTopThree(counts)).map(row => ({ ids: row.items.map(item => item.value.id), count: row.items[0].count }));
  const comparisons = session.scenarios.map(scenario => firstActComparison(scenario, session.answers[scenario.id], session.values));
  const same = comparisons.filter(item => item === '一致').length;
  return <section className="result-page result-cover">
    <PageHeader eyebrow="本次反思 · 開發預覽" title="這一次，你的選擇。" description="對照你原先的排序，看看這次情境中你優先保留了什麼。" />
    <section className="conclusion paper-card" aria-labelledby="interactive-top-three"><h2 id="interactive-top-three">你的前三名</h2>
      <ConclusionColumns titles={['你最重視的', '情境中優先保留的']} {...priorityColumnText}
        stated={columnRows(byPosition(act1TopThree(session.values)).map(row => ({ ids: row.items.map(value => value.id) })))}
        chosen={columnRows(chosen, row => priorityCountText(row.count))} />
      <DecidedCount decided={decided} total={total} />
    </section>
    <section className="result-evidence"><h2>逐題對照</h2>
      <p>{decided ? `方向明確的 ${decided} 題中，${same} 題與原先排序一致，${decided - same} 題不同。` : '這次沒有方向明確的題目，所以沒有和原先排序比較。'}</p>
      <details className="decision-records"><summary>展開全部 {total} 題的決策</summary>
        <ol>{session.scenarios.map((scenario, index) => {
          const answer = session.answers[scenario.id];
          const comparison = comparisons[index];
          return <li className="evidence" key={scenario.id}>
            <p className="eyebrow">第 {index + 1} 題 · {scenario.domain}</p>
            <h3>{scenario.title}</h3>
            <p className="evidence-quote">{decisionText(scenario, answer)}</p>
            {comparison && <span className="evidence-label">{comparisonText[comparison]}</span>}
            <button className="text-button" onClick={() => onEdit(index)}>修改這題</button>
          </li>;
        })}</ol>
      </details>
    </section>
    <section className="result-values"><h2>全部價值的優先保留次數</h2>
      <ul className="priority-counts" aria-label="全部價值的優先保留次數">{[...counts].sort((left, right) => right.count - left.count).map(({ value, count }) =>
        <li key={value.id}><span>{value.word}</span><b>{fullListCountText(count)}</b></li>)}</ul>
    </section>
    <details className="counting-rules"><summary>結果怎麼整理</summary>
      <ul>
        <li>每題最多讓一個價值多 1 次：分得多的一側記 1 次，分配差距不加權。</li>
        <li>平均分配和目前無法決定都不加次數，也不和原先排序比較；明確決策題數只算有方向的題目。</li>
        <li>每個價值這一輪出現在 3 題，最多 3 次。同次數並列，不用第一幕排序拆開；0 次標成「本輪未優先保留」，不表示不重要。</li>
        <li>逐題對照只看方向：這題保留的價值在第一幕排得比較前面，就是一致，反之是不同。自訂價值不參與比較。</li>
        <li>次數只描述這一輪情境中的選擇，不代表偏好強度，也不是完整或穩定的價值排序。</li>
      </ul>
    </details>
    <ReflectionStep session={session} onChange={onReflect} />
    <InteractiveShare session={session} />
    <nav className="actions"><button className="secondary" onClick={onRestart}>重新開始</button></nav>
  </section>;
}
