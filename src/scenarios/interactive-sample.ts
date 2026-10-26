import type { InteractiveScenario } from '../interactiveTypes';

/**
 * AI 草稿，只供開發預覽打通互動題的整條路，不是審閱過的題庫內容。改寫自 preference-slot03-evenings 與
 * prototype/interactive-scenario 分支的六晚行事曆。第 1–5 組的內容票（#68）寫好 slot03 的三個變體時，從題庫組合拿掉這題。
 */
export const interactiveSampleEvenings: InteractiveScenario = {
  id: 'interactive-sample-evenings', slotId: 'slot03', pair: ['autonomy', 'care'], domain: '生活',
  title: '六個晚上，留給誰？',
  setup: '假設接下來三週，你有六個可以自由安排的晚上，每晚兩小時。你想照自己的想法做一本攝影小誌；一位正在轉職的好友也想請你陪他練面試。朋友另有其他人幫忙，沒有急事。每個晚上只能做一件事，兩件事都可以之後再繼續。這六個晚上，你會怎麼安排？',
  interaction: {
    kind: 'allocate', unit: '晚',
    cells: ['第一週・週二', '第一週・週四', '第二週・週二', '第二週・週四', '第三週・週二', '第三週・週四'],
    sides: [
      { id: 'zine', label: '做攝影小誌', detail: '照自己的想法創作，陪朋友就少一些。', valueId: 'autonomy' },
      { id: 'interview', label: '陪朋友練面試', detail: '多陪朋友準備，小誌就得慢一點做。', valueId: 'care' },
    ],
  },
};
