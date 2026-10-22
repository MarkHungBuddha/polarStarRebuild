import { useState } from 'react';
import type { Answer, Scenario } from './types';

export function ScenarioQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: Scenario; answer?: Answer; onConfirm: (answer: Answer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(answer?.optionId ?? null);
  const strike = scenario.kind === 'strike';
  return <section className="scenario-page">
    <header className="section-header"><p className="eyebrow">{scenario.domain} · 情境中的取捨</p><h1>{scenario.title}</h1></header>
    <p className="setup">{scenario.setup}</p>
    <fieldset className="options"><legend>{strike ? '劃掉一段回覆，留下另一段。' : '你會怎麼選？'}</legend>
      {scenario.options.map((option, index) => <label className={strike ? draft !== null && draft !== option.id ? 'option selected strike-removed' : 'option' : draft === option.id ? 'option selected' : 'option'} key={option.id}>
        <input type="radio" name="answer" value={option.id} aria-label={strike ? `刪掉 ${index === 0 ? 'A' : 'B'} 段` : undefined} checked={strike ? draft !== null && draft !== option.id : draft === option.id} onChange={() => setDraft(strike ? scenario.options[index === 0 ? 1 : 0].id : option.id)} />
        <span className="option-letter">{index === 0 ? 'A' : 'B'}</span><span><strong>{option.label}</strong><small>{option.consequence}</small>{strike && <span className="strike-status">{draft === null ? `刪掉 ${index === 0 ? 'A' : 'B'} 段` : draft === option.id ? `保留 ${index === 0 ? 'A' : 'B'} 段` : `已刪 ${index === 0 ? 'A' : 'B'} 段`}</span>}</span>
      </label>)}
    </fieldset>
    <p className="caption">{strike ? '刪掉一段後，按下確認才會提交保留的回覆。你可以回頭修改。' : '選取後，按下確認才會提交答案。你可以回頭修改。'}</p>
    <nav className="actions"><button className="secondary" onClick={onBack}>返回上一頁</button>
      <button className="primary" disabled={draft === null} onClick={() => draft !== null && onConfirm({ kind: scenario.kind, variantId: scenario.id, optionId: draft })}>確認答案</button>
      {onReview && <button className="text-button" onClick={onReview}>返回已確認結果</button>}
    </nav>
  </section>;
}

