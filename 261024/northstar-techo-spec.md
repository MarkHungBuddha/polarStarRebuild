# 北極星 · 手帳感 UI Spec

> 版本：v0.1（2026-10-24）
> 對應設計稿：Design 畫布「北極星 手帳感」（淺色 / 深色各三個畫面）
> 目標程式碼：`polarStarRebuild`（Vite + React + TypeScript，GitHub Pages）

---

## 1. 設計目標

| 目標 | 具體做法 |
|---|---|
| 像在寫自己的筆記，而不是做測驗 | 點格紙底、紙膠帶、略歪的紙卡、手寫字標題、螢光筆畫線 |
| 手機優先、操作輕鬆 | 單欄、選項卡片最小高度 76px、主要按鈕 56px、所有點擊區 ≥ 44px |
| 讀得舒服 | 內文用無襯線字、中文行高 1.7–1.85；手寫字只用在標題、情境文字和註記 |
| 不裝飾過度 | 一個畫面最多一條紙膠帶 + 一個貼紙；不用英文裝飾字（VOL.、SELF PORTRAIT 等） |
| 結果頁有洞察 | 重點是「第一幕排序」和「第二幕實際選擇」之間的落差，而不只是排名 |

**不做的事**：漸層背景、emoji、左側色條卡片、滿版插畫、動態粒子。

---

## 2. Design Tokens

### 2.1 顏色

所有顏色以 CSS custom properties 定義，元件只引用 token，不寫死 hex。

| Token | 淺色 | 深色 | 用途 |
|---|---|---|---|
| `--bg` | `#F6F1E7` | `#1E1C19` | 頁面底色 |
| `--dot` | `rgba(120,100,70,.22)` | `rgba(240,225,200,.10)` | 點格紙圓點 |
| `--paper` | `#FFFDF8` | `#2A2723` | 紙卡底色 |
| `--text` | `#2B2A27` | `#EDE6D8` | 主要文字 |
| `--text-body` | `#3D3A34` | `#DDD5C6` | 長段內文 |
| `--text-2` | `#5E584D` | `#B3AA99` | 次要文字、說明 |
| `--text-3` | `#6B655A` | `#A39A89` | 註腳、圖例 |
| `--rule` | `#DDD3C2` | `#4A443C` | 虛線分隔線 |
| `--stamp` | `#8C8273` | `#6E665A` | 印章外框、次要按鈕外框 |
| `--accent` | `#2F4A6D` | `#9DB6D6` | 墨水色：主按鈕、編號、勾選 |
| `--on-accent` | `#FBF8F2` | `#1E1C19` | 主按鈕上的文字 |
| `--tape` | `#EDBCAF` | `#EDBCAF` | 紙膠帶、貼紙、螢光筆 |
| `--tape-opacity` | `0.85` | `0.7` | 紙膠帶透明度 |
| `--marker` | `#EDBCAF` | `rgba(237,188,175,.35)` | 文字底下的螢光筆 |
| `--sticky` | `#FFF6D6` | `#3A3426` | 便利貼 |
| `--track` | `#E3DACB` | `#3A362F` | 進度條未完成段 |
| `--opt-bg` | `rgba(255,253,248,.7)` | `rgba(42,39,35,.85)` | 選項卡片（未選） |
| `--opt-bg-selected` | `#FFFDF8` | `#2A2723` | 選項卡片（已選） |
| `--opt-border` | `#DCD2C0` | `#4A443C` | 選項卡片外框（未選） |
| `--badge-bg` | `#EFE8DB` | `#3A362F` | 甲／乙徽章（未選） |
| `--disabled-bg` | `#D9D0C1` | `#34302A` | 停用按鈕 |
| `--disabled-fg` | `#5E584D` | `#8F8778` | 停用按鈕文字 |

**墨水色選項**：深色模式不能直接沿用淺色的墨水色（深藍在深底上對比不足），所以每個墨水色要成對定義。

| 名稱 | 淺色 `--accent` | 深色 `--accent` |
|---|---|---|
| 藍（預設） | `#2F4A6D` | `#9DB6D6` |
| 綠 | `#3E5B47` | `#A7C4AE` |
| 紅 | `#7A3E3E` | `#DDA3A3` |

**紙膠帶色選項**：粉 `#EDBCAF`（預設）、黃 `#EBCF8E`、綠 `#BFD1B5`。

> 實作建議：墨水色寫成成對的 token（`--accent-blue-light` / `--accent-blue-dark`），不要在 runtime 用演算法把淺色變亮。演算法算出來的顏色不一定過對比門檻。

