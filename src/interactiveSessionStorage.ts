import { interactiveScenarios } from './interactiveScenarios';
import { isAnswerTo, isRecord } from './interactiveAnswers';
import { reflectionDirections, reflectionNoteLimit, type InteractiveScenario, type InteractiveSession } from './interactiveTypes';
import { baseValues, categoryOrder } from './data';
import { storageReadFailedNotice } from './storageNotices';
import type { Screen, ValueItem } from './types';

/** The interactive version's own record, apart from every earlier version's keys so no older answer is ever read as an interactive one. */
export const interactiveSessionKey = 'polarstar.session.v3';
/** The five-step version's record: only its first act (categories, order, custom values) is carried over, never its answers. */
const fiveStepSessionKey = 'polarstar.session.v2';
/** The mixed-mechanism bank's record: nothing can be carried from it. */
const unusableSessionKeys = ['polarstar.session.v1'];

/** A versioned bank owns its key and validation registry; the deployed v3 path keeps its original format. */
export interface SessionStorageScope { key: string; catalogVersion: string; scenarios: readonly InteractiveScenario[] }
export const redesignSessionKey = 'polarstar.session.v4';

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

function validSession(value: unknown, registry: readonly InteractiveScenario[] = interactiveScenarios): value is InteractiveSession {
  if (!isRecord(value) || !isScreen(value.screen) || !validValues(value.values, value.screen)) return false;
  const { scenarios, answers, scenarioIndex } = value;
  if (!Array.isArray(scenarios) || !scenarios.length || !isRecord(answers)) return false;
  // A stored answer must never be applied to a rewritten or unknown question.
  const current = scenarios.map(snapshot => registry.find(scenario => isRecord(snapshot) && scenario.id === snapshot.id && JSON.stringify(scenario) === JSON.stringify(snapshot)));
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
function fiveStepFirstAct(raw: string, wrapped = true): Pick<InteractiveSession, 'screen' | 'values'> | undefined {
  try {
    const parsed: unknown = JSON.parse(raw);
    const saved = wrapped && isRecord(parsed) ? parsed.session : parsed;
    if (!isRecord(saved) || !isScreen(saved.screen)) return undefined;
    const { screen, values } = saved;
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
export function loadInteractiveSession(start: () => InteractiveSession, scope?: SessionStorageScope): { session?: InteractiveSession; notice?: string; unusable?: boolean } {
  if (scope) {
    let raw: string | null;
    let earlier: string | null;
    let wrapped = false;
    let hasUnusableLegacy = false;
    try {
      raw = localStorage.getItem(scope.key);
      earlier = raw === null ? localStorage.getItem(interactiveSessionKey) : null;
      if (raw === null && earlier === null) { earlier = localStorage.getItem(fiveStepSessionKey); wrapped = true; }
      if (raw === null && earlier === null) hasUnusableLegacy = unusableSessionKeys.some(key => localStorage.getItem(key) !== null);
    } catch { return { notice: storageReadFailedNotice }; }
    if (raw !== null) {
      try {
        const saved: unknown = JSON.parse(raw);
        if (!isRecord(saved) || saved.format !== 4) return { notice: unusableNotice, unusable: true };
        if (saved.catalogVersion === scope.catalogVersion) return validSession(saved.session, scope.scenarios) ? { session: saved.session } : { notice: unusableNotice, unusable: true };
        // A rewritten bank can retain a valid first act, never its now-incompatible second act.
        const firstAct = fiveStepFirstAct(JSON.stringify(saved.session), false);
        return firstAct ? { session: { ...start(), ...firstAct }, notice: keptFirstActNotice } : { notice: unusableNotice, unusable: true };
      } catch { return { notice: unusableNotice, unusable: true }; }
    }
    if (earlier !== null) {
      const firstAct = fiveStepFirstAct(earlier, wrapped);
      return firstAct ? { session: { ...start(), ...firstAct }, notice: keptFirstActNotice } : { notice: unusableLegacyNotice, unusable: true };
    }
    return hasUnusableLegacy ? { notice: unusableLegacyNotice, unusable: true } : {};
  }
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

export function saveInteractiveSession(session: InteractiveSession, scope?: SessionStorageScope): boolean {
  try { localStorage.setItem(scope?.key ?? interactiveSessionKey, JSON.stringify(scope ? { format: 4, catalogVersion: scope.catalogVersion, session } : session)); return true; } catch { return false; }
}

/** Removes the interactive record and every earlier version's, so restarting never brings back a carried first act. */
export function clearInteractiveSession(scope?: SessionStorageScope): boolean {
  try { for (const key of scope ? [scope.key] : [redesignSessionKey, interactiveSessionKey, fiveStepSessionKey, ...unusableSessionKeys]) localStorage.removeItem(key); return true; }
  catch { return false; }
}
