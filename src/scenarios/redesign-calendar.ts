import type { InteractiveScenario } from '../interactiveTypes';

/** Accepted six-question trial's travel scenario; full-bank review is still pending. */
export const redesignCalendar: InteractiveScenario = {
  id: 'redesign-slot01-travel', slotId: 'slot01', pair: ['autonomy', 'security'], domain: '旅行', title: '六天的旅程，怎麼排？',
  setup: '你要去一座以前去過的城市玩六天，住宿已訂好。每天都能自己排行程，也能跟當地的一日團，費用差不多。自己排能隨時改主意，也得自己處理交通和突發狀況；跟團有人照應，就得照團的時間表走。',
  interaction: { kind: 'calendar', slots: ['第1天', '第2天', '第3天', '第4天', '第5天', '第6天'], sides: [
    { id: 'self', label: '自己排行程', detail: '想停就停，也自己處理臨時狀況。', valueId: 'autonomy' },
    { id: 'tour', label: '跟一日團', detail: '交通有人安排，也跟著團體的步調走。', valueId: 'security' },
  ] },
};
