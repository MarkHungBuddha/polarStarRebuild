import type { InteractiveScenario } from '../interactiveTypes';

/** Accepted trial's resource scenario; the initial-arrangement variant is an AI draft for review. */
export const redesignResources: InteractiveScenario[] = [{
  id: 'redesign-slot14-preparation', slotId: 'slot14', pair: ['security', 'fairness'], domain: '防災準備', title: '六個小時，先準備哪一些？',
  setup: '這個月你有六個小時可以做防災準備。你想整理家裡的備用品、資料和緊急聯絡清單；社區也在找人整理多語、易讀的防災資訊，方便不熟悉中文或有不同閱讀需求的居民使用。眼前沒有災情，兩件事都能往後安排；這次多做一邊，就少一小時做另一邊。',
  interaction: { kind: 'resources', unit: '小時', objects: ['時間籌碼 1', '時間籌碼 2', '時間籌碼 3', '時間籌碼 4', '時間籌碼 5', '時間籌碼 6'], sides: [
    { id: 'home', label: '家裡的準備簿', detail: '自己的備用品、備份和聯絡方式更齊全；投入這裡的時間，就不能用來整理社區資訊。', valueId: 'security' },
    { id: 'community', label: '社區的資訊簿', detail: '讓不同語言與閱讀需求的居民取得資訊；投入這裡的時間，就延後自己的準備。', valueId: 'fairness' },
  ] },
}, {
  id: 'redesign-slot14-preparation-initial', slotId: 'slot14', pair: ['security', 'fairness'], domain: '防災準備', title: '原本排好的六小時，要調整嗎？',
  setup: '你原本預留四個小時整理家裡的防災物品和備援資料，兩個小時協助社區整理多語、易讀的防災資訊。眼前沒有災情，兩件事都能延後，也都不是強制任務。你可以重新分配這六小時；多做一邊，就少一小時做另一邊。',
  interaction: { kind: 'resources', unit: '小時', objects: ['時間籌碼 1', '時間籌碼 2', '時間籌碼 3', '時間籌碼 4', '時間籌碼 5', '時間籌碼 6'], initial: [0, 0, 0, 0, 1, 1], sides: [
    { id: 'home', label: '家裡的準備簿', detail: '自己的備用品、備份和聯絡方式更齊全；社區資訊的整理則延後。', valueId: 'security' },
    { id: 'community', label: '社區的資訊簿', detail: '讓不同語言與閱讀需求的居民取得資訊；自己的準備則延後。', valueId: 'fairness' },
  ] },
}];
