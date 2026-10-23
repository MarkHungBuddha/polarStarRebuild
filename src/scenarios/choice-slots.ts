import type { ChoiceScenario } from '../types';

// Binary slots 5, 8, 11, 13, 15. Option order follows the slot pair; valueId is the only source of direction.
export const binarySlotScenarios: ChoiceScenario[] = [{
  id: 'slot05-festival', slotId: 'slot05', pair: ['stimulation', 'tradition'], kind: 'choice', domain: '社群',
  title: '同一天，兩場活動。',
  setup: '假設你熟悉的社區每年都有傳統工藝日。你參加了很多年，跟老師傅做竹編，聽大家聊這門手藝的由來。今年同一天，還有一場只辦一次的聲音採集與即興創作體驗，都是你沒試過的活動。兩場只能去一場，都沒有工作要做，也沒有人要求你一定要去。',
  options: [
    { id: 'new-experience', label: '去只辦一次的新體驗', consequence: '試試從沒接觸過的活動，也錯過今年的工藝日。', valueId: 'stimulation' },
    { id: 'craft-day', label: '照往年參加工藝日', consequence: '照往年做竹編、聽大家聊手藝，也錯過只辦一次的新體驗。', valueId: 'tradition' },
  ],
}, {
  id: 'slot05-holiday', slotId: 'slot05', pair: ['stimulation', 'tradition'], kind: 'choice', domain: '生活',
  title: '這次連假，怎麼過？',
  setup: '假設你有四天連假，可以自己安排，也沒有需要陪伴或照顧的人。你可以去沒去過的地區，參加新型態的戶外體驗；也可以回到熟悉的節慶活動，跟長輩學糊燈籠、醒獅鼓法等傳下來的技藝。兩種安排花費差不多，也差不多累。',
  options: [
    { id: 'unfamiliar-trip', label: '去沒去過的地方體驗新活動', consequence: '去新地方換換環境，也少一次跟長輩學老技藝的機會。', valueId: 'stimulation' },
    { id: 'festival-craft', label: '回熟悉的節慶學老技藝', consequence: '把節慶的老技藝接著學下去，也放下這次去新地方的機會。', valueId: 'tradition' },
  ],
}, {
  id: 'slot08-evening', slotId: 'slot08', pair: ['hedonism', 'care'], kind: 'choice', domain: '人際',
  title: '原本留給自己的那一晚。',
  setup: '假設你訂好了今晚的電影票，這部電影期待很久，下週就不演了。一位熟朋友傳訊息，想聊聊最近考慮換工作的事。朋友沒有遇到危機，可以找別人或改天再聊，只是希望今晚能和你說說。',
  options: [
    { id: 'keep-movie', label: '照原計畫去看電影，明天再回覆朋友', consequence: '看完期待很久的電影，也讓朋友今晚找不到你聊。', valueId: 'hedonism' },
    { id: 'talk-tonight', label: '今晚陪朋友聊聊', consequence: '朋友想聊的時候你在，也錯過在戲院看這部電影。', valueId: 'care' },
  ],
}, {
  id: 'slot08-day-off', slotId: 'slot08', pair: ['hedonism', 'care'], kind: 'choice', domain: '人際',
  title: '只有半天的空檔。',
  setup: '假設這週你只空得出半天，原本打算去看一檔很喜歡、再過幾天就結束的展覽。一位親近的朋友下週要面試，想請你陪他挑衣服、聽他練自我介紹。這些他自己也能準備，只是有你陪著會比較安心。',
  options: [
    { id: 'see-exhibition', label: '去看展，這次不陪朋友', consequence: '把空檔留給自己喜歡的展覽，也讓朋友這次自己準備。', valueId: 'hedonism' },
    { id: 'help-friend', label: '陪朋友準備面試', consequence: '陪朋友把面試準備得更安心，也錯過這檔展覽。', valueId: 'care' },
  ],
}, {
  id: 'slot11-fund', slotId: 'slot11', pair: ['influence', 'fairness'], kind: 'choice', domain: '社群',
  title: '這筆活動預算，誰來決定？',
  setup: '假設你替社區爭取到一筆小額活動預算，可以自行規劃，也有權獨自定案。你已經想好完整方案。你也可以交出一部分預算，讓不同年齡、語言和行動需求的居民代表一起決定，補進原方案沒顧到的需求。兩種做法都公開透明，也都符合規定。',
  options: [
    { id: 'own-plan', label: '保留全部定案權，照我的方案執行', consequence: '照自己的方案完整執行，也比較難補進其他居民的需求。', valueId: 'influence' },
    { id: 'shared-budget', label: '讓居民代表共同決定部分預算', consequence: '讓更多不同處境的居民被顧到，也接受結果不全由你決定。', valueId: 'fairness' },
  ],
}, {
  id: 'slot11-event', slotId: 'slot11', pair: ['influence', 'fairness'], kind: 'choice', domain: '社群',
  title: '一場公開分享會的名額與主題。',
  setup: '假設你負責辦一場公開分享會，可以決定主題和報名名額。你可以全照自己的構想安排，也可以把一部分名額和一段議程交給聽障、新住民和高齡參與者的代表共同安排。後者能顧到更多需求，但不會完全照你的想法進行。兩種做法都符合主辦單位的規則。',
  options: [
    { id: 'own-decision', label: '主題與名額由我做最後決定', consequence: '活動照你的判斷進行，也少了讓不同需求的人參與安排的機會。', valueId: 'influence' },
    { id: 'co-arrange', label: '讓不同需求的代表共同安排一部分', consequence: '活動能顧到更多人的需求，也接受方向不完全照你的想法。', valueId: 'fairness' },
  ],
}, {
  id: 'slot13-club', slotId: 'slot13', pair: ['influence', 'tradition'], kind: 'choice', domain: '社群',
  title: '今年的活動，誰說了算？',
  setup: '假設你剛接任一個自願社團的活動召集人，章程允許你調整年度活動。老成員希望沿用傳了多年的開場儀式和流程，你則有一套想親自決定的新安排。兩種都可行，原來的儀式也沒有排斥任何人。你會用自己的安排，還是延續原來的流程？',
  options: [
    { id: 'own-format', label: '用召集人的權限，照我的安排重新規劃', consequence: '今年照你的安排走，也讓多年的開場儀式停辦一次。', valueId: 'influence' },
    { id: 'keep-ritual', label: '沿用傳下來的儀式和流程', consequence: '讓社團多年的儀式延續下去，也少了照自己想法安排的空間。', valueId: 'tradition' },
  ],
}, {
  id: 'slot13-exhibition', slotId: 'slot13', pair: ['influence', 'tradition'], kind: 'choice', domain: '工作',
  title: '工藝展的安排權。',
  setup: '假設地方工藝展請你策展，展品的順序和介紹方式都由你決定。你可以照自己的完整構想安排，也可以沿用師傅們歷年展示和介紹作品的方式。兩種都能把作品說清楚，沒有哪一種比較好。你會自己定案，還是照師傅們傳下來的方式做？',
  options: [
    { id: 'own-curation', label: '照我的構想安排整個展覽', consequence: '展覽照你的構想呈現，也不再沿用師傅們歷年的展示方式。', valueId: 'influence' },
    { id: 'masters-way', label: '沿用師傅們歷年的展示方式', consequence: '讓師傅們的老做法延續下去，也接受展覽不完全照你的構想。', valueId: 'tradition' },
  ],
}, {
  id: 'slot15-meeting', slotId: 'slot15', pair: ['rules', 'tradition'], kind: 'choice', domain: '社群',
  title: '新約定遇上紀念聚會。',
  setup: '假設你參加的自願社團剛約好，以後每次聚會由成員輪流主持。這次是年度紀念聚會，以往一直由資深成員主持，新約定還沒有任何例外。兩種做法都沒有法律或安全問題。這次由你決定怎麼安排，並向大家說明原因。',
  options: [
    { id: 'rotate', label: '照新約定輪流主持', consequence: '照大家剛約好的規則走，紀念聚會的老慣例也暫停一次。', valueId: 'rules' },
    { id: 'senior-host', label: '照慣例由資深成員主持', consequence: '延續紀念聚會多年的做法，也沒照剛約好的輪流規則。', valueId: 'tradition' },
  ],
}, {
  id: 'slot15-reuse', slotId: 'slot15', pair: ['rules', 'tradition'], kind: 'choice', domain: '社群',
  title: '節慶聚會用哪一套餐具？',
  setup: '假設你參與的文化社群剛約好，活動統一使用可清洗的公用餐具。但有一場每年固定的節慶聚會，大家多年來都會帶家裡有紀念意義的器皿來盛菜。兩種餐具都乾淨、安全，對環境的影響也差不多。今年由你決定用哪一種。',
  options: [
    { id: 'shared-dishes', label: '照新約定使用公用餐具', consequence: '照大家新的約定走，今年也就不帶家裡的器皿了。', valueId: 'rules' },
    { id: 'family-ware', label: '沿用各自帶器皿的慣例', consequence: '延續大家帶器皿來的老習慣，也沒照新的約定。', valueId: 'tradition' },
  ],
}];
