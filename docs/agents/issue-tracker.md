# 工作項目

工作項目放在 GitHub Issues（`MarkHungBuddha/polarStarRebuild`），用 `gh` 操作。

- **規格與票：** 一份規格是一個父 issue（例如 #17），拆出的票是子 issue（#18–#22）。票之間的先後用 GitHub 原生的阻擋關係記錄：`gh api repos/MarkHungBuddha/polarStarRebuild/issues/<n>/dependencies/blocked_by`。
- **關票：** 經由 PR 關閉。PR 內文寫 `Closes #<n>`，每張票和父規格各一行；commit 訊息寫 `Refs #<n>`。
- **分支：** 整份規格在一條整合分支上完成（`codex/<功能>-integration`），每張票各用一條分支和一個工作樹，放在 repo 外的 `../.<功能>-worktrees/<票>`。
- **CI：** 推送整合分支後執行 `gh pr checks <n>`；第一次合併前還沒有 PR，改用 `gh run list --branch <整合分支>`。CI 失敗時先修好，再合併下一張票。本機的 Windows／Edge 測試全部通過，不代表 CI 上的 Linux／Chromium 也會過。
- **規劃檔：** 票的內文草稿、`tracker.json` 和截圖放在 repo 外的 `../.<功能>-workflow/`。每張票的狀態、commit 和全套測試結果只記在 `tracker.json`；交接檔不重抄狀態，只寫查不到的陷阱和還沒驗證的項目。中斷後接手時，先看 `tracker.json`、`git worktree list` 和整合分支 PR 的 CI。
- **票的範圍：** 實作只做票和規格要求的行為，其他行為照原樣保留。想改的地方寫進回報，交給規格負責人決定；規格文件只隨規格變更修改，不改成配合程式。
- **共用接縫：** 拆票時，讓第一張票先建好後續各票都會改的地方（型別聯集的各個成員、測試輔助的各種決策、一行一個的組合清單），後面的票只填自己的部分，平行合併才不會每次都要另外解衝突。
- **平行的內容票：** 每張票的題目放在自己 slot 範圍的檔案（`src/scenarios/interactive-slots-*.ts`），`src/interactiveScenarios.ts` 只加一行組合；共用的測試輔助依題目標題作答，不依題目位置，題數改變時才不會互相衝突。內容格式由 `tests/support/interactive-content.ts` 的 `expectSlotContent` 檢查，送審前先讓它通過。
- **平行時的測試：** 同時有其他工作樹在跑測試時，各票只跑相關的 spec；全套交給合併後整合分支的 CI。多條工作樹同時跑全套會互相搶 CPU，長流程容易逾時，結果看不出真正的失敗。
- **清理：** 刪工作樹前，先停掉從那個工作樹啟動的 vite 伺服器，否則 Windows 會因為檔案被占用而刪不掉。測試回報 port 被占用時，用 `netstat -ano | findstr :<port>` 找出 PID，請使用者停掉後再跑。
