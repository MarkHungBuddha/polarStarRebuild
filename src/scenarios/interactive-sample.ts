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
 * AI 草稿，只供開發預覽打通選方案題，不是審閱過的題庫內容。跟六晚行事曆同屬 slot03，開發預覽固定抽第一個變體，
 * 所以只有把 Math.random 調大的 spec 會抽到它。第 1–5 組的內容票（#68）寫好 slot03 時，跟上一題一起從題庫組合拿掉。
 */
export const interactiveSampleSaturday: InteractiveScenario = {
  id: 'interactive-sample-saturday', slotId: 'slot03', pair: ['autonomy', 'care'], domain: '生活',
  title: '這個週六，去上課還是去幫忙？',
  setup: '你報名了一堂期待很久的單日木工課，就在這個週六，這次沒去要等明年才有名額。週五晚上，正在搬家的好友問你週六能不能來幫忙打包；他已經找了搬家公司，只是一個人收拾會很趕。兩件事時間重疊，只能選一件。這個週六，你會怎麼過？',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'woodwork', label: '照原計畫去上木工課', content: '照自己排好的計畫，動手做出想了很久的小板凳。', cost: '朋友得自己收到半夜，你一整天都會惦記著他。', valueId: 'autonomy' },
      { id: 'packing', label: '去幫朋友打包', content: '陪朋友一起收拾，讓他搬家輕鬆一點。', cost: '木工課要等到明年，想做的板凳先擱著。', valueId: 'care' },
    ],
  },
};
