import type { SliderScenario } from '../types';

export const sliderScenarios: SliderScenario[] = [{
  id: 'slot01-work', slotId: 'slot01', pair: ['autonomy', 'security'], kind: 'slider', domain: '工作',
  title: '先準備多少，再換一種工作？',
  setup: '假設你目前的工作收入固定，排程與做法大多由公司決定。你也能選擇轉為接案，自行安排工作內容與時間，但每月收入可能起伏。兩種工作都能發揮你的能力；留下會少些安排空間，接案則需要自己承擔收入不穩的月份。請依情境想像，不必以你現在的存款作答。',
  question: '存款至少要夠幾個月生活費，你才考慮轉為接案？',
  min: 0, max: 24, step: 1, initial: 6, unit: '個月生活費',
  resultPrefix: '你希望先準備', resultSuffix: '，再考慮轉為接案。',
}, {
  id: 'slot01-home', slotId: 'slot01', pair: ['autonomy', 'security'], kind: 'slider', domain: '居住',
  title: '搬家之前，想先確定什麼？',
  setup: '假設你正在比較兩個都負擔得起的租屋選項。原住處的長租條件穩定，但空間用途與布置須照房東規定；新住處可自行安排工作區與生活空間，續約時卻可能調租。留下能維持可預期的支出，搬家則多了依自己想法生活的空間。新房東願意討論一段不調租的保障期。',
  question: '至少保障幾個月不調租，你才考慮搬到新住處？',
  min: 0, max: 24, step: 1, initial: 6, unit: '個月不調租保障',
  resultPrefix: '你希望先有', resultSuffix: '，再考慮搬到能自行安排空間的新住處。',
}, {
  id: 'slot07-study', slotId: 'slot07', pair: ['hedonism', 'achievement'], kind: 'slider', domain: '進修',
  title: '八週的進修，留多少空白？',
  setup: '假設你想參加一個自選的八週進修計畫，完成一份能展示自己能力的成果。練習會占去原本吃飯、散步與看劇的空檔；不參加則能保留休閒，但這次不會完成那份成果。計畫可協調每週投入時數，進度也會隨之調整。請想像你願意接受的安排，不必以現在的工時作答。',
  question: '每週至少保留幾小時純休閒，你才考慮接受這個進修安排？',
  min: 0, max: 12, step: 1, initial: 4, unit: '小時純休閒',
  resultPrefix: '你希望每週至少保留', resultSuffix: '，再考慮八週進修安排。',
}, {
  id: 'slot07-weekends', slotId: 'slot07', pair: ['hedonism', 'achievement'], kind: 'slider', domain: '生活',
  title: '週末作品集，也要有留白。',
  setup: '假設朋友邀你參加六週作品集共學，目的是完成你重視的一份成果，沒有工作上的強制要求。參加需要把部分週末交給練習；保留原來自在吃飯、逛街與休息的一天，則會放下這次共學和完成成果的機會。你可以和夥伴討論每週參與的時數。',
  question: '每個週末至少保留幾小時純休閒，你才考慮加入共學？',
  min: 0, max: 10, step: 1, initial: 4, unit: '小時純休閒',
  resultPrefix: '你希望每個週末至少保留', resultSuffix: '，再考慮加入六週作品集共學。',
}, {
  id: 'slot10-accessible', slotId: 'slot10', pair: ['achievement', 'fairness'], kind: 'slider', domain: '工作',
  title: '成果發表，要多留一個版本嗎？',
  setup: '假設你正準備發表一份能展示個人能力的公開教學成果。原版已具備基本可用性；另做易讀與無障礙版本，能讓更多不同需求的人使用，但會占去修整個人成果的時間，也延後原定發表日。你可以按原計畫發表，或向主辦方提出較晚的交付日期，承擔這次延後被看見的代價。',
  question: '至少多給幾週準備時間，你才考慮把易讀版一併完成？',
  min: 0, max: 8, step: 1, initial: 2, unit: '週準備時間',
  resultPrefix: '你希望至少多有', resultSuffix: '，再考慮延後發表並一併完成易讀版。',
}, {
  id: 'slot10-environment', slotId: 'slot10', pair: ['achievement', 'fairness'], kind: 'slider', domain: '社群',
  title: '先完成作品，還是多整理一份？',
  setup: '假設你正在為一場自選的作品分享準備成果，希望把個人能力完整呈現。同時，你能把手上的環境觀察筆記整理成公開資料，供不同地區的團體參考。整理公開資料會占去作品打磨的時間；專心作品則能較早發表，但這次不會完成那份共同資料。主辦方可協調延後分享日期。',
  question: '至少多給幾週準備時間，你才考慮把公開資料一併整理？',
  min: 0, max: 6, step: 1, initial: 2, unit: '週準備時間',
  resultPrefix: '你希望至少多有', resultSuffix: '，再考慮延後作品分享並一併整理公開環境資料。',
}];