### 2.2 對比檢查（WCAG 2.x，已實際計算）

| 組合 | 淺色 | 深色 |
|---|---|---|
| `--text` / `--bg` | 12.75 | 13.69 |
| `--text` / `--paper` | — | 11.97 |
| `--text-2` / `--paper` | 6.93 | 6.46 |
| `--text-2` / `--bg` | 6.26 | 7.39 |
| `--text-3` / `--bg` | 5.13 | 6.10 |
| `--accent` / `--paper`（藍） | 8.90 | 7.15 |
| `--accent` / `--paper`（綠） | 7.40 | 7.89 |
| `--accent` / `--paper`（紅） | 7.99 | 6.97 |
| `--on-accent` / `--accent`（藍） | 8.53 | 8.17 |
| `--text` / `--sticky` | 13.26 | 9.95 |
| `--disabled-fg` / `--disabled-bg` | — | 3.69（停用狀態，WCAG 豁免） |

全部文字組合 ≥ 4.5:1。新增顏色時要重跑這張表。

### 2.3 字體

| 角色 | 字體 | 字重 | 備援 |
|---|---|---|---|
| 手寫（標題、情境、註記、編號） | LXGW WenKai TC（霞鶩文楷 TC） | 400 / 700 | `'Klee One', serif` |
| 內文、UI | Noto Sans TC | 400 / 500 / 700 | `'PingFang TC', 'Microsoft JhengHei', sans-serif` |

| 用途 | 字體 | 尺寸 / 行高 | 字重 |
|---|---|---|---|
| 首頁大標 | 手寫 | 34px / 1.35 | 700 |
| 頁面標題（結果頁） | 手寫 | 28px | 700 |
| 結果主價值 | 手寫 | 44px / 1.1 | 700 |
| 品牌名 | 手寫 | 24px，字距 1px | 700 |
| 情境內文 | 手寫 | 19px / 1.85 | 400 |
| 內文段落 | 無襯線 | 15px / 1.85 | 400 |
| 選項標題 | 無襯線 | 16px | 500 |
| 小節標題 | 無襯線 | 15–16px | 700 |
| 說明文字 | 無襯線 | 13–14px / 1.7 | 400 |
| 註腳、圖例 | 無襯線 | 12px / 1.7 | 400 |
| 主按鈕 | 無襯線 | 17px，字距 1px | 500 |

**規則**

- 中文不設負字距。舊版 H1 的 `-3.7px` 是醜的主因之一。
- 手寫字不用在按鈕和超過三行的段落。
- 不用全大寫英文標籤。

### 2.4 間距、圓角、陰影

| Token | 值 |
|---|---|
| 頁面左右內距 | 24px |
| 頁面上內距 | 20–28px（有返回鍵的畫面用 20px） |
| 區塊間距 | 18–22px |
| 紙卡內距 | 上 30–34px（留紙膠帶位置）、左右 22px、下 22–24px |
| `--radius-paper` | 6px |
| `--radius-control` | 14px（按鈕、選項卡片） |
| `--radius-sticky` | 2px |
| `--shadow-paper` | 淺：`0 1px 0 rgba(60,40,10,.06), 0 8px 20px rgba(60,40,10,.08)`；深：`0 1px 0 rgba(0,0,0,.25), 0 10px 24px rgba(0,0,0,.35)` |
| `--shadow-button` | 淺：`0 3px 0 rgba(0,0,0,.2)`；深：`0 3px 0 rgba(0,0,0,.45)` |

### 2.5 可直接貼上的 CSS

