# 北極星

一個繁體中文的價值反思工具：先替價值分類、排序，再在具體情境裡做取捨，最後把兩幕的答案並列，讓你回頭看自己的選擇。

線上版：<https://northstarmetric.org>

## 這是什麼

- **第一幕「你重視的」**：把十個核心價值分進「這就是我」、「還不錯」、「不太在乎」，並在類別內排出先後。可以新增自訂價值。
- **第二幕「情境中的取捨」**：每輪從 45 題（15 組、每組三個變體）抽 15 題，用滑桿、時間分配、取捨選擇等互動方式作答。
- **結果**：兩幕並列呈現，可存成圖片或產生連結分享。作答進度存在本機，可續答。

這是參考 Schwartz 價值理論設計的自我反思工具，題目與解讀由本專案自行設計、尚未驗證，不是心理量表。情境題屬於假設性的自我回報，不代表真實行為。

## 開始開發

需要 Node.js。技術棧是 React 19、TypeScript、Vite，測試用 Playwright。

```bash
npm install
npm run dev
```

| 指令 | 用途 |
|------|------|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 型別檢查並建置到 `dist/` |
| `npm run preview` | 預覽建置結果 |
| `npm run check` | 型別檢查、ESLint、CSS 檢查 |
| `npm test` | 跑全部 Playwright 測試 |

全套測試要十分鐘以上，開發中只跑相關的 spec：

```bash
npx playwright test tests/<檔名>.spec.ts
```

回報前先跑 `npm run check`，再跑一次全套 `npm test`。Windows 使用已安裝的 Edge。

## 專案結構

```
src/        React 元件、題目資料（src/scenarios）、結果連結與本機紀錄邏輯
tests/      Playwright 測試；共用工具在 tests/support
docs/       規格與 ADR
scripts/    CSS 檢查、連結預覽圖產生
```

## 文件

- [GLOSSARY.md](GLOSSARY.md)：用詞定義
- [CODING_STANDARDS.md](CODING_STANDARDS.md)：Review 依據
- [docs/scenario-feature-spec.md](docs/scenario-feature-spec.md)：整體規格
- [docs/interactive-scenario-spec.md](docs/interactive-scenario-spec.md)：互動情境題的作答、計數與連結格式
- [docs/result-share-spec.md](docs/result-share-spec.md)：結果分享
- [docs/content-authoring-notes.md](docs/content-authoring-notes.md)：寫題目文案前先讀
- [docs/adr/](docs/adr/)：設計決策紀錄
- [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)：工作項目與分支流程

## 部署

推送到 `master` 會由 GitHub Actions 部署到 GitHub Pages，網域設定在 `public/CNAME`。
