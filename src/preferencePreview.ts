import { preferenceCatalog } from './questionCatalog';
import { questionPlan, questionShareLink, selectQuestions } from './questionPlan';
import type { Scenario } from './types';

/**
 * PREVIEW ONLY (#54, consolidated by #56): names the result-link code uses for the preference bank while it opens from
 * the preview entry. Selection, seen history, question links and the saved session already run on `preferenceCatalog`;
 * #56 points result links at the default catalog and removes this file.
 */
export const preferencePreviewCatalog = preferenceCatalog;
export const preferencePreviewVersion = preferenceCatalog.version;
export const preferencePreviewPlan = (questions: readonly Scenario[]) => questionPlan(questions, preferenceCatalog);
export function preferencePreviewLink(plan: readonly string[], location: Pick<Location, 'origin' | 'pathname'>): string {
  return questionShareLink(selectQuestions(new Set(), `p.${plan.join('.')}`, preferenceCatalog), location, preferenceCatalog)!;
}
