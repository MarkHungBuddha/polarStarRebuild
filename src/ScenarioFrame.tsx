import type { ReactNode } from 'react';
import type { Scenario } from './types';

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

/** The setup is long, so it reads as body text; a closing question, when there is one, sits apart under a dashed rule. */
function splitSetup(setup: string) {
  const text = setup.replace(/^假設/, '').replace(/回覆只能保留一段。/g, '你會怎麼回覆？');
  const match = /^(.*[。！？])([^。！？]+？)$/.exec(text);
  return match ? { body: match[1], question: match[2] } : { body: text, question: undefined };
}

/** Shared layout for every mechanic: a paper card with the situation, the mechanic's control, then back / confirm / return-to-result. */
export function ScenarioFrame({ scenario, caption, canConfirm, onConfirm, onBack, onReview, children }: {
  scenario: Scenario; caption: string; canConfirm: boolean; onConfirm: () => void; onBack: () => void; onReview?: () => void; children: ReactNode;
}) {
  const { body, question } = splitSetup(scenario.setup);
  return <section className="scenario-page">
    <div className="paper-card scenario-card">
      <svg className="star-sticker" aria-hidden="true" viewBox="0 0 24 24"><path d="m12 2 2.8 6.4 7 .7-5.3 4.6 1.6 6.8-6.1-3.6-6.1 3.6 1.6-6.8L2.2 9.1l7-.7Z" /></svg>
      <p className="scenario-tag">情境 {scenario.slotId.replace('slot', '')} · {scenario.domain}</p>
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
