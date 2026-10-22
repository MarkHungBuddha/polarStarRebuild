import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { AllocationAnswer, AllocationScenario } from './types';

export function AllocationQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: AllocationScenario; answer?: AllocationAnswer; onConfirm: (answer: AllocationAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [draft, setDraft] = useState<number | null>(answer?.allocations[0] ?? null);
  const first = draft ?? Math.floor(scenario.total / 2);
  const amounts = [first, scenario.total - first] as const;
  const change = (index: number, raw: string) => {
    if (raw === '' || !Number.isFinite(Number(raw))) { setDraft(null); return; }
    const amount = Math.max(0, Math.min(scenario.total, Math.round(Number(raw))));
    setDraft(index === 0 ? amount : scenario.total - amount);
  };
  return <ScenarioFrame scenario={scenario} caption="先調整分配，再按下確認。初始配置不會自動成為答案；分配數量不代表價值強度。" canConfirm={draft !== null} onConfirm={() => draft !== null && onConfirm({ kind: 'allocate', variantId: scenario.id, allocations: amounts })} onBack={onBack} onReview={onReview}>
    <fieldset className="allocation-control"><legend>將 {scenario.total} {scenario.unit}全部分配；一邊增加，另一邊就會減少。</legend>
      {scenario.options.map((option, index) => <div className="allocation-row" key={option.id}>
        <div><label htmlFor={`allocation-${scenario.id}-${option.id}`}>{option.label}</label><p>{option.consequence}</p></div>
        <div className="allocation-amount"><input id={`allocation-${scenario.id}-${option.id}`} type="number" min={0} max={scenario.total} step={1} value={amounts[index]} onChange={event => change(index, event.target.value)} /><span>{scenario.unit}</span></div>
      </div>)}
      <output aria-live="polite">已分配 {scenario.total} / {scenario.total} {scenario.unit}</output>
    </fieldset>
  </ScenarioFrame>;
}
