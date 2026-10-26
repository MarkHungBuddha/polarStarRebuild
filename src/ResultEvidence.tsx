import type { ReactNode } from 'react';
import { act1Precedence, type Act1Pair } from './firstAct';
import { leaningValue } from './valueRanking';
import { preferenceLabels } from './PreferenceQuestion';
import type { Answer, Scenario, ValueItem } from './types';

export const evidenceId = (scenario: Scenario) => `evidence-${scenario.id}`;

/** One confirmed answer on the detailed report: both options, the lean and its points, and how it compares with the first act. */
export function ResultEvidence({ scenario, answer, values, position, onEdit }: { scenario: Scenario; answer: Answer; values: ValueItem[]; position: number; onEdit: () => void }) {
  const pair = act1Precedence(values, scenario.pair);
  const leaning = leaningValue(scenario, answer);
  const label = !leaning ? '無明確偏向' : pair?.ahead ? comparisonLabel(pair, leaning) : '第一幕並列 · 只描述本次答案';
  return <EvidenceArticle scenario={scenario} position={position} topic="偏向程度" label={label} onEdit={onEdit}>
    {scenario.options.map((option, index) => <p key={option.id}>{index === 0 ? 'A' : 'B'} · {option.label}：{option.consequence}</p>)}
    <p className="evidence-quote">已確認答案：{preferenceLabels[answer.strength]}。{leaning && pair ? `${leanWord(pair, leaning)}加 ${Math.abs(answer.strength)} 分。` : '兩側都不加分。'}</p>
    {pair && <p>{act1Statement(pair)}。兩幕比較只看偏向方向，不以程度推論差異大小。</p>}
  </EvidenceArticle>;
}

function EvidenceArticle({ scenario, position, topic, label, onEdit, children }: { scenario: Scenario; position: number; topic: string; label: string; onEdit: () => void; children: ReactNode }) {
  return <article className="evidence" id={evidenceId(scenario)} tabIndex={-1}>
    <p className="eyebrow">第 {position} 題 · {scenario.domain} · {topic}</p>
    <h3>{scenario.title}</h3>
    <p className="evidence-setup">{scenario.setup}</p>
    <span className="evidence-label">{label}</span>
    {children}
    <button className="text-button" onClick={onEdit}>修改這題</button>
  </article>;
}

/** 相符／不同 only applies when the first act has a clear order and the answer itself leans to one value. */
const comparisonLabel = (pair: Act1Pair, leaning: string) => leaning === pair.ahead?.id ? '與第一幕相符' : '與第一幕不同';
const leanWord = (pair: Act1Pair, leaning: string) => leaning === pair.first.id ? pair.first.word : pair.second.word;
const act1Statement = (pair: Act1Pair) => pair.ahead && pair.behind ? `你把${pair.ahead.word}放在${pair.behind.word}之前` : `你將${pair.first.word}與${pair.second.word}並列`;
