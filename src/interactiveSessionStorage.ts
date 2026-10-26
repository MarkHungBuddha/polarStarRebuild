import { interactiveScenarios } from './interactiveScenarios';
import { isAnswerTo, isRecord } from './interactiveAnswers';
import { reflectionDirections, reflectionNoteLimit, type InteractiveSession } from './interactiveTypes';
import { baseValues, categoryOrder } from './data';
import { storageReadFailedNotice } from './storageNotices';
import type { Screen, ValueItem } from './types';

/** The interactive version's own record, apart from every earlier version's keys so no older answer is ever read as an interactive one. */
export const interactiveSessionKey = 'polarstar.session.v3';
/** The five-step version's record: only its first act (categories, order, custom values) is carried over, never its answers. */
const fiveStepSessionKey = 'polarstar.session.v2';
/** The mixed-mechanism bank's record: nothing can be carried from it. */
const unusableSessionKeys = ['polarstar.session.v1'];

const screens = ['intro', 'classify', 'rank', 'scenario', 'result'];
const isScreen = (screen: unknown): screen is Screen => typeof screen === 'string' && screens.includes(screen);

/** Whether stored first-act values are the ten core values plus valid custom ones, categorized once the screen is past classifying. */
function validValues(values: unknown, screen: Screen): values is ValueItem[] {
  if (!Array.isArray(values) || values.length < baseValues.length) return false;
  const ids = new Set<string>();
  const words = new Set<string>();
  for (const item of values) {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.word !== 'string' || !item.word.trim() || typeof item.description !== 'string' || typeof item.rank !== 'number' || !Number.isInteger(item.rank) || item.rank < 1 || item.rank > values.length || ids.has(item.id) || words.has(item.word)) return false;
    const base = baseValues.find(core => core.id === item.id);
    if (base ? item.custom === true || item.word !== base.word || item.description !== base.description : item.custom !== true || !item.id.startsWith('custom-') || item.word.length > 24) return false;
    if (item.category !== undefined && !categoryOrder.some(category => category === item.category)) return false;
    if (!['intro', 'classify'].includes(screen) && item.category === undefined) return false;
    ids.add(item.id); words.add(item.word);
  }
  return baseValues.every(core => ids.has(core.id));
}

/** A reflection names one of the session's questions, holds a note of at most `reflectionNoteLimit` characters and maybe a direction. */
function validReflection(value: unknown, scenarioIds: string[]): boolean {
  if (!isRecord(value) || !Object.keys(value).every(key => ['variantId', 'note', 'direction'].includes(key))) return false;
  return typeof value.variantId === 'string' && scenarioIds.includes(value.variantId) && typeof value.note === 'string' && value.note.length <= reflectionNoteLimit
    && (!('direction' in value) || reflectionDirections.some(direction => direction === value.direction));
}

function validSession(value: unknown): value is InteractiveSession {
  if (!isRecord(value) || !isScreen(value.screen) || !validValues(value.values, value.screen)) return false;
  const { scenarios, answers, scenarioIndex } = value;
  if (!Array.isArray(scenarios) || !scenarios.length || !isRecord(answers)) return false;
  // A stored answer must never be applied to a rewritten or unknown question.
  const current = scenarios.map(snapshot => interactiveScenarios.find(scenario => isRecord(snapshot) && scenario.id === snapshot.id && JSON.stringify(scenario) === JSON.stringify(snapshot)));
  if (current.some(scenario => !scenario) || new Set(current.map(scenario => scenario!.id)).size !== current.length) return false;
  if (typeof scenarioIndex !== 'number' || !Number.isInteger(scenarioIndex) || scenarioIndex < 0 || scenarioIndex >= scenarios.length) return false;
  if (!Object.entries(answers).every(([id, answer]) => current.some(scenario => scenario!.id === id && isAnswerTo(answer, scenario!)))) return false;
  if (value.reflection !== undefined && !validReflection(value.reflection, current.map(scenario => scenario!.id))) return false;
  return value.screen !== 'result' || current.every(scenario => answers[scenario!.id] !== undefined);
}

const unusableNotice = '先前的作答紀錄無法讀取或題目已改版，無法續答。按「重新開始」會刪除這份紀錄，從頭作答。';
const keptFirstActNotice = '上次的價值分類、排序與自訂價值可以沿用。第二幕已經改版，舊版的答案不會換算成新版，繼續後請重新作答第二幕。';
const unusableLegacyNotice = '上次留下的作答紀錄來自舊版或已經損壞，無法沿用，舊版的答案也不會換算成新版。按「重新開始」會刪除這份紀錄，從頭作答。';

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
 * The saved session, offered to the user to continue; a record that cannot be used is reported as `unusable`, never resumed,
 * and stays until the user chooses 重新開始. Without an interactive record, an earlier version's record is reported too, and a
 * five-step first act is carried into a session started by `start` (its fresh questions and no answers), offered like a saved one.
 */
export function loadInteractiveSession(start: () => InteractiveSession): { session?: InteractiveSession; notice?: string; unusable?: boolean } {
  let raw: string | null; let fiveStep: string | null; let unusable: boolean;
  try {
    raw = localStorage.getItem(interactiveSessionKey);
    fiveStep = raw ? null : localStorage.getItem(fiveStepSessionKey);
    unusable = unusableSessionKeys.some(key => localStorage.getItem(key) !== null);
  } catch { return { notice: storageReadFailedNotice }; }
  if (raw) {
    try {
      const saved: unknown = JSON.parse(raw);
      return validSession(saved) ? { session: saved } : { notice: unusableNotice, unusable: true };
    } catch { return { notice: unusableNotice, unusable: true }; }
  }
  if (fiveStep !== null) {
    const firstAct = fiveStepFirstAct(fiveStep);
    if (!firstAct) return { notice: unusableLegacyNotice, unusable: true };
    // A five-step record still on the home page holds nothing to carry.
    if (firstAct.screen === 'intro') return {};
    return { session: { ...start(), ...firstAct }, notice: keptFirstActNotice };
  }
  return unusable ? { notice: unusableLegacyNotice, unusable: true } : {};
}

export function saveInteractiveSession(session: InteractiveSession): boolean {
  try { localStorage.setItem(interactiveSessionKey, JSON.stringify(session)); return true; } catch { return false; }
}

/** Removes the interactive record and every earlier version's, so restarting never brings back a carried first act. */
export function clearInteractiveSession(): boolean {
  try { for (const key of [interactiveSessionKey, fiveStepSessionKey, ...unusableSessionKeys]) localStorage.removeItem(key); return true; }
  catch { return false; }
}
