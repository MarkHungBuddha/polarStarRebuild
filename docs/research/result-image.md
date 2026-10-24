# 結果圖產生方式與分享支援研究

對應 issue：#27（上層 #25）。這份只整理事實與比較，不做決定。

程式碼依據：`origin/master` 的 `7d1d35b`。查證日期：2026-10-24。

證據等級標示：

- **〔文件〕**：規格、MDN、browser-compat-data（BCD）、瀏覽器或平台官方文件、套件原始碼。
- **〔實測〕**：這次用 curl／npm registry／bundlephobia API 直接量到的數字。
- **〔回報〕**：GitHub issue、論壇、部落格等開發者回報，沒有官方確認。
- **〔未驗證〕**：找不到可靠來源，只能靠實機測試確認。

## 0. 專案現況（和 issue 敘述的差異）

- issue 寫的是 Noto Serif TC／Noto Sans TC，但 `origin/master` 已換成手帳風格：`index.html` 用 Google Fonts 載入 **LXGW WenKai TC（400、700）** 和 **Noto Sans TC（400、500、700）**，`<link rel="stylesheet" … media="print" onload="this.media='all'">` 非阻塞載入。Noto Serif TC 只出現在舊的本機 `master`（`61c5320`）。
- 字型 token 在 `src/techo.css`：`--font-hand: 'LXGW WenKai TC', 'Klee One', 'Kaiti TC', 'DFKai-SB', serif`、`--font-sans: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif`。
- 主題：`index.html` 的行內腳本在第一次繪製前設定 `<html data-theme="light|dark">`（讀 `localStorage` 的 `northstar-theme`，沒有就看 `prefers-color-scheme`），顏色全是 `:root` 與 `:root[data-theme='dark']` 底下的 CSS 自訂屬性（例如 `--paper`、`--tape`、`--accent`）。背景點陣用 `radial-gradient`，紙膠帶用 `::after` 偽元素。
- 目前沒有任何產生圖片或 Web Share 的程式碼；`ShareFooter.tsx` 只有複製題目連結。

## 1. 產生方式比較

| 做法 | 原理 | 套件大小（min／gzip）〔實測〕 | 最新版與發布日〔實測〕 | 中文網頁字型 | 主題 |
|---|---|---|---|---|---|
| 手寫 Canvas 2D | 直接用 `fillText`、`fillRect` 等畫到 1080×1350 的 `<canvas>`，再 `toBlob()` | 0（瀏覽器內建） | — | 直接用 `document.fonts` 裡已載入的字型；沒載入就用替代字型（見 §2） | 自己從 CSS 自訂屬性讀色值 |
| 手寫 SVG 轉圖 | 組 SVG 字串（`<text>` 等）→ 當 `<img>` 載入 → `drawImage` 到 canvas | 0 | — | SVG 當圖片時不能載入外部資源，字型必須以 `data:` URL 內嵌 | 自己帶色值 |
| html-to-image | 複製 DOM、複製計算後樣式，包進 SVG `<foreignObject>` 再畫到 canvas | 13,452／5,266 B | 1.11.13，2025-02-14 | 自動抓樣式表的 `@font-face` 轉 `data:` 內嵌；也可自行傳 `fontEmbedCSS` | 沿用當下 DOM 的計算後樣式 |
| modern-screenshot | 同 html-to-image 路線（foreignObject），另有 worker 等選項 | 25,673／9,739 B | 4.7.0，2026-04-16 | 同上，依 font-family 篩選 | 同上 |
| dom-to-image-more | 同路線，dom-to-image 的分支 | 28,901／10,093 B | 3.11.0 | 同上 | 同上 |
| html2canvas | 讀 DOM 屬性後用 Canvas API 自己重畫，不是真截圖 | 199,489／46,516 B | 1.4.1，**2022-01-22 之後沒有新版** | 用 `fillText` 畫字，吃 `document.fonts` 已載入的字型 | 讀計算後樣式；只支援它認得的 CSS 屬性 |
| html2canvas-pro | html2canvas 的維護分支 | 208,994／63,147 B | 2.5.2，2026-10-07 | 同 html2canvas | 同 html2canvas |
| satori（參考） | JSX → SVG，需自備字型檔 ArrayBuffer | 1,778,816／674,960 B | 0.63.2 | 要把字型檔整個交給它 | 自己帶色值 |

補充：

