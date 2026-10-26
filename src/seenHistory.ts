import { interactiveCatalog } from './interactiveCatalog';
import { storageReadFailedNotice } from './storageNotices';

/** Variants of the interactive bank this browser has shown; a record from another bank version counts as empty. */
const historyKey = 'polarstar.seen.v3';
/** Seen history the five-step and mixed-mechanism banks left: never read, only removed when the user clears local records. */
const earlierHistoryKeys = ['polarstar.seen.v2', 'polarstar.seen.v1'];

export function loadSeenHistory(): { ids: Set<string>; notice?: string } {
  try {
    const raw = localStorage.getItem(historyKey);
    if (!raw) return { ids: new Set() };
    const saved: unknown = JSON.parse(raw);
    if (typeof saved !== 'object' || saved === null || !('catalogVersion' in saved) || saved.catalogVersion !== interactiveCatalog.version || !('ids' in saved) || !Array.isArray(saved.ids)) return { ids: new Set() };
    const known = new Set(interactiveCatalog.scenarios.map(scenario => scenario.id));
    return { ids: new Set(saved.ids.filter((id): id is string => typeof id === 'string' && known.has(id))) };
  } catch { return { ids: new Set(), notice: storageReadFailedNotice }; }
}

export function markQuestionSeen(id: string): boolean {
  try {
    const history = loadSeenHistory();
    if (history.notice) return false;
    history.ids.add(id);
    localStorage.setItem(historyKey, JSON.stringify({ catalogVersion: interactiveCatalog.version, ids: [...history.ids] }));
    return true;
  } catch { return false; }
}

/** Clears the interactive seen history and every earlier bank's. */
export function clearSeenHistory(): boolean {
  try { for (const key of [historyKey, ...earlierHistoryKeys]) localStorage.removeItem(key); return true; }
  catch { return false; }
}
