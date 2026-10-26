import type { InteractiveScenario } from '../interactiveTypes';

/**
 * Slots 11–15, three interactive variants each (#60). AI drafts rewritten from the five-step variants in
 * preference-slots-11-15.ts, keeping each slot's pair and situations; not authored or reviewed by a person, and no
 * psychometric validity is claimed. Drafting and self-review notes: docs/interactive-content/slots-11-15.md.
 * In every slot the first variant allocates, the second chooses a plan and the third adjusts a current arrangement
 * that the setup already describes. Side or card A leans to the pair's first value; valueId is the only source of direction.
 */
export const interactiveSlots11To15: InteractiveScenario[] = [{
  id: 'interactive-slot11-fund', slotId: 'slot11', pair: ['influence', 'fairness'], domain: '社群',
  title: '六場社區活動，誰來定內容？',
  setup: '假設你替社區爭取到一筆活動預算，今年要辦六場活動，每場內容都可以由你獨自定案，你也已經想好一套完整方案。你也可以把其中幾場交給不同年齡、語言和行動需求的居民代表一起決定，補進你沒顧到的需求，只是那幾場就不照你的方案走。兩種做法都公開透明，也都符合規定。這六場活動，你會怎麼安排？',
  interaction: {
    kind: 'allocate', unit: '場',
    cells: ['三月場', '五月場', '七月場', '九月場', '十月場', '十二月場'],
    sides: [
      { id: 'own-plan', label: '照我的方案辦', detail: '活動照你的規劃完整進行，也比較難補進其他居民的需求。', valueId: 'influence' },
      { id: 'residents', label: '交給居民代表決定', detail: '顧到更多不同處境的居民，那一場也就不由你定案。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot11-event', slotId: 'slot11', pair: ['influence', 'fairness'], domain: '社群',
  title: '分享會的議程，要讓出一段嗎？',
  setup: '假設你負責辦一場公開分享會，主辦單位讓你決定主題和報名名額，你已經擬好完整的議程。聽障、新住民和高齡參與者的代表來信，希望共同安排其中一段議程和三分之一的名額。兩種做法都符合主辦單位的規則。報名下週一開放，你得在週末前定案。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'own-agenda', label: '照我擬的議程和名額開放報名', content: '主題、講者和名額都照你的構想，活動走向清楚一致。', cost: '代表們想加的那段議程排不進來，有些人的需求這次顧不到。', valueId: 'influence' },
      { id: 'co-arrange', label: '讓代表們共同安排一段議程和部分名額', content: '讓聽障、新住民和高齡參與者也用得上這場活動。', cost: '你得拿掉一段自己的安排，活動不完全照你的想法進行。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot11-office', slotId: 'slot11', pair: ['influence', 'fairness'], domain: '工作',
  title: '新辦公區的四個區域，照草案定嗎？',
  setup: '假設公司請你規劃新辦公區，也讓你獨自定案。你的草案已經排好：開放座位區、會議室和茶水間由你配置，安靜工作區說好交給同事代表決定。坐輪椅、需要安靜空間和上夜班的同事代表希望多參與幾區，補進你沒想到的需求。不管怎麼分，預算和完工時間都一樣，現在調整也來得及。這四個區域，你會怎麼安排？',
  interaction: {
    kind: 'adjust', unit: '區',
    cells: ['開放座位區', '會議室', '茶水間', '安靜工作區'],
    sides: [
      { id: 'own-layout', label: '照我的配置定案', detail: '照你的判斷完成，也比較難顧到不同處境同事的需求。', valueId: 'influence' },
      { id: 'colleagues', label: '交給同事代表決定', detail: '讓不同處境的同事用得順手，那一區也就不由你決定。', valueId: 'fairness' },
    ],
    initial: [0, 0, 0, 1],
  },
}, {
  id: 'interactive-slot12-outing', slotId: 'slot12', pair: ['influence', 'care'], domain: '朋友',
  title: '接下來四次聚會，誰來籌備？',
  setup: '假設朋友聚會的預算和行程一直由你決定。接下來四個月各有一次聚會，一位親近的朋友說想試著籌備，希望你支持他試試看。大家沒有特殊的安全或無障礙需求，不管誰籌備，你都會到場。每次聚會只由一個人定案。這四次聚會，你會怎麼安排？',
  interaction: {
    kind: 'allocate', unit: '次',
    cells: ['第一次聚會', '第二次聚會', '第三次聚會', '第四次聚會'],
    sides: [
      { id: 'self-plan', label: '由我籌備', detail: '預算和行程照你的掌握，朋友也少一次試著安排的機會。', valueId: 'influence' },
      { id: 'friend-plans', label: '交給朋友籌備', detail: '支持朋友試著安排，那一次你也放下對細節的掌握。', valueId: 'care' },
    ],
  },
}, {
  id: 'interactive-slot12-project', slotId: 'slot12', pair: ['influence', 'care'], domain: '社群',
  title: '企劃的最後方向，這次誰來定？',
  setup: '假設你和一位熟識的夥伴自願一起做社區小專案，原本說好由你決定最後方向。下週要交企劃，你們各有一個方向。夥伴說這次想練習主導，分工上的約定也允許這樣調整。不管由誰定案，兩個人都會繼續投入。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'keep-final-say', label: '最後方向由我來定', content: '企劃照你的判斷定案，你對最後的成果也比較放心。', cost: '夥伴這次練不到主導，他的方向只能當參考。', valueId: 'influence' },
      { id: 'hand-over', label: '這次讓夥伴定最後方向', content: '你在旁邊支援，讓夥伴完整練習一次主導。', cost: '企劃可能不是你最想要的方向，你得照他的決定做。', valueId: 'care' },
    ],
  },
}, {
  id: 'interactive-slot12-flat', slotId: 'slot12', pair: ['influence', 'care'], domain: '生活',
  title: '下個月的家務，照說好的讓室友排嗎？',
  setup: '假設你和一位感情很好的室友合租，家務分工和採買一直由你安排。室友想試著自己排，你們上週先說好：下個月第一週照你的排法，後三週讓室友排。室友的排法可能跟你習慣的不同，但不會多花錢，也不會讓誰比較累，月初前都還能改。下個月這四週，你會怎麼安排？',
  interaction: {
    kind: 'adjust', unit: '週',
    cells: ['第一週', '第二週', '第三週', '第四週'],
    sides: [
      { id: 'self-schedule', label: '由我來排', detail: '家裡照你的安排運作，室友也少一週試著安排的機會。', valueId: 'influence' },
      { id: 'roommate-schedules', label: '讓室友來排', detail: '支持室友試著安排，那一週你也放下對家務的掌握。', valueId: 'care' },
    ],
    initial: [0, 1, 1, 1],
  },
}, {
  id: 'interactive-slot13-club', slotId: 'slot13', pair: ['influence', 'tradition'], domain: '社群',
  title: '今年四場例行活動，照誰的安排？',
  setup: '假設你剛接任一個自願社團的活動召集人，章程允許你調整年度活動。今年有四場例行活動，老成員希望沿用傳了多年的開場儀式和流程，你則有一套想親自決定的新安排。兩種都可行，原來的儀式也沒有排斥任何人。每場只能照其中一種方式進行。這四場活動，你會怎麼安排？',
  interaction: {
    kind: 'allocate', unit: '場',
    cells: ['春季聚會', '夏季出遊', '秋季成果展', '年終聚餐'],
    sides: [
      { id: 'own-format', label: '照我的新安排', detail: '那一場照你的規劃進行，多年的開場儀式也停一次。', valueId: 'influence' },
      { id: 'keep-ritual', label: '沿用傳下來的流程', detail: '讓社團多年的儀式延續下去，也少了照自己想法安排的空間。', valueId: 'tradition' },
    ],
  },
}, {
  id: 'interactive-slot13-alumni', slotId: 'slot13', pair: ['influence', 'tradition'], domain: '校友',
  title: '返校日的開場，照誰的安排？',
  setup: '假設校友會推你負責今年的返校日，當天流程由你決定。多年來返校日都從一起唱校歌、在老榕樹下合照開始；你想用同一段時間，改成自己規劃的開場。兩種只能選一種，都順利可行，舊流程也沒有讓誰不自在。流程這週五要寄給校友。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'own-opening', label: '照我的規劃重新安排開場', content: '當天從你設計的開場開始，流程照你的想法走。', cost: '唱校歌和老榕樹下合照的慣例，今年停一次。', valueId: 'influence' },
      { id: 'keep-opening', label: '沿用唱校歌、老榕樹下合照', content: '讓校友會多年的開場延續下去。', cost: '你規劃的開場今年用不上，流程裡少了你自己的安排。', valueId: 'tradition' },
    ],
  },
}, {
  id: 'interactive-slot13-exhibition', slotId: 'slot13', pair: ['influence', 'tradition'], domain: '工作',
  title: '工藝展的四個展區，照歷年的方式擺嗎？',
  setup: '假設地方工藝展請你策展，展品的順序和介紹方式都由你決定。籌備組已經照師傅們歷年的方式，先把四個展區排好了；你有自己的完整構想，可以把任何一區改成照你的安排。兩種方式都能把作品說清楚，沒有哪一種比較好，現在改也來得及。這四個展區，你會怎麼安排？',
  interaction: {
    kind: 'adjust', unit: '區',
    cells: ['入口區', '器物區', '織品區', '木作區'],
    sides: [
      { id: 'own-curation', label: '照我的構想安排', detail: '展區照你的構想呈現，也不再沿用師傅們歷年的擺法。', valueId: 'influence' },
      { id: 'masters-way', label: '沿用師傅們的方式', detail: '讓師傅們的老做法延續下去，也接受那一區不照你的構想。', valueId: 'tradition' },
    ],
    initial: [1, 1, 1, 1],
  },
}, {
  id: 'interactive-slot14-preparation', slotId: 'slot14', pair: ['security', 'fairness'], domain: '社區',
  title: '六個小時的防災準備，先做哪邊？',
  setup: '假設接下來兩週，你空出六個一小時的時段做防災準備。你可以整理自己的備援資料、緊急聯絡清單和防災物品，為生活中的意外做準備；也可以幫社區整理多語與無障礙防災資訊，讓不熟悉中文或行動不便的人更容易取得。目前沒有災情，兩件事都能延後，社區的工作也不是你的義務。每個時段只能做一件事。這六個時段，你會怎麼安排？',
  interaction: {
    kind: 'allocate', unit: '小時',
    cells: ['第一週・週一', '第一週・週三', '第一週・週五', '第二週・週一', '第二週・週三', '第二週・週五'],
    sides: [
      { id: 'own-backup', label: '整理自己的防災準備', detail: '自己的生活多一分準備，社區的資訊也晚一點整理好。', valueId: 'security' },
      { id: 'accessible-info', label: '整理社區的防災資訊', detail: '讓更多人拿得到防災資訊，自己的準備也晚一點做。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot14-bonus', slotId: 'slot14', pair: ['security', 'fairness'], domain: '金錢',
  title: '多出來的五千元，放在哪裡？',
  setup: '假設你這個月多拿到一筆五千元的獎金。你的生活費已經夠用，緊急預備金還沒存到你想要的金額。你也查過一個長期補助偏鄉學童交通費的公益團體，帳目公開透明。這筆錢你不打算拆開，只會放在其中一邊。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'emergency-fund', label: '存進自己的緊急預備金', content: '預備金離目標近一點，遇到突發狀況比較有底。', cost: '這次就不捐了，偏鄉學童的交通補助少了你這一份。', valueId: 'security' },
      { id: 'donate', label: '捐給偏鄉學童的交通補助', content: '讓遠方的孩子上學方便一些。', cost: '預備金要再晚一兩個月，才存到你想要的金額。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot14-workflow', slotId: 'slot14', pair: ['security', 'fairness'], domain: '工作',
  title: '四個週五下午，照排好的計畫走嗎？',
  setup: '假設主管讓你這個月用四個週五下午改善工作安排。你已經在行事曆上排好：前三個下午整理自己負責工作的備援和交接流程，減少臨時中斷的影響；最後一個下午把公開活動資訊改成易讀版本，方便有不同閱讀需求的人參加。兩件事都不是規定要做的工作，也沒有緊急期限，現在改也不影響別人。這四個下午，你會怎麼安排？',
  interaction: {
    kind: 'adjust', unit: '個下午',
    cells: ['第一個週五', '第二個週五', '第三個週五', '第四個週五'],
    sides: [
      { id: 'handover', label: '整理備援和交接流程', detail: '工作臨時中斷時比較不慌，易讀版也晚一點完成。', valueId: 'security' },
      { id: 'easy-read', label: '把活動資訊改成易讀版', detail: '讓不同閱讀需求的人都能看懂，交接流程也晚一點整理。', valueId: 'fairness' },
    ],
    initial: [0, 0, 0, 1],
  },
}, {
  id: 'interactive-slot15-meeting', slotId: 'slot15', pair: ['rules', 'tradition'], domain: '社群',
  title: '今年四場年度聚會，誰來主持？',
  setup: '假設你參加的自願社團剛約好，以後每次聚會由成員輪流主持，新約定還沒有任何例外。社團每年有四場年度聚會，多年來一直由資深成員主持。兩種做法都沒有法律或安全問題，資深成員也說都可以。今年由你決定怎麼安排，並向大家說明原因。這四場年度聚會，你會怎麼安排？',
  interaction: {
    kind: 'allocate', unit: '場',
    cells: ['新春團拜', '創社紀念', '年中旅行', '年終晚會'],
    sides: [
      { id: 'rotate', label: '照新約定輪流主持', detail: '照大家剛約好的規則走，那一場的老慣例也暫停一次。', valueId: 'rules' },
      { id: 'senior-host', label: '照慣例由資深成員主持', detail: '延續年度聚會多年的做法，那一場也沒照剛約好的輪流規則。', valueId: 'tradition' },
    ],
  },
}, {
  id: 'interactive-slot15-dinner', slotId: 'slot15', pair: ['rules', 'tradition'], domain: '工作',
  title: '歡迎新同事的那頓飯，怎麼結帳？',
  setup: '假設你的部門剛約好，從這個月起每週五聚餐一律平分費用，不再由誰請客。這週剛好有新同事第一次參加，部門多年的習慣是大家一起請新人這一餐，表示歡迎。兩種做法都不違反公司規定，新同事也不會因此尷尬。這次由你決定怎麼結帳。',
  interaction: {
    kind: 'choose',
    options: [
      { id: 'split-bill', label: '照新約定一律平分', content: '照大家剛約好的規則結帳，新同事也付自己那一份。', cost: '部門請新人吃第一頓飯的老習慣，這次停一次。', valueId: 'rules' },
      { id: 'treat-newcomer', label: '照老習慣大家一起請新同事', content: '延續部門歡迎新人的習慣，新同事這頓不用付。', cost: '剛約好的平分規則，第一個月就沒照著做。', valueId: 'tradition' },
    ],
  },
}, {
  id: 'interactive-slot15-reuse', slotId: 'slot15', pair: ['rules', 'tradition'], domain: '社群',
  title: '節慶聚會的四餐，用哪一套餐具？',
  setup: '假設你參與的文化社群剛約好，活動統一使用可清洗的公用餐具。每年固定的節慶聚會連辦兩天、共四餐，大家多年來都會帶家裡有紀念意義的器皿來盛菜。籌備組的初稿只在開幕晚宴保留帶器皿的慣例，其餘三餐照新約定。兩種餐具都乾淨、安全，對環境的影響也差不多。今年由你定案，現在改也來得及。這四餐，你會怎麼安排？',
  interaction: {
    kind: 'adjust', unit: '餐',
    cells: ['第一天午餐', '開幕晚宴', '第二天午餐', '第二天晚餐'],
    sides: [
      { id: 'shared-dishes', label: '用公用餐具', detail: '照大家新的約定走，那一餐也就不帶家裡的器皿。', valueId: 'rules' },
      { id: 'family-ware', label: '帶家裡的器皿', detail: '延續大家帶器皿來盛菜的老習慣，那一餐也沒照新的約定。', valueId: 'tradition' },
    ],
    initial: [0, 1, 0, 0],
  },
}];
