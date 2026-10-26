# 北極星

- 規格：[docs/scenario-feature-spec.md](docs/scenario-feature-spec.md)，結果分享另見 [docs/result-share-spec.md](docs/result-share-spec.md)；用詞：[GLOSSARY.md](GLOSSARY.md)；決策：[docs/adr/](docs/adr/)。
- 情境題的作答、計數、本機紀錄與連結格式以 [docs/interactive-scenario-spec.md](docs/interactive-scenario-spec.md) 和 [ADR 0007](docs/adr/0007-interactive-scenario-answers.md) 為準（2026-10-26 上線，#71）。[docs/preference-strength-spec.md](docs/preference-strength-spec.md) 是五段偏向題的歷史文件，只用來理解格式版本 2 結果連結。
- 寫或改題目文案前讀 [docs/content-authoring-notes.md](docs/content-authoring-notes.md)。
- Review 依 [CODING_STANDARDS.md](CODING_STANDARDS.md)。
- 工作項目、分支與接手中斷的開發：[docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)。
- 驗證：`npm run check` 後 `npm test`。全套要跑十分鐘以上：開發中只跑相關的 spec（`npx playwright test tests/<檔名>.spec.ts`），回報前再跑一次全套（平行開發的例外見 issue-tracker）。Windows 用已安裝的 Edge。新 spec 從 `tests/support/fixtures` 匯入 `test`（固定 `Math.random`）。
- 只有推送到 master 會部署 GitHub Pages。
