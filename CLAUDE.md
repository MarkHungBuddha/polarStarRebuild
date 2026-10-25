# 北極星

- 規格：[docs/scenario-feature-spec.md](docs/scenario-feature-spec.md)，結果分享另見 [docs/result-share-spec.md](docs/result-share-spec.md)；用詞：[GLOSSARY.md](GLOSSARY.md)；決策：[docs/adr/](docs/adr/)。
- 實作或 review 五段偏向作答與三變體題庫改版時，先讀 [docs/preference-strength-spec.md](docs/preference-strength-spec.md)；該規格已確認、尚未實作。
- 寫或改題目文案前讀 [docs/content-authoring-notes.md](docs/content-authoring-notes.md)。
- Review 依 [CODING_STANDARDS.md](CODING_STANDARDS.md)。
- 工作項目、分支與接手中斷的開發：[docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)。
- 驗證：`npm run check` 後 `npm test`。Windows 用已安裝的 Edge。新 spec 從 `tests/support/fixtures` 匯入 `test`（固定 `Math.random`）。
- 只有推送到 master 會部署 GitHub Pages。
