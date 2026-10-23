import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { AllocationAnswer, AllocationScenario } from './types';

export function AllocationQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: AllocationScenario; answer?: AllocationAnswer; onConfirm: (answer: AllocationAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [placements, setPlacements] = useState<(number | null)[]>(() => answer?.placements ? [...answer.placements] : Array.from({ length: scenario.total }, (_, i) => answer ? i < answer.allocations[0] ? 0 : 1 : null));
  const [activity, setActivity] = useState(0);
  const [drag, setDrag] = useState<{ x: number; y: number; activity: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const amounts = [placements.filter(item => item === 0).length, placements.filter(item => item === 1).length] as const;
  const ready = placements.every(item => item !== null);
  const place = (index: number, choice: number) => setPlacements(current => current.map((item, i) => i === index ? choice : item));
  const drop = (event: PointerEvent<HTMLButtonElement>, choice: number) => {
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-planner-slot]');
    if (target && start.current && Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > 5) place(Number(target.dataset.plannerSlot), choice);
    start.current = null; setDrag(null);
  };
  const timeLabel = (index: number) => scenario.unit === '晚' ? `第 ${Math.floor(index / 2) + 1} 週 · ${index % 2 === 0 ? '週二' : '週四'}晚上` : scenario.unit === '個下午' ? `第 ${index + 1} 週 · 週末下午` : `第 ${index + 1} 個${scenario.unit === '小時' ? '一小時空檔' : '活動時段'}`;
  return <ScenarioFrame scenario={scenario} caption="想換活動，先選另一個活動，再點要更改的時段。排好後按「確認答案」。" canConfirm={ready} onConfirm={() => ready && onConfirm({ kind: 'allocate', variantId: scenario.id, allocations: amounts, placements: placements as number[] })} onBack={onBack} onReview={onReview}>
    <div className="planner-board">
      <div className="planner-heading"><span className="eyebrow">MY SCHEDULE</span><h2>這些空檔，怎麼過？</h2><p>拖曳活動到行程裡；也可以先點活動，再點要安排的空檔。</p></div>
      <div className="planner-activities">{scenario.options.map((option, index) => <button key={option.id} className={activity === index ? 'active' : ''} aria-pressed={activity === index} onClick={() => setActivity(index)} onPointerDown={event => { start.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); setActivity(index); }} onPointerMove={event => { if (start.current && event.currentTarget.hasPointerCapture(event.pointerId)) setDrag({ x: event.clientX, y: event.clientY, activity: index }); }} onPointerUp={event => drop(event, index)} onPointerCancel={() => { start.current = null; setDrag(null); }}><span className={`activity-dot activity-${index}`} />{option.label}<small>拖到行程 ↓</small></button>)}</div>
      <div className="planner-slots">{placements.map((choice, index) => <button key={index} data-planner-slot={index} className={choice === null ? 'empty' : `assigned activity-${choice}`} aria-label={`${timeLabel(index)}：${choice === null ? '尚未安排' : scenario.options[choice].label}`} onClick={() => place(index, activity)}><span className="planner-date">{timeLabel(index)}</span><strong>{choice === null ? '＋ 安排活動' : scenario.options[choice].label}</strong><small>{choice === null ? `1 ${scenario.unit}的空檔` : '點選可換成目前選取的活動'}</small></button>)}</div>
      <p className="scene-feedback" aria-live="polite">{scenario.options[0].label} {amounts[0]} {scenario.unit} · {scenario.options[1].label} {amounts[1]} {scenario.unit}<br />{ready ? '行程排好了。' : `還有 ${scenario.total - amounts[0] - amounts[1]} 個空檔。`}</p>
      {drag && <div className="activity-ghost" style={{ left: drag.x + 12, top: drag.y + 12 }}>{scenario.options[drag.activity].label}</div>}
    </div>
  </ScenarioFrame>;
}
