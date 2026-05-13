# Codex Hooks

このディレクトリには、acf_contract 用の Codex Hooks 実装本体を置く。

## 配置

- Codex 側の設定: `.codex/config.toml`
- Codex 側の hooks 定義: `.codex/hooks.json`
- PreToolUse (`Bash`): `.agents/hooks/block_destructive_commands.mjs`
- Stop: `.agents/hooks/post_edit_workflow.mjs`

## 有効化

Codex は `.codex/config.toml` と `.codex/hooks.json` を入口として読む。
hook 本体は `.codex/hooks.json` からこのディレクトリ内の `.mjs` を呼び出す。

## 想定挙動

- `prisma db push` は拒否する
- コード変更ターン終了時は `corepack pnpm format:check`, `corepack pnpm lint`, `corepack pnpm typecheck` を実行する
- 静的解析成功後は `plan-test-strategy` を促す

## 手元での確認例

```bash
printf '%s' '{"tool_input":{"command":"pnpm prisma db push"}}' | node .agents/hooks/block_destructive_commands.mjs
printf '%s' '{"transcript_path":"/tmp/codex-hook-edit.json"}' | node .agents/hooks/post_edit_workflow.mjs
```
