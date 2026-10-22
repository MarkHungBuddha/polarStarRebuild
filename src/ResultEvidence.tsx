import { categoryOrder } from './data';
import type { AllocationAnswer, AllocationScenario, Answer, Scenario, ValueItem } from './types';

export const evidenceId = (scenario: Scenario) => `evidence-${scenario.id}`;

export function ResultEvidence({ scenario, answer, values, position, onEdit }: { scenario: Scenario; answer: Answer; values: ValueItem[]; position: number; onEdit: () => void }) {
  if (scenario.kind === 'allocate') return answer.kind === 'allocate' ? <AllocationEvidence scenario={scenario} answer={answer} values={values} position={position} onEdit={onEdit} /> : null;
  if (scenario.kind === 'slider') {
    if (answer.kind !== 'slider') return null;
    return <article className="evidence" id={evidenceId(scenario)} tabIndex={-1}>
      <p className="eyebrow">第 {position} 題 · {scenario.domain} · 接受條件</p>
      <h3>{scenario.title}</h3>
      <p className="evidence-setup">{scenario.setup}</p>
      <span className="evidence-label">接受條件 · 只描述本次答案</span>
      <p className="evidence-quote">{scenario.resultPrefix} {answer.value} {scenario.unit}{scenario.resultSuffix}</p>
      <button className="text-button" onClick={onEdit}>修改這題</button>
    </article>;
  }
  if (answer.kind === 'slider' || answer.kind === 'allocate' || answer.kind !== scenario.kind) return null;
  const option = scenario.options.find(item => item.id === answer.optionId);
  const first = values.find(value => value.id === scenario.pair[0]);
  const second = values.find(value => value.id === scenario.pair[1]);
  if (!option || !first?.category || !second?.category) return null;
  const difference = categoryOrder.indexOf(first.category) - categoryOrder.indexOf(second.category) || first.rank - second.rank;
  const preferred = difference < 0 ? first : second;
  const other = difference < 0 ? second : first;
  const comparable = difference !== 0;
  return <article className="evidence" id={evidenceId(scenario)} tabIndex={-1}>
    <p className="eyebrow">第 {position} 題 · {scenario.domain} · {first.word}與{second.word}</p>
    <h3>{scenario.title}</h3>
    <p className="evidence-setup">{scenario.setup}</p>
    <span className="evidence-label">{comparable ? option.valueId === preferred.id ? '與第一幕相符' : '與第一幕不同' : '第一幕並列 · 只描述本次選擇'}</span>
    <p className="evidence-quote">{comparable ? `你把${preferred.word}放在${other.word}之前；在這題，你${scenario.kind === 'strike' ? '保留了以下回覆。' : `選擇了「${option.label}」。`}` : `你將${first.word}與${second.word}並列；在這題，你${scenario.kind === 'strike' ? '保留了以下回覆。' : `選擇了「${option.label}」。`}`}</p>
    {scenario.kind === 'strike' && <blockquote className="kept-reply">{option.label}</blockquote>}
    <p>{option.consequence}</p>
    <button className="text-button" onClick={onEdit}>修改這題</button>
  </article>;
}

function AllocationEvidence({ scenario, answer, values, position, onEdit }: { scenario: AllocationScenario; answer: AllocationAnswer; values: ValueItem[]; position: number; onEdit: () => void }) {
  const first = values.find(value => value.id === scenario.pair[0]);
  const second = values.find(value => value.id === scenario.pair[1]);
  if (!first?.category || !second?.category) return null;
  const difference = categoryOrder.indexOf(first.category) - categoryOrder.indexOf(second.category) || first.rank - second.rank;
  const equal = answer.allocations[0] === answer.allocations[1];
  const chosen = scenario.options[answer.allocations[0] > answer.allocations[1] ? 0 : 1];
  const preferred = difference < 0 ? first : second;
  const comparable = difference !== 0 && !equal;
  return <article className="evidence" id={evidenceId(scenario)} tabIndex={-1}>
    <p className="eyebrow">第 {position} 題 · {scenario.domain} · {first.word}與{second.word}</p><h3>{scenario.title}</h3>
    <p className="evidence-setup">{scenario.setup}</p>
    <span className="evidence-label">{equal ? '平均分配 · 只描述本次配置' : difference === 0 ? '第一幕並列 · 只描述本次配置' : chosen.valueId === preferred.id ? '與第一幕相符' : '與第一幕不同'}</span>
    <p className="evidence-quote">你把 {answer.allocations[0]} {scenario.unit}分給「{scenario.options[0].label}」，{answer.allocations[1]} {scenario.unit}分給「{scenario.options[1].label}」。</p>
    {comparable && <p>在這題，你分給「{chosen.label}」較多資源；這只描述本次的配置方向。</p>}
    <button className="text-button" onClick={onEdit}>修改這題</button>
  </article>;
}
