import { interactiveScenarios } from './interactiveScenarios';
import { isAnswerTo } from './interactiveAnswers';
import type { InteractiveSession } from './interactiveTypes';
import { isScreen, validValues } from './sessionStorage';

/**
 * The development preview's own record, apart from the five-step session so the preview never touches it. It holds the
 * session's confirmed answers only. The official key, and what an older record keeps, are decided when the entry switches (#70).
 */
export const interactivePreviewKey = 'polarstar.interactive-preview.v1';

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

const unusableNotice = '先前的預覽紀錄無法讀取或題目已改版，這次從頭開始；重新作答後會取代它。';

/** The saved preview session; a record that cannot be used is reported, never resumed, and replaced only once the user answers again. */
export function loadInteractiveSession(): { session?: InteractiveSession; notice?: string } {
  try {
    const raw = localStorage.getItem(interactivePreviewKey);
    if (!raw) return {};
    const saved: unknown = JSON.parse(raw);
    return validSession(saved) ? { session: saved } : { notice: unusableNotice };
  } catch { return { notice: unusableNotice }; }
}

export function saveInteractiveSession(session: InteractiveSession): boolean {
  try { localStorage.setItem(interactivePreviewKey, JSON.stringify(session)); return true; } catch { return false; }
}

export function clearInteractiveSession(): boolean {
  try { localStorage.removeItem(interactivePreviewKey); return true; } catch { return false; }
}