- 套件大小來自 bundlephobia API（`/api/size?package=…`），版本與發布日來自 npm registry。上週下載量：html2canvas 約 1,180 萬、html-to-image 約 500 萬、modern-screenshot 約 196 萬〔實測〕。
- html2canvas 官方文件寫明它「根據從 DOM 讀到的屬性建出畫面的表示」，只能正確畫出它理解的 CSS 屬性，跨來源圖片需要 proxy〔文件〕。專案用到的 `radial-gradient`、偽元素、`transform: rotate()` 是否都畫得對，要實測〔未驗證〕。
- html-to-image README 說明靠 `<foreignObject>` 運作；`pixelRatio` 預設是裝置像素比，要固定輸出 1080×1350 時可用 `pixelRatio: 1` 或 `canvasWidth`／`canvasHeight`；`backgroundColor` 可指定背景色；DOM 很大時可能撞到瀏覽器的 data URI 長度上限〔文件〕。
- html-to-image 在 GitHub 上有多個長期未關閉的 Safari／iOS issue，例如 #361「Image is not showing in some cases iOS, Safari」（29 則留言）、#292「First render of image (on mobile) is broken, on refresh rendered image is correct」、#488「Suggestion for blank image on safari」、#569「html-to-image not working on Safari」（2025-12）〔回報〕。
- 1080×1350 = 1,458,000 像素，畫布尺寸本身不大；iOS 的 canvas 記憶體上限這次沒有查到官方數字〔未驗證〕。

## 2. 中文網頁字型：輸出時字型還沒載入會怎樣

### Canvas（手寫 Canvas、html2canvas 系列）

- HTML 規格（canvas 章節）：字型在**完全載入前就被使用**時，「必須當成未知字型處理」，改用替代字型〔文件〕。也就是說，畫的當下字型沒到，那張圖就是替代字型，事後字型載入也不會重畫。
- `document.fonts.load(font, text)` 的 `text` 參數會把要載入的 font face 限定為 `unicode-range` 涵蓋這些字元的那些；預設只有一個空白字元〔文件，MDN〕。所以要畫哪些中文，就要把那些字串傳進去，例如 `document.fonts.load('700 64px "LXGW WenKai TC"', 要畫的全部文字)`，等 Promise 完成後再畫。
- `document.fonts.ready` 只代表「目前排定的載入都結束了」，不保證圖上要用的字已經載入（網頁上沒出現過的字所在的切片，不會被排定）。這點是從上面規格推得的〔推論〕。

### Google Fonts 的 CJK 切片

- Google Fonts 把 CJK 字型切成很多切片，每片在 `@font-face` 用 `unicode-range` 宣告，瀏覽器只抓頁面上用到的字所在的切片；先放最常用字，其餘依碼位分成約 100 片〔文件，Google Developers Blog〕。
- 實際抓專案目前的 CSS（`LXGW WenKai TC:wght@400;700` + `Noto Sans TC:wght@400;500;700`）〔實測〕：
  - LXGW WenKai TC 每個字重 115 片、Noto Sans TC 每個字重 108 片，共 554 個 `@font-face`。
  - 全部 woff2 切片加總：LXGW WenKai TC 約 9.4 MB、Noto Sans TC 約 12.8 MB，合計約 **22.2 MB**。單片約 25–75 KB。
  - `fonts.googleapis.com` 的 CSS 與 `fonts.gstatic.com` 的字型檔都回 `Access-Control-Allow-Origin: *`，所以前端用 `fetch` 抓得到。

### SVG 轉圖、foreignObject 系列（html-to-image、modern-screenshot 等）

- SVG 當圖片使用（`<img>`、CSS 背景、canvas `drawImage`）時「不能載入外部資源（例如圖片、樣式表），以 `data:` URL 內嵌則可以」〔文件，MDN〕。字型因此必須轉成 `data:` 內嵌，否則就用替代字型。
- html-to-image 的 `embed-webfonts.ts` 先收集所有樣式表的 `@font-face`，再**只用 font-family 名稱**篩掉節點沒用到的字型家族（`getUsedFonts`），沒有依 `unicode-range` 或字重篩選〔文件，原始碼〕。modern-screenshot 的 `embed-web-font.ts` 也是依 font-family 篩〔文件，原始碼〕。照這個邏輯，結果圖只要用到這兩個字型家族，就會嘗試抓取並以 base64 內嵌上面那約 22 MB 的切片（base64 會再膨脹約 1/3）。這是從原始碼加實測數字推得，實際耗時與是否失敗沒有跑過〔推論〕。
- html-to-image 提供的繞法〔文件〕：`fontEmbedCSS` 自己給要內嵌的 CSS（套件就不再自己解析）、`getFontEmbedCSS()` 預先算一次重複使用、`preferredFontFormat` 只保留一種格式。要只內嵌圖上文字需要的切片，得自己依 `unicode-range` 挑。
- WebKit bug 219770「SVG with embedded font triggers img.onload before font is available」：SVG 內嵌字型時，`img.onload` 比字型可用更早觸發，第一次畫到 canvas 會缺字或空白，之後才正常。狀態 NEW（2020-12 建立，最後更新 2026-08）〔文件，WebKit Bugzilla〕。這和上面 html-to-image 的 iOS「第一次畫壞、重來就好」回報相符。

