import type { Scenario } from './types';
import { sliderScenarios } from './scenarios/slider';
import { strikeScenarios } from './scenarios/strike';
import { allocationScenarios } from './scenarios/allocation';
export const scenarios: Scenario[] = [...sliderScenarios, ...strikeScenarios, ...allocationScenarios, {
  id: 'slot04-work', slotId: 'slot04', pair: ['stimulation', 'security'], kind: 'choice', domain: '工作',
  title: '下週，照原計畫嗎？',
  setup: '公司邀你到另一個團隊支援兩週，薪資不變，也可以留在原職。新團隊做你沒接觸過的專案，會提供基本交接，但每天的安排尚未定下來。留在原團隊，則能按已排好的節奏完成熟悉的工作。兩邊都能如期交付。',
  options: [
    { id: 'join', label: '去新團隊試兩週', consequence: '接觸新的工作方式，也接受行程與任務較難預料。', valueId: 'stimulation' },
    { id: 'stay', label: '留在原團隊', consequence: '維持熟悉、可預期的節奏，也放下這次新體驗。', valueId: 'security' },
  ],
}];

