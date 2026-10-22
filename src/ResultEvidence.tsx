import { categoryOrder } from './data';
import type { Answer, Scenario, ValueItem } from './types';

export function ResultEvidence({ scenario, answer, values, onEdit }: { scenario: Scenario; answer: Answer; values: ValueItem[]; onEdit: () => void }) {
  if (scenario.kind === 'slider') {
    if (answer.kind !== 'slider') return null;
    return <article className="evidence">
      <p className="eyebrow">{scenario.domain} · 接受條件</p>
      <h3>{scenario.title}</h3>
      <p className="evidence-setup">{scenario.setup}</p>
      <span className="evidence-label">接受條件 · 只描述本次答案</span>
      <p className="evidence-quote">{scenario.resultPrefix} {answer.value} {scenario.unit}{scenario.resultSuffix}</p>
      <button className="text-button" onClick={onEdit}>修改這題</button>
    </article>;
  }
  if (answer.kind !== 'choice') return null;
  const option = scenario.options.find(item => item.id === answer.optionId);
  const first = values.find(value => value.id === scenario.pair[0]);
  const second = values.find(value => value.id === scenario.pair[1]);
  if (!option || !first?.category || !second?.category) return null;
  const difference = categoryOrder.indexOf(first.category) - categoryOrder.indexOf(second.category) || first.rank - second.rank;
  const preferred = difference < 0 ? first : second;
  const other = difference < 0 ? second : first;
  const comparable = difference !== 0;
  return <article className="evidence">
    <p className="eyebrow">{scenario.domain} · {first.word}與{second.word}</p>
    <h3>{scenario.title}</h3>
    <p className="evidence-setup">{scenario.setup}</p>
    <span className="evidence-label">{comparable ? option.valueId === preferred.id ? '與第一幕相符' : '與第一幕不同' : '第一幕並列 · 只描述本次選擇'}</span>
    <p className="evidence-quote">{comparable ? `你把${preferred.word}放在${other.word}之前；在這題，你選擇了「${option.label}」。` : `你將${first.word}與${second.word}並列；在這題，你選擇了「${option.label}」。`}</p>
    <p>{option.consequence}</p>
    <button className="text-button" onClick={onEdit}>修改這題</button>
  </article>;
}
