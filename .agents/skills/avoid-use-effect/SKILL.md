---
name: avoid-use-effect
description: React/Next.js のクライアントコンポーネントで useEffect を直接使いそうな実装やレビューを扱うときに使う。状態同期、初期化、client fetch、props 変更に伴う再計算、フォームのリセットなどで useEffect を原則禁止とし、状態の派生・データ取得ライブラリ・イベントハンドラ・useMountEffect・key リセットの5パターンへ置き換えるための判断基準と標準スニペットを提供する。
---

# useEffect を避ける

## 基本方針

- `useEffect` は escape hatch として扱う
- 外部システムとの同期でない限り、直接使わない
- まず `references/react-effect-rules.md` を読み、5つの代替ルールに当てはめる

## 判定順

1. render 中に派生できないかを確認する
2. データ取得ライブラリまたは Server Component へ寄せられないかを確認する
3. ユーザー操作起点の処理へ寄せられないかを確認する
4. 初回同期だけなら `useMountEffect` で明示できるかを確認する
5. `key` で再マウントした方が自然ではないかを確認する

## リポジトリ運用

- このリポジトリでは direct `useEffect` を ESLint で禁止する
- 例外は `src/ui/hooks/useMountEffect.ts` のみとする
- ルール更新時は以下も同期して更新する
  - `AGENTS.md`
  - `docs/dev/react-effects.md`
  - `eslint.config.mjs`
  - `src/ui/hooks/useMountEffect.ts`

## 出力ルール

- direct `useEffect` を見つけたら、どの代替ルールで置き換えるかを先に示す
- `useMountEffect` を使う場合は、同期対象の外部システムと cleanup 方針を説明する
- 5ルールのどれにも入らない場合だけ、外部システムとの同期であることを明記して例外理由を残す

詳細なルール、標準スニペット、禁止例は `references/react-effect-rules.md` を参照する。
