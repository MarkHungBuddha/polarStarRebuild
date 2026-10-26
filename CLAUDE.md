# 北極星

- 規格：[docs/scenario-feature-spec.md](docs/scenario-feature-spec.md)，結果分享另見 [docs/result-share-spec.md](docs/result-share-spec.md)；用詞：[GLOSSARY.md](GLOSSARY.md)；決策：[docs/adr/](docs/adr/)。
- 情境題的作答、計分、本機紀錄與連結格式以 [docs/preference-strength-spec.md](docs/preference-strength-spec.md) 為準（2026-10-26 上線）。
- 寫或改題目文案前讀 [docs/content-authoring-notes.md](docs/content-authoring-notes.md)。
- Review 依 [CODING_STANDARDS.md](CODING_STANDARDS.md)。
- 工作項目、分支與接手中斷的開發：[docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)。
- 驗證：`npm run check` 後 `npm test`。全套要跑十分鐘以上：開發中只跑相關的 spec（`npx playwright test tests/<檔名>.spec.ts`），回報前再跑一次全套。Windows 用已安裝的 Edge。新 spec 從 `tests/support/fixtures` 匯入 `test`（固定 `Math.random`）。
- 只有推送到 master 會部署 GitHub Pages。