## 3. 深淺主題

- 手寫 Canvas／SVG：色值要自己取。可以用 `getComputedStyle(document.documentElement).getPropertyValue('--paper')` 讀當下主題的 token，或另外寫死一組圖用配色〔文件，CSSOM〕。圖的配色跟不跟網頁主題，是產品決定。
- html-to-image 等：複製的是當下計算後樣式，所以會跟著目前 `data-theme`。要固定某個主題，需要在截圖前暫時切換 `data-theme`，或截一個獨立、不受主題影響的離屏節點〔推論〕。截圖節點本身如果沒有背景，背景會是透明，需要 `backgroundColor`〔文件〕。
- `<html>` 上的 `radial-gradient` 點陣背景和 `color-scheme` 不在被截的節點內時，不會出現在圖上〔推論〕。

## 4. Web Share API 帶圖片檔

### 共通規則〔文件，MDN〕

- 只能在安全環境（HTTPS）使用；GitHub Pages 是 HTTPS。
- 需要暫時性使用者啟用（transient activation），也就是要在按鈕點擊等事件裡呼叫；還需要 `web-share` 權限政策允許。
- 支援帶檔案前要用 `navigator.canShare({ files })` 檢查。
- 例外：`NotAllowedError`（政策擋下、沒有使用者啟用、基於安全擋下檔案）、`AbortError`（使用者取消或沒有分享目標）、`DataError`、`TypeError`（含「實作不支援分享檔案」）、`InvalidStateError`（已有分享進行中）。
- 承諾何時完成依平台而異：Windows 在分享視窗開啟時完成，Android 在資料交給分享目標後完成。
- 使用者啟用有時效，如果點擊後才 `await` 產生圖片、載入字型，可能過期而得到 `NotAllowedError`〔回報〕；HTML 規格的使用者啟用時效長度由瀏覽器自訂〔文件〕。

### 各瀏覽器支援（BCD `api.Navigator.share` 與 `data_files_parameter`）〔文件〕

| 瀏覽器 | `share()` | `share({ files })` | `canShare()` |
|---|---|---|---|
| iOS Safari | 12.1 | 14 | 14 |
| macOS Safari | 12.1 | 14 | 14 |
| Android Chrome | 61 | 76 | 75 |
| Samsung Internet | 同 Chrome Android | 11.0 | 同 Chrome Android |
| 桌機 Chrome | 128（89–127 只限 ChromeOS 與 Windows） | 89 | 128（同左限制） |
| 桌機 Edge | 93（81–92 只限 Windows） | 81 | 93 |
| Firefox 桌機 | 需開 `dom.webshare.enabled` | 不支援 | 需開旗標 |
| Firefox Android | 79 | 不支援 | 96 |
| **Android WebView** | **不支援**（crbug 40540400） | **不支援** | **不支援** |
| iOS WebView（WKWebView） | 同 iOS Safari（BCD 標為 mirror） | 同 iOS Safari | 同 iOS Safari |

補充：

- 桌機 Chrome 128 拿掉了「只限 ChromeOS 與 Windows」的註記，代表 128 起 macOS 也支援；Linux 桌機的狀況 BCD 沒有分開寫〔未驗證〕。
- WebKit 的 Web Share Level 2（帶檔案）在 bug 198606 已標為 FIXED〔文件〕。iOS 14 初期有「第二次呼叫被拒」的回歸（bug 216913，已修）〔文件〕。
- MDN 列出常見可分享檔案類型，包含 PNG、JPEG；實際仍以 `canShare` 結果為準〔文件〕。

## 5. LINE、Facebook、Instagram 內建瀏覽器

