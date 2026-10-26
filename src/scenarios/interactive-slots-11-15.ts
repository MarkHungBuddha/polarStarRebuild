import type { InteractiveScenario } from '../interactiveTypes';

/**
 * Slots 11–15, three variants each (#87). AI drafts rewritten for the six interaction mechanisms, keeping each slot's pair, the
 * variant ids and their registry order; not authored by a person and not yet reviewed by the project owner, and no psychometric
 * validity is claimed. Drafting notes, mechanism choices, costs and direction rules: docs/interactive-content/slots-11-15.md.
 * Side A, location A or the first sides entry leans to the pair's first value; valueId is the only source of direction, and
 * only where the mechanism's data defines one (message questions never have a direction).
 */
export const interactiveSlots11To15: InteractiveScenario[] = [{
  id: 'interactive-slot11-fund', slotId: 'slot11', pair: ['influence', 'fairness'], domain: '社區',
  title: '六場社區活動，最後由誰決定？',
  setup: '假設你替社區爭取到一筆活動經費，今年要辦六場活動，每場的規模和預算差不多。每一場的主題、講者和流程，都可以由你一個人定案，你也已經擬好完整的方案。你也可以把其中幾場的最後決定權，交給不同年齡、語言和行動需求的居民代表，補進你沒顧到的處境。兩種做法都公開透明，也都符合規定。',
  interaction: {
    kind: 'resources', unit: '場',
    objects: ['三月場決定牌', '五月場決定牌', '七月場決定牌', '九月場決定牌', '十月場決定牌', '十二月場決定牌'],
    sides: [
      { id: 'own-plan', label: '我的企劃桌', detail: '那一場照你的方案完整進行，也比較難補進其他居民的需求。', valueId: 'influence' },
      { id: 'residents', label: '居民代表桌', detail: '那一場顧到更多不同處境的居民，你也就不能照自己的方案定案。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot11-event', slotId: 'slot11', pair: ['influence', 'fairness'], domain: '社群',
  title: '給代表們的回覆，你想傳哪些話？',
  setup: '假設你負責辦一場公開分享會，主辦單位讓你決定主題和報名名額，議程你已經擬好了。聽障、新住民和高齡參與者的代表來信，希望共同安排其中一段議程和三分之一的名額。兩種做法都符合主辦單位的規則。你先打好一段回覆，還沒傳出去。',
  interaction: {
    kind: 'message',
    sentences: [
      { id: 'thanks', text: '謝謝你們來信，說明各自需要什麼。' },
      { id: 'final-say', text: '這場分享會的主題和報名名額，由我負責最後定案。' },
      { id: 'draft', text: '議程我已經擬好，大致會照這個版本進行。' },
      { id: 'one-session', text: '我願意把其中一段議程，請你們一起安排。' },
      { id: 'quota', text: '三分之一名額怎麼分配，我想先跟你們討論再決定。' },
      { id: 'next-time', text: '你們提到的需求，我會先記下來，下次籌辦時優先考慮。' },
      { id: 'reply-date', text: '報名下週一開放，我這週會再回覆確定的安排。' },
    ],
  },
}, {
  id: 'interactive-slot11-office', slotId: 'slot11', pair: ['influence', 'fairness'], domain: '工作',
  title: '新辦公區的茶水間，最後由誰定案？',
  setup: '假設公司請你規劃新辦公區，也讓你獨自定案。其他區域你都排好了，還沒定的是茶水間，你已經畫好配置草案。坐輪椅、需要安靜空間和上夜班的同事代表，希望共同決定這一區，補進你沒想到的需求。不管誰定案，預算和完工時間都一樣，現在決定也來得及。',
  interaction: {
    kind: 'scene', object: '配置草案', transitionLabel: '待定區',
    locations: [
      { id: 'own-layout', label: '我的定案區', action: '放進我的定案區', consequence: '茶水間照你的判斷定案，也比較難補進其他同事的需求。', valueId: 'influence' },
      { id: 'colleagues', label: '同事代表區', action: '放進同事代表區', consequence: '茶水間由幾位同事代表共同定案，用得順手的人更多，你也就不能照自己的草案決定。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot12-outing', slotId: 'slot12', pair: ['influence', 'care'], domain: '朋友',
  title: '接下來四次聚會，誰來籌備？',
  setup: '假設朋友聚會的預算和行程一直由你決定。接下來四個月各有一次聚會，一位親近的朋友說想試著籌備，希望你支持他試試看。大家沒有特殊的安全或無障礙需求，不管誰籌備，你都會到場。每次聚會只由一個人定案。',
  interaction: {
    kind: 'calendar', unit: '次', label: '聚會行事曆',
    slots: ['第一次聚會', '第二次聚會', '第三次聚會', '第四次聚會'],
    sides: [
      { id: 'self-plan', label: '由我籌備', detail: '預算和行程照你的掌握，朋友也少一次試著安排的機會。', valueId: 'influence' },
      { id: 'friend-plans', label: '交給朋友籌備', detail: '支持朋友試著安排，那一次你也放下對細節的掌握。', valueId: 'care' },
    ],
  },
}, {
  id: 'interactive-slot12-project', slotId: 'slot12', pair: ['influence', 'care'], domain: '社群',
  title: '給夥伴的回覆，你想傳哪些話？',
  setup: '假設你和一位熟識的夥伴自願一起做社區小專案，原本說好最後方向由你定。下週要交企劃，你們各有一個方向。夥伴說這次想練習主導，分工的約定也允許這樣調整。不管由誰定案，兩個人都會繼續投入。你先打好一段回覆，還沒傳出去。',
  interaction: {
    kind: 'message',
    sentences: [
      { id: 'both', text: '我們各有一個方向，我覺得兩個都值得認真看。' },
      { id: 'support', text: '你想練習主導，我願意支持。' },
      { id: 'keep', text: '原本說好由我定案，這次我想照自己的判斷決定方向。' },
      { id: 'follow', text: '如果由你定案，我會在旁邊配合你的方向。' },
      { id: 'discuss', text: '最後選哪個方向，我想週三前先跟你一起討論。' },
      { id: 'finish', text: '不管誰定案，我都會一起把企劃做完。' },
    ],
  },
}, {
  id: 'interactive-slot12-flat', slotId: 'slot12', pair: ['influence', 'care'], domain: '生活',
  title: '下個月的家務，由你排幾週？',
  setup: '假設你和一位感情很好的室友合租，家務分工和採買一直由你安排。下個月共四週，室友想試著自己排。你們上週先說好，第一週照你的排法，後三週讓室友排。從第一週起連續幾週由你排，其餘的週數換室友排，費用和勞累都一樣，月初前都還能改。',
  interaction: {
    kind: 'linked', min: 0, max: 4, step: 1, initial: 1, unit: '週', label: '由我排的週數',
    consequence: '你排的週數越多，室友試著自己安排的週數就越少；不管誰排，費用和勞累都一樣。',
    presentation: { kind: 'calendar' }, resourceTotal: 4,
    resourceSides: [
      { id: 'self-schedule', label: '由我排', detail: '家裡照你的安排運作，室友也少一週試著安排的機會。', valueId: 'influence' },
      { id: 'roommate-schedules', label: '讓室友排', detail: '支持室友試著安排，那一週你也放下對家務的掌握。', valueId: 'care' },
    ],
  },
}, {
  id: 'interactive-slot13-club', slotId: 'slot13', pair: ['influence', 'tradition'], domain: '社群',
  title: '今年四場例行活動，各照誰的安排？',
  setup: '假設你剛接任一個自願社團的活動召集人，章程允許你調整年度活動。今年有四場例行活動，老成員希望沿用傳了多年的開場儀式和流程，你則有一套想親自決定的新安排。兩種都可行，原來的儀式也沒有排斥任何人。每場只能照其中一種方式進行。',
  interaction: {
    kind: 'calendar', unit: '場', label: '年度活動行事曆',
    slots: ['春季聚會', '夏季出遊', '秋季成果展', '年終聚餐'],
    sides: [
      { id: 'own-format', label: '照我的新安排', detail: '那一場照你的規劃進行，多年的開場儀式也停一次。', valueId: 'influence' },
      { id: 'keep-ritual', label: '沿用傳下來的流程', detail: '讓社團多年的儀式延續下去，也少了照自己想法安排的空間。', valueId: 'tradition' },
    ],
  },
}, {
  id: 'interactive-slot13-alumni', slotId: 'slot13', pair: ['influence', 'tradition'], domain: '校友',
  title: '返校日的開場，放在哪一邊？',
  setup: '假設校友會推你負責今年的返校日，當天流程由你決定。多年來返校日都從一起唱校歌、在老榕樹下合照開始，你想用同一段時間，改成自己規劃的開場。開場只能選一種，兩種都順利可行，舊流程也沒有讓誰不自在。流程這週五要寄給校友。',
  interaction: {
    kind: 'scene', object: '開場流程卷', transitionLabel: '籌備桌',
    locations: [
      { id: 'own-stage', label: '我設計的舞台', action: '放上我設計的舞台', consequence: '當天從你設計的開場開始，流程照你的想法走，唱校歌和老榕樹下合照今年停一次。', valueId: 'influence' },
      { id: 'old-tree', label: '老榕樹下', action: '放到老榕樹下', consequence: '當天照例唱校歌、在老榕樹下合照，校友會多年的開場延續下去，你規劃的開場今年用不上。', valueId: 'tradition' },
    ],
  },
}, {
  id: 'interactive-slot13-exhibition', slotId: 'slot13', pair: ['influence', 'tradition'], domain: '工作',
  title: '給師傅們的信，你想寫哪些話？',
  setup: '假設地方工藝展請你策展，展品順序和介紹方式都由你決定。籌備組先照師傅們歷年的方式排好了四個展區，你有自己的完整構想。兩種方式都能把作品說清楚，沒有哪一種比較好。你要寫信向幾位老師傅說明，先打好一段，還沒寄出去。',
  interaction: {
    kind: 'message',
    sentences: [
      { id: 'seen', text: '展區我看過了，歷年的排法把作品交代得很清楚。' },
      { id: 'decide', text: '今年的展品順序和介紹方式，由我負責最後決定。' },
      { id: 'entrance', text: '我有一套自己的構想，想先在入口區試試看。' },
      { id: 'keep-halls', text: '器物區和織品區，我想照師傅們歷年的方式擺。' },
      { id: 'wood-text', text: '木作區的介紹文字，想請師傅們先看過我寫的版本。' },
      { id: 'meet', text: '開展前我會再找時間，當面跟你們確認細節。' },
    ],
  },
}, {
  id: 'interactive-slot14-preparation', slotId: 'slot14', pair: ['security', 'fairness'], domain: '社區',
  title: '六個小時的防災準備，先做哪邊？',
  setup: '假設接下來兩週，你空出六個一小時的時段做防災準備。你可以整理自己的備援資料、緊急聯絡清單和防災物品，為生活中的意外做準備，也可以幫社區整理多語與易讀的防災資訊，讓不熟悉中文或有不同閱讀需求的人更容易取得。目前沒有災情，兩件事都能延後，社區的工作也不是你的義務。每個時段只能做一件事。',
  interaction: {
    kind: 'resources', unit: '小時',
    objects: ['第一週・週一', '第一週・週三', '第一週・週五', '第二週・週一', '第二週・週三', '第二週・週五'],
    sides: [
      { id: 'own-backup', label: '自己的防災準備', detail: '自己的生活多一分準備，社區的資訊也就晚一點整理好。', valueId: 'security' },
      { id: 'community-info', label: '社區的防災資訊', detail: '讓更多人拿得到防災資訊，自己的準備也就晚一點做。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot14-bonus', slotId: 'slot14', pair: ['security', 'fairness'], domain: '金錢',
  title: '多出來的五千元，放在哪裡？',
  setup: '假設你這個月多拿到一筆五千元的獎金。你的生活費已經夠用，緊急預備金還沒存到你想要的金額。你也查過一個長期補助偏鄉學童交通費的公益團體，帳目公開透明。這筆錢你不打算拆開，只會放在其中一邊。',
  interaction: {
    kind: 'scene', object: '五千元信封', transitionLabel: '桌面',
    locations: [
      { id: 'emergency-fund', label: '緊急預備金', action: '存進緊急預備金', consequence: '預備金離目標近一點，遇到突發狀況比較有底，偏鄉學童的交通補助這次也少了你這一份。', valueId: 'security' },
      { id: 'donation', label: '交通補助捐款箱', action: '投進交通補助捐款箱', consequence: '遠方的孩子上學方便一些，你的預備金也要再晚一兩個月才存到目標。', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot14-workflow', slotId: 'slot14', pair: ['security', 'fairness'], domain: '工作',
  title: '六件改善工作，這個月先做哪四件？',
  setup: '假設主管讓你這個月用四個週五下午改善工作安排，每個下午只夠做一件事。你手上有六件候選，其中三件能降低自己負責的工作臨時中斷時的影響，另外三件能讓公開活動資訊更容易被不同閱讀需求的人使用。兩類都不是規定要做的工作，也沒有緊急期限，沒排進來的延到下個月。',
  interaction: {
    kind: 'priority', capacity: 4, keepLabel: '這個月做', deferLabel: '延到下個月', resourceUnit: '個下午',
    items: [
      { id: 'handover', label: '整理工作交接流程', detail: '寫下自己負責的工作怎麼接手', valueId: 'security' },
      { id: 'easy-read', label: '把活動簡章改成易讀版', detail: '用較短的句子和圖示重寫', valueId: 'fairness' },
      { id: 'backup', label: '替重要檔案多備一份', detail: '臨時出狀況時能很快還原', valueId: 'security' },
      { id: 'captions', label: '替活動影片補上字幕', detail: '聽障參與者也能看懂內容', valueId: 'fairness' },
      { id: 'contacts', label: '整理臨時中斷時的聯絡窗口', detail: '知道誰能接手、怎麼找到人', valueId: 'security' },
      { id: 'languages', label: '補上簡章的多語摘要', detail: '不熟悉中文的人也能快速看懂', valueId: 'fairness' },
    ],
  },
}, {
  id: 'interactive-slot15-meeting', slotId: 'slot15', pair: ['rules', 'tradition'], domain: '社群',
  title: '今年四場年度聚會，誰來主持？',
  setup: '假設你參加的自願社團剛約好，以後每次聚會由成員輪流主持，新約定還沒有任何例外。社團每年有四場年度聚會，多年來一直由資深成員主持。兩種做法都沒有法律或安全問題，資深成員也說都可以。今年由你決定怎麼安排，並向大家說明原因。',
  interaction: {
    kind: 'calendar', unit: '場', label: '年度聚會行事曆',
    slots: ['新春團拜', '創社紀念', '年中旅行', '年終晚會'],
    sides: [
      { id: 'rotate', label: '照新約定輪流主持', detail: '照大家剛約好的規則走，那一場的老慣例也暫停一次。', valueId: 'rules' },
      { id: 'senior-host', label: '照慣例由資深成員主持', detail: '延續年度聚會多年的做法，那一場也沒照剛約好的輪流規則。', valueId: 'tradition' },
    ],
  },
}, {
  id: 'interactive-slot15-dinner', slotId: 'slot15', pair: ['rules', 'tradition'], domain: '工作',
  title: '給部門的訊息，你想傳哪些話？',
  setup: '假設你的部門剛約好，從這個月起每週五聚餐的費用以平分為原則，不再由誰請客。這週有新同事第一次參加，部門多年的習慣是大家一起請新人這一餐。兩種做法都不違反公司規定，新同事也不會因此尷尬。你要在群組說明這次怎麼結帳，先打好一段，還沒傳出去。',
  interaction: {
    kind: 'message',
    sentences: [
      { id: 'intro', text: '週五聚餐的結帳方式，我先說明一下。' },
      { id: 'new-rule', text: '我們這個月剛約好，聚餐費用以平分為原則。' },
      { id: 'old-habit', text: '部門以前有大家一起請新人第一餐的習慣。' },
      { id: 'treat', text: '這次新同事的那一份，我想照老習慣由大家一起出。' },
      { id: 'split-rest', text: '其他人的部分，照新約定平分。' },
      { id: 'feedback', text: '如果有人覺得不妥，歡迎直接跟我說，我們再調整。' },
    ],
  },
}, {
  id: 'interactive-slot15-reuse', slotId: 'slot15', pair: ['rules', 'tradition'], domain: '社群',
  title: '節慶聚會的四餐，初稿要調整嗎？',
  setup: '假設你參與的文化社群剛約好，活動統一使用可清洗的公用餐具。每年固定的節慶聚會連辦兩天、共四餐，大家多年來都會帶家裡有紀念意義的器皿來盛菜。籌備組的初稿只在開幕晚宴保留帶器皿的慣例，其餘三餐照新約定。兩種餐具都乾淨、安全，對環境的影響也差不多。今年由你定案，現在改也來得及。',
  interaction: {
    kind: 'resources', unit: '餐',
    objects: ['第一天午餐', '開幕晚宴', '第二天午餐', '第二天晚餐'],
    initial: [0, 1, 0, 0],
    sides: [
      { id: 'shared-dishes', label: '用公用餐具', detail: '照大家新的約定走，那一餐也就不帶家裡的器皿。', valueId: 'rules' },
      { id: 'family-ware', label: '帶家裡的器皿', detail: '延續大家帶器皿來盛菜的老習慣，那一餐也沒照新的約定。', valueId: 'tradition' },
    ],
  },
}];
