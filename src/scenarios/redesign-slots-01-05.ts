import type { InteractiveScenario } from '../interactiveTypes';

/**
 * Slots 1–5 of the redesigned bank (#85), three variants each, in the order of the current bank. AI drafts awaiting the project
 * owner's review (docs/interactive-content/redesign-slots-01-05.md); not part of the live bank until the cutover (#88).
 * Side A (first side, card or location) leans to pair[0]; `valueId` or side order is the only source of direction.
 * Only an explicit action or an equal-resource split leans; the two message variants keep the full text and lean nowhere.
 */
export const redesignSlots01To05: InteractiveScenario[] = [{
  id: 'interactive-slot01-trip', slotId: 'slot01', pair: ['autonomy', 'security'], domain: '旅行',
  title: '六天的旅程，哪幾天自己排？',
  setup: '你要去一座以前去過的城市玩六天，住宿已經訂好。當地每天都有行程固定的一日團，交通、導覽和緊急聯絡都有人安排，費用和自己玩差不多。自己排能隨時改主意，臨時狀況得自己處理；跟團有人照應，就得照團的時間表走。',
  interaction: { kind: 'calendar', slots: ['第1天', '第2天', '第3天', '第4天', '第5天', '第6天'], sides: [
    { id: 'self-planned', label: '自己排行程', detail: '想去哪裡、待多久都自己決定，也得自己應付臨時狀況。', valueId: 'autonomy' },
    { id: 'tour', label: '跟一日團', detail: '交通和突發狀況有人照應，也得照團的時間表走。', valueId: 'security' },
  ] },
}, {
  id: 'interactive-slot01-work', slotId: 'slot01', pair: ['autonomy', 'security'], domain: '工作',
  title: '明年的合作，照草案走嗎？',
  setup: '你正和公司談明年的合作方式。目前的草案是第一、二、四季領固定月薪，工作時間和做法照公司安排；第三季先試按件接案，自己決定接什麼、怎麼排時間，收入隨接案量起伏。公司說每一季都還能改。你已經存好半年的生活費，兩種做法都能發揮你的能力。',
  interaction: { kind: 'resources', unit: '季', objects: ['第一季', '第二季', '第三季', '第四季'], initial: [1, 1, 0, 1], sides: [
    { id: 'freelance', label: '按件接案', detail: '接什麼、怎麼排都自己決定，也接受這一季收入說不準。', valueId: 'autonomy' },
    { id: 'salaried', label: '領固定月薪', detail: '這一季收入穩定可預期，也照公司安排工作。', valueId: 'security' },
  ] },
}, {
  id: 'interactive-slot01-home', slotId: 'slot01', pair: ['autonomy', 'security'], domain: '居住',
  title: '這次租約，續住還是搬家？',
  setup: '你在比較兩間都租得起的房子，通勤和大小都差不多。現在的住處可以續簽三年、房租不調，但房間怎麼布置、空間怎麼用，都得照房東的規定。新住處可以自己安排工作區和生活空間，只是租約一年一簽，續約時可能漲租。',
  interaction: { kind: 'scene', object: '鑰匙', transitionLabel: '玄關桌', locations: [
    { id: 'move', label: '新住處的交屋區', action: '把鑰匙放進新住處的交屋區', consequence: '搬到能自己安排空間的新住處，租約一年一簽，續約時房租可能調漲。', valueId: 'autonomy' },
    { id: 'renew', label: '續約文件區', action: '把鑰匙放在續約文件上', consequence: '續簽三年不調租，房間怎麼布置、空間怎麼用，仍照房東的規定。', valueId: 'security' },
  ] },
}, {
  id: 'interactive-slot02-proposal', slotId: 'slot02', pair: ['autonomy', 'rules'], domain: '工作',
  title: '這份提案，要怎麼回覆夥伴？',
  setup: '你和幾位同事一起準備內部提案，先前約好用同一份格式，方便大家對照。你想用自己設計的方式，把觀點說得更清楚。兩種方式都能完整交代內容，主管也允許例外。夥伴問你明天能不能交，你打好一段回覆，還沒傳出去。',
  interaction: { kind: 'message', sentences: [
    { id: 'delivery', text: '提案我明天會交一版。' },
    { id: 'own-method', text: '我想用自己設計的方式呈現，觀點會比較清楚。' },
    { id: 'difference', text: '這樣會跟我們約好的共同格式不一樣。' },
    { id: 'agreement', text: '我記得我們約好這次用同一份格式。' },
    { id: 'adjust', text: '如果要維持一致，我可以把內容改回共同格式。' },
    { id: 'discuss', text: '想請你先看看我的版本，再一起決定。' },
    { id: 'effort', text: '多花的排版時間，我自己負責。' },
  ] },
}, {
  id: 'interactive-slot02-reading', slotId: 'slot02', pair: ['autonomy', 'rules'], domain: '學習',
  title: '六週的共學，每週讀哪一章？',
  setup: '你參加一個線上共學小組，接下來六週，大家約好每週讀同一章，聚會時照章節討論。你對書後面幾章的主題更有興趣，照自己的順序也能讀完整本。你每週只有讀一章的時間。小組沒有強制規定，只是照約好的進度，大家比較好一起討論。',
  interaction: { kind: 'calendar', slots: ['第1週', '第2週', '第3週', '第4週', '第5週', '第6週'], sides: [
    { id: 'own-order', label: '讀自己想深入的章節', detail: '照自己的順序讀有興趣的主題，也沒照小組那週的進度。', valueId: 'autonomy' },
    { id: 'group-pace', label: '讀小組約好的那一章', detail: '和大家讀同一章、一起討論，想先讀的主題就往後放。', valueId: 'rules' },
  ] },
}, {
  id: 'interactive-slot02-cleaning', slotId: 'slot02', pair: ['autonomy', 'rules'], domain: '居住',
  title: '這個月的打掃，要怎麼跟室友說？',
  setup: '你和室友約好，每週六上午一起打掃公共區域，這個月的四週目前都照這個約定。你想把其中幾週改到平日晚上，照自己的作息打掃負責的區域。兩種做法都能打掃乾淨，室友也不急著用空間；只是改時間的那幾週，就沒照原本的約定，大家得另外確認進度。你寫好一段訊息，還沒傳出去。',
  interaction: { kind: 'message', sentences: [
    { id: 'status', text: '我們原本約好每週六上午一起打掃，目前還沒有改。' },
    { id: 'propose', text: '這個月有幾週，我想改到平日晚上打掃我負責的區域。' },
    { id: 'done', text: '我會把負責的區域打掃乾淨。' },
    { id: 'notice', text: '我知道這樣就不是照原本的約定了。' },
    { id: 'confirm', text: '改時間的那幾週，想另外跟你確認進度。' },
    { id: 'wait', text: '你回覆之前，我先照週六上午的約定。' },
  ] },
}, {
  id: 'interactive-slot03-afternoons', slotId: 'slot03', pair: ['autonomy', 'care'], domain: '生活',
  title: '這個月的四個週末下午，怎麼分配？',
  setup: '接下來一個月，你有四個空閒的週末下午。你想選一條路線，做自己的散步紀錄；一位熟識的長輩也想請你陪著學整理手機相片。長輩平常有人協助，沒有急事，只是很珍惜和你一起學的時間；他說哪幾個下午都可以調。散步紀錄晚一點做也來得及。',
  interaction: { kind: 'calendar', slots: ['第1個下午', '第2個下午', '第3個下午', '第4個下午'], sides: [
    { id: 'walk', label: '走自己的路線', detail: '照自己的想法走走、記錄，也讓陪長輩的時間少一些。', valueId: 'autonomy' },
    { id: 'photos', label: '陪長輩整理相片', detail: '陪長輩學整理相片，散步紀錄就晚一點做。', valueId: 'care' },
  ] },
}, {
  id: 'interactive-slot03-moving', slotId: 'slot03', pair: ['autonomy', 'care'], domain: '居住',
  title: '空出來的週六，要去哪裡？',
  setup: '你終於空出一整個週六，打算照自己的計畫整理房間，改排書櫃和工作角落。一位熟朋友這週剛搬家，問你能不能去幫忙拆箱、整理廚房。朋友找了搬家公司，也有其他人會去，只是希望你也在。兩件事都能改到下週，但這個週六只能做一件。',
  interaction: { kind: 'scene', object: '自己', transitionLabel: '家門口', locations: [
    { id: 'own-room', label: '自己的書櫃工作角', action: '走進自己的書櫃工作角', consequence: '這個週六照自己的計畫整理房間，去朋友家幫忙改到下週。', valueId: 'autonomy' },
    { id: 'friend-home', label: '朋友的拆箱區', action: '走進朋友的拆箱區', consequence: '這個週六在朋友家拆箱、整理廚房，自己的整理計畫改到下週。', valueId: 'care' },
  ] },
}, {
  id: 'interactive-slot03-evenings', slotId: 'slot03', pair: ['autonomy', 'care'], domain: '生活',
  title: '這三週的晚上，留給哪件事？',
  setup: '接下來三週，你有六個可以自由安排的晚上，每晚兩小時，每個晚上只能做一件事。你想照自己的想法做一本攝影小誌；一位正在轉職的好友也想請你陪他練面試。朋友另有其他人幫忙，沒有急事，兩件事之後都還能繼續。',
  interaction: { kind: 'resources', unit: '晚', objects: ['第一週・週二', '第一週・週四', '第二週・週二', '第二週・週四', '第三週・週二', '第三週・週四'], sides: [
    { id: 'zine', label: '做攝影小誌', detail: '照自己的想法創作，也讓陪朋友的時間少一些。', valueId: 'autonomy' },
    { id: 'interview', label: '陪朋友練面試', detail: '多陪朋友準備，小誌就得慢一點做。', valueId: 'care' },
  ] },
}, {
  id: 'interactive-slot04-work', slotId: 'slot04', pair: ['stimulation', 'security'], domain: '工作',
  title: '這兩週，要去新團隊支援嗎？',
  setup: '公司邀你到另一個團隊支援兩週，薪水不變，你也可以選擇留下。新團隊的專案是你沒做過的，會有基本交接，但每天要做什麼還沒排定。留在原團隊，就能照排好的時間完成熟悉的工作。兩邊都能如期交付。',
  interaction: { kind: 'scene', object: '工作證', transitionLabel: '自己的座位', locations: [
    { id: 'join', label: '新團隊的桌子', action: '把工作證放到新團隊的桌上', consequence: '這兩週做沒做過的專案，每天要做什麼還沒排定，比較難預料。', valueId: 'stimulation' },
    { id: 'stay', label: '原團隊的桌子', action: '把工作證留在原團隊的桌上', consequence: '這兩週照排好的時間完成熟悉的工作，放下這次換環境的機會。', valueId: 'security' },
  ] },
}, {
  id: 'interactive-slot04-weekends', slotId: 'slot04', pair: ['stimulation', 'security'], domain: '生活',
  title: '四個週末，各要怎麼過？',
  setup: '接下來一個月有四個週末。你可以走熟悉的路線，散步吃飯，照預計的時間回家；也可以去沒去過的小鎮參加一日體驗，當天行程還沒確定。交通和預算都準備好了，沒有非去不可的人情或工作，現在改變主意也不用付取消費。',
  interaction: { kind: 'calendar', slots: ['第1個週末', '第2個週末', '第3個週末', '第4個週末'], sides: [
    { id: 'explore', label: '去陌生小鎮體驗', detail: '去新地方試新活動，也接受當天行程說不準。', valueId: 'stimulation' },
    { id: 'familiar', label: '走熟悉的路線', detail: '照自己知道的步調過，也放下去新地方的機會。', valueId: 'security' },
  ] },
}, {
  id: 'interactive-slot04-workshops', slotId: 'slot04', pair: ['stimulation', 'security'], domain: '學習',
  title: '六堂短課只能上三堂，留哪些？',
  setup: '公司補助你上晚間的單堂短課，每堂兩小時，時間和費用都一樣。候選有六堂：三堂是你從沒接觸過的主題，第一次開課，內容和進度會邊上邊調整；三堂屬於你熟悉的領域，已經開過很多期，流程和講義都排得清清楚楚。這期你只排得出三個晚上，其餘的延到下一期，兩種都不影響工作考核。',
  interaction: { kind: 'priority', capacity: 3, keepLabel: '這期上課', deferLabel: '延到下一期', resourceUnit: '個晚上', items: [
    { id: 'new-wood', label: '木工入門（第一次開課）', detail: '接觸沒用過的材料與工具，進度邊上邊調整', valueId: 'stimulation' },
    { id: 'known-sheet', label: '試算表進階（開過多期）', detail: '延伸熟悉的工具，流程和講義都已排好', valueId: 'security' },
    { id: 'new-improv', label: '即興戲劇體驗（第一次開課）', detail: '試試陌生的表達方式，內容說不準', valueId: 'stimulation' },
    { id: 'known-slides', label: '簡報架構（開過多期）', detail: '整理熟悉的工作技巧，步驟清楚', valueId: 'security' },
    { id: 'new-sound', label: '聲音採集（第一次開課）', detail: '用沒試過的媒介認識身邊的環境，進度邊上邊調整', valueId: 'stimulation' },
    { id: 'known-schedule', label: '專案時程管理（開過多期）', detail: '練習熟悉的工作流程，每堂重點明確', valueId: 'security' },
  ] },
}, {
  id: 'interactive-slot05-holiday', slotId: 'slot05', pair: ['stimulation', 'tradition'], domain: '生活',
  title: '四天連假，每天怎麼過？',
  setup: '你有四天連假，可以自己安排，也沒有需要陪伴或照顧的人。你回到熟悉的節慶小鎮，每天都有長輩帶著糊燈籠、練醒獅鼓法，教的是傳下來的老技藝；附近新開了一種你從沒試過的戶外體驗，每天都有梯次。兩邊都能免費改期，花費和累的程度也差不多。',
  interaction: { kind: 'calendar', slots: ['第1天', '第2天', '第3天', '第4天'], sides: [
    { id: 'outdoor', label: '去新的戶外體驗', detail: '試從沒玩過的活動，也少一天跟長輩學技藝。', valueId: 'stimulation' },
    { id: 'craft', label: '跟長輩學老技藝', detail: '把節慶的老技藝接著學下去，也少一天試新活動。', valueId: 'tradition' },
  ] },
}, {
  id: 'interactive-slot05-winter', slotId: 'slot05', pair: ['stimulation', 'tradition'], domain: '飲食',
  title: '冬至聚會的備料時間，怎麼分？',
  setup: '今年由你負責朋友間的冬至聚會，桌上要準備六道菜，備料時間一共六小時。這群朋友每年都照上一輩傳下來的做法，一起搓湯圓、煮鹹湯圓，再配幾道家常老菜。今年你也可以把時間花在料理實驗上，大家一起試從沒做過的異國食譜。兩邊花的錢差不多，朋友們都說照你的安排。',
  interaction: { kind: 'resources', unit: '小時', objects: ['備料時間 1', '備料時間 2', '備料時間 3', '備料時間 4', '備料時間 5', '備料時間 6'], sides: [
    { id: 'new-recipe', label: '試新的異國食譜', detail: '和大家試沒做過的料理，也少一小時準備老菜。', valueId: 'stimulation' },
    { id: 'old-recipe', label: '照傳下來的老做法', detail: '把老做法再延續一年，也少一小時試新料理。', valueId: 'tradition' },
  ] },
}, {
  id: 'interactive-slot05-festival', slotId: 'slot05', pair: ['stimulation', 'tradition'], domain: '社群',
  title: '同一天，去工藝日還是新體驗？',
  setup: '你熟悉的社區每年都有傳統工藝日。你參加了很多年，跟老師傅做竹編，聽大家聊這門手藝的由來。今年同一天，還有一場只辦一次的聲音採集與即興創作體驗，都是你沒試過的活動。兩場只能去一場，都沒有工作要做，也沒有人要求你一定要去。',
  interaction: { kind: 'scene', object: '票券', transitionLabel: '服務台', locations: [
    { id: 'new-experience', label: '新體驗入口', action: '把票券放進新體驗入口', consequence: '去只辦一次的聲音採集與即興創作體驗，錯過今年的工藝日。', valueId: 'stimulation' },
    { id: 'craft-day', label: '工藝日入口', action: '把票券放進工藝日入口', consequence: '照往年跟老師傅做竹編，錯過只辦一次的新體驗。', valueId: 'tradition' },
  ] },
}];
