import type { ChoiceScenario } from '../types';

// Binary slot 4. Option order follows the slot pair; valueId is the only source of direction.
export const slot04Scenarios: ChoiceScenario[] = [{
  id: 'slot04-work', slotId: 'slot04', pair: ['stimulation', 'security'], kind: 'choice', domain: '工作',
  title: '下週，照原計畫嗎？',
  setup: '公司邀你到另一個團隊支援兩週，薪資不變，也可以留在原職。新團隊做你沒接觸過的專案，會提供基本交接，但每天的安排尚未定下來。留在原團隊，則能按已排好的節奏完成熟悉的工作。兩邊都能如期交付。',
  options: [
    { id: 'join', label: '去新團隊試兩週', consequence: '接觸新的工作方式，也接受行程與任務較難預料。', valueId: 'stimulation' },
    { id: 'stay', label: '留在原團隊', consequence: '維持熟悉、可預期的節奏，也放下這次新體驗。', valueId: 'security' },
  ],
}, {
  id: 'slot04-weekend', slotId: 'slot04', pair: ['stimulation', 'security'], kind: 'choice', domain: '生活',
  title: '這次週末，要換條路嗎？',
  setup: '你有一天可自行安排的假日，交通與預算都已留好。可以到沒去過的小鎮參加一日體驗，活動會提供基本資訊，但當天節奏尚未確定；也可以沿熟悉的路線散步、吃飯，按自己知道的時間回家。兩種安排都能讓你休息，沒有需要履行的人情或工作責任。',
  options: [
    { id: 'explore', label: '去陌生小鎮體驗一天', consequence: '接觸新的地方與活動，也接受行程較難預料。', valueId: 'stimulation' },
    { id: 'familiar', label: '按熟悉的路線過一天', consequence: '保留可預期的假日節奏，也放下這次新鮮的體驗。', valueId: 'security' },
  ],
}];
