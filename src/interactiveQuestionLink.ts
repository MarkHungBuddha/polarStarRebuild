import { interactiveCatalog, interactivePlan, questionsOfPlan } from './interactiveCatalog';
import type { InteractiveScenario } from './interactiveTypes';

export const outdatedQuestionLinkNotice = '這份題目連結建立後，題目已經改版，無法重現原本的題組。你可以用目前題目開始。';
const unusableQuestionLinkNotice = '這份題目連結的題目資料無法使用。你可以用目前題目開始。';

/**
 * The question set a question link (`?seed=p.<plan>&v=<bank version>`) asks for. A link from another bank, including every link
 * the five-step and mixed-mechanism banks shared, is reported and never answered with today's questions under its name.
 */
export function requestedQuestions(search: string): { questions?: InteractiveScenario[]; notice?: string; specified: boolean } {
  const params = new URLSearchParams(search);
  const seed = params.get('seed');
  if (seed === null) return { specified: false };
  if (params.get('v') !== interactiveCatalog.version) return { specified: true, notice: outdatedQuestionLinkNotice };
  const questions = seed.startsWith('p.') && seed.length <= 1024 ? questionsOfPlan(seed.slice(2).split('.')) : undefined;
  return questions ? { specified: true, questions } : { specified: true, notice: unusableQuestionLinkNotice };
}

/** The question-only link for `questions`; undefined unless they are one variant of today's bank per slot. */
export function questionShareLink(questions: readonly InteractiveScenario[], location: Pick<Location, 'origin' | 'pathname'>): string | undefined {
  const plan = interactivePlan(questions);
  if (!plan) return undefined;
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('seed', `p.${plan.join('.')}`);
  url.searchParams.set('v', interactiveCatalog.version);
  return url.href;
}

/** Drops the question link from the address, keeping every other parameter. */
export function leaveQuestionLink() {
  const params = new URLSearchParams(window.location.search);
  params.delete('seed'); params.delete('v');
  const search = params.toString();
  window.history.replaceState(null, '', window.location.pathname + (search ? `?${search}` : ''));
}
