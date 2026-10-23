import type { SliderScenario } from '../types';

export const sliderScenarios: SliderScenario[] = [{
  id: 'slot01-work', slotId: 'slot01', pair: ['autonomy', 'security'], kind: 'slider', domain: '工作',
  title: '先準備多少，再換一種工作？',
  setup: '假設你現在領固定薪水，工作時間和做法大多由公司安排。你可以繼續做，也可以轉為接案，自己決定接什麼工作、怎麼排時間，但每月收入可能有起伏。兩種工作都能發揮你的能力。請想想，存下多少生活費，你才願意換工作？不用照你目前的存款回答。',
  question: '存款至少要夠幾個月生活費，你才考慮轉為接案？',
  min: 0, max: 24, step: 1, initial: 6, unit: '個月生活費',
  resultPrefix: '你希望先準備', resultSuffix: '，再考慮轉為接案。',
}, {
  id: 'slot01-home', slotId: 'slot01', pair: ['autonomy', 'security'], kind: 'slider', domain: '居住',
  title: '搬家之前，想先確定什麼？',
  setup: '假設你在比較兩間都租得起的房子。現在的住處有穩定的長租條件，但房間怎麼布置、空間怎麼用，都得照房東的規定。新住處可以自己安排工作區和生活空間，續約時卻可能漲租。新房東願意談一段不調租的保障期，你希望這段時間有多長？',
  question: '至少保障幾個月不調租，你才考慮搬到新住處？',
  min: 0, max: 24, step: 1, initial: 6, unit: '個月不調租保障',
  resultPrefix: '你希望先有', resultSuffix: '，再考慮搬家。',
}, {
  id: 'slot07-study', slotId: 'slot07', pair: ['hedonism', 'achievement'], kind: 'slider', domain: '進修',
  title: '八週的進修，留多少空白？',
  setup: '假設你想參加八週的進修計畫，完成一份能展示自己能力的成果。練習會用掉原本吃飯、散步、看劇的空檔；不參加，就能照常休息，但這次也不會完成那份成果。每週投入多少時間可以商量，進度也會跟著調整。請想想你願意接受的安排，不用照目前的工時回答。',
  question: '每週至少要留幾小時純休閒，你才考慮參加這個進修計畫？',
  min: 0, max: 12, step: 1, initial: 4, unit: '小時純休閒',
  resultPrefix: '你希望每週至少保留', resultSuffix: '，再考慮參加八週進修。',
}, {
  id: 'slot07-weekends', slotId: 'slot07', pair: ['hedonism', 'achievement'], kind: 'slider', domain: '生活',
  title: '週末作品集，也要有留白。',
  setup: '假設朋友邀你參加六週的作品集共學，一起完成你在意的作品。這是自由參加，工作上沒有要求。你原本每個週末有一天可以自在吃飯、逛街、休息；加入後，得把其中一部分時間拿來練習。不加入，就保留原來的休閒，也錯過這次共學和完成作品的機會。每週參加幾小時可以和夥伴商量。',
  question: '每個週末至少保留幾小時純休閒，你才考慮加入共學？',
  min: 0, max: 10, step: 1, initial: 4, unit: '小時純休閒',
  resultPrefix: '你希望每個週末至少保留', resultSuffix: '，再考慮加入六週作品集共學。',
}, {
  id: 'slot10-accessible', slotId: 'slot10', pair: ['achievement', 'fairness'], kind: 'slider', domain: '工作',
  title: '成果發表，要多留一個版本嗎？',
  setup: '假設你準備公開發表一份教學成果，展示自己的能力。目前的版本已經可以基本使用。你也可以加做易讀與無障礙版本，讓更多有不同需求的人使用；只是這會占用修改原版的時間，也會延後發表。你可以照原定日期交付，或向主辦方提出較晚的日期，讓自己的成果晚一點公開。',
  question: '至少要多幾週準備時間，你才考慮一起完成易讀版？',
  min: 0, max: 8, step: 1, initial: 2, unit: '週準備時間',
  resultPrefix: '你希望至少多', resultSuffix: '，再考慮延後發表、一起完成易讀版。',
}, {
  id: 'slot10-environment', slotId: 'slot10', pair: ['achievement', 'fairness'], kind: 'slider', domain: '社群',
  title: '先完成作品，還是多整理一份？',
  setup: '假設你報名了作品分享，正在修改作品，希望完整呈現自己的能力。手上還有一份環境觀察筆記，可以整理成公開資料，供不同地區的團體參考。做這份資料，就少了修改作品的時間；只做作品，能早一點發表，但這次就不會整理出公開資料。主辦方願意商量延後分享日期。',
  question: '至少要多幾週準備時間，你才考慮一起整理公開資料？',
  min: 0, max: 6, step: 1, initial: 2, unit: '週準備時間',
  resultPrefix: '你希望至少多', resultSuffix: '，再考慮延後分享、一起整理公開資料。',
}];
