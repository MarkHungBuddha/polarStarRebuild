import type { InteractiveScenario } from '../interactiveTypes';

/**
 * Slots 6–10 (#69), three interactive variants each, rewritten from the five-step questions of the same slots with the same value
 * pairs. Side or option A leans to the pair's first value; valueId is the only source of direction. Each slot is ordered
 * allocate or adjust, then choose, then adjust or allocate. AI-drafted and AI-reviewed, approved by the project owner on 2026-10-26, not psychometrically validated; the
 * per-variant rationale is in docs/interactive-content/slots-06-10.md.
 */
export const interactiveSlots06To10: InteractiveScenario[] = [{
  id: 'interactive-slot06-sessions', slotId: 'slot06', pair: ['stimulation', 'achievement'], domain: '學習',
  title: '六次進修空檔，怎麼排？',
  setup: '假設接下來三週，你有一張六次的進修課卡，每次兩小時，兩邊的課都能用。一邊是輪流開的短課，木工、即興、聲音採集，每次都是沒碰過的東西；另一邊是工作室的練習時段，可以練熟悉的技能，把一份想公開展示的作品做完。作品大約要五、六次才做得完，次數少就只能展示做到一半的版本。這不是工作要求。',
  interaction: {
    kind: 'allocate', unit: '次',
    cells: ['第一週・週二', '第一週・週六', '第二週・週二', '第二週・週六', '第三週・週二', '第三週・週六'],
    sides: [
      { id: 'short-courses', label: '上沒試過的短課', detail: '每次碰一種新東西，也讓作品晚一步完成。', valueId: 'stimulation' },
      { id: 'portfolio', label: '練技能做作品', detail: '把作品往完成推一步，也少一次試新領域的機會。', valueId: 'achievement' },
    ],
  },
}, {
  id: 'interactive-slot06-project', slotId: 'slot06', pair: ['stimulation', 'achievement'], domain: '工作',
  title: '下一季，接哪個案子？',
  setup: '假設你在接案，下一季只排得下一個案子，兩個案子的報酬和工時差不多。一個是你沒做過的領域，得從頭學起，每週都會碰到沒處理過的問題；另一個是你擅長的類型，規模比以往大，做好了會是作品集裡最完整的一件。兩邊都只要準時交付，也沒有人情壓力。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'unfamiliar-field', label: '接沒做過的領域', content: '從頭學一個陌生領域，每週都有沒處理過的問題要摸索。', cost: '這一季不會多出代表作，擅長的手藝也先擱著。', valueId: 'stimulation' },
      { id: 'signature-work', label: '接擅長類型的大案子', content: '用熟悉的本事做一個比以往更大的案子，完成後是作品集裡最完整的一件。', cost: '這一季碰不到新領域，每週面對的大多是熟悉的問題。', valueId: 'achievement' },
    ],
  },
}, {
  id: 'interactive-slot06-community', slotId: 'slot06', pair: ['stimulation', 'achievement'], domain: '社群',
  title: '這個月的週六活動，照報名的走嗎？',
  setup: '假設你在一個開放社群報了這個月四個週六的活動，報名系統已經先幫你排好：第二個週六去輪換的體驗場，試一種沒接觸過的活動；其他三個週六去固定的練習班，反覆練一項已經有基礎的技能，準備月底的成果展示。兩種場次都有人帶、都要投入，月底前都能免費改。練習班去得越少，月底能展示的就越少。',
  interaction: {
    kind: 'adjust', unit: '個週六',
    cells: ['第一個週六', '第二個週六', '第三個週六', '第四個週六'],
    sides: [
      { id: 'try', label: '去體驗場試新活動', detail: '試一種沒碰過的活動，也讓月底的展示少練一次。', valueId: 'stimulation' },
      { id: 'practice', label: '去練習班準備展示', detail: '多練一次，月底的成果更完整，也少試一種新活動。', valueId: 'achievement' },
    ],
    initial: [1, 0, 1, 1],
  },
}, {
  id: 'interactive-slot07-weekends', slotId: 'slot07', pair: ['hedonism', 'achievement'], domain: '生活',
  title: '六週的作品集共學，週末照排好的走嗎？',
  setup: '假設朋友邀你參加六週的作品集共學，一起完成一件你在意的作品。你已經先在行事曆上排好：六個週末裡，有四個週六去共學，第三和第六個週末照舊留給自己，自在吃飯、逛街、休息。這是自由參加，工作上沒有要求，哪一週不去只要前一天說一聲。去得越少，作品越可能做不完。',
  interaction: {
    kind: 'adjust', unit: '個週末',
    cells: ['第一個週末', '第二個週末', '第三個週末', '第四個週末', '第五個週末', '第六個週末'],
    sides: [
      { id: 'keep-weekend', label: '留給自己休息', detail: '自在吃飯、逛街、休息，也讓作品少推進一週。', valueId: 'hedonism' },
      { id: 'join-group', label: '去共學做作品', detail: '作品往完成多推一週，也少一個自在的週末。', valueId: 'achievement' },
    ],
    initial: [1, 1, 0, 1, 1, 0],
  },
}, {
  id: 'interactive-slot07-bonus', slotId: 'slot07', pair: ['hedonism', 'achievement'], domain: '旅行',
  title: '這筆獎金，怎麼用？',
  setup: '假設你拿到一筆獎金，剛好夠安排一件事。你可以去期待很久的海島放鬆一週，吃好吃的、什麼行程都不排；也可以報名一個密集的專業認證課程，結業前要交出一份完整的實作，通過後能證明自己的程度。兩種安排都在你能負擔的範圍內，也沒有人要求你選哪一個。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'island-week', label: '去海島放鬆一週', content: '吃好吃的、什麼行程都不排，好好放一週假。', cost: '認證課程往後延，這次不會交出實作，也拿不到認證。', valueId: 'hedonism' },
      { id: 'certificate', label: '報名密集認證課程', content: '交出一份完整的實作，通過後能證明自己的程度。', cost: '這次沒有放鬆的假期，下班時間大多拿來趕實作。', valueId: 'achievement' },
    ],
  },
}, {
  id: 'interactive-slot07-study', slotId: 'slot07', pair: ['hedonism', 'achievement'], domain: '進修',
  title: '八週的線上進修，哪幾週要上？',
  setup: '假設你報名了一個八週的線上進修，可以自己決定哪幾週上課。每週有一個晚上能拿來上課和做作業；不上課的那週，這個晚上就照常吃飯、散步、看劇。八週都上，能完成一份展示自己能力的成果；上得越少，成果越單薄。這是你自己決定的事，工作上沒有要求。',
  interaction: {
    kind: 'allocate', unit: '週',
    cells: ['第 1 週', '第 2 週', '第 3 週', '第 4 週', '第 5 週', '第 6 週', '第 7 週', '第 8 週'],
    sides: [
      { id: 'leisure', label: '照常休閒', detail: '吃飯、散步、看劇照舊，也讓成果少做一週。', valueId: 'hedonism' },
      { id: 'study', label: '上課做作業', detail: '成果多完成一週，也少一晚原本的休閒。', valueId: 'achievement' },
    ],
  },
}, {
  id: 'interactive-slot08-afternoons', slotId: 'slot08', pair: ['hedonism', 'care'], domain: '人際',
  title: '這個月的四個週六下午，留給誰？',
  setup: '假設這個月有四個週六下午空著，你想留給自己：看一檔喜歡的展、去常去的咖啡店坐坐、把想看的電影看完。一位剛搬到附近的好友對環境還不熟，想找你一起逛市場、組家具、認識附近。他自己慢慢來也可以，只是有你陪會比較開心。每個下午只能做一件事。',
  interaction: {
    kind: 'allocate', unit: '個下午',
    cells: ['第一個週六', '第二個週六', '第三個週六', '第四個週六'],
    sides: [
      { id: 'own-time', label: '留給自己', detail: '做自己喜歡的事，也少一次陪朋友熟悉新家。', valueId: 'hedonism' },
      { id: 'with-friend', label: '陪朋友熟悉新家', detail: '陪朋友把新生活安頓好，也少一個自己的下午。', valueId: 'care' },
    ],
  },
}, {
  id: 'interactive-slot08-evening', slotId: 'slot08', pair: ['hedonism', 'care'], domain: '人際',
  title: '原本留給自己的那一晚，要讓出來嗎？',
  setup: '假設你訂好了今晚的電影票，這部電影期待很久，下週就下檔了。一位熟朋友傳訊息，想聊聊最近考慮換工作的事。朋友沒有遇到危機，可以找別人或改天再聊，只是希望今晚能和你說說。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'keep-movie', label: '照原計畫去看電影', content: '看完期待很久的電影，明天再回朋友的訊息。', cost: '朋友今晚找不到你聊，得自己先想想或找別人。', valueId: 'hedonism' },
      { id: 'talk-tonight', label: '今晚陪朋友聊聊', content: '朋友想聊換工作的時候，你在。', cost: '這部電影就錯過在戲院看的機會。', valueId: 'care' },
    ],
  },
}, {
  id: 'interactive-slot08-unpacking', slotId: 'slot08', pair: ['hedonism', 'care'], domain: '家人',
  title: '這週四個晚上，照原本排的過嗎？',
  setup: '假設你這週四個晚上都已經排給自己：週一追新出的影集、週二去新開的拉麵店、週三把小說看完、週四早點泡澡睡覺。弟弟上週末剛搬進新家，大件行李有搬家公司處理，他自己也能慢慢整理，只是希望晚上有人陪他拆箱、聊聊天。每個晚上只能做一件事。',
  interaction: {
    kind: 'adjust', unit: '晚',
    cells: ['週一晚上', '週二晚上', '週三晚上', '週四晚上'],
    sides: [
      { id: 'own-plans', label: '做自己排的事', detail: '把排給自己的事做完，也少一晚陪弟弟。', valueId: 'hedonism' },
      { id: 'help-unpack', label: '去陪弟弟拆箱', detail: '陪弟弟在新家多待一晚，也放下那晚排好的事。', valueId: 'care' },
    ],
    initial: [0, 0, 0, 0],
  },
}, {
  id: 'interactive-slot09-rooftop', slotId: 'slot09', pair: ['hedonism', 'rules'], domain: '居住',
  title: '四個晚上的頂樓，十點就下樓嗎？',
  setup: '假設你住的大樓有頂樓花園，住戶公約寫明晚上十點關閉，沒有例外。這週有四個晚上天氣很好，你和室友約好上去喝飲料、看夜景。管理員十點就下班，頂樓離住戶樓層遠，多待半小時不會吵到人。每晚到了十點，你們可以再待半小時，或照公約收拾下樓。',
  interaction: {
    kind: 'allocate', unit: '晚',
    cells: ['週二晚上', '週三晚上', '週五晚上', '週六晚上'],
    sides: [
      { id: 'stay-up', label: '再待半小時', detail: '多享受一段夜景和晚風，也沒照十點關閉的公約。', valueId: 'hedonism' },
      { id: 'go-down', label: '十點收拾下樓', detail: '照住戶公約的時間離開，也提早結束這晚的夜景。', valueId: 'rules' },
    ],
  },
}, {
  id: 'interactive-slot09-phone-free', slotId: 'slot09', pair: ['hedonism', 'rules'], domain: '生活',
  title: '說好不拿手機的晚餐，要拿出來拍照嗎？',
  setup: '假設你和同事聚餐，事先約好吃飯時不拿手機，今晚也沒有工作或家裡的急事。桌上來了一份難得吃到的甜點，朋友們也都同意合照。你想拍幾張照片，但拿出手機就沒有遵守原來的約定。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'take-photos', label: '拿出手機拍幾張，拍完就收', content: '留下今晚的甜點和大家的合照。', cost: '沒照吃飯不拿手機的約定，雖然只有一下子。', valueId: 'hedonism' },
      { id: 'keep-phone-away', label: '照約定把手機收著', content: '照大家說好的，專心把這一餐吃完。', cost: '今晚的甜點和合照，這次不會留下照片。', valueId: 'rules' },
    ],
  },
}, {
  id: 'interactive-slot09-quiet-hours', slotId: 'slot09', pair: ['hedonism', 'rules'], domain: '聚會',
  title: '這個月的四次聚會，九點就散嗎？',
  setup: '假設你參加的讀書會這個月在共用空間聚四次，大家借場地時約好九點散場，場地也都只預約到九點。場地方說，當晚想延長半小時，現場付費就好，音量也沒問題；每次也都有幾位想留下來多聊。不過，大家的約定還是九點結束，也還沒有人提議改。多留的話，你會一起分攤延長費。',
  interaction: {
    kind: 'adjust', unit: '次',
    cells: ['第一次聚會', '第二次聚會', '第三次聚會', '第四次聚會'],
    sides: [
      { id: 'stay-longer', label: '多留半小時再走', detail: '把話聊完，也沒照九點散場的約定。', valueId: 'hedonism' },
      { id: 'leave-on-time', label: '照約定九點散場', detail: '照大家說好的時間走，也少了多聊一會兒的開心。', valueId: 'rules' },
    ],
    initial: [1, 1, 1, 1],
  },
}, {
  id: 'interactive-slot10-contest', slotId: 'slot10', pair: ['achievement', 'fairness'], domain: '比賽',
  title: '比賽的最後六天，花在哪裡？',
  setup: '假設你參加一場應用程式設計比賽，只剩最後六天。每一天可以拿來打磨作品的主要功能，爭取好名次；也可以替作品加上多語介面和螢幕報讀支援，讓新住民和視障者也能使用。花在支援上的天數越多，涵蓋的語言和畫面越多，主要功能就越陽春。評審規則對這兩種做法都不另外加分或扣分。',
  interaction: {
    kind: 'allocate', unit: '天',
    cells: ['第 1 天', '第 2 天', '第 3 天', '第 4 天', '第 5 天', '第 6 天'],
    sides: [
      { id: 'polish-features', label: '打磨主要功能', detail: '更有機會拿到好名次，也讓多語和報讀支援少做一天。', valueId: 'achievement' },
      { id: 'add-access', label: '做多語和報讀支援', detail: '讓更多不同處境的人用得上，也讓主要功能少磨一天。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot10-accessible', slotId: 'slot10', pair: ['achievement', 'fairness'], domain: '工作',
  title: '成果發表，要多做一個版本嗎？',
  setup: '假設你準備公開發表一份教學成果，展示自己的能力，目前的版本已經可以基本使用。你可以照原定日期發表，把剩下的時間拿來把原版修得更好；也可以加做易讀與無障礙版本，讓更多有不同需求的人使用，只是原版沒時間再修，發表也要延後一個月。主辦方兩種都接受。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'polish-original', label: '照原定日期發表，把原版修好', content: '準時拿出修得最好的成果，展現自己的程度。', cost: '有不同閱讀需求的人，這次比較難使用這份成果。', valueId: 'achievement' },
      { id: 'add-accessible', label: '加做易讀與無障礙版本', content: '讓更多有不同需求的人用得上這份成果。', cost: '發表延後一個月，原版也少修一輪。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot10-notes', slotId: 'slot10', pair: ['achievement', 'fairness'], domain: '社群',
  title: '分享前的四個晚上，照原本排的走嗎？',
  setup: '假設你報名了作品分享，離分享日還有四個晚上，你已經排好：三個晚上修改作品，希望完整呈現自己的能力；第三個晚上把手上的環境觀察筆記整理成公開資料，供不同地區的團體參考。資料多整理一晚就更完整好用，作品也就少修一輪。分享日期不變，兩件事都沒有人要求。',
  interaction: {
    kind: 'adjust', unit: '晚',
    cells: ['第一個晚上', '第二個晚上', '第三個晚上', '第四個晚上'],
    sides: [
      { id: 'refine-work', label: '修改作品', detail: '作品多修一輪、更完整，也讓公開資料少整理一晚。', valueId: 'achievement' },
      { id: 'share-notes', label: '整理公開資料', detail: '讓其他地區的團體多一份可參考的資料，也讓作品少修一輪。', valueId: 'fairness' },
    ],
    initial: [0, 0, 1, 0],
  },
}];
