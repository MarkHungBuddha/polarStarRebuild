# 工作項目

工作項目放在 GitHub Issues（`MarkHungBuddha/polarStarRebuild`），用 `gh` 操作。

- **規格與票：** 一份規格是一個父 issue（例如 #17），拆出的票是子 issue（#18–#22）。票之間的先後用 GitHub 原生的阻擋關係記錄：`gh api repos/MarkHungBuddha/polarStarRebuild/issues/<n>/dependencies/blocked_by`。
- **關票：** 經由 PR 關閉。PR 內文寫 `Closes #<n>`，每張票和父規格各一行；commit 訊息寫 `Refs #<n>`。
- **分支：** 整份規格在一條整合分支上完成（`codex/<功能>-integration`），每張票各用一條分支和一個工作樹，放在 repo 外的 `../.<功能>-worktrees/<票>`。
- **規劃檔：** 票的內文草稿、`tracker.json`（票號對照）和截圖放在 repo 外的 `../.<功能>-workflow/`。中斷後接手時，先看這個資料夾、`git worktree list` 和整合分支的 PR。
