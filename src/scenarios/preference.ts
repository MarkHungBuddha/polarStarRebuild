import type { PreferenceScenario } from '../types';
import { preferenceSlots01To05 } from './preference-slots-01-05';

/** New catalog, kept separate from the published catalog until all fifteen slots are ready. */
export const preferenceScenarios: PreferenceScenario[] = [{
  id: 'preference-slot04-work', slotId: 'slot04', pair: ['stimulation', 'security'], kind: 'preference', domain: '工作',
  title: '下週，照原計畫嗎？',
  setup: '公司邀你到另一個團隊支援兩週，薪水不變，你也可以選擇留下。新團隊的專案是你沒做過的，會有基本交接，但每天要做什麼還沒排定。留在原團隊，就能照排好的時間完成熟悉的工作。兩邊都能如期交付。',
  options: [
    { id: 'join', label: '去新團隊試兩週', consequence: '試試新的工作方式，也接受每天的安排比較難預料。', valueId: 'stimulation' },
    { id: 'stay', label: '留在原團隊', consequence: '照熟悉的步調工作，也放下這次換環境的機會。', valueId: 'security' },
  ],
},
...preferenceSlots01To05,
];
