# Git Worktree Main Sync

このスキルは、Git worktree で作業中の feature ブランチへ最新 `main` を
`rebase` で安全に取り込み、競合解消と検証まで一貫して実施します。
特に「Worktree A のPRが main にマージされた後、Worktree B を追従させる」運用を主対象にします。

## 推奨メインパターン

- Worktree A: feature ブランチでPRを作成し、GitHubで `main` にマージ
- Worktree B: 作業継続中の feature ブランチで以下を実施
  - `git fetch origin --prune`
  - `git rebase origin/main`

基本方針として、`origin/feature-*` など別 feature ブランチからの取り込みは常用しません。

## 使うタイミング

- 複数 worktree で並行開発していて `main` の更新を取り込みたい
- PR 前に `main` との差分を解消したい
- 競合の有無を早く確認し、必要なら確実に解決したい

## 必要な入力

- 対象 worktree のパス
- 現在の作業ブランチ
- 競合時の判断に必要な仕様意図（必要時のみ）

## 出力

- 実行したコマンド一覧
- 競合ファイル一覧（または競合なし）
- ファイルごとの解消方針
- 検証結果（マーカー残存、`git status`、テスト、ahead/behind）

## 注意点

- ユーザー明示なしで `main` 上には適用しない
- dirty な作業ツリーでは、先に commit/stash を確認する
- 本スキルでは `merge` ではなく `rebase` を使う
- 取り込み元は原則 `origin/main` とし、非mainブランチ取り込みは例外扱いにする
