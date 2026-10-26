import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { ChoiceAnswer, ChoiceInteraction, InteractiveScenario } from './interactiveTypes';
import './interactive.css';

/**
 * 選一個方案: two cards, each a native radio, so clicking a card or the keyboard (Tab, arrows, Space) picks or switches it.
 * Nothing is picked at first; 確認答案 opens once a card is picked. The draft is never stored.
 */
export function ChoiceQuestion({ scenario, interaction, answer, onConfirm, onBack, onReview }: {
  scenario: InteractiveScenario; interaction: ChoiceInteraction; answer?: ChoiceAnswer;
  onConfirm: (answer: ChoiceAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [picked, setPicked] = useState(answer?.optionId);
  return <ScenarioFrame scenario={scenario} caption={picked ? '確認前都可以換一張。' : '選一張卡片，才能確認答案。'} canConfirm={picked !== undefined}
    onConfirm={() => picked && onConfirm({ kind: 'choose', variantId: scenario.id, optionId: picked })} onBack={onBack} onReview={onReview}>
    <div className="choice-cards">{interaction.options.map(option => <label className="choice-card" key={option.id}>
      <input type="radio" name={`choice-${scenario.id}`} value={option.id} checked={picked === option.id} onChange={() => setPicked(option.id)} />
      <span className="choice-label">{option.label}</span>
      <span className="choice-content">{option.content}</span>
      <span className="choice-cost"><b>代價</b>{option.cost}</span>
    </label>)}</div>
  </ScenarioFrame>;
}
