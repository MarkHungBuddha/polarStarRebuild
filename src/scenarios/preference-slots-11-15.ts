import type { PreferenceScenario } from '../types';

/**
 * Slots 11–15, three preference variants each (#52). AI-drafted content, reviewed per variant against the slot's
 * trade-off; not authored or validated by a person. Option order follows the slot pair and valueId is the only
 * source of direction. Slots 11, 13 and 15 keep the published two-option texts (closing either/or questions
 * dropped, since the scale asks the lean) and add one new life setting. Slot 12 turns the strike replies into
 * two short options with their costs; slot 14 replaces the six-hour allocation with one slot that fits only
 * one of the two tasks, so the answer is a lean rather than an amount.
 */
export const preferenceSlots11To15: PreferenceScenario[] = [{
  id: 'preference-slot11-fund', slotId: 'slot11', pair: ['influence', 'fairness'], kind: 'preference', domain: '社群',
  title: '這筆活動預算，誰來決定？',
  setup: '假設你替社區爭取到一筆小額活動預算，可以自行規劃，也有權獨自定案。你已經想好完整方案。你也可以交出一部分預算，讓不同年齡、語言和行動需求的居民代表一起決定，補進原方案沒顧到的需求。兩種做法都公開透明，也都符合規定。',
  options: [
    { id: 'own-plan', label: '保留全部定案權，照我的方案執行', consequence: '照自己的方案完整執行，也比較難補進其他居民的需求。', valueId: 'influence' },
    { id: 'shared-budget', label: '讓居民代表共同決定部分預算', consequence: '讓更多不同處境的居民被顧到，也接受結果不全由你決定。', valueId: 'fairness' },
  ],
}, {
  id: 'preference-slot11-event', slotId: 'slot11', pair: ['influence', 'fairness'], kind: 'preference', domain: '社群',
  title: '一場公開分享會的名額與主題。',
  setup: '假設你負責辦一場公開分享會，可以決定主題和報名名額。你可以全照自己的構想安排，也可以把一部分名額和一段議程交給聽障、新住民和高齡參與者的代表共同安排。後者能顧到更多需求，但不會完全照你的想法進行。兩種做法都符合主辦單位的規則。',
  options: [
    { id: 'own-decision', label: '主題與名額由我做最後決定', consequence: '活動照你的判斷進行，也少了讓不同需求的人參與安排的機會。', valueId: 'influence' },
    { id: 'co-arrange', label: '讓不同需求的代表共同安排一部分', consequence: '活動能顧到更多人的需求，也接受方向不完全照你的想法。', valueId: 'fairness' },
  ],
}, {
  // New setting: workplace instead of community. Same budget and deadline either way, so only control vs. wider needs differ.
  id: 'preference-slot11-office', slotId: 'slot11', pair: ['influence', 'fairness'], kind: 'preference', domain: '工作',
  title: '新辦公區的配置，誰來定？',
  setup: '假設公司請你規劃新辦公區的座位和設備，也讓你獨自定案。你已經有一套完整的配置。你也可以讓坐輪椅、需要安靜空間和上夜班的同事代表，一起決定其中一部分，補進你沒想到的需求。兩種做法的預算和完工時間都一樣，也都符合公司規定。',
  options: [
    { id: 'own-layout', label: '照我的配置定案', consequence: '辦公區照你的判斷完成，也比較難顧到不同處境同事的需求。', valueId: 'influence' },
    { id: 'shared-layout', label: '讓不同需求的同事代表決定一部分', consequence: '讓更多不同處境的同事用得順手，也接受配置不全由你決定。', valueId: 'fairness' },
  ],
}, {
  id: 'preference-slot12-project', slotId: 'slot12', pair: ['influence', 'care'], kind: 'preference', domain: '社群',
  title: '你熟悉的夥伴想主導',
  setup: '假設你和一位熟識的夥伴自願一起做小專案，原本由你決定最後方向。這次夥伴想練習主導，分工上的約定也允許這樣調整。不管由誰定案，你們都會繼續投入。',
  options: [
    { id: 'keep-final-say', label: '最後方向還是由我來定', consequence: '照自己的判斷定案，也讓夥伴少一次練習主導的機會。', valueId: 'influence' },
    { id: 'hand-over', label: '這次讓夥伴決定最後方向', consequence: '支持夥伴練習主導，也放下這次自己定案的機會。', valueId: 'care' },
  ],
}, {
  id: 'preference-slot12-outing', slotId: 'slot12', pair: ['influence', 'care'], kind: 'preference', domain: '朋友',
  title: '熟朋友的活動籌備',
  setup: '假設朋友聚會的預算和行程，一直都由你決定。這次一位親近的朋友想試著安排，大家也沒有特殊的安全或無障礙需求。你希望保留最後決定權，朋友則希望你支持他試一次。',
  options: [
    { id: 'keep-control', label: '預算和行程還是由我決定', consequence: '保有預算和行程的決定權，也讓朋友少一次試著安排的機會。', valueId: 'influence' },
    { id: 'let-friend-plan', label: '這次交給朋友安排，我來配合', consequence: '支持親近朋友試著安排，也放下這次對細節的掌握。', valueId: 'care' },
  ],
}, {
  // New setting: shared flat. Neither plan costs more or tires anyone, so the roommate's chance to try is the only stake.
  id: 'preference-slot12-flat', slotId: 'slot12', pair: ['influence', 'care'], kind: 'preference', domain: '生活',
  title: '下個月的家務，誰來排？',
  setup: '假設你和一位感情很好的室友合租，家務分工和採買一直由你安排。這次室友想試著排下個月的分工和採買清單，排法可能和你習慣的不同，但不會多花錢，也不會讓誰比較累。',
  options: [
    { id: 'keep-schedule', label: '下個月還是由我來排', consequence: '家裡照你的安排運作，也讓室友少一次試著安排的機會。', valueId: 'influence' },
    { id: 'roommate-plans', label: '這次讓室友來排，我照著做', consequence: '支持室友試著安排，也放下這個月對家務的掌握。', valueId: 'care' },
  ],
}, {
  id: 'preference-slot13-club', slotId: 'slot13', pair: ['influence', 'tradition'], kind: 'preference', domain: '社群',
  title: '今年的活動，誰說了算？',
  setup: '假設你剛接任一個自願社團的活動召集人，章程允許你調整年度活動。老成員希望沿用傳了多年的開場儀式和流程，你則有一套想親自決定的新安排。兩種都可行，原來的儀式也沒有排斥任何人。',
  options: [
    { id: 'own-format', label: '用召集人的權限，照我的安排重新規劃', consequence: '今年照你的安排走，也讓多年的開場儀式停辦一次。', valueId: 'influence' },
    { id: 'keep-ritual', label: '沿用傳下來的儀式和流程', consequence: '讓社團多年的儀式延續下去，也少了照自己想法安排的空間。', valueId: 'tradition' },
  ],
}, {
  id: 'preference-slot13-exhibition', slotId: 'slot13', pair: ['influence', 'tradition'], kind: 'preference', domain: '工作',
  title: '工藝展的安排權。',
  setup: '假設地方工藝展請你策展，展品的順序和介紹方式都由你決定。你可以照自己的完整構想安排，也可以沿用師傅們歷年展示和介紹作品的方式。兩種都能把作品說清楚，沒有哪一種比較好。',
  options: [
    { id: 'own-curation', label: '照我的構想安排整個展覽', consequence: '展覽照你的構想呈現，也不再沿用師傅們歷年的展示方式。', valueId: 'influence' },
    { id: 'masters-way', label: '沿用師傅們歷年的展示方式', consequence: '讓師傅們的老做法延續下去，也接受展覽不完全照你的構想。', valueId: 'tradition' },
  ],
}, {
  // New setting: alumni day. The old opening is neither inefficient nor exclusive; the new plan is not framed as more exciting.
  id: 'preference-slot13-alumni', slotId: 'slot13', pair: ['influence', 'tradition'], kind: 'preference', domain: '校友',
  title: '返校日的流程，照誰的安排？',
  setup: '假設校友會推你負責今年的返校日，當天流程由你決定。多年來返校日都從一起唱校歌、在老榕樹下合照開始，你則想照自己的規劃重新安排當天活動。兩種安排都順利可行，舊流程也沒有讓誰不自在。',
  options: [
    { id: 'own-program', label: '照我的規劃重新安排返校日', consequence: '返校日照你的規劃進行，也讓唱校歌和老樹下合照的慣例停一次。', valueId: 'influence' },
    { id: 'keep-opening', label: '沿用唱校歌、老樹下合照的流程', consequence: '讓校友會多年的慣例延續下去，也少了照自己想法安排的空間。', valueId: 'tradition' },
  ],
}, {
  // Rewritten from the six-hour allocation: one afternoon fits only one task, so the lean is asked directly.
  id: 'preference-slot14-preparation', slotId: 'slot14', pair: ['security', 'fairness'], kind: 'preference', domain: '社區',
  title: '一個下午的準備，先做哪件事？',
  setup: '假設你這個週末有一個下午的空檔。你可以整理自己的備援資料、緊急聯絡清單和防災物品，為生活中的意外做準備；也可以幫社區整理多語與無障礙防災資訊，讓不熟悉中文或行動不便的人更容易取得資訊。目前沒有災情，兩件事都能延後，社區的工作也不是你的義務。這個下午只夠做其中一件。',
  options: [
    { id: 'backup', label: '整理自己的備援與防災用品', consequence: '自己的生活多一分準備，也讓社區的防災資訊晚一點整理好。', valueId: 'security' },
    { id: 'accessible-info', label: '整理社區的多語與無障礙防災資訊', consequence: '讓更多人拿得到防災資訊，也讓自己的準備晚一點做。', valueId: 'fairness' },
  ],
}, {
  // Rewritten from the six-slot allocation the same way; neither task is required or urgent.
  id: 'preference-slot14-workflow', slotId: 'slot14', pair: ['security', 'fairness'], kind: 'preference', domain: '工作',
  title: '這個下午，先改善哪件事？',
  setup: '假設這週你有一個下午可以改善工作上的安排。你可以整理自己負責工作的備援和交接流程，減少臨時中斷的影響；也可以把公開活動資訊改成易讀版本，方便有不同閱讀需求的人參加。主管同意兩件事都能做，都不是規定要做的工作，也沒有緊急期限。這個下午只夠做其中一件。',
  options: [
    { id: 'handover', label: '建立自己工作的備援與交接流程', consequence: '工作臨時中斷時比較不慌，也讓易讀版資訊晚一點完成。', valueId: 'security' },
    { id: 'easy-read', label: '把公開活動資訊改成易讀版', consequence: '讓有不同閱讀需求的人都能看懂，也讓自己的交接流程晚一點整理。', valueId: 'fairness' },
  ],
}, {
  // New setting: money. Living costs are covered and the charity is checked, so the stake is own buffer vs. people far away.
  id: 'preference-slot14-bonus', slotId: 'slot14', pair: ['security', 'fairness'], kind: 'preference', domain: '金錢',
  title: '多出來的五千元。',
  setup: '假設你這個月多拿到一筆五千元的獎金。你可以存進自己的緊急預備金，遇到突發狀況比較有底；也可以捐給一個長期補助偏鄉學童交通費的公益團體，你查過它的帳目公開透明。你的生活費已經夠用，預備金還沒存到你想要的金額。這筆錢只打算放在其中一邊。',
  options: [
    { id: 'emergency-fund', label: '存進自己的緊急預備金', consequence: '遇到突發狀況比較有底，也少了這次補助偏鄉學童的機會。', valueId: 'security' },
    { id: 'donate', label: '捐給偏鄉學童的交通補助', consequence: '讓遠方的孩子上學方便一些，也讓自己的預備金晚一點存到目標。', valueId: 'fairness' },
  ],
}, {
  id: 'preference-slot15-meeting', slotId: 'slot15', pair: ['rules', 'tradition'], kind: 'preference', domain: '社群',
  title: '新約定遇上紀念聚會。',
  setup: '假設你參加的自願社團剛約好，以後每次聚會由成員輪流主持。這次是年度紀念聚會，以往一直由資深成員主持，新約定還沒有任何例外。兩種做法都沒有法律或安全問題。這次由你決定怎麼安排，並向大家說明原因。',
  options: [
    { id: 'rotate', label: '照新約定輪流主持', consequence: '照大家剛約好的規則走，紀念聚會的老慣例也暫停一次。', valueId: 'rules' },
    { id: 'senior-host', label: '照慣例由資深成員主持', consequence: '延續紀念聚會多年的做法，也沒照剛約好的輪流規則。', valueId: 'tradition' },
  ],
}, {
  id: 'preference-slot15-reuse', slotId: 'slot15', pair: ['rules', 'tradition'], kind: 'preference', domain: '社群',
  title: '節慶聚會用哪一套餐具？',
  setup: '假設你參與的文化社群剛約好，活動統一使用可清洗的公用餐具。但有一場每年固定的節慶聚會，大家多年來都會帶家裡有紀念意義的器皿來盛菜。兩種餐具都乾淨、安全，對環境的影響也差不多。今年由你決定用哪一種。',
  options: [
    { id: 'shared-dishes', label: '照新約定使用公用餐具', consequence: '照大家新的約定走，今年也就不帶家裡的器皿了。', valueId: 'rules' },
    { id: 'family-ware', label: '沿用各自帶器皿的慣例', consequence: '延續大家帶器皿來的老習慣，也沒照新的約定。', valueId: 'tradition' },
  ],
}, {
  // New setting: workplace. Both ways follow company policy and the newcomer is not embarrassed, so only the new rule vs. the custom differ.
  id: 'preference-slot15-dinner', slotId: 'slot15', pair: ['rules', 'tradition'], kind: 'preference', domain: '工作',
  title: '歡迎新同事的那頓飯。',
  setup: '假設你的部門剛約好，從這個月起每週五聚餐一律平分費用，不再由誰請客。這週剛好有新同事第一次參加，部門多年的習慣是大家一起請新人這一餐，表示歡迎。兩種做法都不違反公司規定，新同事也不會因此尷尬。這次由你決定怎麼結帳。',
  options: [
    { id: 'split-bill', label: '照新約定一律平分', consequence: '照大家剛約好的規則結帳，也讓請新人吃飯的老習慣停一次。', valueId: 'rules' },
    { id: 'treat-newcomer', label: '照老習慣大家一起請新同事', consequence: '延續部門歡迎新人的習慣，也沒照剛約好的平分規則。', valueId: 'tradition' },
  ],
}];
