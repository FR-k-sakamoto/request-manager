# 共通開発ガイドライン (Common Rules)

本プロジェクトの全タスク（新規・改修・修正）において、いかなる場合でも遵守すべき最優先事項です。

## 1. アーキテクチャの依存関係（絶対厳守）

- **依存の方向**: UI → Controller → Usecase → Domain の方向、および Infrastructure → Domain の方向のみを許可します。
- **ショートカット禁止**: 以下の行為はバグ修正や急ぎの対応であっても厳禁です。
  - UIやServer Actionから直接 Prisma（DB）を呼び出す。
  - Domain層に React や Next.js 依存のコード（hooks, components等）を混入させる。
  - Usecase層で Prisma の生成型（Model）を直接扱う（必ずDTOやDomainモデルに変換する）。

## 2. AIの振る舞いとワークフロー

- **ステップ実行**: 依頼内容に基づき「モードA/B/C」を判断し、各レイヤーのステップごとに実装を止めて確認を求めてください。
- **勝手な実行の禁止**: 実装が完了しても、指示があるまで `git commit` や `git push` は実行しないでください。
- **パスの記述**: ファイルパスは常にリポジトリ相対パス（例: `src/app/page.tsx`）で記載してください。

## 3. コミット・メッセージ規格

- **形式**: `type: 件名`。
- **利用可能な type**: `feature`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`。
- **粒度**: 1つのPRに対し、影響するレイヤー（domain, infra, usecase, ui）ごとにコミットを分割することを推奨してください。
