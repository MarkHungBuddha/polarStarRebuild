# 結果連結長度與版本相容性研究

對應 issue：#26（上層 #25）。這份只整理事實與數字，不做決定。

程式碼依據：`origin/master` 的 `7d1d35b`。題庫共 30 個題目變體、15 個題位（每個題位 2 個變體），每次作答 15 題。目前 `catalogVersion` = `c18hay5z`。

## 1. 三種內容編進網址的長度

### 量測方法

用一支一次性腳本（不在 repo 內）直接匯入 `src/scenarios.ts`、`src/data.ts`、`src/questionPlan.ts`、`src/valueRanking.ts`，以 Node 26 跑：

1. 依現有 `Session` 結構隨機產生完整作答：十個核心價值各有分類與順序；15 題各有已確認答案（choice／strike 選項、slider 數值、allocate 的 `allocations` 與 `placements`）。
2. 用 `act1TopThree`、`scenarioTallies`、`scenarioTopThree` 算出兩份前三名與「選了 N 次／共 M 題」。
3. 每種內容做兩種表示法，各量三種長度：
   - **直接 JSON**：沿用 app 現有欄位名稱，例如 `{"v":"c18hay5z","act1Top":[{"id":"achievement","position":1},…]}`；第 3 種直接放 `session.answers`。
   - **精簡編碼**：純 ASCII 位置式字串。價值用 `baseValues` 的索引（0–9）、分類用一個字母、順序用 base36、每題用「變體索引＋答案」（選項索引、slider 數值、allocate 的 `placements` 位元遮罩轉 base36）。範例：`c18hay5z~132739~15332322302334233623~c1c2c3a1c4b1c5a2c6a3~1c.10.12.01.01.0f.01.01.11.02.11.00.10.11c.00`。
   - 長度分三欄：`encodeURIComponent` 後的字元數（放進 `#` 而且在聊天 App 裡不會被斷開的保守寫法）、`CompressionStream('deflate-raw')` 壓縮後轉 base64url 的字元數，以及完整網址 `https://northstarmetric.org/#r=…` 的總長。
4. 沒有自訂價值的情況跑 300 組隨機作答，取最小值／中位數／最大值。另外單獨量含 1 個、3 個自訂價值（每個 24 個中文字，也就是輸入框 `maxLength` 的上限）的情況。

內容層級：

- **L1**：兩份前三名，加上情境前三名各自的「選了 N 次／共 M 題」，再加版本字串。
- **L2**：L1 再加上第一幕每個價值的分類與順序。
- **L3**：L2 再加上 15 題已確認答案。

### 結果：沒有自訂價值（300 組，`#` 後字元數，最小／中位數／最大）

| 內容 | 直接 JSON，百分比編碼 | 直接 JSON，deflate-raw＋base64url | 精簡編碼（不壓縮） | 精簡編碼，deflate-raw＋base64url |
|---|---|---|---|---|
| L1 | 500／600／865 | 163／187／216 | 28／32／44 | 34／46／55 |
| L2 | 1328／1429／1693 | 296／316／338 | 49／53／65 | 58／63／71 |
| L3 | 3452／3568／3842 | 763／800／828 | 94／99／111 | 86／95／108 |

完整網址要再加 `https://northstarmetric.org/#r=` 的 31 個字元。

觀察：

- 直接 JSON 的 `{`、`"`、`:` 都要百分比編碼，長度幾乎翻倍。未編碼的原始 JSON（單一樣本）：L1 約 280–390 字元，L3 約 2,100–2,600 字元。
- 精簡編碼的 L1、L2 太短，壓縮反而更長（deflate 的區塊標頭和 base64 的 4/3 倍膨脹蓋過了節省的部分）。L3 精簡編碼壓縮後只短不到 10%。
- gzip 比 deflate-raw 多 24 個 base64url 字元（18 bytes 的標頭與檢查碼）。

### 結果：有自訂價值（單一樣本，`#` 後字元數）

自訂價值只影響 L2、L3（L1 不含自訂價值）。中文在 UTF-8 是 3 bytes，放進 `#` 會被百分比編碼成 `%XX%XX%XX`，一個字 9 個字元。

| 內容 | 自訂價值數 | 直接 JSON，百分比編碼 | 直接 JSON，deflate＋b64url | 精簡編碼，百分比編碼 | 精簡編碼，deflate＋b64url |
|---|---|---|---|---|---|
| L2 | 1 | 1895 | 536 | 276 | 175 |
| L2 | 3 | 2620 | 790 | 696 | 332 |
| L3 | 1 | 4029 | 1022 | 322 | 208 |
| L3 | 3 | 4753 | 1306 | 743 | 372 |

自訂價值的內容是使用者自己輸入的字，連結帶上它，就等於把這段文字公開給所有拿到連結的人。

### 量測限制

- Node 的 `CompressionStream` 和瀏覽器的實作都不能指定壓縮等級，輸出可能差幾個 bytes；數量級不會變。
- `placements` 是選填欄位。精簡編碼若只存 `allocations[0]`，allocate 題每題約可再省 1 個字元。
- 精簡編碼只是量測用的一種寫法，不是提案。