| | 底層引擎 | Web Share 帶檔案 | `<a download>` 下載 blob | 跳出到外部瀏覽器 |
|---|---|---|---|---|
| LINE iOS | 普遍認為是 WKWebView〔回報〕，LINE 官方文件沒寫 | 若是 WKWebView，引擎層有支援〔文件，BCD〕；LINE 本身有沒有關掉〔未驗證〕 | 〔未驗證〕 | **網址加 `?openExternalBrowser=1`**，LINE 會改用外部瀏覽器開啟，LIFF 網址除外〔文件，LINE Developers〕 |
| LINE Android | 普遍認為是 Android WebView〔回報〕 | 若是 Android WebView，引擎不支援〔文件，BCD〕 | 〔未驗證〕 | `?openExternalBrowser=1` 用外部瀏覽器；`?openInAppBrowser=0` 改用 Chrome Custom Tab（只限 Android）〔文件，LINE Developers〕 |
| Facebook iOS | WKWebView〔回報〕 | 引擎層有支援；App 本身行為〔未驗證〕 | 〔未驗證〕 | 沒有官方參數；使用者可從選單選「以外部瀏覽器開啟」〔回報〕 |
| Facebook Android | Android WebView〔回報〕 | 引擎不支援〔文件，BCD〕 | 〔未驗證〕 | 同上 |
| Instagram iOS | WKWebView〔回報〕 | 引擎層有支援；App 本身行為〔未驗證〕 | blob 下載無效、甚至只送出 `blob:` 字串〔回報：FileSaver.js #754、add-to-calendar-button #72〕 | 舊的 `instagram://extbrowser` 是非官方做法，多數回報在新版已無效〔回報〕 |
| Instagram Android | Android WebView〔回報〕 | 引擎不支援〔文件，BCD〕 | 有回報說 Android 會轉交真正的瀏覽器處理下載〔回報〕 | 同上 |

說明：

- 「引擎層支援」只表示 WKWebView 本身有實作；App 可以自訂 WebView 行為，所以每個 App 都要實機測。
- 關於 LINE 的 `openExternalBrowser=1`：官方文件寫的是「從 LINE App 開啟的所有網址」都適用，案例是聊天訊息裡的連結。已經在 LINE 內建瀏覽器裡的頁面，自己導向加了參數的網址會不會跳出，官方沒寫〔未驗證〕；有臺灣論壇回報，經過短網址時 LINE 會先開內建瀏覽器再跳出〔回報〕。
- LINE 官方文件說明 LINE 內建瀏覽器不同於 LIFF 瀏覽器，`liff.getContext()` 在內建瀏覽器回傳 `external`；文件沒有提到 Web Share 或下載〔文件〕。
- Meta（Facebook、Instagram）沒有找到公開的內建瀏覽器技術文件。
- Android WebView 的下載要靠宿主 App 註冊 `DownloadListener`（`WebView.setDownloadListener`）自行處理；`blob:` 網址只存在頁面內，原生下載管理員抓不到，所以 blob 下載在 WebView 常失敗。這段來自 Android API 設計，各 App 實際做法〔未驗證〕。

## 6. 退回路徑

### `<a download>`〔文件，BCD `html.elements.a.download`〕

- Chrome 14、Edge 18、Firefox 20、桌機 Safari 10.1、**iOS Safari 13** 起支援；Android WebView 與 iOS WebView 在 BCD 都標為 mirror（同 Chrome Android／iOS Safari），但這只是引擎層，實際下載仍取決於宿主 App（見 §5）。
- 跨來源網址的 `download` 會被忽略（Chrome 65、Edge 79 起），用 canvas 產生的 `blob:` 或 `data:` 屬同來源，不受影響。
- **iOS Safari 下載的檔案會進「檔案」App 的「下載項目」資料夾**，不會進「照片」〔文件，Apple 支援〕。想存進照片，要走分享選單的「儲存影像」，或長按圖片選「加入照片」〔Apple UI，非規格〕。

### 常見替代做法

