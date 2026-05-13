# Controller & UI (Presentation) レイヤー 実装ガイドライン

本ステップでは、エンドユーザーとの接点となるUIコンポーネントの構築と、リクエストの入り口となるController（API/Server Actions）の実装を行います。

## 1. 責務と配置先

- **Controller責務**: 認証/認可、パラメータ抽出、UseCase呼び出し、レスポンスの整形（薄い実装）。
- **Controller配置先**: `src/app/api/**/route.ts`, `src/app/actions/**`。
- **UI責務**: 画面の組み立て、公開DTOを用いた表示、汎用/専用コンポーネントの分割。
- **UI配置先**: `src/ui/**` (テンプレート/DTO), `src/components/**` (汎用), `src/app/(route)/.../_components/**` (専用)。

## 2. 絶対ルール (MUST)

- **Controllerにロジックを書かない**: API側は `request.json()` 等の取り出しのみを担い、内容検証や業務ルールはUseCaseに委譲します。Prismaの直接操作は厳禁です。
- **スタイリング**: MUIの `sx` やインライン `style` は使用禁止です。`className` と Tailwind ユーティリティを使用してください。
- **useEffectの禁止**: `useEffect` を直接使用せず、派生状態やイベントハンドラへの集約など代替手段を優先してください。やむを得ない外部システムとの初回同期のみ `useMountEffect` を使用します。
- **DTOの利用**: UIは `domain` 型ではなく `src/ui/dto/*` の公開DTOを受け取り表示に徹します。

## 3. このステップの完了条件（AIの振る舞い）

実装が完了したら、**コミット/Pushを行わず、ここで停止してください**。
ユーザに対し、以下の情報を提供して確認を求めてください。

1. `pnpm lint -- --fix` および `pnpm typecheck` 等の事前チェックを促す。
2. 変更した UI / Controller ファイルの一覧。
3. **コミットメッセージ案**: `feature(ui): 〇〇画面のコンポーネントとAPIエンドポイントを追加` など、この層に限定されたコミットを提案してください。
