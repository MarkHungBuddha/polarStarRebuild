import { useState } from 'react';
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
  return <section className="scenario-page">
    <header className="section-header"><p className="eyebrow">{scenario.domain} · 情境中的取捨</p><h1>{scenario.title}</h1></header>
    <p className="setup">{scenario.setup}</p>
    <fieldset className="allocation-control"><legend>將 {scenario.total} {scenario.unit}全部分配；一邊增加，另一邊就會減少。</legend>
      {scenario.options.map((option, index) => <div className="allocation-row" key={option.id}>
        <div><label htmlFor={`allocation-${scenario.id}-${option.id}`}>{option.label}</label><p>{option.consequence}</p></div>
        <div className="allocation-amount"><input id={`allocation-${scenario.id}-${option.id}`} type="number" min={0} max={scenario.total} step={1} value={amounts[index]} onChange={event => change(index, event.target.value)} /><span>{scenario.unit}</span></div>
      </div>)}
      <output aria-live="polite">已分配 {scenario.total} / {scenario.total} {scenario.unit}</output>
    </fieldset>
    <p className="caption">先調整分配，再按下確認。初始配置不會自動成為答案；分配數量不代表價值強度。</p>
    <nav className="actions"><button className="secondary" onClick={onBack}>返回上一頁</button>
      <button className="primary" disabled={draft === null} onClick={() => draft !== null && onConfirm({ kind: 'allocate', variantId: scenario.id, allocations: amounts })}>確認答案</button>
      {onReview && <button className="text-button" onClick={onReview}>返回已確認結果</button>}
    </nav>
  </section>;
}
