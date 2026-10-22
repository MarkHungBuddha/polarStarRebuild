import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { SliderAnswer, SliderScenario } from './types';

export function SliderQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: SliderScenario; answer?: SliderAnswer; onConfirm: (answer: SliderAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [draft, setDraft] = useState<number | null>(answer?.value ?? null);
  const value = draft ?? scenario.initial;
  return <ScenarioFrame scenario={scenario} caption="先調整條件，再按下確認。初始刻度不會自動成為答案；這裡記錄的是接受條件，不是價值強度。" canConfirm={draft !== null} onConfirm={() => draft !== null && onConfirm({ kind: 'slider', variantId: scenario.id, value: draft })} onBack={onBack} onReview={onReview}>
    <div className="condition-control">
      <label htmlFor={`condition-${scenario.id}`}>{scenario.question}</label>
      <output htmlFor={`condition-${scenario.id}`} className="condition-reading" aria-live="polite">{value} {scenario.unit}</output>
      <input id={`condition-${scenario.id}`} type="range" min={scenario.min} max={scenario.max} step={scenario.step} value={value} aria-valuetext={`${value} ${scenario.unit}`} onChange={event => setDraft(Number(event.target.value))} />
      <div className="condition-limits"><span>{scenario.min} {scenario.unit}</span><span>{scenario.max} {scenario.unit}</span></div>
    </div>
  </ScenarioFrame>;
}
