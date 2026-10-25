// Published result links, format version 2 (preference scores). A published link is never edited, only added to: the site promises to keep reading every published format (ADR 0005).
// `v` is the preference preview's catalog version these links were written against (PREVIEW ONLY until #56); tests that need the original question set swap it for the current one.
export const resultLinksV2Catalog = 'c6z97x2';

export interface PublishedPreferenceLink { fragment: string; stated: string[]; scored: string[]; custom?: string[] }

export const noScores = '這次作答沒有明確偏向';

export const resultLinksV2 = {
  // What the fixed preview flow in preference-result-link.spec.ts shares: core values ranked in list order, the first variant of each of the nine
  // preview slots, answered B strong, A strong, B slight, B slight, neutral, neutral, B slight, neutral, neutral.
  fixedFlow: {
    fragment: '#r=2.autonomy~stimulation~hedonism.3-security~2-autonomy~1-care-fairness..c6z97x2.0-0-0-0-0-0-0-0-0',
    stated: ['第 1自主', '第 2探索刺激', '第 3享受生活'],
    scored: ['第 1安全穩定3 分', '第 2自主2 分', '並列第 3照顧身邊的人、普遍關懷各 1 分'],
  },
  allNeutral: {
    fragment: '#r=2.autonomy~stimulation~hedonism...c6z97x2.0-0-0-0-0-0-0-0-0',
    stated: ['第 1自主', '第 2探索刺激', '第 3享受生活'],
    scored: [],
  },
  tiedBeyondThree: {
    fragment: '#r=2.care~fairness~tradition.2-stimulation-security-care-fairness-tradition..c6z97x2.0-0-0-0-0-0-0-0-0',
    stated: ['第 1照顧身邊的人', '第 2普遍關懷', '第 3傳承'],
    scored: ['並列第 1探索刺激、安全穩定、照顧身邊的人、普遍關懷、傳承各 2 分'],
  },
  statedTieWithCustom: {
    fragment: '#r=2.autonomy-care~security.4-security~2-stimulation~1-care-fairness.5L-d5pyJ542o6JmV55qE5pmC6ZaT~6YCZ5bCx5piv5oiR.c6z97x2.0-0-0-0-0-0-0-0-0',
    stated: ['並列第 1自主、照顧身邊的人', '第 3安全穩定'],
    scored: ['第 1安全穩定4 分', '第 2探索刺激2 分', '並列第 3照顧身邊的人、普遍關懷各 1 分'],
    custom: ['保有獨處的時間', '這就是我'],
  },
} satisfies Record<string, PublishedPreferenceLink>;
