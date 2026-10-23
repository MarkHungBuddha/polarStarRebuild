import { evidenceId } from './ResultEvidence';
import { act1TopThree, byPosition, differsFromFirstAct, scenarioTallies, scenarioTopThree } from './valueRanking';
import type { Session } from './types';

const positionLabel = (row: { position: number; items: readonly unknown[] }) => (row.items.length > 1 ? '並列第 ' : '第 ') + row.position;
const counted = (row: { items: readonly { chosen: number; directional: number }[] }) => `${row.items.length > 1 ? '各' : ''}選了 ${row.items[0].chosen} 次／共 ${row.items[0].directional} 題`;

/** The two top-three columns, one row per position; shared by the result cover and the detailed conclusion. */
export function TopThreeColumns({ session, onRevisitFirstAct }: { session: Session; onRevisitFirstAct: () => void }) {
  const statedRows = byPosition(act1TopThree(session.values));
  const chosenRows = byPosition(scenarioTopThree(scenarioTallies(session)));
  return <div className="conclusion-columns">
    <div><h3>你最重視的</h3><p className="caption">第一幕的分類與排序</p>
      <ol>{statedRows.map(row => <li key={row.position}><span>{positionLabel(row)}</span><strong>{row.items.map(value => value.word).join('、')}</strong></li>)}</ol>
      {statedRows.some(row => row.items.length > 1) && <p className="caption">有些價值你沒有排出先後。<button className="text-button" onClick={onRevisitFirstAct}>回第一幕調整</button></p>}</div>
    <div><h3>你在情境中最常選的</h3><p className="caption">第二幕有偏向一邊的答案</p>
      {chosenRows.length ? <ol>{chosenRows.map(row => <li key={row.position}><span>{positionLabel(row)}</span><strong>{row.items.map(tally => tally.value.word).join('、')}</strong><small>{counted(row)}</small></li>)}</ol> : <p>這次沒有偏向一邊的答案。</p>}</div>
  </div>;
}

/** The conclusion: the first act's top three beside the values chosen most in the scenarios, one row per position, with what to take away. */
export function ValueConclusion({ session, onRevisitFirstAct }: { session: Session; onRevisitFirstAct: () => void }) {
  const stated = act1TopThree(session.values);
  const tallies = scenarioTallies(session);
  const chosen = scenarioTopThree(tallies);
  const tallyOf = (id: string) => tallies.find(tally => tally.value.id === id)!;
  const chosenIds = new Set(chosen.map(placed => placed.item.value.id));
  const statedIds = new Set(stated.map(placed => placed.item.id));
  const onlyChosen = chosen.filter(placed => !statedIds.has(placed.item.value.id));
  const allDiffering = session.scenarios.map((scenario, index) => ({ scenario, position: index + 1 })).filter(({ scenario }) => session.answers[scenario.id] && differsFromFirstAct(scenario, session.answers[scenario.id], session.values));
  // Only the differing scenarios that touch the stated top three are linked; the rest stay in the evidence below.
  const differing = allDiffering.filter(({ scenario }) => scenario.pair.some(id => statedIds.has(id)));
  const otherDiffering = allDiffering.length - differing.length;
  return <section className="conclusion" aria-labelledby="conclusion-title">
    <h2 id="conclusion-title">你的前三名</h2>
    <TopThreeColumns session={session} onRevisitFirstAct={onRevisitFirstAct} />
    <h3>對照你最重視的前三名</h3>
    <ul className="conclusion-checks">{stated.map(({ item }) => {
      const tally = tallyOf(item.id);
      const detail = !tally.directional ? '這次沒有偏向一邊的題目。' : `在情境中選了 ${tally.chosen} 次／共 ${tally.directional} 題，${chosenIds.has(item.id) ? '也排進情境中的前三名。' : '沒有排進情境中的前三名。'}`;
      return <li key={item.id}><strong>{item.word}</strong>：{detail}</li>;
    })}
    {onlyChosen.length > 0 && <li>另外在情境中常選的：{byPosition(onlyChosen).map(row => `${row.items.map(tally => tally.value.word).join('、')}（${counted(row)}）`).join('；')}。</li>}</ul>
    <h3>帶走這三個問題</h3>
    <ol className="conclusion-questions">
      <li>{onlyChosen.length ? '兩份前三名不完全一樣。接下來一年，你希望生活更接近哪一份？' : '兩份前三名一致。你現在的時間與精力，有分給這三件事嗎？'}</li>
      <li>從你最重視的前三名挑一個，寫下下個月能為它多留一點空間的一件具體安排。</li>
      <li>{differing.length ? <>回頭看與你最重視的前三名有關、又與第一幕不同的題目：是什麼條件讓你選了另一邊？那個條件在你的生活裡常出現嗎？
        <ul className="conclusion-differing">{differing.map(({ scenario, position }) => <li key={scenario.id}><a href={`#${evidenceId(scenario)}`}>第 {position} 題 · {scenario.title}</a></li>)}</ul></> : allDiffering.length ? '與你最重視的前三名有關的題目，都與第一幕相符。挑一題回頭看：在什麼條件下，你會選另一邊？' : '這次沒有與第一幕不同的題目。挑一題回頭看：在什麼條件下，你會選另一邊？'}
        {otherDiffering > 0 && <p className="caption">其餘 {otherDiffering} 題與第一幕不同的題目，在下方逐題證據。</p>}</li>
    </ol>
    <p className="disclaimer">每個價值這次只出現在約三題，一題改變就可能改動名次；滑桿條件落在中間、平均分配的題目不計入次數。這份對照是規劃與反思的起點，不是測驗分數或人格判定。</p>
  </section>;
}
