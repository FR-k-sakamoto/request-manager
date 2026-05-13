---
name: claude-uiux-designer
description: Create a Claude Code handoff for UI/UX and design reviews. Use when the user asks to consult Claude for UI/UX or design feedback, to improve a screen or UI, or to pass screenshots and code with requirements to Claude via the claude command.
---

# Claude UI/UX Designer

## Overview

Define UI/UX improvement requirements, gather assets (screenshots and code), then produce a single structured prompt to send to Claude Code.

このスキルの実行系は v2 として更新済みです。`stream-json` の raw ログをそのまま Codex に流さず、

- raw stream は保存
- 進捗は軽い status に集約
- 最終レビュー本文は別ファイルに抽出

の3層に分離します。Codex から参照するのは原則 `status` と `final` だけです。

このスキルは `.codex/skills/...` と `.agents/skills/...` のどちらにも配置されえます。以降の `scripts/...` などの相対パスは、必ず「この `SKILL.md` があるディレクトリ」を基準に解決してください。`.codex` 固定や `.agents` 固定のパスを前提に組み立てないこと。

## Workflow

1. Confirm trigger and scope (which screen, which problem, what outcome).
2. Collect assets (screenshots, relevant code paths/snippets, routes).
3. Define requirements (goals, constraints, users, success metrics).
4. Produce the Claude prompt using the fixed template below.
5. If the user only wants a handoff, return the prompt and stop.
6. If the user explicitly asks to run Claude, use the run/result/status workflow below.

## Intake Checklist

Required:

- Target screen(s) or flow (name, route, feature)
- Current pain points or problems
- Desired outcome (what should improve)
- At least one of: UI description or code references (screenshots are optional)
- Code references if available (file paths/snippets)

Optional (ask only if relevant or missing):

- Target users and usage context (device, environment)
- Design system or component library constraints
- Must-keep elements or hard constraints
- Accessibility requirements
- Performance or technical limits
- Timeline or priority (quick wins vs redesign)
- Success metrics or acceptance criteria

## Questions to Ask (Use Only as Needed)

- Which exact screen or flow should Claude review?
- What is the primary problem you want to solve?
- Who are the target users and what device are they on?
- Do you have screenshots or a staging URL? If not, can you describe the UI layout and flow in words?
- Which files/components are relevant?
- Are there any constraints (design system, brand, layout must-keep)?
- How will you measure success?

## Output Rules

- Output only the Claude prompt template below, fully filled.
- If information is missing, mark it as TBD and include questions in the template.
- Do not propose UI changes yourself.
- Keep the prompt concise and actionable.
- Output in Japanese.
- Enforce MUI, KISS, and Clean Architecture constraints.
- If screenshots are unavailable, explicitly state that the review is based on code and textual UI description.

## Codex-Friendly Review Workflow

Claude を Codex 経由で実行する場合は、次の順番を固定にします。

1. `start-claude-review.sh` でレビューをデタッチ起動し、`run_dir` を受け取る
2. 実行中は `review-status.mjs <run_dir>` だけを参照する
3. `status: completed` になったら `extract-final-review.mjs <run_dir>` だけを読む
4. `run-claude-review.sh` は人間が直接ブロッキング実行したい場合か、runner 自体のデバッグ時だけ使う

raw stream の `jsonl` をそのまま会話に貼り戻さないでください。これはコンテキスト効率を大きく落とします。
途中経過の preview も既定では読みません。必要な場合だけ `review-status.mjs --preview` を使ってください。

このスキルのランナーは以下を自動で行います。

- `stream-json` を run ディレクトリへ保存
- `status.json` に軽量ステータスを書き出す
- `final.md` に最終レビュー本文だけを抽出する
- 同期 runner の標準出力には生streamではなく、短い進捗行と最終本文だけを出す
- デタッチ runner は `runner.stdout.log` / `runner.stderr.log` にだけ書き出し、agent には `run_dir` だけ返す

既定の run 保存先:

- `/tmp/claude-uiux-designer-runs/<timestamp>-<pid>/`

主要成果物:

- `prompt.txt`
- `raw.jsonl`
- `status.json`
- `final.md`
- `runner.stdout.log`
- `runner.stderr.log`

## Claude CLI Execution (Optional)

- When the user explicitly asks to run Claude, keep the task read-only unless the user clearly requests implementation or file edits.
- For Codex-mediated execution, prefer the detached starter in the active skill directory. Resolve `SKILL_DIR` to the directory containing this `SKILL.md`, then run: `"$SKILL_DIR/scripts/start-claude-review.sh" "<プロンプト>"`
- Capture the returned `run_dir`, then poll:
  `node "$SKILL_DIR/scripts/review-status.mjs" "<run_dir>"`
- After `status: completed`, read only the final review text:
  `node "$SKILL_DIR/scripts/extract-final-review.mjs" "<run_dir>"`
