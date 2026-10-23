import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import { DragClock, PiggyBank } from './PhysicalControls';
import type { SliderAnswer, SliderScenario } from './types';

export function SliderQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: SliderScenario; answer?: SliderAnswer; onConfirm: (answer: SliderAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [draft, setDraft] = useState<number | null>(answer?.value ?? null);
  const value = draft ?? 0;
  const money = scenario.id === 'slot01-work';
  const clock = scenario.slotId === 'slot07';
  const lease = scenario.slotId === 'slot01';
  const instruction = money ? '把硬幣拖進小豬撲滿，或點硬幣存入。每份代表一個月生活費。' : clock ? '拖動紅色時針，留出你希望擁有的休閒時間。' : '翻動桌曆，找到你願意接受的安排。';
  return <ScenarioFrame scenario={scenario} caption="先在場景裡試試看。確認之前，都可以改變安排。" canConfirm={draft !== null} onConfirm={() => draft !== null && onConfirm({ kind: 'slider', variantId: scenario.id, value: draft })} onBack={onBack} onReview={onReview}>
    <div className="game-board">
      <p className="game-instruction">{instruction}</p>
      <p className="scene-question">{scenario.question}</p>
      {money ? <PiggyBank value={value} max={scenario.max} onChange={setDraft}/> : clock ? <DragClock value={draft} max={scenario.max} onChange={setDraft}/> : <div className="desk-calendar" aria-label="翻頁安排保障期或發表日">
        <div className="calendar-binding" aria-hidden="true"><i/><i/></div>
        <div className="calendar-masthead"><span>{lease ? '租約保障' : '發表計畫'}</span><span>{lease ? 'MONTHS' : 'WEEKS'}</span></div>
        <button className="calendar-page" aria-label={`選定 ${value} ${scenario.unit}`} onClick={() => setDraft(value)}>
          <span className="calendar-kicker">{value === 0 ? lease ? '不要求保障期' : '維持原定日期' : lease ? '不調租的日子' : '多留一點準備時間'}</span>
          <strong>{String(value).padStart(2, '0')}</strong><span className="calendar-unit">{lease ? '個月保障' : '週準備時間'}</span>
          <span className="calendar-stamp">{draft === null ? '點這頁選定' : '這次的安排'}</span>
        </button>
        <div className="calendar-navigation"><button aria-label="往前翻一頁" disabled={value === scenario.min} onClick={() => setDraft(Math.max(scenario.min, value - scenario.step))}>← 前一頁</button><span>{scenario.min}–{scenario.max} {lease ? '個月' : '週'}</span><button aria-label="往後翻一頁" disabled={value === scenario.max} onClick={() => setDraft(Math.min(scenario.max, value + scenario.step))}>後一頁 →</button></div>
      </div>}
      <p className="scene-feedback" aria-live="polite">{draft === null ? '還沒有定案，先在場景裡試試看。' : `${scenario.resultPrefix} ${value} ${scenario.unit}${scenario.resultSuffix}`}</p>
    </div>
  </ScenarioFrame>;
}