1. **在頁面上顯示圖片，請使用者長按儲存**：把產生的圖片放進 `<img src="blob:…">`（或 `data:`），加一句「長按圖片儲存」。iOS Safari 長按圖片會出現「加入照片」等選項〔Apple UI〕；在 WKWebView／Android WebView 裡，長按選單由宿主 App 決定，LINE、Facebook、Instagram 是否提供「儲存圖片」〔未驗證〕。
2. **開新分頁顯示圖片**：`window.open(blobURL)`。點擊後若先 `await` 產生圖片，新分頁可能被彈出視窗攔截擋下（同樣是使用者啟用過期的問題）〔推論〕；內建瀏覽器怎麼處理新分頁（另開畫面或在同一個畫面導向、回上一頁會不會遺失結果頁狀態）〔未驗證〕。
3. **提示改用外部瀏覽器**：依 user agent 判斷內建瀏覽器（常見特徵字串：`Line/`、`FBAN`／`FBAV`、`Instagram`），顯示「用 Safari／Chrome 開啟」說明〔回報；UA 字串沒有官方文件〕。LINE 可搭配 `openExternalBrowser=1`（見 §5）。
4. **預先產生圖片**：進入結果頁或打開分享面板時就先產生好 `File`，點擊時直接 `navigator.share`，避免使用者啟用過期〔回報，與 §4 規則一致〕。

## 7. 需要實機測試才能確認的項目

- LINE、Facebook、Instagram 在 iOS 與 Android 上：`navigator.canShare({ files })` 的回傳值、`share()` 實際能不能開啟系統分享選單、`<a download>` 對 `blob:`／`data:` 的行為、長按 `<img>` 是否有「儲存圖片」。
- LINE 內建瀏覽器中，頁面自己導向 `?openExternalBrowser=1` 會不會跳出。
- html-to-image／modern-screenshot 在 iOS Safari 上，內嵌 LXGW WenKai TC + Noto Sans TC 時的耗時、記憶體、第一次是否缺字；只內嵌所需切片（自訂 `fontEmbedCSS`）後的差異。
- 手寫 Canvas 用 `document.fonts.load(font, text)` 等字型後再畫，在慢速網路下的等待時間（LXGW WenKai TC 單片約 47 KB 起）。
- html2canvas(-pro) 對專案 CSS（`radial-gradient` 點陣、紙膠帶偽元素、旋轉）的還原程度。
- Linux 桌機 Chrome 的 `canShare({ files })`。

## 來源

- MDN：[Navigator.share()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)、[FontFaceSet.load()](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load)、[SVG as an image](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image)
- browser-compat-data：[api/Navigator.json](https://github.com/mdn/browser-compat-data/blob/main/api/Navigator.json)（`share`、`canShare`、`data_files_parameter`）、[html/elements/a.json](https://github.com/mdn/browser-compat-data/blob/main/html/elements/a.json)（`download`）
- HTML 規格 canvas 章節（字型載入前使用即視為未知字型）：<https://html.spec.whatwg.org/multipage/canvas.html>
- WebKit Bugzilla：[198606 Web Share Level 2](https://bugs.webkit.org/show_bug.cgi?id=198606)、[216913 iOS 14 回歸](https://bugs.webkit.org/show_bug.cgi?id=216913)、[219770 SVG 內嵌字型 onload 過早](https://bugs.webkit.org/show_bug.cgi?id=219770)
- Chromium：[crbug 40540400（Android WebView 的 Web Share）](https://crbug.com/40540400)
- Google Developers Blog：[Google Fonts launches Japanese support](https://developers.googleblog.com/2018/09/google-fonts-launches-japanese-support.html)（CJK 切片方式）
- LINE Developers：[Using LINE URL scheme — Opening a URL in an external browser](https://developers.line.biz/en/docs/line-login/using-line-url-scheme/)、[Differences between LIFF browser and LINE's in-app browser](https://developers.line.biz/en/docs/liff/differences-between-liff-browser-and-line-in-app-browser/)
- Apple 支援：[Find your downloaded files on iPhone](https://support.apple.com/guide/iphone/find-your-downloaded-files-on-iphone-iphc9cd7266c/ios)
- Android Developers：[DownloadListener](https://developer.android.com/reference/android/webkit/DownloadListener)
- 套件：[html-to-image](https://github.com/bubkoo/html-to-image)（README、`src/embed-webfonts.ts`、issues #292、#361、#488、#569）、[modern-screenshot](https://github.com/qq15725/modern-screenshot)（`src/embed-web-font.ts`）、[html2canvas 文件](https://html2canvas.hertzen.com/documentation)、[html2canvas-pro](https://github.com/yorickshan/html2canvas-pro)；大小與版本來自 [bundlephobia](https://bundlephobia.com) API 與 npm registry
- 開發者回報：[FileSaver.js #754](https://github.com/eligrey/FileSaver.js/issues/754)、[add-to-calendar-button #72](https://github.com/add2cal/add-to-calendar-button/issues/72)、[iThome 論壇 openExternalBrowser 與短網址](https://ithelp.ithome.com.tw/questions/10214624)
