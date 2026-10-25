import { useState } from 'react';
import { ScenarioFrame } from './ScenarioFrame';
import type { Answer, ChoiceAnswer, ChoiceScenario, Scenario, StrikeAnswer, StrikeScenario } from './types';
import { SliderQuestion } from './SliderQuestion';
import { AllocationQuestion } from './AllocationQuestion';
import { TransferScene } from './GameScene';
import { choiceStages } from './choiceStages';
import { PreferenceQuestion } from './PreferenceQuestion';

export function ScenarioQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: Scenario; answer?: Answer; onConfirm: (answer: Answer) => void; onBack: () => void; onReview?: () => void;
}) {
  if (scenario.kind === 'preference') return <PreferenceQuestion scenario={scenario} answer={answer?.kind === 'preference' ? answer : undefined} onConfirm={onConfirm} onBack={onBack} onReview={onReview} />;
  if (scenario.kind === 'slider') return <SliderQuestion scenario={scenario} answer={answer?.kind === 'slider' ? answer : undefined} onConfirm={onConfirm} onBack={onBack} onReview={onReview} />;
  if (scenario.kind === 'allocate') return <AllocationQuestion scenario={scenario} answer={answer?.kind === 'allocate' ? answer : undefined} onConfirm={onConfirm} onBack={onBack} onReview={onReview} />;
  return <ChoiceQuestion scenario={scenario} answer={answer?.kind === 'choice' || answer?.kind === 'strike' ? answer : undefined} onConfirm={onConfirm} onBack={onBack} onReview={onReview} />;
}

function ChoiceQuestion({ scenario, answer, onConfirm, onBack, onReview }: {
  scenario: ChoiceScenario | StrikeScenario; answer?: ChoiceAnswer | StrikeAnswer; onConfirm: (answer: Answer) => void; onBack: () => void; onReview?: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(answer?.optionId ?? null);
  const stage = choiceStages[scenario.id];
  const selected = scenario.options.findIndex(option => option.id === draft);
  return <ScenarioFrame scenario={scenario} caption="把物件拖到目的地，或直接點選目的地。按下確認前都能更改。" canConfirm={draft !== null} onConfirm={() => draft !== null && onConfirm({ kind: scenario.kind, variantId: scenario.id, optionId: draft })} onBack={onBack} onReview={onReview}>
    <div className="game-board">
      <p className="game-instruction">{stage.instruction}</p>
      <TransferScene prop={stage.prop} destinations={stage.destinations} labels={[scenario.options[0].label, scenario.options[1].label]} selected={selected < 0 ? null : selected} onChoose={index => setDraft(scenario.options[index].id)} />
      <div className="scene-key">{scenario.options.map((option, index) => <p key={option.id}><b>{stage.destinations[index]}</b>{option.consequence}</p>)}</div>
      <p className="scene-feedback" aria-live="polite">{selected < 0 ? '還沒選好。' : scenario.options[selected].label}</p>
    </div>
  </ScenarioFrame>;
}
