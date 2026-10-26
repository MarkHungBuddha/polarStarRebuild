import { evidenceId } from './ResultEvidence';
import { act1TopThree, byPosition, differsFromFirstAct } from './valueRanking';
import type { Session } from './types';
import { preferenceScores, preferenceScoreText, preferenceScoringNote, preferenceTopThree } from './preferenceRanking';
import { columnRows, scoreCount, type ColumnRow } from './columnRows';

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

/** The two top-three columns, one row per position; shared by the result cover and the detailed conclusion. */
export function TopThreeColumns({ session }: { session: Session }) {
  return <ConclusionColumns titles={['你最重視的', '情境中的偏向分數']} {...preferenceColumnText}
    stated={columnRows(byPosition(act1TopThree(session.values)).map(row => ({ ids: row.items.map(value => value.id) })))}
    chosen={columnRows(byPosition(preferenceTopThree(preferenceScores(session))).map(row => ({ ids: row.items.map(item => item.value.id), score: row.items[0].score })), scoreCount)} />;
}

/** The conclusion: the first act's top three beside the values with the highest preference scores, one row per position, with what to take away. */
export function ValueConclusion({ session }: { session: Session }) {
  const stated = act1TopThree(session.values);
  const scores = preferenceScores(session);
  const scored = preferenceTopThree(scores);
  const scoreOf = (id: string) => scores.find(item => item.value.id === id)!.score;
  const scoredIds = new Set(scored.map(placed => placed.item.value.id));
  const statedIds = new Set(stated.map(placed => placed.item.id));
  const onlyScored = scored.filter(placed => !statedIds.has(placed.item.value.id));
  const allDiffering = session.scenarios.map((scenario, index) => ({ scenario, position: index + 1 })).filter(({ scenario }) => session.answers[scenario.id] && differsFromFirstAct(scenario, session.answers[scenario.id], session.values));
  // Only the differing scenarios that touch the stated top three are linked; the rest stay in the evidence below.
  const differing = allDiffering.filter(({ scenario }) => scenario.pair.some(id => statedIds.has(id)));
  const otherDiffering = allDiffering.length - differing.length;
  return <section className="conclusion paper-card" aria-labelledby="conclusion-title">
    <h2 id="conclusion-title">你的前三名</h2>
    <TopThreeColumns session={session} />
    <p>{preferenceScoringNote}</p>
    <h3>對照你最重視的前三名</h3>
    <ul className="conclusion-checks">{stated.map(({ item }) => {
      const score = scoreOf(item.id);
      const detail = !score ? '這次沒有答案偏向它，得 0 分。' : `在情境中得到 ${score} 分，${scoredIds.has(item.id) ? '也排進情境中的前三名。' : '沒有排進情境中的前三名。'}`;
      return <li key={item.id}><strong>{item.word}</strong>：{detail}</li>;
    })}
    {onlyScored.length > 0 && <li>另外在情境中分數較高的：{byPosition(onlyScored).map(row => `${row.items.map(entry => entry.value.word).join('、')}（${preferenceScoreText(row.items[0].score, row.items.length > 1)}）`).join('；')}。</li>}</ul>
    <h3>還可以想想</h3>
    <ol className="conclusion-questions">
      <li>{onlyScored.length ? '兩份前三名不完全一樣。接下來一年，你希望生活更接近哪一份？' : '兩份前三名一致。你現在的時間與精力，有分給這三件事嗎？'}</li>
      <li>從你最重視的前三名挑一個：下個月，你可以為它安排一件什麼事？</li>
      <li>{differing.length ? <>回頭看與你最重視的前三名有關、又與第一幕不同的題目：是什麼條件讓你偏向另一邊？那個條件在你的生活裡常出現嗎？
        <ul className="conclusion-differing">{differing.map(({ scenario, position }) => <li key={scenario.id}><a href={`#${evidenceId(scenario)}`}>第 {position} 題 · {scenario.title}</a></li>)}</ul></> : allDiffering.length ? '與你最重視的前三名有關的題目，都與第一幕相符。挑一題回頭看：在什麼條件下，你會偏向另一邊？' : '這次沒有與第一幕不同的題目。挑一題回頭看：在什麼條件下，你會偏向另一邊？'}
        {otherDiffering > 0 && <p className="caption">其餘 {otherDiffering} 題與第一幕不同的題目，可以在下方逐題查看。</p>}</li>
    </ol>
    <p className="sticky-note" role="note">每個價值這次只出現在三題，改一題就可能換名次。選兩者相當的題目，兩側都不加分。這些分數和名次可以幫你回顧答案，不是測驗成績，也不是人格判定。</p>
  </section>;
}
