import { outdatedQuestionLinkNotice } from './questionPlan';

/**
 * The notice for a question link (`seed` and `v` in the address) the interactive bank cannot reproduce. Every such link so far
 * comes from an earlier bank, whose questions are never swapped for interactive ones under its name; interactive question links,
 * with their own bank version, arrive with the entry switch (#71).
 */
export function unreproducibleQuestionLink(search: string): string | undefined {
  return new URLSearchParams(search).has('seed') ? outdatedQuestionLinkNotice : undefined;
}

/** Drops the question link from the address, keeping every other parameter. */
export function leaveQuestionLink() {
  const params = new URLSearchParams(window.location.search);
  params.delete('seed'); params.delete('v');
  const search = params.toString();
  window.history.replaceState(null, '', window.location.pathname + (search ? `?${search}` : ''));
}