```css
:root {
  --bg: #F6F1E7;
  --dot: rgba(120, 100, 70, .22);
  --paper: #FFFDF8;
  --text: #2B2A27;
  --text-body: #3D3A34;
  --text-2: #5E584D;
  --text-3: #6B655A;
  --rule: #DDD3C2;
  --stamp: #8C8273;
  --accent: #2F4A6D;
  --on-accent: #FBF8F2;
  --tape: #EDBCAF;
  --tape-opacity: .85;
  --marker: var(--tape);
  --sticky: #FFF6D6;
  --track: #E3DACB;
  --opt-bg: rgba(255, 253, 248, .7);
  --opt-bg-selected: #FFFDF8;
  --opt-border: #DCD2C0;
  --badge-bg: #EFE8DB;
  --disabled-bg: #D9D0C1;
  --disabled-fg: #5E584D;
  --shadow-paper: 0 1px 0 rgba(60, 40, 10, .06), 0 8px 20px rgba(60, 40, 10, .08);
  --shadow-button: 0 3px 0 rgba(0, 0, 0, .2);
  --radius-paper: 6px;
  --radius-control: 14px;
  --font-hand: 'LXGW WenKai TC', 'Klee One', serif;
  --font-sans: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* 同下方深色值 */ }
}

:root[data-theme="dark"] {
  --bg: #1E1C19;
  --dot: rgba(240, 225, 200, .10);
  --paper: #2A2723;
  --text: #EDE6D8;
  --text-body: #DDD5C6;
  --text-2: #B3AA99;
  --text-3: #A39A89;
  --rule: #4A443C;
  --stamp: #6E665A;
  --accent: #9DB6D6;
  --on-accent: #1E1C19;
  --tape-opacity: .7;
  --marker: rgba(237, 188, 175, .35);
  --sticky: #3A3426;
  --track: #3A362F;
  --opt-bg: rgba(42, 39, 35, .85);
  --opt-bg-selected: #2A2723;
  --opt-border: #4A443C;
  --badge-bg: #3A362F;
  --disabled-bg: #34302A;
  --disabled-fg: #8F8778;
  --shadow-paper: 0 1px 0 rgba(0, 0, 0, .25), 0 10px 24px rgba(0, 0, 0, .35);
  --shadow-button: 0 3px 0 rgba(0, 0, 0, .45);
  color-scheme: dark;
}

body {
  margin: 0;
  background-color: var(--bg);
  background-image: radial-gradient(var(--dot) 1px, transparent 1.3px);
  background-size: 20px 20px;
  color: var(--text);
  font-family: var(--font-sans);
}
```

> `prefers-color-scheme` 區塊裡的深色值要和 `[data-theme="dark"]` 完全一樣。建議用 Sass mixin 或 PostCSS 產生，避免兩份手動同步。

---

## 3. 視覺元素（Motifs）

| 元素 | 規格 | 使用限制 |
|---|---|---|
| 點格紙 | `radial-gradient` 1px 圓點，間距 20px，畫在 `body` | 全站 |
| 紙卡 `PaperCard` | `--paper` 底、6px 圓角、`--shadow-paper`、旋轉 −1°～+1° | 每個畫面最多一張主卡 |
| 紙膠帶 `Tape` | 84–104 × 24–26px、`--tape` + `--tape-opacity`、旋轉 −5°～+5°、壓在紙卡上緣 −11～−12px | 每張紙卡一條 |
| 星星貼紙 | 五角星 path，填 `--tape`、描邊 `--accent`，旋轉 8°～12° | 情境卡右上角、結果主價值 |
| 螢光筆 | 文字：`linear-gradient(transparent 58%, var(--marker) 58%)`；長條：14px 高、`skewX(-8deg)` | 每段最多一處 |
| 印章 | 13px 手寫字、1.5px `--stamp` 外框、膠囊形、旋轉 ±3° | 頁首右側 |
| 便利貼 | `--sticky` 底、2px 圓角、旋轉 1° | 結果頁註記 |
| 虛線 | `1.5px dashed var(--rule)` | 清單分隔、問句上緣 |

### 3.1 旋轉的實作方式（重要）

設計稿是直接對整張卡片 `transform: rotate()`。**正式實作不要這樣做**：旋轉文字容器會讓中文在部分螢幕（尤其 Windows、非 Retina）變模糊，也會讓文字選取和無障礙工具的框框歪掉。

建議把旋轉只放在背景層：

```css
.paper-card {
  position: relative;
  isolation: isolate;
}
.paper-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--paper);
  border-radius: var(--radius-paper);
  box-shadow: var(--shadow-paper);
  transform: rotate(var(--tilt, -0.8deg));
}
```

文字保持水平，視覺上仍然有歪斜紙張的感覺。紙膠帶和貼紙本身沒有文字，可以直接旋轉。

---

## 4. 元件

### 4.1 `Button`

| 變體 | 樣式 |
|---|---|
| `primary` | 高 54–56px、`--accent` 底、`--on-accent` 字、14px 圓角、`--shadow-button`，可帶右箭頭 icon |
| `secondary` | 高 54px、透明底、1.5px `--stamp` 外框、`--text` 字 |
| `disabled` | `--disabled-bg` / `--disabled-fg`、無陰影、`disabled` 屬性 |

- 按下時：`transform: translateY(2px)` 並把陰影縮成 `0 1px 0`，模擬按壓。
- 焦點：`outline: 2px solid var(--accent); outline-offset: 3px`。

### 4.2 `ChoiceOption`（情境選項）

