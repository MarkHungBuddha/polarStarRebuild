import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { ChoiceAnswer, ChoiceInteraction, InteractiveScenario, UndecidedAnswer } from './interactiveTypes';
import { UndecidedButton } from './UndecidedButton';
import './interactive.css';

/**
 * 選一個方案: two cards, each a native radio, so clicking a card or the keyboard (Tab, arrows, Space) picks or switches it.
 * Nothing is picked at first; 確認答案 opens once a card is picked, or once 目前無法決定 is pressed (which clears the pick).
 * The draft is never stored.
 */
export function ChoiceQuestion({ scenario, interaction, answer, onConfirm, onBack, onReview }: {
  scenario: InteractiveScenario; interaction: ChoiceInteraction; answer?: ChoiceAnswer | UndecidedAnswer;
  onConfirm: (answer: ChoiceAnswer | UndecidedAnswer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [picked, setPicked] = useState(answer?.kind === 'choose' ? answer.optionId : undefined);
  const [undecided, setUndecided] = useState(answer?.kind === 'undecided');
  const ready = undecided || picked !== undefined;
  const caption = undecided ? '確認後記為目前無法決定，可以繼續下一題。' : picked ? '確認前都可以換一張。' : '選一張卡片，或選目前無法決定，才能確認答案。';
  return <ScenarioFrame scenario={scenario} caption={caption} canConfirm={ready}
    onConfirm={() => ready && onConfirm(undecided ? { kind: 'undecided', variantId: scenario.id } : { kind: 'choose', variantId: scenario.id, optionId: picked! })} onBack={onBack} onReview={onReview}>
    <div className="choice-cards">{interaction.options.map(option => <label className="choice-card" key={option.id}>
      <input type="radio" name={`choice-${scenario.id}`} value={option.id} checked={picked === option.id} onChange={() => { setUndecided(false); setPicked(option.id); }} />
      <span className="choice-label">{option.label}</span>
      <span className="choice-content">{option.content}</span>
      <span className="choice-cost"><b>代價</b>{option.cost}</span>
    </label>)}</div>
    <div className="mechanic-extras">
      <UndecidedButton pressed={undecided} onPress={() => { setUndecided(true); setPicked(undefined); }} />
    </div>
  </ScenarioFrame>;
}