- Use the synchronous runner only for manual/direct execution or debugging:
  `"$SKILL_DIR/scripts/run-claude-review.sh" "<プロンプト>"`
- To inspect progress without loading the raw stream, use:
  `node "$SKILL_DIR/scripts/review-status.mjs"`
- To read only the extracted final review text, use:
  `node "$SKILL_DIR/scripts/extract-final-review.mjs"`
- If the script cannot be used, execute with:
  `claude -p --model opus --permission-mode default --tools "Read,Grep,Glob" --append-system-prompt "Return the review directly in the final answer. Do not write files, plans, or patches." --verbose --output-format stream-json --include-partial-messages --no-session-persistence --max-turns 8 "<プロンプト>"`
- `stream-json` is preferred for tool-driven execution because it emits progress incrementally. Keep `--verbose` with `stream-json`; some local Claude Code versions require both together.
- Keep `--max-turns` above 1 when read tools are enabled; Claude may spend an initial turn gathering file context before answering.
- The default runner uses `CLAUDE_REVIEW_MAX_TURNS=8`.
- For broad reviews that include many screens or screenshots, or when Claude tends to spend early turns on code reading, raise `--max-turns` to `12`.
- If the review needs files outside the current directory, add `--add-dir <path>`.
- Use `--bare` only when you have explicit auth configured via environment variables or settings. In keychain/OAuth setups, `--bare` can produce `Not logged in` because it disables those auth sources.
- If a fully qualified model name is required, ask the user for the exact model string.
- When executing the claude command via a tool call, set `timeout_ms` to 900000 (15 minutes), use a short initial wait, and poll periodically instead of relying on a single blocking wait.

## Claude Execution Notes

- Prefer `--permission-mode default` over `plan` for review runs. In some environments, `plan` can bias Claude toward plan-style output or file-backed planning flows instead of returning the review directly.
- `--tools "Read,Grep,Glob"` keeps the review read-only and avoids permission pauses caused by Bash/Edit.
- Add an explicit instruction to return the review in the conversation and not save files. This materially reduces cases where Claude writes plan files instead of answering.
- Do not make Codex read `raw.jsonl` unless debugging the parser. Prefer `status.json` for progress and `final.md` for the result.
- The default runner already saves the raw stream and extracts the final text, so `tee` is no longer the primary path.
- Default to the detached workflow. Agents should not sit on the streaming session and harvest partial output from stdout.
- `review-status.mjs` omits `preview` by default. Use `--preview` only when debugging whether Claude is making progress.
- `extract-final-review.mjs` refuses to return partial text while the review is still running unless `--allow-partial` is explicitly set.
- If the host says the `.codex` runner does not exist but the same skill is resolved from `.agents`, continue with that resolved skill directory. The problem is path resolution, not skill activation.
- If the host tool cannot wait well on long-running output, poll `review-status.mjs` instead of tailing the raw stream.
- If the command still appears stuck, add `--debug-file /tmp/claude-uiux-review.log` and inspect the log before retrying.
- If the user only wants a prompt handoff, do not run Claude at all.

## Claude Prompt Template (Fixed)

```text
あなたはClaude Codeで、シニアUI/UXおよびプロダクトデザイナーとして振る舞ってください。
対象UIをレビューし、改善提案を出してください。

背景
- プロダクト/機能:
- 対象画面/フロー:
- 対象ユーザー:
- 利用状況（デバイス、環境）:
- 現在の課題/痛点:

目的
- 主な目的:
- 副次的な目的:
- 成功指標:

制約
- 技術スタック:
- デザインシステム/コンポーネント（MUI準拠）:
- 開発原則（KISSの原則・クリーンアーキテクチャ遵守）:
- 変更不可/維持すべき要素:
- アクセシビリティ要件:
- パフォーマンス/技術的制約:
- 期限/優先度:

資産
- スクリーンショット（任意・パスまたは説明）:
- 画面構成の文章説明（スクショがない場合は必須）:
- 参照コード（ファイルパス/抜粋）:
- ルート/URL:
- データ/API制約:

依頼内容
1) UI/UXの問題点を根拠とユーザー影響付きで指摘。
2) 改善案を提示（必要に応じて代替案）。
3) コンポーネントや実装レベルの具体ガイダンス（MUI準拠）。
4) 優先度付け（短期でできる改善 vs 大きな改修）。
5) リスク、エッジケース、検証案。
6) KISSとクリーンアーキテクチャの観点での注意点。
7) レビュー本文はこの会話に直接返し、ファイルには保存しない。

出力形式
- まとめ（3-5点）
- 問題点リスト（重要度、根拠、影響）
- 改善提案（優先度順）
- コード/コンポーネント指針（該当時）
- 次のアクション（検証/テスト）

未決事項
- TBD:
```