| 狀態 | 外框 | 底色 | 徽章 |
|---|---|---|---|
| 未選 | 2px `--opt-border` | `--opt-bg` | `--badge-bg` 底、`--text` 字 |
| 已選 | 2px `--accent` | `--opt-bg-selected` | `--accent` 底、`--on-accent` 字，右側顯示勾選 icon |

- 最小高度 76px，內距 14px 16px，左徽章 34px 圓形（甲／乙，手寫字 17px）。
- 主標 16px/500，副標 13px `--text-2`。

**語意（修正設計稿）**：設計稿用了 `aria-pressed` 按鈕，但這是「二選一」，語意上應該是單選群組。正式實作請用：

```tsx
<fieldset>
  <legend className="sr-only">你會先顧哪一件？</legend>
  <label className="choice-option">
    <input type="radio" name={`scene-${id}`} value="a" className="sr-only" />
    …
  </label>
</fieldset>
```

這樣鍵盤可以用方向鍵切換，螢幕閱讀器會念出「第 1 個，共 2 個」。

### 4.3 `ProgressSegments`

- 15 段、高 6px、間距 4px、3px 圓角。
- 已完成：`--accent`；目前：`--tape`；未完成：`--track`。
- 外層 `role="progressbar"`、`aria-valuemin="1"`、`aria-valuemax="15"`、`aria-valuenow={current}`、`aria-label="第二幕進度"`。（設計稿用的是 `role="img"`，正式版改成 progressbar。）
- 頁首右側同時顯示「4 / 15」文字，不單靠顏色傳達進度。

### 4.4 `StepList`（首頁兩幕說明）

- 編號：30px 圓、1.5px `--accent` 外框、手寫字 16px/700。
- 每列上下 14px、列與列之間 `1.5px dashed var(--rule)`。
- 用 `<ol>`。

### 4.5 `RankRow`（結果頁）

- 高 42px，下緣虛線。
- 欄位：排名（手寫 17px `--accent`）｜價值名（15px/500，寬 44px）｜螢光筆長條（flex 1）｜不一致標記（`!` icon，`aria-label="排序和選擇不一致"`）。

### 4.6 `StickyNote`

- `--sticky` 底、內距 14px 16px、手寫字 16px / 1.7、旋轉 1°（同樣只旋轉背景層）。

### 4.7 `Stamp`

- 手寫字 13px、`--text-2`、1.5px `--stamp` 外框、`padding: 3px 12px`、膠囊形、旋轉 ±3°。

---

## 5. 畫面

畫面基準：390 × 844。超過 480px 寬時，內容欄固定 `max-width: 440px` 置中，兩側露出點格紙。

### 5.1 首頁

由上而下：

1. **頁首**：星星 icon + 「北極星」（手寫 24px）｜右側印章「反思筆記 · 01」。
2. **主紙卡**（紙膠帶在上緣中央）
   - 小字「今天，留十五分鐘給自己」（手寫 15px `--text-2`）
   - 大標「你重視什麼，／會怎麼選？」
   - 段落，最後「先顧哪一件」加螢光筆
   - `StepList`：第一幕、第二幕
   - 資訊列：時鐘 icon「約 15 分鐘」、鎖頭 icon「答案只存在你的裝置」
3. **底部**（`margin-top: auto` 貼底）：主按鈕「開始這次反思」＋註腳「參考 Schwartz 價值理論設計的自編反思工具，不是診斷。」和「關於這份題目」連結。

舊版的三行免責聲明（尚未驗證、尚未實測等）移到「關於這份題目」頁。

### 5.2 第二幕 · 情境題

1. **頁首**：返回鍵（44 × 44，`aria-label="上一題"`）｜「第二幕 · 情境中的取捨」｜「4 / 15」（手寫、`--accent`）。
2. `ProgressSegments`。
3. **情境紙卡**：紙膠帶在左上、星星貼紙在右上；標籤「情境 04 · 週六傍晚」；情境內文（手寫 19px）；虛線下方問句「你會先顧哪一件？」（16px/700）。
4. **兩個 `ChoiceOption`**（甲、乙），間距 12px。
5. **底部**：「下一個情境」主按鈕（未選擇時停用）＋提示「沒有對錯，選你此刻真的會做的那個。」

### 5.3 結果頁

