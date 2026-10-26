// Published result links, format version 3 (interactive questions: 優先保留次數 and 明確決策題數). A published link is never edited,
// only added to: the site promises to keep reading every published format (ADR 0005).
// `resultLinksV3Catalog` is the interactive bank these links were written against: the development preview's single slot (slot03,
// two sample variants) during #66, so the fixed flow's plan has one question. The other samples use a made-up earlier bank
// (`c0ld`) and fifteen questions; an earlier bank only has its syntax checked.
export const resultLinksV3Catalog = 'c1hya2ui';

export interface PublishedPriorityLink { fragment: string; stated: string[]; counted: string[]; decided: string; custom?: string[] }

/** The second column when no confirmed answer had a direction (明確決策 0 題). */
export const noRanking = '這次沒有方向明確的決策，不產生第二幕排名。';

export const resultLinksV3 = {
  // What the fixed flow in interactive-result-link.spec.ts shares: core values ranked in list order, then the preview's first variant
  // (「六個晚上，留給誰？」) split 4 evenings to 自主 and 2 to 照顧身邊的人; any later question is 平均分配.
  fixedFlow: {
    fragment: '#r=3.autonomy~stimulation~hedonism.1-autonomy.1..c1hya2ui.0',
    stated: ['第 1自主', '第 2探索刺激', '第 3享受生活'],
    counted: ['第 1自主1 次／3 題'],
    decided: '明確決策 1 / 1 題',
  },
  general: {
    fragment: '#r=3.care~security~autonomy.3-care~2-autonomy-fairness.c..c0ld.0-1-0-2-1-0-0-2-1-0-1-0-2-1-0',
    stated: ['第 1照顧身邊的人', '第 2安全穩定', '第 3自主'],
    counted: ['第 1照顧身邊的人3 次／3 題', '並列第 2自主、普遍關懷2 次／3 題'],
    decided: '明確決策 12 / 15 題',
  },
  noRanking: {
    fragment: '#r=3.autonomy~stimulation~hedonism..0..c0ld.0-0-0-0-0-0-0-0-0-0-0-0-0-0-0',
    stated: ['第 1自主', '第 2探索刺激', '第 3享受生活'],
    counted: [],
    decided: '明確決策 0 / 15 題',
  },
  tiedBeyondThree: {
    fragment: '#r=3.care~fairness~tradition.2-stimulation-security-care-fairness-tradition.f..c0ld.0-0-0-0-0-0-0-0-0-0-0-0-0-0-0',
    stated: ['第 1照顧身邊的人', '第 2普遍關懷', '第 3傳承'],
    counted: ['並列第 1探索刺激、安全穩定、照顧身邊的人、普遍關懷、傳承2 次／3 題'],
    decided: '明確決策 15 / 15 題',
  },
  statedTieWithCustom: {
    fragment: '#r=3.autonomy-care~security.3-security~2-stimulation~1-care-fairness.7.5L-d5pyJ542o6JmV55qE5pmC6ZaT~6YCZ5bCx5piv5oiR.c0ld.2-2-2-2-2-2-2-2-2-2-2-2-2-2-2',
    stated: ['並列第 1自主、照顧身邊的人', '第 3安全穩定'],
    counted: ['第 1安全穩定3 次／3 題', '第 2探索刺激2 次／3 題', '並列第 3照顧身邊的人、普遍關懷1 次／3 題'],
    decided: '明確決策 7 / 15 題',
    custom: ['保有獨處的時間', '這就是我'],
  },
} satisfies Record<string, PublishedPriorityLink>;
