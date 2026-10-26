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

/**
 * AI 草稿，只供開發預覽打通「從初始安排調整」：改寫自 preference-slot04-weekend，現況是三個週末走熟悉路線、一個週末去新地方。
 * 第 1–5 組的內容票（#68）寫好 slot04 的三個變體時，從題庫組合拿掉這題。
 */
export const interactiveSampleWeekends: InteractiveScenario = {
  id: 'interactive-sample-weekends', slotId: 'slot04', pair: ['stimulation', 'security'], domain: '生活',
  title: '四個週末，照原本排的走嗎？',
  setup: '假設接下來一個月有四個週末，你已經大致排好：三個週末走熟悉的路線、散步吃飯，照預計的時間回家；第三個週末去沒去過的小鎮參加一日體驗，當天行程還沒確定。交通和預算都準備好了，也沒有非去不可的人情或工作，現在改也不用付取消費。這四個週末，你會怎麼過？',
  interaction: {
    kind: 'adjust', unit: '個週末',
    cells: ['第一個週末', '第二個週末', '第三個週末', '第四個週末'],
    sides: [
      { id: 'explore', label: '去陌生小鎮體驗', detail: '去新地方試新活動，也接受當天行程說不準。', valueId: 'stimulation' },
      { id: 'familiar', label: '走熟悉的路線', detail: '照自己知道的步調過，也放下去新地方的機會。', valueId: 'security' },
    ],
    initial: [1, 1, 0, 1],
  },
};
