import { interactiveScenarios } from './interactiveScenarios';
import { isAnswerTo } from './interactiveAnswers';
import type { InteractiveSession } from './interactiveTypes';
import { isScreen, validValues } from './sessionStorage';
import type { Screen } from './types';

/** The interactive version's own record, apart from every earlier version's keys so no older answer is ever read as an interactive one. */
export const interactiveSessionKey = 'polarstar.session.v3';
/** The five-step version's record: only its first act (categories, order, custom values) is carried over, never its answers. */
const fiveStepSessionKey = 'polarstar.session.v2';
/** Records nothing can be carried from: the mixed-mechanism bank's, and the development preview's before the interactive key existed. */
const unusableSessionKeys = ['polarstar.session.v1', 'polarstar.interactive-preview.v1'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function validSession(value: unknown): value is InteractiveSession {
  if (!isRecord(value) || !isScreen(value.screen) || !validValues(value.values, value.screen)) return false;
  const { scenarios, answers, scenarioIndex } = value;
  if (!Array.isArray(scenarios) || !scenarios.length || !isRecord(answers)) return false;
  // A stored answer must never be applied to a rewritten or unknown question.
  const current = scenarios.map(snapshot => interactiveScenarios.find(scenario => isRecord(snapshot) && scenario.id === snapshot.id && JSON.stringify(scenario) === JSON.stringify(snapshot)));
  if (current.some(scenario => !scenario) || new Set(current.map(scenario => scenario!.id)).size !== current.length) return false;
  if (typeof scenarioIndex !== 'number' || !Number.isInteger(scenarioIndex) || scenarioIndex < 0 || scenarioIndex >= scenarios.length) return false;
  if (!Object.entries(answers).every(([id, answer]) => current.some(scenario => scenario!.id === id && isAnswerTo(answer, scenario!)))) return false;
  return value.screen !== 'result' || current.every(scenario => answers[scenario!.id] !== undefined);
}

const unusableNotice = '先前的作答紀錄無法讀取或題目已改版，這次從頭開始；重新作答後會取代它。';
const keptFirstActNotice = '已沿用你上次的價值分類、排序與自訂價值。第二幕已經改版，舊版的答案不會換算成新版，請重新作答第二幕。';
const unusableLegacyNotice = '上次留下的作答紀錄來自舊版或已經損壞，無法沿用，這次從頭開始。舊版的答案不會換算成新版。';

/**
 * The five-step record's first act, or `undefined` when it cannot be used. Its second-act answers are never read: a first act
 * that was already finished resumes on the first interactive question.
 */
function fiveStepFirstAct(raw: string): Pick<InteractiveSession, 'screen' | 'values'> | undefined {
  try {
    const saved: unknown = JSON.parse(raw);
    if (!isRecord(saved) || !isRecord(saved.session) || !isScreen(saved.session.screen)) return undefined;
    const { screen, values } = saved.session;
    if (!validValues(values, screen)) return undefined;
    const carried: Screen = screen === 'scenario' || screen === 'result' ? 'scenario' : screen;
    return { screen: carried, values };
  } catch { return undefined; }
}

/**
 * The saved session; a record that cannot be used is reported, never resumed, and replaced only once the user answers again.
 * Without an interactive record, an earlier version's record is reported too, and a five-step first act is carried into a
 * session started by `start` (its fresh questions and no answers), which is returned to be saved under the interactive key.
 */
export function loadInteractiveSession(start: () => InteractiveSession): { session?: InteractiveSession; notice?: string } {
  try {
    const raw = localStorage.getItem(interactiveSessionKey);
    if (raw) {
      const saved: unknown = JSON.parse(raw);
      return validSession(saved) ? { session: saved } : { notice: unusableNotice };
    }
    const fiveStep = localStorage.getItem(fiveStepSessionKey);
    if (fiveStep !== null) {
      const firstAct = fiveStepFirstAct(fiveStep);
      if (!firstAct) return { notice: unusableLegacyNotice };
      // A five-step record still on the home page holds nothing to carry.
      if (firstAct.screen === 'intro') return {};
      return { session: { ...start(), ...firstAct }, notice: keptFirstActNotice };
    }
    return unusableSessionKeys.some(key => localStorage.getItem(key) !== null) ? { notice: unusableLegacyNotice } : {};
  } catch { return { notice: unusableNotice }; }
}

export function saveInteractiveSession(session: InteractiveSession): boolean {
  try { localStorage.setItem(interactiveSessionKey, JSON.stringify(session)); return true; } catch { return false; }
}

/** Removes the interactive record and every earlier version's, so restarting never brings back a carried first act. */
export function clearInteractiveSession(): boolean {
  try { for (const key of [interactiveSessionKey, fiveStepSessionKey, ...unusableSessionKeys]) localStorage.removeItem(key); return true; }
  catch { return false; }
}
