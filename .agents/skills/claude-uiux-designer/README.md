# Claude UI/UX Designer

このスキルは、Claude CodeにUI/UXレビューを依頼するための
ハンドオフ用プロンプトを作成します。ユーザーが明示した場合は、
Codex 経由で Claude レビューを安定実行するところまで扱います。

## 使うタイミング

- UIの改善ポイントを整理したい
- 画面/フローのレビューをClaudeに依頼したい
- スクショやコードを前提に指摘を得たい

## 必要な入力

- 対象画面/フロー
- 現在の課題/痛点
- 期待する改善
- UI説明またはコード参照（スクショは任意）

## 出力

- Claude Code向けのプロンプトのみを出力
- 出力は日本語
- 情報不足はTBDで明記

## v2 実行方針

`stream-json` の raw ログをそのまま Codex に流さず、次の3つに分離します。

- raw 保存: `raw.jsonl`
- 進捗確認: `status.json`
- 最終結果: `final.md`

デフォルト運用は、同期実行の stream を待つのではなく、

- `start-claude-review.sh` でデタッチ起動
- `review-status.mjs` で status だけ確認
- 完了後に `extract-final-review.mjs` で最終本文だけ取得

です。これにより、Codex などのコーディングエージェントが長い stream をそのまま読まずに済みます。

既定の run 保存先:

- `/tmp/claude-uiux-designer-runs/<timestamp>-<pid>/`

これにより、長いレビューでも Codex は raw stream を抱え込まずに、
必要なときだけ結果と進捗を小さく参照できます。

## 配置の扱い

この skill は環境によって、`.codex/skills/claude-uiux-designer` または
`.agents/skills/claude-uiux-designer` のどちらかで解決されます。

- 実行コマンドは `.codex` 固定や `.agents` 固定にしない
- 常に「今参照している `SKILL.md` があるディレクトリ」を `SKILL_DIR` として扱う
- `scripts/*` はその `SKILL_DIR` 配下のものを使う

つまり、skill の発動有無とランナーの配置先は別問題です。`runner が .codex にない` というメッセージは、発動失敗ではなく参照先解決の問題です。

## 使い方例

- 「この画面のUIレビューをClaudeに頼める形でまとめて」
- 「改善点を整理してClaudeに渡すプロンプトを作って」
- 「スクショ/コードを前提にUXレビューをお願い」
- 「CodexからClaudeレビューを安定実行したいので、このskillの実行手順で回して」

## 注意点

- ここではUI改善案自体は書かない
- MUI/KISS/クリーンアーキテクチャを前提とする
- Claude実行はユーザーが明示的に依頼した場合のみ
- Codex経由でClaudeを実行する場合は、`scripts/run-claude-review.sh` を優先する
- Codex経由の既定フローは `scripts/start-claude-review.sh` -> `scripts/review-status.mjs` -> `scripts/extract-final-review.mjs`
- 既定の permission mode は `plan` ではなく `default` を使う
- 既定の `CLAUDE_REVIEW_MAX_TURNS` は `8`
- レビュー本文を直接返させる指示を明示しないと、環境によっては plan ファイルへ逃がす挙動が出る
- `--bare` は keychain / OAuth 認証を無効化するため、環境によっては `Not logged in` になる
- 画面数が多いレビューや、コード読込だけで途中終了しやすいレビューでは `CLAUDE_REVIEW_MAX_TURNS=12` を使う
- `review-status.mjs` は既定で preview を出さない。進捗確認は status / phase / latest_tool / final_text_length だけ見る
- `extract-final-review.mjs` は既定で未完了レビューの partial を返さない。途中経過が必要なときだけ `--allow-partial`

## 実行コマンド

以下の例では、`SKILL_DIR` は「この `SKILL.md` / `README.md` があるディレクトリ」を指します。

デフォルトの agent 向けフロー:

```bash
SKILL_DIR="<このskillディレクトリ>"
"$SKILL_DIR/scripts/start-claude-review.sh" "<Claudeに渡すプロンプト>"
```

進捗確認:

```bash
SKILL_DIR="<このskillディレクトリ>"
node "$SKILL_DIR/scripts/review-status.mjs" "<run_dir>"
```

完了後に最終レビュー本文だけ取得:

```bash
SKILL_DIR="<このskillディレクトリ>"
node "$SKILL_DIR/scripts/extract-final-review.mjs" "<run_dir>"
```

preview を見たいときだけ:

```bash
SKILL_DIR="<このskillディレクトリ>"
node "$SKILL_DIR/scripts/review-status.mjs" "<run_dir>" --preview
```

人が直接ブロッキング実行したい場合のみ:

```bash
SKILL_DIR="<このskillディレクトリ>"
"$SKILL_DIR/scripts/run-claude-review.sh" "<Claudeに渡すプロンプト>"
```
