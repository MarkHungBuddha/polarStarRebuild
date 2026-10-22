# 北極星

- 規格：[docs/scenario-feature-spec.md](docs/scenario-feature-spec.md)；用詞：[GLOSSARY.md](GLOSSARY.md)；決策：[docs/adr/](docs/adr/)。
- 寫或改題目文案前讀 [docs/content-authoring-notes.md](docs/content-authoring-notes.md)。
- Review 依 [CODING_STANDARDS.md](CODING_STANDARDS.md)。
- 驗證：`npm run check` 後 `npm test`。Windows 用已安裝的 Edge；同時跑多個 worktree 時各設不同的 `PLAYWRIGHT_PORT`。新 spec 從 `tests/support/fixtures` 匯入 `test`（固定 `Math.random`）。
- 只有推送到 master 會部署 GitHub Pages。