## 2. 平台與瀏覽器對網址長度和 `#` 片段的限制

### 已用一手來源確認

| 項目 | 事實 | 來源 |
|---|---|---|
| 片段不送到伺服器 | 片段在取用資源之前就從 URI 分離，只由使用者代理（瀏覽器）解讀。GitHub Pages 和任何預覽爬蟲都收不到 `#` 之後的內容。 | [RFC 3986 §3.5](https://www.rfc-editor.org/rfc/rfc3986.html#section-3.5) |
| HTTP 的長度建議 | 「建議所有傳送端與接收端至少支援 8000 octets 的 URI」。這是對請求目標的建議，片段不在請求裡。 | [RFC 9110 §4.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-4.1) |
| URL 標準沒有長度上限 | WHATWG URL Standard 沒有規定最大長度。片段的百分比編碼集合包含 C0 控制字元、空白、`"`、`<`、`>`、`` ` `` 與所有大於 U+007E 的字元，所以中文一定會被編碼。 | [URL Standard](https://url.spec.whatwg.org/)（fragment percent-encode set） |
| Chrome／Chromium | 網址上限 2MB；網址列在多數平台最多顯示 32kB（`kMaxURLDisplayChars`），VR 平台 1kB。 | [Chromium URL display guidelines](https://chromium.googlesource.com/chromium/src/+/main/docs/security/url_display_guidelines/url_display_guidelines.md) |
| `CompressionStream` | 支援 `gzip`、`deflate`、`deflate-raw`（另有 `brotli`、`zstd`）。MDN 標為 Baseline Widely available，自 2023 年 5 月起各主要瀏覽器都可用；但 MDN 也註明「部分功能支援程度不一」，`brotli`、`zstd` 的支援範圍這次沒查。 | [MDN CompressionStream()](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream/CompressionStream) |

### 實測報告（非官方文件）

| 項目 | 事實 | 來源 |
|---|---|---|
| Firefox | 「標準」上限 1MB（偏好設定可調，絕對上限 512MB）；歷史紀錄與書籤只存 2,000 字元以內的網址。 | [Simon Willison, URL limits investigation（2025-12）](https://simonwillison.net/2025/Dec/23/url-limits-investigation/)。Mozilla 原始碼裡的預設值沒有核對。 |

### 未驗證（找不到一手來源）

下列項目沒有找到官方文件或可靠的實測報告，要靠實機測試確認：

- **Safari／WebKit 的網址長度上限**：沒找到 WebKit 文件。
- **LINE、Facebook、Messenger、Threads、Instagram 私訊、iMessage 的內建瀏覽器會不會截掉或改寫 `#` 之後的內容**：沒找到任何一家的官方說明。這些內建瀏覽器底層是 iOS 的 WKWebView／SFSafariViewController 或 Android WebView，引擎本身會保留片段；但 App 可能先經過自己的轉址（例如 Facebook 的 `l.facebook.com` 外連轉址）、加上追蹤參數，或用外部瀏覽器開啟，這些環節會不會保留片段都沒有文件。
- **LINE 的 `openExternalBrowser=1`**：只找到第三方實測（[classmethod 文章](https://dev.classmethod.jp/articles/line-open-uri-in-external-browser/)），沒拿到 LINE 官方 URL scheme 頁面原文。這個參數要放在 query，不是 `#`。LINE 官方文件只說 LIFF 的端點 URL 不能帶片段，LIFF URL 的片段會被搬進 `liff.state`（[LINE Developers](https://developers.line.biz/en/docs/liff/opening-liff-app/)），但本專案不是 LIFF app，不適用。
- **各 App 的訊息字數上限**：LINE Messaging API（機器人送訊）5,000 字、Instagram 私訊 1,000 字、Threads 貼文 500 字等數字都只出現在第三方整理，沒有官方頁面可引用。另外，Threads 的網址算不算進 500 字也沒有官方說法。如果這些數字屬實，L3 直接 JSON 百分比編碼（約 3,500–4,800 字元）會超過 Instagram 私訊和 Threads 貼文的上限；壓縮後（約 800–1,300 字元）仍可能超過 Instagram 的 1,000 字。
- **聊天 App 自動把文字轉成連結時的斷點**：沒找到文件。只用 RFC 3986 的 unreserved 字元（`A–Z a–z 0–9 - . _ ~`）比較安全，這是推測，尚未驗證。

### 與片段直接相關、已可推得的事實

- 因為片段不會送到伺服器（RFC 3986 §3.5），LINE、Facebook、iMessage 等產生的連結預覽卡只看得到 `#` 之前的網址。所有結果連結的預覽都會一樣，不能依結果換預覽圖或標題。
- GitHub Pages 的請求長度限制和伺服器紀錄都碰不到片段內容。

## 3. `catalogVersion` 怎麼算、什麼情況會變

### 計算方式

`src/questionPlan.ts`：

```ts
export const catalogVersion = `c${hash(JSON.stringify(scenarios)).toString(36)}`;
```

- `hash` 是 32 位元 FNV-1a，以 UTF-16 code unit 逐一計算。
- 輸入是整個 `scenarios` 陣列的 `JSON.stringify`（目前 13,838 字元），也就是 `src/scenarios.ts` 依序串接的 slider、strike、allocation、choice-slots、slot04 五個題庫。
- 輸出是 `c` 加上 base36，目前 8 個字元。

### 會讓版本改變的修改（實測）

| 修改 | 新版本 |
|---|---|
| 無（基準） | `c18hay5z` |
| 第一題 `setup` 多一個「。」 | `c1bquwun` |
| 題庫順序反過來 | `c141apxz` |
| 第一題 slider `max` 從 24 改 25 | `cqz1s5s` |
| 只調整物件欄位的順序，內容不變 | `c1hjgl3v` |
| 新增一個變體 | `c154ekh4` |

任何會影響 `JSON.stringify(scenarios)` 的修改都會換版本：題目文字、選項文字或 `id`、`pair`、`valueId`、數值範圍、題目順序、欄位順序，甚至純排版的標點修改。

### 不會讓版本改變、但會影響結果的東西

這些檔案不在雜湊範圍內：

- `src/scenarios/slider-leans.ts`：slider 的偏向門檻（`atMost`／`atLeast`、`lowValue`／`highValue`）。改門檻後，同一個 slider 數值算出的偏向可能不同，「選了 N 次／共 M 題」和情境前三名也會跟著變，版本卻不變。
- `src/valueRanking.ts`：前三名與計次規則。
- `src/data.ts`：核心價值的 `id`、名稱、說明，以及 `categoryOrder`。
- `src/choiceStages.ts`：題目的場景道具與文字。
- `src/sessionStorage.ts` 的 `schemaVersion`（目前為 1）是本機存檔用的另一個版本號，和 `catalogVersion` 無關。

### 現有的使用方式

- 題目連結（`questionShareLink`／`requestedQuestions`）：網址帶 `seed=p.<各題位變體索引>` 和 `v=<catalogVersion>`。`v` 不等於目前版本時，直接顯示「這份分享題目的版本目前無法使用」，不嘗試解讀。
- 看過的題目紀錄（`seenHistory.ts`）：版本不同就整份捨棄。
- 本機存檔（`sessionStorage.ts`）：沒有用 `catalogVersion`，而是把每題快照和目前題庫逐題 `JSON.stringify` 比對，有任何一題不同就判定不相容。
- 部署後的程式只帶目前這一版題庫，沒有保留舊版題庫。

### 結果連結帶原始答案時，題庫改版會怎麼壞

如果連結帶的是 L3 那種原始答案，用的又是舊版題庫：

1. **只比對版本**：只要題庫有任何修改，連標點都算，所有舊連結都會被判定不相容，打不開。
2. **不比對版本、直接套用目前題庫**，可能出現：
   - 變體 `id` 或選項 `id` 改名、刪除 → 找不到題目或選項，答案無法解讀。
   - 精簡編碼用位置索引（例如變體索引、選項索引），題目順序或選項順序一改，答案就會無聲地對到別的題目或另一個選項，不會報錯。
   - slider 的 `min`／`max`／`step` 改了 → 舊數值可能超出範圍，或落在範圍內但意思變了。
   - allocate 的 `total` 改了 → `allocations` 加總不符。
   - 題目的 `pair` 或選項的 `valueId` 改了 → 同一個答案會算到別的價值上。
   - 題目文字改寫但 `id` 不變 → 答案還能套用，但分享者當時讀到的題目和開啟者看到的不同。
3. **版本相同、結果仍可能不同**：改了 `slider-leans.ts` 的門檻或 `valueRanking.ts` 的規則，`catalogVersion` 不會變，但用原始答案重新算出來的前三名可能和分享者當時看到的不一樣。只帶 L1 計算結果的連結不受這點影響，因為它不需要重算。
4. **核心價值改動**：`data.ts` 的價值 `id` 或順序改了，`catalogVersion` 不會變。L1、L2 用價值 `id` 存的連結會對不到價值，用索引存的則會無聲地對錯價值。

32 位元雜湊理論上可能碰撞，兩個不同題庫算出相同版本，機率約 1／2³²。

## 來源

- RFC 3986 §3.5 Fragment：<https://www.rfc-editor.org/rfc/rfc3986.html#section-3.5>
- RFC 9110 §4.1 URI References：<https://www.rfc-editor.org/rfc/rfc9110.html#section-4.1>
- WHATWG URL Standard：<https://url.spec.whatwg.org/>
- Chromium URL display guidelines：<https://chromium.googlesource.com/chromium/src/+/main/docs/security/url_display_guidelines/url_display_guidelines.md>
- MDN CompressionStream()：<https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream/CompressionStream>
- Simon Willison, URL limits investigation：<https://simonwillison.net/2025/Dec/23/url-limits-investigation/>
- LINE Developers, Opening a LIFF app：<https://developers.line.biz/en/docs/liff/opening-liff-app/>
- classmethod, LINE 内で開く URL を外部ブラウザで開く方法：<https://dev.classmethod.jp/articles/line-open-uri-in-external-browser/>
