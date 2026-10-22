import type { AllocationScenario } from '../types';

export const allocationScenarios: AllocationScenario[] = [{
  id: 'slot03-evenings', slotId: 'slot03', pair: ['autonomy', 'care'], kind: 'allocate', domain: '生活',
  title: '六個晚上，留給哪些事？',
  setup: '假設接下來三週，你有六個能自行安排的晚上，每晚兩小時。你想做一本自己規劃的攝影小誌；一位正在轉職的好友也希望請你陪練面試。好友另有其他協助，沒有緊急危機。每多留一晚做小誌，就少一晚陪練；每多陪練一晚，就少一晚推進自己的計畫。六晚全部分完，任一邊都可以分零晚。',
  total: 6, unit: '晚',
  options: [
    { id: 'zine', label: '自己的攝影小誌', consequence: '依自己的方向創作，放下部分陪朋友準備的時間。', valueId: 'autonomy' },
    { id: 'interview', label: '陪朋友練面試', consequence: '支持熟悉的朋友，放下部分推進自己計畫的時間。', valueId: 'care' },
  ],
}, {
  id: 'slot03-afternoons', slotId: 'slot03', pair: ['autonomy', 'care'], kind: 'allocate', domain: '生活',
  title: '四個下午，怎麼留下？',
  setup: '假設未來一個月，你有四個可自行安排的週末下午。你想照自己選的路線做一份散步紀錄；一位熟識的長輩則希望由你陪著學會整理手機相片。長輩已有日常支援，沒有緊急需要，但很珍惜與你一起學習的時間。每個下午只能做其中一件事，兩邊都能延後。把四個下午全部分完，任一邊可分零。',
  total: 4, unit: '個下午',
  options: [
    { id: 'walk', label: '自選路線的散步紀錄', consequence: '依自己的想法探索與記錄，少一些陪長輩整理相片的時間。', valueId: 'autonomy' },
    { id: 'photos', label: '陪長輩整理手機相片', consequence: '支持熟識的人學習，少一些推進自選紀錄的時間。', valueId: 'care' },
  ],
}, {
  id: 'slot06-learning', slotId: 'slot06', pair: ['stimulation', 'achievement'], kind: 'allocate', domain: '學習',
  title: '六次進修，往哪裡走？',
  setup: '假設接下來一個月，你有六個兩小時的進修時段，可以自由選擇。你能參加從沒試過的木工、即興或聲音採集短課，體驗新的活動；也能練習熟悉的工作技能，完成一份自己重視、可公開展示的作品。兩邊都需要認真投入，時間不能重疊。新課多一次，作品練習就少一次；六次全部分完。',
  total: 6, unit: '次',
  options: [
    { id: 'new-courses', label: '嘗試陌生領域短課', consequence: '接觸不同的新鮮體驗，也減少完成熟悉技能作品的練習。', valueId: 'stimulation' },
    { id: 'portfolio', label: '完成熟悉技能的作品', consequence: '累積可展示的成果，也放下部分嘗試新活動的機會。', valueId: 'achievement' },
  ],
}, {
  id: 'slot06-community', slotId: 'slot06', pair: ['stimulation', 'achievement'], kind: 'allocate', domain: '社群',
  title: '活動名額，留給嘗試還是成果？',
  setup: '假設一個開放社群讓你報名六個活動時段，費用與時間相同。你能逐次嘗試未接觸過的活動，也能持續練習一項已有基礎的技能，完成月底自己期待的成果展示。這不是工作要求，兩種安排都有人帶領，也都值得投入。每個名額只能選一邊，請把六個時段全部分完。',
  total: 6, unit: '個時段',
  options: [
    { id: 'try', label: '輪流嘗試新活動', consequence: '體驗不同內容，也減少完成同一項成果的練習。', valueId: 'stimulation' },
    { id: 'showcase', label: '練習月底成果展示', consequence: '完成自己重視的展示，也減少接觸其他新活動的時間。', valueId: 'achievement' },
  ],
}, {
  id: 'slot14-preparation', slotId: 'slot14', pair: ['security', 'fairness'], kind: 'allocate', domain: '社區',
  title: '六小時的準備，先顧哪些事？',
  setup: '假設你有六個一小時的空檔，可以整理自己的備援資料、緊急聯絡清單與防災物品，讓生活更能應付意外；也能參與社區多語與無障礙防災資訊整理，讓不熟悉中文或行動不便的人更容易取得資訊。現在沒有災情，兩件事都可延後，社區工作也不是你的責任。每小時只能做其中一件，六小時全部分完。',
  total: 6, unit: '小時',
  options: [
    { id: 'backup', label: '整理自己的備援與用品', consequence: '減少個人生活的不確定，也少一些整理公開資訊的時間。', valueId: 'security' },
    { id: 'accessible-info', label: '整理多語與無障礙資訊', consequence: '讓不同處境的人更容易取得資訊，也延後自己的備援準備。', valueId: 'fairness' },
  ],
}, {
  id: 'slot14-workflow', slotId: 'slot14', pair: ['security', 'fairness'], kind: 'allocate', domain: '工作',
  title: '六個改善時段，怎麼安排？',
  setup: '假設你可自行安排六個一小時的工作改善時段。你能建立自己負責工作的備援與交接流程，降低臨時中斷的不確定；也能把公開活動資訊整理成易讀版本，讓不同閱讀需求的人更容易參加。主管同意兩件事都可以做，沒有一項是規定責任，也沒有緊急期限。每個時段只能做其中一件，六個時段全部分完。',
  total: 6, unit: '個時段',
  options: [
    { id: 'handover', label: '建立備援與交接流程', consequence: '讓自己的工作較不怕突然中斷，也少一些改善公開資訊的時間。', valueId: 'security' },
    { id: 'easy-read', label: '整理公開活動易讀資訊', consequence: '涵蓋不同閱讀需求，也延後自己工作備援的整理。', valueId: 'fairness' },
  ],
}];
