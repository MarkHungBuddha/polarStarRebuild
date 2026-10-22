import type { ReactNode } from 'react';
import type { Scenario } from './types';

/** Shared layout for every mechanic: heading, setup, the mechanic's control, then back / confirm / return-to-result. */
export function ScenarioFrame({ scenario, caption, canConfirm, onConfirm, onBack, onReview, children }: {
  scenario: Scenario; caption: string; canConfirm: boolean; onConfirm: () => void; onBack: () => void; onReview?: () => void; children: ReactNode;
}) {
  return <section className="scenario-page">
    <header className="section-header"><p className="eyebrow">{scenario.domain} · 情境中的取捨</p><h1>{scenario.title}</h1></header>
    <p className="setup">{scenario.setup}</p>
    {children}
    <p className="caption">{caption}</p>
    <nav className="actions"><button className="secondary" onClick={onBack}>返回上一頁</button>
      <button className="primary" disabled={!canConfirm} onClick={onConfirm}>確認答案</button>
      {onReview && <button className="text-button" onClick={onReview}>返回已確認結果</button>}
    </nav>
  </section>;
}
