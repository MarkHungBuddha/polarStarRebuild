import type { InteractiveScenario } from '../interactiveTypes';

/**
 * Slots 6–10 (#86): fifteen AI drafts for the owner's review, in the same order, pairs and IDs as the published bank but with
 * interactions chosen from each decision. Per-question mechanism, costs, direction rule and open items are recorded in
 * docs/interactive-content/redesign-slots-06-10.md. Nothing here is approved content.
 */
export const redesignSlots06To10: InteractiveScenario[] = [{
  id: 'interactive-slot06-sessions', slotId: 'slot06', pair: ['stimulation', 'achievement'], domain: '進修',
  title: '三次進修空檔，先排哪些？',
  setup: '這個月你有三個各兩小時的進修空檔，六項候選活動各要用一個空檔。你想接觸沒試過的領域，也想把手上的一組照片整理成能公開展示的作品。每項活動都能獨立進行，費用相近。先做新體驗，作品就晚一點完成；先修作品，新嘗試就延到下個月。這不是工作要求。',
  interaction: { kind: 'priority', capacity: 3, keepLabel: '這個月先做', deferLabel: '延到下個月', resourceUnit: '個兩小時空檔', items: [
    { id: 'wood', label: '試一堂木工課', detail: '接觸新的材料與工具，占用一個兩小時空檔。', valueId: 'stimulation' },
    { id: 'reshoot', label: '重拍攝影作品', detail: '改善已有的照片，占用一個兩小時空檔。', valueId: 'achievement' },
    { id: 'improv', label: '參加即興工作坊', detail: '試陌生的表達方式，占用一個兩小時空檔。', valueId: 'stimulation' },
    { id: 'sequence', label: '整理作品集順序', detail: '讓已有的成果更完整，占用一個兩小時空檔。', valueId: 'achievement' },
    { id: 'sound', label: '到街上採集聲音', detail: '認識新的創作媒介，占用一個兩小時空檔。', valueId: 'stimulation' },
    { id: 'statement', label: '完成攝影作品說明', detail: '把作品的想法寫清楚，占用一個兩小時空檔。', valueId: 'achievement' },
  ] },
}, {
  id: 'interactive-slot06-project', slotId: 'slot06', pair: ['stimulation', 'achievement'], domain: '工作',
  title: '下一季，把工作牌放在哪張桌？',
  setup: '你在接案，下一季只排得下一個案子，兩個案子的報酬和工時差不多。一個在你沒做過的領域，得從頭學起，每週都會碰到沒處理過的問題；另一個是你擅長的類型，規模比以往大，做好會是作品集裡最完整的一件。兩邊都要準時交付，也沒有人情壓力。',
  interaction: { kind: 'scene', object: '工作牌', transitionLabel: '走道', locations: [
    { id: 'unfamiliar', label: '陌生領域的研究桌', action: '選擇陌生案子', consequence: '這一季從頭學新領域，每週摸索沒處理過的問題；擅長的類型先擱著。', valueId: 'stimulation' },
    { id: 'signature', label: '大案子的作品桌', action: '選擇擅長的大案子', consequence: '這一季用熟悉的本事做比以往更大的案子，完成後是作品集裡最完整的一件；新領域先不碰。', valueId: 'achievement' },
  ] },
}, {
  id: 'interactive-slot06-community', slotId: 'slot06', pair: ['stimulation', 'achievement'], domain: '社群',
  title: '這個月的四個週六，活動卡怎麼放？',
  setup: '你在開放社群報了這個月的四個週六，每個週六只能去一種活動。體驗場輪流換內容，可以試沒接觸過的活動；練習班固定練一項已有基礎的技能，準備月底的成果展示。兩種都有人帶、都要投入，月底前都能免費改。練習班去得越少，月底能展示的就越少。',
  interaction: { kind: 'calendar', slots: ['第1個週六', '第2個週六', '第3個週六', '第4個週六'], sides: [
    { id: 'try', label: '去體驗場試新活動', detail: '試一種沒碰過的活動，月底的展示也少練一次。', valueId: 'stimulation' },
    { id: 'practice', label: '去練習班準備展示', detail: '多練一次，月底的成果更完整，也少試一種新活動。', valueId: 'achievement' },
  ] },
}, {
  id: 'interactive-slot07-weekends', slotId: 'slot07', pair: ['hedonism', 'achievement'], domain: '生活',
  title: '六個週末，作品和休息怎麼分？',
  setup: '朋友邀你參加六週的作品集共學，一起完成一件你在意的作品。這六個週末你都有空，每個週末只能選一種：去共學做作品，或留給自己吃飯、逛街、休息。這是自由參加，工作上沒有要求，哪一週不去，前一天說一聲就好。去得越少，作品越可能做不完。',
  interaction: { kind: 'calendar', slots: ['第1個週末', '第2個週末', '第3個週末', '第4個週末', '第5個週末', '第6個週末'], sides: [
    { id: 'rest', label: '留給自己休息', detail: '自在吃飯、逛街、休息，作品也少推進一週。', valueId: 'hedonism' },
    { id: 'group', label: '去共學做作品', detail: '作品多推進一週，也少一個自在的週末。', valueId: 'achievement' },
  ] },
}, {
  id: 'interactive-slot07-bonus', slotId: 'slot07', pair: ['hedonism', 'achievement'], domain: '旅行',
  title: '這筆獎金的六張預算券，放在哪裡？',
  setup: '你拿到一筆獎金，已經換成六張金額相同的預算券。放鬆假期可以一項一項買，例如交通住宿、餐廳預約、按摩行程，不必一次買齊；專業實作的準備也能分開買，例如教材、實作課、模擬測驗。每張預算券只能用在一邊。放鬆這邊用得越少，假期就越短、越簡單；實作這邊用得越少，準備就越不完整。兩邊都在你能負擔的範圍內，也沒有人要求你怎麼選。',
  interaction: { kind: 'resources', unit: '張', objects: ['預算券 1', '預算券 2', '預算券 3', '預算券 4', '預算券 5', '預算券 6'], sides: [
    { id: 'rest', label: '放鬆假期的安排', detail: '假期更長、更舒服，就少一份用在實作準備的預算。', valueId: 'hedonism' },
    { id: 'prep', label: '專業實作的準備', detail: '實作準備更完整，也少一份用在放鬆假期的預算。', valueId: 'achievement' },
  ] },
}, {
  id: 'interactive-slot07-study', slotId: 'slot07', pair: ['hedonism', 'achievement'], domain: '進修',
  title: '八週的週六下午，留多少給課程？',
  setup: '你報名了八週的線上進修，每個週六下午兩點到晚上八點，這六小時都能自己安排。你想拿來散步、看劇或休息，也想拿來上課、做結業作品。課程加作品大約要三十六小時；這八週每週給它的時間越少，結業前缺的時數就越多，得另外找時間補上。這是你自己決定的事，工作上沒有要求。',
  interaction: { kind: 'linked', min: 0, max: 6, step: 1, initial: 3, unit: '小時', label: '休閒留白', consequence: '每多留一小時休閒，就少一小時投入課程；這八週沒完成的部分，結業前得另外補上。', presentation: { kind: 'clock', startHour: 14 }, resourceTotal: 6, resourceSides: [
    { id: 'rest', label: '休閒留白', detail: '散步、看劇或休息，課程進度也慢一點。', valueId: 'hedonism' },
    { id: 'course', label: '投入課程', detail: '上課、做結業作品，也少一小時休閒留白。', valueId: 'achievement' },
  ], metrics: [
    { label: '八週投入課程', unit: '小時', source: 'remainder', multiplier: 8 },
    { label: '結業前還缺', unit: '小時', source: 'remainder', multiplier: 8, subtractFrom: 36, minimum: 0 },
  ] },
}, {
  id: 'interactive-slot08-afternoons', slotId: 'slot08', pair: ['hedonism', 'care'], domain: '人際',
  title: '四個週六下午，行事曆放什麼？',
  setup: '這個月有四個週六下午空著，每個下午只能做一件事。你想留給自己：看一檔喜歡的展、去常去的咖啡店坐坐、把想看的電影看完。一位剛搬到附近的好友對環境還不熟，想找你一起逛市場、組家具、認識附近。他自己慢慢來也可以，只是有你陪會比較開心。',
  interaction: { kind: 'calendar', slots: ['第1個週六', '第2個週六', '第3個週六', '第4個週六'], sides: [
    { id: 'own', label: '照原本的休閒計畫過下午', detail: '看展、坐咖啡店或看完那部電影，也少一次陪好友熟悉新環境。', valueId: 'hedonism' },
    { id: 'friend', label: '陪好友逛市場、組家具', detail: '陪好友把新生活安頓好，也放下原本想過的休閒下午。', valueId: 'care' },
  ] },
}, {
  id: 'interactive-slot08-evening', slotId: 'slot08', pair: ['hedonism', 'care'], domain: '朋友',
  title: '電影只剩今晚，你走向哪裡？',
  setup: '你訂好了今晚的電影票，這部電影期待很久，下週就下檔，只有今晚排得進你的行程。一位熟朋友傳訊息來，想聊聊最近考慮換工作的事。他沒有遇到危機，也可以找別人或改天再聊，只是希望今晚能和你說說。',
  interaction: { kind: 'scene', object: '自己', transitionLabel: '走廊', locations: [
    { id: 'cinema', label: '影廳', action: '走進影廳', consequence: '今晚看完期待很久的電影，明天再回朋友的訊息；朋友今晚得自己先想想，或找別人聊。', valueId: 'hedonism' },
    { id: 'table', label: '餐桌區', action: '走進餐桌區', consequence: '今晚陪朋友聊換工作的事；這部電影就錯過在戲院看的機會。', valueId: 'care' },
  ] },
}, {
  id: 'interactive-slot08-unpacking', slotId: 'slot08', pair: ['hedonism', 'care'], domain: '家人',
  title: '四個晚上，原本的安排要調整嗎？',
  setup: '這週四個晚上你都已經排給自己：週一追新出的影集、週二去新開的拉麵店、週三把小說看完、週四早點泡澡睡覺。弟弟上週末剛搬進新家，大件行李由搬家公司處理，他自己也能慢慢整理，只是希望晚上有人陪他拆箱、聊聊天。每個晚上只能做一件事。',
  interaction: { kind: 'resources', unit: '晚', objects: ['週一晚上', '週二晚上', '週三晚上', '週四晚上'], initial: [0, 0, 0, 0], sides: [
    { id: 'own', label: '原本的休閒安排', detail: '把排給自己的事做完，那晚就不能陪弟弟。', valueId: 'hedonism' },
    { id: 'brother', label: '陪弟弟拆箱', detail: '陪弟弟在新家多待一晚，也放下那晚原本排好的事。', valueId: 'care' },
  ] },
}, {
  id: 'interactive-slot09-rooftop', slotId: 'slot09', pair: ['hedonism', 'rules'], domain: '居住',
  title: '十點到了，你想在頂樓待到幾點？',
  setup: '住戶公約寫明頂樓花園晚上十點關閉，沒有例外。今晚天氣很好，你和室友上去喝飲料、看夜景。管理員十點就下班，頂樓離住戶樓層遠，多待一會兒不會吵到人。你可以照公約十點下樓，也可以多待一段時間。這裡只記下你願意待到幾點，不代表你已經這麼做。',
  interaction: { kind: 'linked', min: 0, max: 1, step: 0.5, initial: 0, unit: '小時', label: '十點後多待', consequence: '多待越久，夜景和聊天的時間越長，也離公約規定的十點關閉越遠。這裡只記下你的選擇條件。', presentation: { kind: 'clock', startHour: 10 }, metrics: [
    { label: '超過公約關閉時間', unit: '分鐘', source: 'value', multiplier: 60 },
  ] },
}, {
  id: 'interactive-slot09-phone-free', slotId: 'slot09', pair: ['hedonism', 'rules'], domain: '聚會',
  title: '甜點上桌，手機放在哪裡？',
  setup: '你和同事聚餐，事先約好吃飯時不拿手機，今晚也沒有工作或家裡的急事。桌上來了一份難得吃到的甜點，大家也都同意合照。你想拍幾張，拍完就收，但拿出手機就沒照原來的約定。這不會影響同桌的人吃飯。',
  interaction: { kind: 'scene', object: '手機', transitionLabel: '桌面', locations: [
    { id: 'photo', label: '拍照位置', action: '拿出手機拍照', consequence: '留下今晚的甜點和大家的合照；這一餐沒照不拿手機的約定，拍完就收。', valueId: 'hedonism' },
    { id: 'box', label: '收納盒', action: '把手機收進盒子', consequence: '照大家說好的，專心把這一餐吃完；這次不會留下甜點和合照的照片。', valueId: 'rules' },
  ] },
}, {
  id: 'interactive-slot09-quiet-hours', slotId: 'slot09', pair: ['hedonism', 'rules'], domain: '聚會',
  title: '讀書會還想多聊，你會留下哪些話？',
  setup: '你參加的讀書會這個月在共用空間聚會，大家借場地時約好九點散場，場地也只預約到九點。今晚討論得很熱烈，幾位成員想多聊一會兒。場地方說可以現場付費延長半小時，音量也沒問題；不過大家的約定還是九點結束，還沒有人提議改。你在群組裡打好一段回覆，還沒送出。',
  interaction: { kind: 'message', sentences: [
    { id: 'agreement', text: '我記得我們原本約好九點結束。' },
    { id: 'want', text: '今天聊得很盡興，我想多聊一會兒。' },
    { id: 'extend', text: '場地方說可以現場付費延長半小時。' },
    { id: 'share', text: '延長費我願意跟大家分攤。' },
    { id: 'ask', text: '你們覺得要不要延長？' },
    { id: 'ontime', text: '如果大家想照原本的約定，我們九點準時散。' },
    { id: 'next', text: '想多聊的人，下次可以另外約。' },
  ] },
}, {
  id: 'interactive-slot10-contest', slotId: 'slot10', pair: ['achievement', 'fairness'], domain: '比賽',
  title: '最後六天，工作籌碼放在哪張桌？',
  setup: '你參加一場應用程式設計比賽，只剩最後六天。每一天可以拿來打磨主要功能，爭取好名次；也可以替作品加上多語介面和螢幕報讀支援，讓新住民和視障者也能使用。花在支援上的天數越多，涵蓋的語言和畫面越多，主要功能就越陽春。評審規則對這兩種做法都不另外加分或扣分。',
  interaction: { kind: 'resources', unit: '天', objects: ['工作籌碼 1', '工作籌碼 2', '工作籌碼 3', '工作籌碼 4', '工作籌碼 5', '工作籌碼 6'], sides: [
    { id: 'polish', label: '打磨主要功能', detail: '更有機會拿到好名次，也讓多語和報讀支援少做一天。', valueId: 'achievement' },
    { id: 'access', label: '做多語和報讀支援', detail: '讓更多不同處境的人用得上，也讓主要功能少磨一天。', valueId: 'fairness' },
  ] },
}, {
  id: 'interactive-slot10-accessible', slotId: 'slot10', pair: ['achievement', 'fairness'], domain: '工作',
  title: '加做另一種版本，你願意多留幾週？',
  setup: '你準備公開發表一份教學成果，展示自己的能力，目前的版本已經能基本使用。你可以照原定日期發表，把剩下的時間拿來修原版；也可以加做易讀與無障礙版本，讓閱讀需求不同的人也能使用，只是原版沒時間再修，發表日要往後延。主辦方兩種都接受。這裡只記下你願意多留幾週，不代表已經決定。',
  interaction: { kind: 'linked', min: 0, max: 8, step: 1, initial: 0, unit: '週', label: '額外準備時間', consequence: '每多留一週，發表日就往後延一週，那一週用來準備易讀與無障礙版本，不再修原版。0 週表示照原定日期發表。', presentation: { kind: 'calendar' }, metrics: [
    { label: '發表日往後延', unit: '週', source: 'value' },
  ] },
}, {
  id: 'interactive-slot10-notes', slotId: 'slot10', pair: ['achievement', 'fairness'], domain: '社群',
  title: '分享前四晚，先保留哪些工作？',
  setup: '你報名了作品分享，離分享日還有四個晚上，候選的工作有六件，每件要一整晚。三件是修改作品的不同部分，希望完整呈現自己的能力；另外三件是把環境觀察筆記整理成公開資料，供其他地區的團體參考。分享日期不變，兩邊都沒有人要求，這四晚只做得完四件，其餘延到分享之後。',
  interaction: { kind: 'priority', capacity: 4, keepLabel: '這次四晚先做', deferLabel: '分享後再做', resourceUnit: '個晚上', items: [
    { id: 'intro', label: '修改作品的開場', detail: '作品更完整，占用一整晚。', valueId: 'achievement' },
    { id: 'index', label: '整理觀察筆記的目錄', detail: '讓其他地區的團體更好查閱，占用一整晚。', valueId: 'fairness' },
    { id: 'structure', label: '調整作品的結構', detail: '呈現得更清楚，占用一整晚。', valueId: 'achievement' },
    { id: 'source', label: '補上資料的來源說明', detail: '讓公開資料更可靠，占用一整晚。', valueId: 'fairness' },
    { id: 'talk', label: '練習現場的講述', detail: '分享時更有把握，占用一整晚。', valueId: 'achievement' },
    { id: 'format', label: '統一資料的格式', detail: '其他團體更容易引用，占用一整晚。', valueId: 'fairness' },
  ] },
}];
