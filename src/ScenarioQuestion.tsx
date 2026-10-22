import { useState } from 'react';
import type { Answer, ChoiceAnswer, ChoiceScenario, Scenario } from './types';
import { SliderQuestion } from './SliderQuestion';

export function ScenarioQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: Scenario; answer?: Answer; onConfirm: (answer: Answer) => void; onBack: () => void; onReview?: () => void;
}) {
  if (scenario.kind === 'slider') return <SliderQuestion scenario={scenario} answer={answer?.kind === 'slider' ? answer : undefined} onConfirm={onConfirm} onBack={onBack} onReview={onReview} />;
  return <ChoiceQuestion scenario={scenario} answer={answer?.kind === 'choice' ? answer : undefined} onConfirm={onConfirm} onBack={onBack} onReview={onReview} />;
}

function ChoiceQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: ChoiceScenario; answer?: ChoiceAnswer; onConfirm: (answer: Answer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(answer?.optionId ?? null);
  return <section className="scenario-page">
    <header className="section-header"><p className="eyebrow">{scenario.domain} · 情境中的取捨</p><h1>{scenario.title}</h1></header>
    <p className="setup">{scenario.setup}</p>
    <fieldset className="options"><legend>你會怎麼選？</legend>
      {scenario.options.map((option, index) => <label className={draft === option.id ? 'option selected' : 'option'} key={option.id}>
        <input type="radio" name="answer" value={option.id} checked={draft === option.id} onChange={() => setDraft(option.id)} />
        <span className="option-letter">{index === 0 ? 'A' : 'B'}</span><span><strong>{option.label}</strong><small>{option.consequence}</small></span>
      </label>)}
    </fieldset>
    <p className="caption">選取後，按下確認才會提交答案。你可以回頭修改。</p>
    <nav className="actions"><button className="secondary" onClick={onBack}>返回上一頁</button>
      <button className="primary" disabled={draft === null} onClick={() => draft !== null && onConfirm({ kind: 'choice', variantId: scenario.id, optionId: draft })}>確認答案</button>
      {onReview && <button className="text-button" onClick={onReview}>返回已確認結果</button>}
    </nav>
  </section>;
}

