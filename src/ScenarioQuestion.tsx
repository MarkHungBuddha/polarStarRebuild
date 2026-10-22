import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { Answer, ChoiceAnswer, ChoiceScenario, Scenario, StrikeAnswer, StrikeScenario } from './types';
import { SliderQuestion } from './SliderQuestion';
import { AllocationQuestion } from './AllocationQuestion';

export function ScenarioQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: Scenario; answer?: Answer; onConfirm: (answer: Answer) => void; onBack: () => void; onReview?: () => void;
}) {
  if (scenario.kind === 'slider') return <SliderQuestion scenario={scenario} answer={answer?.kind === 'slider' ? answer : undefined} onConfirm={onConfirm} onBack={onBack} onReview={onReview} />;
  if (scenario.kind === 'allocate') return <AllocationQuestion scenario={scenario} answer={answer?.kind === 'allocate' ? answer : undefined} onConfirm={onConfirm} onBack={onBack} onReview={onReview} />;
  return <ChoiceQuestion scenario={scenario} answer={answer?.kind === 'choice' || answer?.kind === 'strike' ? answer : undefined} onConfirm={onConfirm} onBack={onBack} onReview={onReview} />;
}

function ChoiceQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: ChoiceScenario | StrikeScenario; answer?: ChoiceAnswer | StrikeAnswer; onConfirm: (answer: Answer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(answer?.optionId ?? null);
  const strike = scenario.kind === 'strike';
  return <ScenarioFrame scenario={scenario} caption={strike ? '刪掉一段後，按下確認才會提交保留的回覆。你可以回頭修改。' : '選取後，按下確認才會提交答案。你可以回頭修改。'} canConfirm={draft !== null} onConfirm={() => draft !== null && onConfirm({ kind: scenario.kind, variantId: scenario.id, optionId: draft })} onBack={onBack} onReview={onReview}>
    <fieldset className="options"><legend>{strike ? '劃掉一段回覆，留下另一段。' : '你會怎麼選？'}</legend>
      {scenario.options.map((option, index) => <label className={strike ? draft !== null && draft !== option.id ? 'option selected strike-removed' : 'option' : draft === option.id ? 'option selected' : 'option'} key={option.id}>
        <input type="radio" name="answer" value={option.id} aria-label={strike ? `刪掉 ${index === 0 ? 'A' : 'B'} 段` : undefined} checked={strike ? draft !== null && draft !== option.id : draft === option.id} onChange={() => setDraft(strike ? scenario.options[index === 0 ? 1 : 0].id : option.id)} />
        <span className="option-letter">{index === 0 ? 'A' : 'B'}</span><span><strong>{option.label}</strong><small>{option.consequence}</small>{strike && <span className="strike-status">{draft === null ? `刪掉 ${index === 0 ? 'A' : 'B'} 段` : draft === option.id ? `保留 ${index === 0 ? 'A' : 'B'} 段` : `已刪 ${index === 0 ? 'A' : 'B'} 段`}</span>}</span>
      </label>)}
    </fieldset>
  </ScenarioFrame>;
}

