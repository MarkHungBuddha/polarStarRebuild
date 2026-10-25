import type { Session } from './types';
import { baseValues, categoryOrder } from './data';
import { scenarios } from './scenarios';
import { storageReadFailedNotice } from './storageNotices';

const sessionKey = 'polarstar.session.v1';
const schemaVersion = 1;
export interface SessionCatalog { key: string; scenarios: readonly Session['scenarios'][number][] }
const publishedCatalog: SessionCatalog = { key: sessionKey, scenarios };
const incompatibleNotice = '先前的本機紀錄無法讀取或版本不相容，請重新開始。';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validAnswer(answer: unknown, scenario: Record<string, unknown>): boolean {
  if (!isRecord(answer) || answer.variantId !== scenario.id || answer.kind !== scenario.kind) return false;
  if (answer.kind === 'preference') return typeof answer.strength === 'number' && Number.isInteger(answer.strength) && answer.strength >= -2 && answer.strength <= 2;
  if (answer.kind === 'choice' || answer.kind === 'strike') {
    return Array.isArray(scenario.options) && scenario.options.some(option => isRecord(option) && option.id === answer.optionId);
  }
  if (answer.kind === 'slider') {
    const { value } = answer;
    const { min, max, step } = scenario;
    if (typeof value !== 'number' || !Number.isFinite(value) || typeof min !== 'number' || typeof max !== 'number' || typeof step !== 'number' || step <= 0) return false;
    const steps = (value - min) / step;
    return value >= min && value <= max && Math.abs(steps - Math.round(steps)) < 1e-7;
  }
  if (answer.kind === 'allocate') {
    const amounts = answer.allocations;
    if (answer.placements !== undefined && (!Array.isArray(answer.placements) || answer.placements.length !== scenario.total || !answer.placements.every(item => item === 0 || item === 1) || !Array.isArray(amounts) || answer.placements.filter(item => item === 0).length !== amounts[0])) return false;
    return Array.isArray(amounts) && amounts.length === 2 && amounts.every(amount => typeof amount === 'number' && Number.isInteger(amount) && amount >= 0) && typeof scenario.total === 'number' && amounts[0] + amounts[1] === scenario.total;
  }
  return false;
}

function validSession(value: unknown, catalog: SessionCatalog): value is Session {
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

export function loadSavedSession(catalog = publishedCatalog): { session?: Session; notice?: string } {
  try {
    const raw = localStorage.getItem(catalog.key);
    if (!raw) return {};
    let saved: unknown;
    try { saved = JSON.parse(raw); } catch { return { notice: incompatibleNotice }; }
    if (!isRecord(saved) || saved.schemaVersion !== schemaVersion || !validSession(saved.session, catalog)) return { notice: incompatibleNotice };
    return { session: saved.session };
  } catch {
    return { notice: storageReadFailedNotice };
  }
}

export function saveSession(session: Session, catalog = publishedCatalog): boolean {
  try {
    localStorage.setItem(catalog.key, JSON.stringify({ schemaVersion, session }));
    return true;
  } catch { return false; }
}

export function clearSavedSession(catalog = publishedCatalog): boolean {
  try { localStorage.removeItem(catalog.key); return true; }
  catch { return false; }
}