1. **頁首**：「範例結果 · 第 1 次反思」小字 + 「你的北極星」標題｜右側日期印章。
2. **主價值紙卡**：96px 星星貼紙＋「你最常回到的方向」＋價值名（手寫 44px `--accent`）＋一句定義。
3. **對照清單**：「你排的順序 × 情境中的選擇」＋圖例「螢光筆越長＝越常選」，列出前 5 名 `RankRow`。
4. **便利貼註記**：挑出落差最大的一組，用一句話描述並以問句收尾。
5. **底部**：「重新開始」（secondary）＋「存成圖片分享」（primary，比例 1 : 1.4）。

---

## 6. 互動

| 行為 | 規格 |
|---|---|
| 選擇選項 | 點擊即選取，可改選；選取後「下一個情境」啟用 |
| 進入下一題 | 情境卡從右側淡入（`opacity` + `translateX(16px)`，200ms，`ease-out`） |
| 返回上一題 | 保留先前的選擇 |
| 按鈕按壓 | `translateY(2px)`，80ms |
| `prefers-reduced-motion: reduce` | 關閉所有位移動畫，只保留 `opacity` |

---

## 7. 深色模式

- 預設跟隨系統（`prefers-color-scheme`），使用者可手動切換，選擇寫入 `localStorage`。
- `localStorage` 讀寫一律包 `try/catch`（無痕模式、Safari 封鎖第三方儲存時會丟例外），失敗就回到跟隨系統。
- 在 `index.html` 的 `<head>` 放一小段 inline script，在 React 掛載前就設好 `data-theme`，避免首屏先閃白再變黑。

```html
<script>
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch (e) {}
</script>
```

- 深色模式的紙膠帶透明度降到 0.7、螢光筆改成 35% 透明，避免在深底上太刺眼，也確保螢光筆上的淺色文字仍可讀。
- **分享圖片一律用淺色輸出**。深色截圖分享到 IG / LINE 時，在淺色介面中會像一塊黑洞，而且手帳感本來就是紙張的隱喻。（如果你不同意，這是第 9 節的待決事項之一。）

---

## 8. 字型載入

LXGW WenKai TC 是完整的中文字型，原始檔數 MB。兩種做法：

| 做法 | 優點 | 缺點 |
|---|---|---|
| Google Fonts `css2` | 自動依 `unicode-range` 切片，只下載頁面用到的字 | 多一個第三方請求；無法離線 |
| 自架 + 子集化 | 可控、可離線、可 preload | 題庫改字就要重新子集化 |

**建議**：先用 Google Fonts（加 `display=swap`），上線後量 LCP。如果首屏標題閃字明顯，再改成自架並用 `pyftsubset` 依題庫文字產生子集。現有的 Noto 自架流程可以沿用。

- 手寫字只用 400、700 兩個字重，不要載 300。
- 分享圖片用 `html-to-image` 之類工具產生時，要確認字型已經 `document.fonts.ready`，否則截出來會是備援字體。

---

## 9. 待決事項與風險

1. **螢光筆長條的精準度**：15 個情境、10 個價值，每個價值平均只出現約 3 次。長條長度 88% vs 80% 其實是「3 次選了 3 次」對「3 次選了 2 次」的差別，長條會讓人誤以為很精確。建議改成直接寫次數（例如「3 次中選了 2 次」），或至少在長條旁標出次數。
2. **「很難選」選項**：要不要允許第三個選項？允許的話資料比較誠實，但結果比較難解讀。
3. **選完自動跳下一題，還是按「下一個」？** 自動跳比較順，但容易誤觸；目前設計是手動，可做 A/B。
4. **結果主價值的選法**：是依第一幕排序第一名，還是第二幕最常選的？設計稿標的是「最常回到的方向」，代表用第二幕。兩者不同時，便利貼要負責解釋。
5. **分享圖片的深淺色**：第 7 節建議一律淺色，待確認。
6. **第一幕畫面還沒設計**：拖曳排序、可以並列，是互動最複雜的一頁，也最能檢驗這套風格撐不撐得住。手機上的拖曳要另外考慮可及性（提供上下移動按鈕作為替代）。

---

## 10. 實作檢查清單

- [ ] 所有顏色都走 token，元件內沒有寫死的 hex
- [ ] 淺色、深色、跟隨系統三種狀態都測過
- [ ] 首屏沒有閃白
- [ ] 紙卡旋轉只在背景層，文字是水平的
- [ ] 情境選項是 radio group，可用鍵盤操作
- [ ] 進度條有 `role="progressbar"` 和數值
- [ ] 所有點擊區 ≥ 44 × 44
- [ ] `prefers-reduced-motion` 下沒有位移動畫
- [ ] 390px 和 320px 寬都不會橫向捲動
- [ ] 分享圖片的字型正確
