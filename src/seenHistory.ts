import { catalogVersion } from './questionPlan';
import { scenarios } from './scenarios';

const historyKey = 'polarstar.seen.v1';

export function loadSeenHistory(): { ids: Set<string>; notice?: string } {
  try {
    const raw = localStorage.getItem(historyKey);
    if (!raw) return { ids: new Set() };
    const saved: unknown = JSON.parse(raw);
    if (typeof saved !== 'object' || saved === null || !('catalogVersion' in saved) || saved.catalogVersion !== catalogVersion || !('ids' in saved) || !Array.isArray(saved.ids)) return { ids: new Set() };
    const known = new Set(scenarios.map(scenario => scenario.id));
    return { ids: new Set(saved.ids.filter((id): id is string => typeof id === 'string' && known.has(id))) };
  } catch { return { ids: new Set(), notice: '目前無法讀取本機紀錄，仍可完成這次作答，但可能無法保存。' }; }
}

export function markQuestionSeen(id: string): boolean {
  try {
    const history = loadSeenHistory();
    if (history.notice) return false;
    history.ids.add(id);
    localStorage.setItem(historyKey, JSON.stringify({ catalogVersion, ids: [...history.ids] }));
    return true;
  } catch { return false; }
}

export function clearSeenHistory(): boolean {
  try { localStorage.removeItem(historyKey); return true; }
  catch { return false; }
}
