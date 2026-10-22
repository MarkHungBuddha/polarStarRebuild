import type { ChoiceScenario } from '../types';

// Binary slots 5, 8, 11, 13, 15. Option order follows the slot pair; valueId is the only source of direction.
export const binarySlotScenarios: ChoiceScenario[] = [{
  id: 'slot05-festival', slotId: 'slot05', pair: ['stimulation', 'tradition'], kind: 'choice', domain: '社群',
  title: '同一天，兩場活動。',
  setup: '假設你熟悉的社區每年都辦一場傳統工藝日，你已連續參加多年，跟著老師傅做竹編、聽大家講這門手藝的由來。今年同一天，另有一場只辦一次的陌生領域體驗，內容是你從沒接觸過的聲音採集與即興創作。兩場都沒有工作責任，也沒有人催你非去不可，只能擇一。',
  options: [
    { id: 'new-experience', label: '去只辦一次的新體驗', consequence: '接觸從沒試過的活動與做法，也放下今年延續多年的工藝日。', valueId: 'stimulation' },
    { id: 'craft-day', label: '照往年參加工藝日', consequence: '延續與這門手藝和社區習俗的連結，也錯過這次難得的新鮮機會。', valueId: 'tradition' },
  ],
}, {
  id: 'slot05-holiday', slotId: 'slot05', pair: ['stimulation', 'tradition'], kind: 'choice', domain: '生活',
  title: '這次連假，怎麼過？',
  setup: '假設你有一段完全由自己安排的四天連假，沒有需要陪伴或照料的人。你可以去一個沒去過的地區，參加當地新型態的戶外體驗；也可以回到自己熟悉的節慶活動，跟著長輩學一段代代相傳的老技藝，例如糊燈籠或醒獅鼓法。兩種安排的花費與疲累程度差不多。',
  options: [
    { id: 'unfamiliar-trip', label: '去沒去過的地方體驗新活動', consequence: '換來陌生環境帶來的新鮮與變化，也少一次學老技藝的機會。', valueId: 'stimulation' },
    { id: 'festival-craft', label: '回熟悉的節慶學老技藝', consequence: '把節慶裡的老做法接著學下去，也放下這次去新地方的體驗。', valueId: 'tradition' },
  ],
}, {
  id: 'slot08-evening', slotId: 'slot08', pair: ['hedonism', 'care'], kind: 'choice', domain: '人際',
  title: '原本留給自己的那一晚。',
  setup: '假設你早就把今晚留給一部期待很久的電影，戲院場次已訂好，這週之後就下檔。一位熟朋友傳訊息，想找你聊聊最近考慮換工作的事。朋友沒有遇到危機，也可以改找別人或改天再聊，只是希望今晚能和你說說。',
  options: [
    { id: 'keep-movie', label: '照原計畫去看電影，明天再回覆朋友', consequence: '好好享受這段期待已久的時光，也讓朋友今晚少了你的陪伴。', valueId: 'hedonism' },
    { id: 'talk-tonight', label: '今晚陪朋友聊聊', consequence: '在朋友需要時陪在旁邊，也放棄這次在戲院看完那部電影。', valueId: 'care' },
  ],
}, {
  id: 'slot08-day-off', slotId: 'slot08', pair: ['hedonism', 'care'], kind: 'choice', domain: '人際',
  title: '只有半天的空檔。',
  setup: '假設這週你唯一空出的半天，原本打算去看一檔很喜歡的展覽，展期剩下最後幾天。一位親近的朋友下週要面試，想請你陪他挑衣服、順便聽聽他的自我介紹。朋友自己也能處理，只是有你陪著會比較安心。',
  options: [
    { id: 'see-exhibition', label: '去看展，這次不陪朋友', consequence: '把空檔留給自己喜歡的展覽，也讓朋友這次自己準備。', valueId: 'hedonism' },
    { id: 'help-friend', label: '陪朋友準備面試', consequence: '陪朋友把面試準備得更安心，也錯過這檔展覽。', valueId: 'care' },
  ],
}, {
  id: 'slot11-fund', slotId: 'slot11', pair: ['influence', 'fairness'], kind: 'choice', domain: '社群',
  title: '這筆活動預算，誰來決定？',
  setup: '假設你為社區爭取到一筆可自行規劃的小額活動預算，用途規則也允許你獨自定案。你已有一份完整方案；另一種做法是把一部分預算交給不同年齡、語言與行動需求的居民代表共同決定，納入你原方案沒涵蓋的需求。兩種做法都公開透明、符合規定。',
  options: [
    { id: 'own-plan', label: '保留全部定案權，照我的方案執行', consequence: '由自己掌握資源與方向，完整實現規劃，也讓不同需求較少改變活動內容。', valueId: 'influence' },
    { id: 'shared-budget', label: '讓居民代表共同決定部分預算', consequence: '讓更多處境不同的人得到照應，也接受自己無法完全掌握結果。', valueId: 'fairness' },
  ],
}, {
  id: 'slot11-event', slotId: 'slot11', pair: ['influence', 'fairness'], kind: 'choice', domain: '社群',
  title: '一場公開分享會的名額與主題。',
  setup: '假設你負責籌辦一場公開分享會，有權決定主題與報名名額怎麼分配，兩種做法都符合主辦單位規則。你可以依自己的構想定下主題與名額；也可以讓部分名額和一段議程，由聽障、新住民與高齡參與者的代表共同安排，讓活動涵蓋更多處境，但內容會偏離你原本的想法。',
  options: [
    { id: 'own-decision', label: '主題與名額由我做最後決定', consequence: '依自己的判斷掌握活動方向，也較少讓不同處境的人參與安排。', valueId: 'influence' },
    { id: 'co-arrange', label: '讓不同需求的代表共同安排一部分', consequence: '讓活動照顧到更多不同處境的人，也接受方向不完全由自己決定。', valueId: 'fairness' },
  ],
}, {
  id: 'slot13-club', slotId: 'slot13', pair: ['influence', 'tradition'], kind: 'choice', domain: '社群',
  title: '今年的活動，誰說了算？',
  setup: '假設你剛接任一個自願社團的活動召集人，章程允許你調整年度活動的形式。老成員希望照多年來傳下來的開場儀式與流程進行；你心中則有一套自己想主導的新安排。兩種都可行，舊儀式也沒有排斥任何人，差別在於這次由誰的方式決定方向。',
  options: [
    { id: 'own-format', label: '用召集人的權限，照我的安排重新規劃', consequence: '由自己掌握這次活動的方向，也讓多年的儀式在今年中斷。', valueId: 'influence' },
    { id: 'keep-ritual', label: '讓傳下來的儀式決定流程', consequence: '把社團多年的習俗延續下去，也少了自己主導安排的空間。', valueId: 'tradition' },
  ],
}, {
  id: 'slot13-exhibition', slotId: 'slot13', pair: ['influence', 'tradition'], kind: 'choice', domain: '工作',
  title: '工藝展的安排權。',
  setup: '假設地方工藝展邀你負責策展，主辦方讓你決定展品順序與介紹方式。你可以依自己的完整構想定案；也可以沿用師傅們歷年來的展示次序與講述方式。兩種呈現都能清楚介紹作品，沒有新舊優劣的問題，差別在於這次的方向由誰掌握。',
  options: [
    { id: 'own-curation', label: '依我的構想定案整個展覽', consequence: '由自己決定展覽的方向，也放下師傅們歷年延續的展示方式。', valueId: 'influence' },
    { id: 'masters-way', label: '沿用師傅們歷年的展示方式', consequence: '讓這門工藝的老做法延續下去，也接受自己不能完全決定方向。', valueId: 'tradition' },
  ],
}, {
  id: 'slot15-meeting', slotId: 'slot15', pair: ['rules', 'tradition'], kind: 'choice', domain: '社群',
  title: '新共識遇上紀念聚會。',
  setup: '假設你所在的自願社團剛通過新共識：每次聚會由成員輪流主持。這次剛好是年度紀念聚會，多年來一直由資深成員主持，新規則還沒有訂下任何例外。兩種做法都沒有法律或安全問題，你負責決定這次怎麼安排，並會向大家說明原因。',
  options: [
    { id: 'rotate', label: '照新共識輪流主持', consequence: '守住大家剛約定的規則，也讓紀念聚會的老慣例暫停一次。', valueId: 'rules' },
    { id: 'senior-host', label: '照慣例由資深成員主持', consequence: '延續紀念聚會多年的做法，也讓這次偏離剛通過的共識。', valueId: 'tradition' },
  ],
}, {
  id: 'slot15-reuse', slotId: 'slot15', pair: ['rules', 'tradition'], kind: 'choice', domain: '社群',
  title: '節慶聚會用哪一套餐具？',
  setup: '假設你參與的小型文化社群新約定：活動一律使用統一的可清洗公用餐具。不過，每年某個節慶聚會，大家多年來都帶自己家裡具有紀念意義的器皿來盛菜。兩種餐具都乾淨安全，環境代價也差不多，你負責決定今年的節慶聚會怎麼做。',
  options: [
    { id: 'shared-dishes', label: '照新約定使用公用餐具', consequence: '遵照大家新訂的約定，也少一次帶器皿共聚的節慶慣例。', valueId: 'rules' },
    { id: 'family-ware', label: '沿用各自帶器皿的慣例', consequence: '延續節慶裡帶器皿共聚的習俗，也讓這次偏離新約定。', valueId: 'tradition' },
  ],
}];
