import type { StrikeScenario } from '../types';

export const strikeScenarios: StrikeScenario[] = [{
  id: 'slot02-proposal', slotId: 'slot02', pair: ['autonomy', 'rules'], kind: 'strike', domain: '工作',
  title: '這份提案，用誰的方法？',
  setup: '假設你正準備一份內部提案。團隊共同約定使用同一份格式，讓每個人都能快速對照；你則想用自己設計的敘事方式表達觀點。兩種都能完整交代內容，主管也允許你提出例外，但採用自己的方式，就會偏離這次的共同約定。回覆只能保留一段。',
  options: [
    { id: 'own-method', label: '這次我想用自己設計的方式說明，讓觀點依我的想法展開；我知道這會偏離共同約定，也需要大家多花時間熟悉。', consequence: '保留自行決定呈現方式的空間，也接受偏離共同格式的代價。', valueId: 'autonomy' },
    { id: 'shared-format', label: '這次我先沿用共同約定的格式，讓大家可以直接對照；我會把自己的呈現方式留到另一次提案。', consequence: '維持共同約定，也放下這次自行決定呈現方式的機會。', valueId: 'rules' },
  ],
}];
