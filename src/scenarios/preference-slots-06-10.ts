import type { PreferenceScenario } from '../types';

/**
 * Slots 6–10 (#51), three five-step preference variants each. Option order follows the slot pair, so A is the
 * pair's first value; valueId is the only source of direction. Draft content written by an AI agent from
 * docs/content-authoring-notes.md and the published variants it rewrites; reviewed against the trade-off
 * conditions in the ticket, not psychometrically validated.
 *
 * Draft review, per slot (the agent's own check, not an author's sign-off):
 * - slot06: the allocation and slider versions become one either-or plan, so the lean is stated, not inferred from
 *   amounts. Both sides need effort and cost the same; the new 'project' variant keeps uncertainty out of A so it
 *   does not drift into a security trade-off.
 * - slot07: the slider thresholds are dropped; A is plain leisure, B a self-chosen result with no job pressure.
 *   'bonus' keeps both uses affordable and unrequested.
 * - slot08: the two published choices carry over unchanged. 'housewarming' adds a family setting where the brother
 *   can manage alone, so B is closeness, not rescue.
 * - slot09: the strike replies are split into short labels and costs. A always departs from an agreement nobody
 *   is harmed by, never a law or a nuisance to others.
 * - slot10: A keeps a better own result, B reaches people outside the close circle; organisers and judges accept
 *   both, so neither side is a rule. 'contest' names who gains without claiming any measured effect.
 */
