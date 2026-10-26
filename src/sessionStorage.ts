import type { Session } from './types';
import { baseValues, categoryOrder } from './data';
import { catalog } from './questionCatalog';
import { storageReadFailedNotice } from './storageNotices';

const schemaVersion = 1;
const incompatibleNotice = '先前的本機紀錄無法讀取或版本不相容，請重新開始。';
const legacySessionNotice = '上次的作答來自舊版題目，不能接著做，也不會換算成新版答案。請重新開始。';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validAnswer(answer: unknown, scenario: Record<string, unknown>): boolean {
  if (!isRecord(answer) || answer.variantId !== scenario.id || answer.kind !== 'preference' || scenario.kind !== 'preference') return false;
  return typeof answer.strength === 'number' && Number.isInteger(answer.strength) && answer.strength >= -2 && answer.strength <= 2;
}

function validSession(value: unknown): value is Session {
  if (!isRecord(value) || typeof value.screen !== 'string' || !['intro', 'classify', 'rank', 'scenario', 'result'].includes(value.screen)) return false;
  if (!Array.isArray(value.values) || value.values.length < baseValues.length || !Array.isArray(value.scenarios) || !value.scenarios.length || !isRecord(value.answers)) return false;
  const values = value.values;
  const snapshots = value.scenarios;
  const ids = new Set<string>();
  const words = new Set<string>();
  for (const item of values) {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.word !== 'string' || !item.word.trim() || typeof item.description !== 'string' || typeof item.rank !== 'number' || !Number.isInteger(item.rank) || item.rank < 1 || item.rank > values.length || ids.has(item.id) || words.has(item.word)) return false;
    const base = baseValues.find(core => core.id === item.id);
    if (base ? item.custom === true || item.word !== base.word || item.description !== base.description : item.custom !== true || !item.id.startsWith('custom-') || item.word.length > 24) return false;
    if (item.category !== undefined && !categoryOrder.some(category => category === item.category)) return false;
    if (!['intro', 'classify'].includes(value.screen) && item.category === undefined) return false;
    ids.add(item.id); words.add(item.word);
  }
  if (!baseValues.every(core => ids.has(core.id))) return false;
  const variantIds = new Set<string>();
  const slotIds = new Set<string>();
  for (const snapshot of snapshots) {
    if (!isRecord(snapshot) || typeof snapshot.id !== 'string' || typeof snapshot.slotId !== 'string' || variantIds.has(snapshot.id) || slotIds.has(snapshot.slotId)) return false;
    const current = catalog.scenarios.find(scenario => scenario.id === snapshot.id);
    // A stored answer must never be applied to a rewritten or unknown question.
    if (!current || JSON.stringify(snapshot) !== JSON.stringify(current)) return false;
    variantIds.add(snapshot.id); slotIds.add(snapshot.slotId);
  }
  const currentSlots = new Set(catalog.scenarios.map(scenario => scenario.slotId));
  if (slotIds.size !== currentSlots.size || [...currentSlots].some(slot => !slotIds.has(slot))) return false;
  // A result is only shown for a fully answered question set.
  if (value.screen === 'result' && !snapshots.every(snapshot => isRecord(snapshot) && typeof snapshot.id === 'string' && isRecord(value.answers) && value.answers[snapshot.id] !== undefined)) return false;
  if (typeof value.scenarioIndex !== 'number' || !Number.isInteger(value.scenarioIndex) || value.scenarioIndex < 0 || value.scenarioIndex >= snapshots.length) return false;
  return Object.entries(value.answers).every(([id, answer]) => {
    const snapshot = snapshots.find(item => isRecord(item) && item.id === id);
    return isRecord(snapshot) && validAnswer(answer, snapshot);
  });
}

/** `legacy` is set when only the mixed-mechanism bank's record exists: it is never resumed, and clearing the session removes it. */
export function loadSavedSession(): { session?: Session; notice?: string; legacy?: boolean } {
  try {
    const raw = localStorage.getItem(catalog.sessionKey);
    if (!raw) return catalog.legacySessionKeys.some(key => localStorage.getItem(key) !== null) ? { notice: legacySessionNotice, legacy: true } : {};
    let saved: unknown;
    try { saved = JSON.parse(raw); } catch { return { notice: incompatibleNotice }; }
    if (!isRecord(saved) || saved.schemaVersion !== schemaVersion || !validSession(saved.session)) return { notice: incompatibleNotice };
    return { session: saved.session };
  } catch {
    return { notice: storageReadFailedNotice };
  }
}

export function saveSession(session: Session): boolean {
  try {
    localStorage.setItem(catalog.sessionKey, JSON.stringify({ schemaVersion, session }));
    return true;
  } catch { return false; }
}

export function clearSavedSession(): boolean {
  try {
    for (const key of [catalog.sessionKey, ...catalog.legacySessionKeys]) localStorage.removeItem(key);
    return true;
  }
  catch { return false; }
}
