import type { ReactNode } from 'react';
import { act1Precedence, type Act1Pair } from './firstAct';
import type { AllocationAnswer, AllocationScenario, Answer, ChoiceOption, ChoiceScenario, Scenario, SliderAnswer, SliderScenario, StrikeScenario, ValueItem } from './types';

export const evidenceId = (scenario: Scenario) => `evidence-${scenario.id}`;

interface EvidenceProps { values: ValueItem[]; position: number; onEdit: () => void }

export function ResultEvidence({ scenario, answer, ...props }: EvidenceProps & { scenario: Scenario; answer: Answer }) {
  if (scenario.kind === 'slider') return answer.kind === 'slider' ? <SliderEvidence scenario={scenario} answer={answer} {...props} /> : null;
  if (scenario.kind === 'allocate') return answer.kind === 'allocate' ? <AllocationEvidence scenario={scenario} answer={answer} {...props} /> : null;
  if (answer.kind !== scenario.kind || (answer.kind !== 'choice' && answer.kind !== 'strike')) return null;
  return <ChoiceEvidence scenario={scenario} optionId={answer.optionId} {...props} />;
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

const pairTopic = (pair: Act1Pair) => `${pair.first.word}與${pair.second.word}`;
/** 相符／不同 only applies when the first act has a clear order and the answer itself clearly supports one option. */
const comparisonLabel = (pair: Act1Pair, chosen: ChoiceOption) => chosen.valueId === pair.ahead?.id ? '與第一幕相符' : '與第一幕不同';
const act1Statement = (pair: Act1Pair) => pair.ahead && pair.behind ? `你把${pair.ahead.word}放在${pair.behind.word}之前` : `你將${pair.first.word}與${pair.second.word}並列`;

function SliderEvidence({ scenario, answer, position, onEdit }: EvidenceProps & { scenario: SliderScenario; answer: SliderAnswer }) {
  return <EvidenceArticle scenario={scenario} position={position} topic="接受條件" label="接受條件 · 只描述本次答案" onEdit={onEdit}>
    <p className="evidence-quote">{scenario.resultPrefix} {answer.value} {scenario.unit}{scenario.resultSuffix}</p>
  </EvidenceArticle>;
}

function ChoiceEvidence({ scenario, optionId, values, position, onEdit }: EvidenceProps & { scenario: ChoiceScenario | StrikeScenario; optionId: string }) {
  const option = scenario.options.find(item => item.id === optionId);
  const pair = act1Precedence(values, scenario.pair);
  if (!option || !pair) return null;
  const choice = scenario.kind === 'strike' ? '保留了以下回覆。' : `選擇了「${option.label}」。`;
  return <EvidenceArticle scenario={scenario} position={position} topic={pairTopic(pair)} label={pair.ahead ? comparisonLabel(pair, option) : '第一幕並列 · 只描述本次選擇'} onEdit={onEdit}>
    <p className="evidence-quote">{act1Statement(pair)}；在這題，你{choice}</p>
    {scenario.kind === 'strike' && <blockquote className="kept-reply">{option.label}</blockquote>}
    <p>{option.consequence}</p>
  </EvidenceArticle>;
}

function AllocationEvidence({ scenario, answer, values, position, onEdit }: EvidenceProps & { scenario: AllocationScenario; answer: AllocationAnswer }) {
  const pair = act1Precedence(values, scenario.pair);
  if (!pair) return null;
  const [firstAmount, secondAmount] = answer.allocations;
  // Proportions are not a direction: only giving the whole resource to one option is an answer that clearly supports it.
  const chosen = secondAmount === 0 ? scenario.options[0] : firstAmount === 0 ? scenario.options[1] : undefined;
  const label = firstAmount === secondAmount ? '平均分配 · 只描述本次配置' : !pair.ahead ? '第一幕並列 · 只描述本次配置' : chosen ? comparisonLabel(pair, chosen) : '兩邊都有分配 · 只描述本次配置';
  return <EvidenceArticle scenario={scenario} position={position} topic={pairTopic(pair)} label={label} onEdit={onEdit}>
    <p className="evidence-quote">你把 {firstAmount} {scenario.unit}分給「{scenario.options[0].label}」，{secondAmount} {scenario.unit}分給「{scenario.options[1].label}」。</p>
    {pair.ahead && chosen && <p>{act1Statement(pair)}；在這題，你把全部 {scenario.total} {scenario.unit}分給「{chosen.label}」。</p>}
  </EvidenceArticle>;
}
