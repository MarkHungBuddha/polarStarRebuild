import { useId, useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { Answer, Scenario, PreferenceStrength } from './types';
import { preferenceLabels } from './preferenceLabels';
import './preference.css';

const strengths: readonly PreferenceStrength[] = [-2, -1, 0, 1, 2];

export function PreferenceQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: Scenario; answer?: Answer; onConfirm: (answer: Answer) => void; onBack: () => void; onReview?: () => void;
}) {
  const group = useId();
  const [draft, setDraft] = useState<PreferenceStrength | null>(answer?.strength ?? null);
  return <ScenarioFrame scenario={scenario} caption="選擇你的偏向程度，再按確認答案。覺得兩者相當，也請選它。" canConfirm={draft !== null}
    onConfirm={() => draft !== null && onConfirm({ kind: 'preference', variantId: scenario.id, strength: draft })} onBack={onBack} onReview={onReview}>
    <div className="preference-options">{scenario.options.map((option, index) => <section className="paper-card" key={option.id}>
      <h2>{index === 0 ? 'A' : 'B'} · {option.label}</h2><p>{option.consequence}</p>
    </section>)}</div>
    <fieldset className="preference-scale"><legend>你偏向哪一邊？</legend>{strengths.map(strength => <label key={strength}>
      <input type="radio" name={group} value={strength} checked={draft === strength} onChange={() => setDraft(strength)} />
      <span>{preferenceLabels[strength]}</span>
    </label>)}</fieldset>
  </ScenarioFrame>;
}
