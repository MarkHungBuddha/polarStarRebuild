import type { SliderScenario } from '../types';

export const sliderScenarios: SliderScenario[] = [{
  id: 'slot01-work', slotId: 'slot01', pair: ['autonomy', 'security'], kind: 'slider', domain: '工作',
  title: '先準備多少，再換一種工作？',
  setup: '假設你目前的工作收入固定，排程與做法大多由公司決定。你也能選擇轉為接案，自行安排工作內容與時間，但每月收入可能起伏。兩種工作都能發揮你的能力；留下會少些安排空間，接案則需要自己承擔收入不穩的月份。請依情境想像，不必以你現在的存款作答。',
  question: '存款至少要夠幾個月生活費，你才考慮轉為接案？',
  min: 0, max: 24, step: 1, initial: 6, unit: '個月生活費',
  resultPrefix: '你希望先準備', resultSuffix: '，再考慮轉為接案。',
}];
