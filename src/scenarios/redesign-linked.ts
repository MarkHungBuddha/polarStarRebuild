import type { InteractiveScenario } from '../interactiveTypes';

/** Saturday clock from the accepted trial; the calendar condition is a pending AI review draft. */
export const redesignLinked: InteractiveScenario[] = [{
  id: 'redesign-slot07-saturday', slotId: 'slot07', pair: ['hedonism', 'achievement'], domain: '進修與休息', title: '週六六小時，留多少空白？',
  setup: '接下來八週，每個週六都有下午一點到七點這六小時能自己安排。你想拿來散步、看劇或休息，也想完成一份自選的專業作品。作品大約要二十四小時；這八週每週給它的時間越少，預定發表日後還得補上的時間就越多。工作上沒有人要求你參加。',
  interaction: { kind: 'linked', min: 0, max: 6, step: 1, initial: 3, unit: '小時', label: '休閒留白', consequence: '每多留一小時休閒，就少一小時投入作品；這八週未完成的部分留待發表日後補上。', presentation: { kind: 'clock', startHour: 13 }, resourceTotal: 6, resourceSides: [
    { id: 'rest', label: '休閒留白', detail: '散步、看劇或休息，也延後作品進度。', valueId: 'hedonism' },
    { id: 'work', label: '投入作品', detail: '完成自己選定的成果，也減少休閒留白。', valueId: 'achievement' },
  ], metrics: [
    { label: '八週投入作品', unit: '小時', source: 'remainder', multiplier: 8 },
    { label: '發表日後待補', unit: '小時', source: 'remainder', multiplier: 8, subtractFrom: 24, minimum: 0 },
  ] },
}, {
  id: 'redesign-slot01-notice', slotId: 'slot01', pair: ['autonomy', 'security'], domain: '行程協調', title: '提前幾天知道安排，你才考慮參加？',
  setup: '朋友邀你參加每週一次、共四週的城市走讀。路線由主辦者安排，你想保留臨時改變行程的空間，也希望有時間確認交通與工作安排。主辦者可以提前一到十四天通知每次的路線；你目前考慮提前七天。這裡只記下你願意考慮參加的通知條件，不代表已經決定參加。',
  interaction: { kind: 'linked', min: 1, max: 14, step: 1, initial: 7, unit: '天', label: '提前通知', consequence: '提前越多天通知，你有越多時間確認安排，主辦者也得更早固定路線。這裡只記下你願意考慮的通知條件。', presentation: { kind: 'calendar' }, metrics: [
    { label: '主辦者固定路線的提前時間', unit: '天', source: 'value' },
  ] },
}];
