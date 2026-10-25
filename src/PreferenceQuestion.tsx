import { useId, useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { PreferenceAnswer, PreferenceScenario, PreferenceStrength } from './types';
import './preference.css';

export const preferenceLabels: Record<PreferenceStrength, string> = {
  [-2]: '強烈偏向 A', [-1]: '稍微偏向 A', 0: '兩者相當', 1: '稍微偏向 B', 2: '強烈偏向 B',
};
const strengths: readonly PreferenceStrength[] = [-2, -1, 0, 1, 2];

export function PreferenceQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: PreferenceScenario; answer?: PreferenceAnswer; onConfirm: (answer: PreferenceAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const group = useId();
  const [draft, setDraft] = useState<PreferenceStrength | null>(answer?.strength ?? null);
  return <ScenarioFrame scenario={scenario} caption="選擇你的偏向程度，再按確認答案。兩者相當也需要主動選擇。" canConfirm={draft !== null}
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
