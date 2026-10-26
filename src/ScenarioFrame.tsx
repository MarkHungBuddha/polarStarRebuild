import type { ReactNode } from 'react';
import type { Scenario } from './types';
import { StarIcon } from './StarIcon';
import './techo-scenario.css';

/** Visible "第 n 題" text plus a progressbar with the same numbers, so progress never relies on the segment colors. */
export function ScenarioProgress({ current, total }: { current: number; total: number }) {
  const text = `第 ${current} 題，共 ${total} 題`;
  return <div className="scenario-progress">
    <p><span>第二幕 · 情境中的取捨</span><span className="scenario-count">{text}</span></p>
    <div className="progress-segments" role="progressbar" aria-label="第二幕進度" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-valuetext={text}>
      {Array.from({ length: total }, (_, index) => <span key={index} className={index + 1 < current ? 'done' : index + 1 === current ? 'current' : undefined} />)}
    </div>
  </div>;
}

/** Splits the author's setup, unchanged, into its body and the closing question (when it ends with one), so the question can sit apart under a dashed rule. */
function splitClosingQuestion(setup: string) {
  const match = /^(.*[。！？])([^。！？]+？)$/.exec(setup);
  return match ? { body: match[1], question: match[2] } : { body: setup, question: undefined };
}

/** The question layout: a paper card with the situation, the answer control, then back / confirm / return-to-result. */
export function ScenarioFrame({ scenario, caption, canConfirm, onConfirm, onBack, onReview, children }: {
  scenario: Scenario; caption: string; canConfirm: boolean; onConfirm: () => void; onBack: () => void; onReview?: () => void; children: ReactNode;
}) {
  const { body, question } = splitClosingQuestion(scenario.setup);
  return <section className="scenario-page">
    <div className="paper-card scenario-card">
      <StarIcon className="star-sticker" />
      <p className="scenario-tag">{scenario.domain}</p>
      <h1>{scenario.title}</h1>
      <p className="setup">{body}</p>
      {question && <p className="setup-question">{question}</p>}
    </div>
    <div className="scenario-mechanic">{children}</div>
    <p className="caption">{caption}</p>
    <nav className="actions"><button className="secondary" onClick={onBack}>返回上一頁</button>
      <button className="primary" disabled={!canConfirm} onClick={onConfirm}>確認答案</button>
      {onReview && <button className="text-button" onClick={onReview}>返回已確認結果</button>}
    </nav>
  </section>;
}
