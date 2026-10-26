import type { InteractiveScenario } from '../interactiveTypes';

/**
 * Slots 1–5 of the interactive bank (#68), three variants each, rewritten from the five-step questions in preference-slots-01-05.ts.
 * Side or card A leans to pair[0], B to pair[1]; valueId is the only source of direction. Variant order within a slot is the order
 * the preview draws from (Math.random 0 → first), and slot 1 lists allocate, adjust, choose in that order so specs can reach each kind first.
 * AI-drafted content with AI self-review in docs/interactive-content/slots-01-05.md; not reviewed by a person and not a
 * psychometrically validated item set.
 */
export const interactiveSlots01To05: InteractiveScenario[] = [{
  id: 'interactive-slot01-trip', slotId: 'slot01', pair: ['autonomy', 'security'], domain: '旅行',
  title: '六天的旅程，哪幾天自己排？',
  setup: '假設你要去一座以前去過的城市玩六天，住宿已經訂好。當地每天都有行程固定的一日團，交通、導覽和緊急聯絡都有人安排，費用跟自己玩差不多。哪一天自己排，想在哪裡多待就多待，臨時狀況得自己處理；哪一天跟團，就照團的時間表走。',
  interaction: {
    kind: 'allocate', unit: '天',
    cells: ['第一天', '第二天', '第三天', '第四天', '第五天', '第六天'],
    sides: [
      { id: 'self-planned', label: '自己排行程', detail: '想去哪裡、待多久都自己決定，也得自己應付臨時狀況。', valueId: 'autonomy' },
      { id: 'tour', label: '跟一日團', detail: '交通和突發狀況都有人照應，也照團的時間表走。', valueId: 'security' },
    ],
  },
}, {
  id: 'interactive-slot01-work', slotId: 'slot01', pair: ['autonomy', 'security'], domain: '工作',
  title: '明年的合作，照草案走嗎？',
  setup: '假設你正和公司談明年的合作方式。目前的草案是第一、二、四季領固定月薪，工作時間和做法照公司安排；第三季先試按件接案，自己決定接什麼、怎麼排時間，收入隨接案量起伏。公司說每一季都還能改。你已經存好半年的生活費，兩種做法都能發揮你的能力。',
  interaction: {
    kind: 'adjust', unit: '季',
    cells: ['第一季', '第二季', '第三季', '第四季'],
    sides: [
      { id: 'freelance', label: '按件接案', detail: '接什麼、怎麼排都自己決定，也接受這一季收入說不準。', valueId: 'autonomy' },
      { id: 'salaried', label: '領固定月薪', detail: '這一季收入穩定可預期，工作怎麼做也照公司安排。', valueId: 'security' },
    ],
    initial: [1, 1, 0, 1],
  },
}, {
  id: 'interactive-slot01-home', slotId: 'slot01', pair: ['autonomy', 'security'], domain: '居住',
  title: '這次租約，續住還是搬家？',
  setup: '假設你在比較兩間都租得起的房子。現在的住處可以續簽三年、房租不調，但房間怎麼布置、空間怎麼用，都得照房東的規定。新住處可以自己安排工作區和生活空間，只是租約一年一簽，續約時可能漲租。兩間的通勤和大小都差不多。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'move', label: '搬到能自己安排空間的新住處', content: '工作區和生活空間，都照自己的方式布置。', cost: '租約一年一簽，續約時房租可能調漲。', valueId: 'autonomy' },
      { id: 'renew', label: '續簽三年不調租的現住處', content: '房租和租期，三年內都有保障。', cost: '房間怎麼布置、空間怎麼用，仍照房東的規定。', valueId: 'security' },
    ],
  },
}, {
  id: 'interactive-slot02-proposal', slotId: 'slot02', pair: ['autonomy', 'rules'], domain: '工作',
  title: '這份提案，用誰的方法？',
  setup: '假設你在準備一份內部提案。團隊約好用同一份格式，方便大家對照；你想用自己設計的方式，把觀點說清楚。兩種方式都能完整交代內容，主管也允許例外。不過用自己的格式，就沒有照這次的共同約定，大家也得多花時間熟悉。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'own-method', label: '用自己設計的方式寫', content: '照自己的方式，把觀點說清楚。', cost: '沒照這次的共同約定，大家得多花時間熟悉。', valueId: 'autonomy' },
      { id: 'shared-format', label: '照團隊約好的格式寫', content: '大家可以直接對照，討論起來比較快。', cost: '自己想試的寫法，留到下次再說。', valueId: 'rules' },
    ],
  },
}, {
  id: 'interactive-slot02-reading', slotId: 'slot02', pair: ['autonomy', 'rules'], domain: '學習',
  title: '六週的共學，讀哪一章？',
  setup: '假設你參加一個線上共學小組，接下來六週，大家約好每週讀同一章，聚會時照章節討論。你對書後面幾章的主題更有興趣，照自己的順序也能讀完整本。你每週只有讀一章的時間。小組沒有強制規定，只是照約好的進度，大家比較好一起討論。',
  interaction: {
    kind: 'allocate', unit: '週',
    cells: ['第一週', '第二週', '第三週', '第四週', '第五週', '第六週'],
    sides: [
      { id: 'own-order', label: '讀自己想深入的章節', detail: '照自己的順序讀有興趣的主題，那週也沒照小組的進度。', valueId: 'autonomy' },
      { id: 'group-pace', label: '讀小組約好的那一章', detail: '和大家讀同一章、一起討論，想先讀的主題就往後放。', valueId: 'rules' },
    ],
  },
}, {
  id: 'interactive-slot02-cleaning', slotId: 'slot02', pair: ['autonomy', 'rules'], domain: '居住',
  title: '這個月的打掃，照原本的約定嗎？',
  setup: '假設你和室友約好，每週六上午一起打掃公共區域，方便彼此確認進度，這個月的四週目前都照這個約定排。你想把其中幾週改到平日晚上，照自己的作息打掃負責的區域。兩種做法都能打掃乾淨，室友也不急著用空間；但改時間的那週，就沒照原本的約定，大家得另外確認進度。',
  interaction: {
    kind: 'adjust', unit: '週',
    cells: ['第一週', '第二週', '第三週', '第四週'],
    sides: [
      { id: 'own-schedule', label: '平日晚上自己打掃', detail: '照自己的作息打掃，那週也沒照週六上午的約定。', valueId: 'autonomy' },
      { id: 'shared-time', label: '週六上午一起打掃', detail: '照室友間的約定走，也放下那週自己排時間的機會。', valueId: 'rules' },
    ],
    initial: [1, 1, 1, 1],
  },
}, {
  id: 'interactive-slot03-afternoons', slotId: 'slot03', pair: ['autonomy', 'care'], domain: '生活',
  title: '這個月的週末下午，照原本排的嗎？',
  setup: '假設接下來一個月，你有四個空閒的週末下午。你想選一條路線，做自己的散步紀錄；一位熟識的長輩也想請你陪著學整理手機相片。你原本打算這個月專心走路線，只答應長輩第二個下午。長輩平常有人協助，沒有急事，只是很珍惜和你一起學的時間；他說哪幾個下午都可以再調。',
  interaction: {
    kind: 'adjust', unit: '個下午',
    cells: ['第一個下午', '第二個下午', '第三個下午', '第四個下午'],
    sides: [
      { id: 'walk', label: '走自己的路線', detail: '照自己的想法走走、記錄，陪長輩的時間就少一些。', valueId: 'autonomy' },
      { id: 'photos', label: '陪長輩整理相片', detail: '陪長輩學整理相片，散步紀錄就晚一點做。', valueId: 'care' },
    ],
    initial: [0, 1, 0, 0],
  },
}, {
  id: 'interactive-slot03-moving', slotId: 'slot03', pair: ['autonomy', 'care'], domain: '居住',
  title: '空出來的週六，給誰？',
  setup: '假設你終於空出一整個週六，打算照自己的計畫重新整理房間、改排書櫃和工作角落。一位熟朋友這週剛搬家，問你能不能去幫忙拆箱、整理廚房。朋友找了搬家公司，也有其他人會去，只是希望你也在。兩件事都能改到下週，但這個週六只能做一件。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'own-room', label: '照自己的計畫整理房間', content: '改排書櫃和工作角落，這天照自己的步調過。', cost: '這次沒去幫朋友整理新家。', valueId: 'autonomy' },
      { id: 'help-move', label: '去幫朋友整理新家', content: '朋友搬家這天，你在旁邊幫忙拆箱、整理廚房。', cost: '自己的整理計畫往後延一週。', valueId: 'care' },
    ],
  },
}, {
  id: 'interactive-slot03-evenings', slotId: 'slot03', pair: ['autonomy', 'care'], domain: '生活',
  title: '這三週的晚上，留給哪件事？',
  setup: '假設接下來三週，你有六個可以自由安排的晚上，每晚兩小時。你想照自己的想法做一本攝影小誌；一位正在轉職的好友也想請你陪他練面試。朋友另有其他人幫忙，沒有急事。每個晚上只能做一件事，兩件事都可以之後再繼續。',
  interaction: {
    kind: 'allocate', unit: '晚',
    cells: ['第一週・週二', '第一週・週四', '第二週・週二', '第二週・週四', '第三週・週二', '第三週・週四'],
    sides: [
      { id: 'zine', label: '做攝影小誌', detail: '照自己的想法創作，陪朋友就少一些。', valueId: 'autonomy' },
      { id: 'interview', label: '陪朋友練面試', detail: '多陪朋友準備，小誌就得慢一點做。', valueId: 'care' },
    ],
  },
}, {
  id: 'interactive-slot04-work', slotId: 'slot04', pair: ['stimulation', 'security'], domain: '工作',
  title: '這兩週，要去新團隊支援嗎？',
  setup: '公司邀你到另一個團隊支援兩週，薪水不變，你也可以選擇留下。新團隊的專案是你沒做過的，會有基本交接，但每天要做什麼還沒排定。留在原團隊，就能照排好的時間完成熟悉的工作。兩邊都能如期交付。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'join', label: '去新團隊支援兩週', content: '做沒做過的專案，試試新的工作方式。', cost: '每天要做什麼還沒排定，比較難預料。', valueId: 'stimulation' },
      { id: 'stay', label: '留在原團隊', content: '照排好的時間，完成熟悉的工作。', cost: '放下這次換環境的機會。', valueId: 'security' },
    ],
  },
}, {
  id: 'interactive-slot04-weekends', slotId: 'slot04', pair: ['stimulation', 'security'], domain: '生活',
  title: '四個週末，照原本排的走嗎？',
  setup: '假設接下來一個月有四個週末，你已經大致排好：三個週末走熟悉的路線、散步吃飯，照預計的時間回家；第三個週末去沒去過的小鎮參加一日體驗，當天行程還沒確定。交通和預算都準備好了，也沒有非去不可的人情或工作，現在改也不用付取消費。',
  interaction: {
    kind: 'adjust', unit: '個週末',
    cells: ['第一個週末', '第二個週末', '第三個週末', '第四個週末'],
    sides: [
      { id: 'explore', label: '去陌生小鎮體驗', detail: '去新地方試新活動，也接受當天行程說不準。', valueId: 'stimulation' },
      { id: 'familiar', label: '走熟悉的路線', detail: '照自己知道的步調過，也放下去新地方的機會。', valueId: 'security' },
    ],
    initial: [1, 1, 0, 1],
  },
}, {
  id: 'interactive-slot04-workshops', slotId: 'slot04', pair: ['stimulation', 'security'], domain: '學習',
  title: '六堂工作坊，選哪一種？',
  setup: '假設公司補助你上六堂晚間的單堂工作坊，每堂兩小時，時間和費用都一樣。每一堂都有兩種可以選：一種是你從沒接觸過的主題，第一次開，內容和進度會邊上邊調整；另一種屬於你熟悉的領域，已經開過很多期，流程和講義都排得清清楚楚。兩種都不影響工作考核。',
  interaction: {
    kind: 'allocate', unit: '堂',
    cells: ['第一堂', '第二堂', '第三堂', '第四堂', '第五堂', '第六堂'],
    sides: [
      { id: 'new-topic', label: '上陌生主題', detail: '學點完全沒碰過的東西，也接受內容和進度說不準。', valueId: 'stimulation' },
      { id: 'known-topic', label: '上熟悉的主題', detail: '照清楚的流程一步步上，也放下接觸新東西的機會。', valueId: 'security' },
    ],
  },
}, {
  id: 'interactive-slot05-holiday', slotId: 'slot05', pair: ['stimulation', 'tradition'], domain: '生活',
  title: '四天連假，照原本排的過嗎？',
  setup: '假設你有四天連假，可以自己安排，也沒有需要陪伴或照顧的人。你回到熟悉的節慶小鎮，每天都有長輩帶著糊燈籠、練醒獅鼓法，教的是傳下來的老技藝；附近新開了一種你從沒試過的戶外體驗，每天都有梯次。你先排好前兩天去戶外體驗、後兩天跟長輩學技藝，兩邊都還能免費改期，花費和累的程度也差不多。',
  interaction: {
    kind: 'adjust', unit: '天',
    cells: ['第一天', '第二天', '第三天', '第四天'],
    sides: [
      { id: 'outdoor', label: '去新的戶外體驗', detail: '試從沒玩過的活動，也少一天跟長輩學技藝。', valueId: 'stimulation' },
      { id: 'craft', label: '跟長輩學老技藝', detail: '把節慶的老技藝接著學下去，也少一天試新活動。', valueId: 'tradition' },
    ],
    initial: [0, 0, 1, 1],
  },
}, {
  id: 'interactive-slot05-winter', slotId: 'slot05', pair: ['stimulation', 'tradition'], domain: '飲食',
  title: '冬至聚會的六道菜，怎麼做？',
  setup: '假設今年由你負責朋友間的冬至聚會，桌上要準備六道菜。這群朋友每年都照上一輩傳下來的做法，一起搓湯圓、煮鹹湯圓，再配幾道家常老菜。今年你也可以把其中幾道換成料理實驗，大家一起試從沒做過的異國食譜。每道菜準備起來差不多花時間和錢，朋友們也都說照你的安排。',
  interaction: {
    kind: 'allocate', unit: '道菜',
    cells: ['第一道', '第二道', '第三道', '第四道', '第五道', '第六道'],
    sides: [
      { id: 'new-recipe', label: '試新的異國食譜', detail: '和大家試沒做過的料理，這道就不照老做法。', valueId: 'stimulation' },
      { id: 'old-recipe', label: '照傳下來的老做法', detail: '把老做法再延續一年，也放下這道試新料理的機會。', valueId: 'tradition' },
    ],
  },
}, {
  id: 'interactive-slot05-festival', slotId: 'slot05', pair: ['stimulation', 'tradition'], domain: '社群',
  title: '同一天，去工藝日還是新體驗？',
  setup: '假設你熟悉的社區每年都有傳統工藝日。你參加了很多年，跟老師傅做竹編，聽大家聊這門手藝的由來。今年同一天，還有一場只辦一次的聲音採集與即興創作體驗，都是你沒試過的活動。兩場只能去一場，都沒有工作要做，也沒有人要求你一定要去。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'new-experience', label: '去只辦一次的新體驗', content: '試試聲音採集和即興創作，都是沒碰過的活動。', cost: '錯過今年的工藝日。', valueId: 'stimulation' },
      { id: 'craft-day', label: '照往年參加工藝日', content: '跟老師傅做竹編，聽大家聊這門手藝的由來。', cost: '錯過只辦一次的新體驗。', valueId: 'tradition' },
    ],
  },
}];
