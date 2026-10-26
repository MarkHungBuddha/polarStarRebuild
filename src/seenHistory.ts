import { catalog } from './questionCatalog';
import { storageReadFailedNotice } from './storageNotices';

/** Variants of the catalog this browser has shown; a record from another catalog version counts as empty. */
export function loadSeenHistory(): { ids: Set<string>; notice?: string } {
  try {
    const raw = localStorage.getItem(catalog.historyKey);
    if (!raw) return { ids: new Set() };
    const saved: unknown = JSON.parse(raw);
    if (typeof saved !== 'object' || saved === null || !('catalogVersion' in saved) || saved.catalogVersion !== catalog.version || !('ids' in saved) || !Array.isArray(saved.ids)) return { ids: new Set() };
    const known = new Set(catalog.scenarios.map(scenario => scenario.id));
    return { ids: new Set(saved.ids.filter((id): id is string => typeof id === 'string' && known.has(id))) };
  } catch { return { ids: new Set(), notice: storageReadFailedNotice }; }
}

export function markQuestionSeen(id: string): boolean {
  try {
    const history = loadSeenHistory();
    if (history.notice) return false;
    history.ids.add(id);
    localStorage.setItem(catalog.historyKey, JSON.stringify({ catalogVersion: catalog.version, ids: [...history.ids] }));
    return true;
  } catch { return false; }
}

/** Clears this catalog's seen history and the one the mixed-mechanism bank left. */
export function clearSeenHistory(): boolean {
  try { for (const key of [catalog.historyKey, ...catalog.legacyHistoryKeys]) localStorage.removeItem(key); return true; }
  catch { return false; }
}