export const preferenceSlots06To10: PreferenceScenario[] = [{
  id: 'preference-slot06-learning', slotId: 'slot06', pair: ['stimulation', 'achievement'], kind: 'preference', domain: '學習',
  title: '這次進修，往哪裡走？',
  setup: '假設接下來一個月，你有六次進修空檔，每次兩小時，只能整批報名一種安排。你可以報一系列沒試過的短課，木工、即興、聲音採集輪著上；也可以六次都拿來練熟悉的工作技能，完成一份自己在意、能公開展示的作品。兩邊費用差不多，都要認真投入，也都不是工作要求。',
  options: [
    { id: 'new-courses', label: '輪流上沒試過的短課', consequence: '每次都碰新的東西，也讓作品這個月做不出來。', valueId: 'stimulation' },
    { id: 'portfolio', label: '練熟悉的技能，把作品做完', consequence: '交出一份完整的作品，也少了這個月嘗試新領域的機會。', valueId: 'achievement' },
  ],
}, {
  id: 'preference-slot06-community', slotId: 'slot06', pair: ['stimulation', 'achievement'], kind: 'preference', domain: '社群',
  title: '活動時段，留給嘗試還是成果？',
  setup: '假設一個開放社群讓你報名這個月的活動，兩種班的費用和時間都一樣。你可以參加輪換的體驗場，每次試一種沒接觸過的活動；也可以加入固定的練習班，反覆練一項已有基礎的技能，準備月底的成果展示。這不是工作要求，兩種都有人帶領、都需要投入，報名後不能中途換班。',
  options: [
    { id: 'try', label: '參加輪換的體驗場', consequence: '每次試不同的活動，也趕不上月底的成果展示。', valueId: 'stimulation' },
    { id: 'showcase', label: '加入練習班準備成果展示', consequence: '月底能展示自己練出來的成果，也放下這個月試新活動的機會。', valueId: 'achievement' },
  ],
}, {
  id: 'preference-slot06-project', slotId: 'slot06', pair: ['stimulation', 'achievement'], kind: 'preference', domain: '工作',
  title: '下一季，接哪個案子？',
  setup: '假設你在接案，下一季只排得下一個案子，兩個案子的報酬和工時差不多。一個是你沒做過的領域，得從頭學起，每週都會碰到沒處理過的問題；另一個是你擅長的類型，規模比以往大，做好了會是作品集裡最完整的一件。兩邊都只要準時交付，也沒有人情壓力。',
  options: [
    { id: 'unfamiliar-field', label: '接沒做過的領域', consequence: '換到陌生的領域試試身手，也少了一件拿得出手的代表作。', valueId: 'stimulation' },
    { id: 'signature-work', label: '接擅長類型的大案子', consequence: '做出作品集裡最完整的一件，也放下這次換領域的機會。', valueId: 'achievement' },
  ],
}, {
  id: 'preference-slot07-study', slotId: 'slot07', pair: ['hedonism', 'achievement'], kind: 'preference', domain: '進修',
  title: '八週的進修，要不要報？',
  setup: '假設你可以報名一個八週的進修計畫，完成一份能展示自己能力的成果。每週要投入固定時數，會用掉原本吃飯、散步、看劇的空檔。不報名，就照常過這兩個月的休閒，這次也不會完成那份成果。這是你自己決定的事，工作上沒有要求。',
  options: [
    { id: 'keep-leisure', label: '不報名，照常過休閒時間', consequence: '這兩個月照常吃飯、散步、看劇，也不會有那份成果。', valueId: 'hedonism' },
    { id: 'join-course', label: '報名八週進修', consequence: '八週後完成一份能展示的成果，也少了原本的休閒空檔。', valueId: 'achievement' },
  ],
}, {
  id: 'preference-slot07-weekends', slotId: 'slot07', pair: ['hedonism', 'achievement'], kind: 'preference', domain: '生活',
  title: '週末作品集，要加入嗎？',
  setup: '假設朋友邀你參加六週的作品集共學，一起完成你在意的作品。這是自由參加，工作上沒有要求。你原本每個週末有一天可以自在吃飯、逛街、休息；加入後，那一天大半要拿來練習。不加入，就保留原來的週末，這次也不會完成那件作品。',
  options: [
    { id: 'keep-weekend', label: '保留原來的週末', consequence: '週末照樣自在吃飯、逛街、休息，也錯過這次完成作品的機會。', valueId: 'hedonism' },
    { id: 'join-group', label: '加入六週共學', consequence: '六週後完成一件自己在意的作品，也把週末大半拿來練習。', valueId: 'achievement' },
  ],
}, {
  id: 'preference-slot07-bonus', slotId: 'slot07', pair: ['hedonism', 'achievement'], kind: 'preference', domain: '旅行',
  title: '這筆獎金，怎麼用？',
  setup: '假設你拿到一筆獎金，剛好夠安排一件事。你可以去期待很久的海島放鬆一週，吃好吃的、什麼行程都不排；也可以報名一個密集的專業認證課程，結業前要交出一份完整的實作，通過後能證明自己的程度。兩種安排都在你能負擔的範圍內，也沒有人要求你選哪一個。',
  options: [
    { id: 'island-week', label: '去海島放鬆一週', consequence: '好好享受一週假期，也把認證課程往後延。', valueId: 'hedonism' },
    { id: 'certificate', label: '報名密集認證課程', consequence: '交出完整的實作、拿到認證，也少了這次放鬆的假期。', valueId: 'achievement' },
  ],
}, {
  // Keeps the published slot08-evening title and options (the preview tests open the run with it).
  id: 'preference-slot08-evening', slotId: 'slot08', pair: ['hedonism', 'care'], kind: 'preference', domain: '人際',
  title: '原本留給自己的那一晚。',
  setup: '假設你訂好了今晚的電影票，這部電影期待很久，下週就不演了。一位熟朋友傳訊息，想聊聊最近考慮換工作的事。朋友沒有遇到危機，可以找別人或改天再聊，只是希望今晚能和你說說。',
  options: [
    { id: 'keep-movie', label: '照原計畫去看電影，明天再回覆朋友', consequence: '看完期待很久的電影，也讓朋友今晚找不到你聊。', valueId: 'hedonism' },
    { id: 'talk-tonight', label: '今晚陪朋友聊聊', consequence: '朋友想聊的時候你在，也錯過在戲院看這部電影。', valueId: 'care' },
  ],
}, {
  id: 'preference-slot08-day-off', slotId: 'slot08', pair: ['hedonism', 'care'], kind: 'preference', domain: '人際',
  title: '只有半天的空檔。',
  setup: '假設這週你只空得出半天，原本打算去看一檔很喜歡、再過幾天就結束的展覽。一位親近的朋友下週要面試，想請你陪他挑衣服、聽他練自我介紹。這些他自己也能準備，只是有你陪著會比較安心。',
  options: [
    { id: 'see-exhibition', label: '去看展，這次不陪朋友', consequence: '把空檔留給自己喜歡的展覽，也讓朋友這次自己準備。', valueId: 'hedonism' },
    { id: 'help-friend', label: '陪朋友準備面試', consequence: '陪朋友把面試準備得更安心，也錯過這檔展覽。', valueId: 'care' },
  ],
}, {
  id: 'preference-slot08-housewarming', slotId: 'slot08', pair: ['hedonism', 'care'], kind: 'preference', domain: '家人',
  title: '搬家那天的晚餐。',
  setup: '假設你訂到一家很難訂的餐廳，這個週六晚上要去吃一頓期待很久的套餐，錯過這次就得再等好幾個月。同一天弟弟搬進新家，大件行李搬家公司會處理，他自己也能慢慢整理，只是希望晚上有人陪他拆箱、一起吃在新家的第一頓飯。',
  options: [
    { id: 'keep-booking', label: '照訂位去吃那頓套餐', consequence: '吃到期待很久的那一餐，也讓弟弟自己過搬家的第一晚。', valueId: 'hedonism' },
    { id: 'help-unpack', label: '去新家陪弟弟拆箱', consequence: '陪弟弟在新家吃第一頓飯，也錯過這次訂到的位子。', valueId: 'care' },
  ],
}, {
  id: 'preference-slot09-quiet-hours', slotId: 'slot09', pair: ['hedonism', 'rules'], kind: 'preference', domain: '聚會',
  title: '聚會的散場時間',
  setup: '假設你參加一場在共用空間辦的小聚會，大家借場地時約好九點散場。現在聊得正開心，場地方說可以付費再留半小時，音量也沒問題。不過，你們原本的約定還是九點結束，也還沒有人提議改時間。',
  options: [
    { id: 'stay-longer', label: '多留半小時再走', consequence: '把話聊完、一起分攤延長費，也沒照原本九點散場的約定。', valueId: 'hedonism' },
    { id: 'leave-on-time', label: '照約定九點散場', consequence: '照大家原本的約定走，也少了今晚多聊一會兒的開心。', valueId: 'rules' },
  ],
}, {
  id: 'preference-slot09-phone-free', slotId: 'slot09', pair: ['hedonism', 'rules'], kind: 'preference', domain: '生活',
  title: '無手機的晚餐',
  setup: '假設你和同事聚餐，事先約好吃飯時不拿手機，今晚也沒有工作或家裡的急事。桌上來了一份難得吃到的甜點，朋友們也都同意合照。你想拍幾張照片，但拿出手機就沒有遵守原來的約定。',
  options: [
    { id: 'take-photos', label: '拿出手機拍幾張，拍完就收', consequence: '留下今晚的甜點和合照，也沒照吃飯不拿手機的約定。', valueId: 'hedonism' },
    { id: 'keep-phone-away', label: '照約定把手機收著', consequence: '專心吃完這一餐，也少了留下照片的樂趣。', valueId: 'rules' },
  ],
}, {
  id: 'preference-slot09-rooftop', slotId: 'slot09', pair: ['hedonism', 'rules'], kind: 'preference', domain: '住處',
  title: '十點以後的頂樓。',
  setup: '假設你住的大樓有頂樓花園，住戶公約寫明晚上十點關閉。今晚天氣很好，你和室友在頂樓喝飲料、看夜景，轉眼就十點了。管理員已經下班，附近也沒有其他住戶，多待一會兒不會吵到人，但公約的時間沒有例外。',
  options: [
    { id: 'stay-up', label: '再多待一會兒', consequence: '多享受一段夜景和晚風，也沒照十點關閉的公約。', valueId: 'hedonism' },
    { id: 'go-down', label: '十點就收拾下樓', consequence: '照住戶公約的時間離開，也提早結束今晚的夜景。', valueId: 'rules' },
  ],
}, {
  id: 'preference-slot10-accessible', slotId: 'slot10', pair: ['achievement', 'fairness'], kind: 'preference', domain: '工作',
  title: '成果發表，要多做一個版本嗎？',
  setup: '假設你準備公開發表一份教學成果，展示自己的能力，目前的版本已經可以基本使用。你可以照原定日期發表，把剩下的時間拿來把原版修得更好；也可以加做易讀與無障礙版本，讓更多有不同需求的人使用，只是原版沒時間再修，發表也要延後一個月。主辦方兩種都接受。',
  options: [
    { id: 'polish-original', label: '照原定日期發表，把原版修好', consequence: '準時拿出修得最好的成果，也讓有不同需求的人這次比較難使用。', valueId: 'achievement' },
    { id: 'add-accessible', label: '加做易讀與無障礙版本', consequence: '讓更多不同需求的人用得上，也延後發表、原版少修一輪。', valueId: 'fairness' },
  ],
}, {
  id: 'preference-slot10-environment', slotId: 'slot10', pair: ['achievement', 'fairness'], kind: 'preference', domain: '社群',
  title: '先完成作品，還是多整理一份？',
  setup: '假設你報名了作品分享，正在修改作品，希望完整呈現自己的能力。手上還有一份環境觀察筆記，可以整理成公開資料，供不同地區的團體參考。整理這份資料，就少了修改作品的時間；只修作品，能把作品做到最好，這次就不會整理出公開資料。分享日期不變。',
  options: [
    { id: 'refine-work', label: '把時間都拿來修作品', consequence: '作品能修到最完整，也不會整理出這份公開資料。', valueId: 'achievement' },
    { id: 'share-notes', label: '分時間整理公開資料', consequence: '讓不同地區的團體有資料可參考，也讓作品少修幾輪。', valueId: 'fairness' },
  ],
}, {
  id: 'preference-slot10-contest', slotId: 'slot10', pair: ['achievement', 'fairness'], kind: 'preference', domain: '比賽',
  title: '比賽的最後一週。',
  setup: '假設你參加一場應用程式設計比賽，只剩最後一週。你可以把時間都拿來打磨作品的主要功能，爭取好名次；也可以替作品加上多語介面和螢幕報讀支援，讓新住民和視障者也能使用，只是功能會做得比較陽春。評審規則對這兩種做法都不另外加分或扣分。',
  options: [
    { id: 'polish-features', label: '把最後一週拿來打磨功能', consequence: '更有機會拿到好名次，也讓新住民和視障者這次用起來比較吃力。', valueId: 'achievement' },
    { id: 'add-languages', label: '加上多語介面和報讀支援', consequence: '讓更多不同處境的人用得上，也可能少拿一個名次。', valueId: 'fairness' },
  ],
}];
