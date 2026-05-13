# React `useEffect` 代替ルール

## 概要

`useEffect` は React の escape hatch であり、外部システムとの同期以外では不要なことが多い。依存配列に起因する暗黙結合、無限ループ、race condition を避けるため、次の5ルールで置き換える。

## 1. 状態を派生させる

- props や state から計算できる値を別 state に複製しない
- 表示用整形、フィルタ済み配列、件数集計は render 中に求める
- 重い計算だけ `useMemo` を検討する

```tsx
const fullName = `${firstName} ${lastName}`;
const visibleItems = items.filter((item) => item.status === statusFilter);
```

## 2. データ取得ライブラリを使う

- client fetch が必要な場合でも、裸の `useEffect` + `fetch` を書かない
- まず Server Component / Route Handler / Server Action を検討する
- クライアントで再検証やキャッシュが必要なら SWR や TanStack Query を優先する

```tsx
const { data, error, isLoading } = useSWR(`/api/items?query=${query}`, fetcher);
```

## 3. イベントハンドラに集約する

- POST、親通知、複数 state の同時更新はイベントの中で終わらせる
- `state` の変更を監視して callback を呼ばない

```tsx
function updateToggle(nextIsOn: boolean) {
  setIsOn(nextIsOn);
  onChange(nextIsOn);
}
```

## 4. `useMountEffect` で初回同期を明示する

- 対象は localStorage 初期化、購読開始、外部 widget 初期化などに限る
- 派生 state、通常のデータ取得、入力補正、親通知には使わない
- Strict Mode の再マウントでも壊れないよう、冪等に保つ

### 標準スニペット

```tsx
'use client';

import { useEffect, type EffectCallback } from 'react';

export function useMountEffect(effect: EffectCallback): void {
  useEffect(effect, []);
}
```

## 5. `key` で state をリセットする

- レコード切り替えやフォーム初期化は `key` で再マウントする
- `props` 変更を見て `setState` し直す `useEffect` は避ける

```tsx
<EditForm key={item.id} item={item} />
```

## 禁止例

- `useEffect` で `fullName` を更新する
- `useEffect` でフィルタ済み一覧を state に写す
- `useEffect` で親の `onChange` を呼ぶ
- `useEffect` でフォーム初期値へ戻す
- `useEffect` で `fetch` して `ignore` フラグや `isMounted` フラグを持つ

## 判断フロー

1. 外部システムとの同期か？
2. そうでなければ 1, 2, 3, 5 のどれかに寄せる
3. 外部同期なら `useMountEffect` か、依存を持つ別の専用 Hook を検討する

## 参考

- React: https://react.dev/learn/you-might-not-need-an-effect
- React: https://react.dev/reference/react/useEffect
- Shared note: https://x.com/alvinsng/status/2033969062834045089
