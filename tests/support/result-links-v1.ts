// Published result links, format version 1. A published link is never edited, only added to: the site promises to keep reading every published format (ADR 0005).
// `v` is the catalog version these links were written against; tests that need the current question set swap it for the current one.
export const resultLinksV1Catalog = 'c18hay5z';

export interface PublishedResultLink { fragment: string; stated: string[]; chosen: string[] }

export const noChosen = '這次沒有偏向一邊的答案，所以沒有排名。';

export const resultLinksV1 = {
  general: {
    fragment: '#r=1.autonomy~stimulation~hedonism.3-3-care~2-3-autonomy-fairness..c18hay5z.0-0-0-0-0-0-0-0-0-0-0-0-0-0-0',
    stated: ['第 1自主', '第 2探索刺激', '第 3享受生活'],
    chosen: ['第 1照顧身邊的人選了 3 次／共 3 題', '並列第 2自主、普遍關懷各選了 2 次／共 3 題'],
  },
  // What the fixed-randomness flow in result-link.spec.ts shares: ranked in list order, every scenario answered the same way.
  fixedFlow: {
    fragment: '#r=1.autonomy~stimulation~hedonism.3-3-influence~2-3-autonomy-stimulation-hedonism-achievement-fairness..c18hay5z.0-0-0-0-0-0-0-0-0-0-0-0-0-0-0',
    stated: ['第 1自主', '第 2探索刺激', '第 3享受生活'],
    chosen: ['第 1主導權選了 3 次／共 3 題', '並列第 2自主、探索刺激、享受生活、成就、普遍關懷各選了 2 次／共 3 題'],
  },
  statedTieNoChosen: {
    fragment: '#r=1.autonomy-care~security...c18hay5z.1-1-1-1-1-1-1-1-1-1-1-1-1-1-1',
    stated: ['並列第 1自主、照顧身邊的人', '第 3安全穩定'],
    chosen: [],
  },
  chosenAllTied: {
    fragment: '#r=1.care~fairness~tradition.1-3-autonomy-stimulation-hedonism-achievement-influence-security-rules-tradition-care-fairness..c18hay5z.1-0-1-0-1-0-1-0-1-0-1-0-1-0-1',
    stated: ['第 1照顧身邊的人', '第 2普遍關懷', '第 3傳承'],
    chosen: ['並列第 1自主、探索刺激、享受生活、成就、主導權、安全穩定、遵守規範、傳承、照顧身邊的人、普遍關懷各選了 1 次／共 3 題'],
  },
} satisfies Record<string, PublishedResultLink>;
