import type { ChoiceScenario } from '../types';

// Binary slot 4. Option order follows the slot pair; valueId is the only source of direction.
export const slot04Scenarios: ChoiceScenario[] = [{
  id: 'slot04-work', slotId: 'slot04', pair: ['stimulation', 'security'], kind: 'choice', domain: '工作',
  title: '下週，照原計畫嗎？',
  setup: '公司邀你到另一個團隊支援兩週，薪水不變，你也可以選擇留下。新團隊的專案是你沒做過的，會有基本交接，但每天要做什麼還沒排定。留在原團隊，就能照排好的時間完成熟悉的工作。兩邊都能如期交付。',
  options: [
    { id: 'join', label: '去新團隊試兩週', consequence: '試試新的工作方式，也接受每天的安排比較難預料。', valueId: 'stimulation' },
    { id: 'stay', label: '留在原團隊', consequence: '照熟悉的步調工作，也放下這次換環境的機會。', valueId: 'security' },
  ],
}, {
  id: 'slot04-weekend', slotId: 'slot04', pair: ['stimulation', 'security'], kind: 'choice', domain: '生活',
  title: '這次週末，要換條路嗎？',
  setup: '你有一天可以自由安排的假日，交通和預算都準備好了。你可以去陌生小鎮參加一日體驗，活動有基本介紹，但當天行程還沒確定；也可以走熟悉的路線、散步吃飯，照預計的時間回家。兩種安排都能休息，也沒有非去不可的人情或工作。',
  options: [
    { id: 'explore', label: '去陌生小鎮體驗一天', consequence: '去新地方試新活動，也接受當天行程說不準。', valueId: 'stimulation' },
    { id: 'familiar', label: '照熟悉的路線過一天', consequence: '假日照自己知道的步調過，也放下這次去新地方的機會。', valueId: 'security' },
  ],
}];
