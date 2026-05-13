---
name: generate-e2e-test
description: 画面単位のメインシナリオに基づきPlaywrightのE2Eテストを生成する。docs/tests/scenarios/のシナリオ仕様書を参照し、ユーザー操作フローをテストコードに変換する。ロケータ戦略やWeb-firstアサーションなどPlaywright公式ベストプラクティスに準拠。
---

# E2E テスト生成

## 手順

1. `docs/tests/scenarios/` から対象画面のシナリオ仕様書を読み込む（なければ画面の実装コードからメインシナリオを推定）
2. 画面ごとに1〜3本のメインシナリオ（Happy Path）を設計し、テストコードを生成
3. 人間が空の describe/test を追記している場合は、その中身を実装

## 設計方針

- 正常系の操作フローを優先。エッジケースはUnitテストで担保
- 必須のエラーハンドリング（認証切れ等）は含める

## 社内コーディングルール

- **describe/test は日本語で記述する**
- **ファイル配置**: `tests/e2e/*.e2e.spec.ts`
- **ファイル命名**: シナリオ仕様書と対応させる（例: `quotation.scenario.md` → `quotation.e2e.spec.ts`）
- ロケータ優先順位: `getByRole` > `getByLabel` > `getByText` > `getByTestId`（CSS セレクタやDOM構造に依存しない）
- Web-first アサーション（`await expect(...).toBeVisible()` 等）を使用。手動 `isVisible()` チェックは使わない
- 外部サービス（GeminiAPI等）は `page.route()` でモック。テスト内で実際のAPIを呼ばない

## 認証セットアップ

E2Eテスト生成時、認証ヘルパーが存在しない場合は以下の構成で自動作成する。

### `playwright.config.ts` の接続先ルール

- `playwright.config.ts` を追加・更新する場合、`use.baseURL` と `webServer.url` は**そのシステムで実際に使っている起動先URL**に合わせる
- `http://localhost:3000` を固定前提にしない。worktree、`portless`、環境ごとの自動採番ポートを考慮する
- 優先順位は `process.env.BASE_URL` を最優先とし、未指定時の既定値は**その時点のローカル開発サーバー到達先**に合わせる
- 既存の `playwright.config.ts` がある場合は、現在の `baseURL` / `webServer.url` と実際の起動ポートが一致しているか確認してから変更する
- ローカルサーバーがすでに起動済みで `reuseExistingServer` を使う運用なら、`webServer.url` も同じ到達先に揃える
- 環境依存の一時的なポート調整だけを目的に既存設定を上書きする場合は、その変更をコミット対象に含めるべきか確認する

### 確認手順

1. `tests/e2e/auth.setup.ts` が存在するか確認
2. 存在しなければ、対象アプリのログイン画面の実装を読み取り、`auth.setup.ts` を生成
3. `playwright.config.ts` に setup プロジェクトと `storageState` の設定がなければ追加

### テスト用認証情報の環境変数整備

E2Eテストの認証失敗を防ぐため、テスト生成時に以下を必ず実施する。

**手順:**

1. プロジェクト内の環境変数サンプルファイル（`.env.example`, `.env.sample` 等）を探す
2. E2Eテスト用のログイン認証情報の変数が未定義であれば追記する
   ```
   # E2E テスト用ログイン認証情報
   E2E_TEST_USER_ID=
   E2E_TEST_USER_PASSWORD=
   ```
3. ユーザーに対して、実際の `.env`（または `.env.local` 等）にテスト用アカウントのID・パスワードを設定するよう案内する
4. `auth.setup.ts` では `process.env.E2E_TEST_USER_ID` / `process.env.E2E_TEST_USER_PASSWORD` を参照する形で生成する

**環境変数名の決定ルール:**

- 既存の `.env.example` に E2E テスト用の変数が既にある場合はその名前に従う
- ロール別に分ける場合は `E2E_TEST_ADMIN_USER_ID` / `E2E_TEST_ADMIN_PASSWORD` のようにロール名を含める

### Basic認証の環境変数整備

ソースコード内にBasic認証の処理がある場合（ステージング環境のアクセス制限等）、以下を実施する。

**確認手順:**

1. ソースコード・ミドルウェア設定からBasic認証の有無を確認する
2. Basic認証の認証情報がソース内にハードコードされている、または環境変数で管理されていない場合は環境変数化を促す

**対応:**

1. `.env.example` 等にBasic認証用の変数を追記する
   ```
   # Basic認証（ステージング環境等）
   BASIC_AUTH_USER=
   BASIC_AUTH_PASSWORD=
   ```
2. ユーザーに対して、実際の環境変数ファイルにBasic認証のID・パスワードを設定するよう案内する
3. `auth.setup.ts` またはテストのbeforeAll等でBasic認証を通過する処理を追加する場合は、環境変数から取得する形で生成する
4. `playwright.config.ts` の `httpCredentials` オプションでBasic認証を設定する方法も検討する
   ```typescript
   use: {
     httpCredentials: {
       username: process.env.BASIC_AUTH_USER ?? '',
       password: process.env.BASIC_AUTH_PASSWORD ?? '',
     },
   },
   ```

### ロール別認証（複数権限対応）

アプリに複数の権限ロール（管理者・一般ユーザー等）がある場合、ロールごとに認証状態を分離する。

**ファイル構成:**

- `tests/e2e/auth.setup.ts` — 全ロールのログイン処理をまとめて定義
- `.auth/<role>.json` — ロールごとの認証状態ファイル

**テストでの使い分け:**

- `playwright.config.ts` の `projects` でロールごとにプロジェクトを定義し、各プロジェクトが対応する `storageState` を使用
- テストファイル側ではロールを意識せず、どのプロジェクトで実行されるかで権限が決まる

**生成時のルール:**

- 対象アプリの認証方式（フォームログイン / OAuth 等）とロール定義を実装コードから読み取る
- ログイン用のテストアカウント情報は環境変数（`process.env`）から取得する形で生成し、ハードコードしない
- ロールが1つしかない場合でも、将来の拡張に備えて `.auth/<role>.json` の命名規則を使う

## シナリオ仕様書の運用

```
1. 機能追加/変更 → docs/tests/scenarios/ のシナリオ仕様書を更新
2. AIにシナリオファイルを参照させてE2Eテストを生成/更新
```

- `docs/tests/scenarios/` → E2E自動テスト用のメインシナリオ
- `docs/tests/v1.x/` → 手動テスト用。E2Eでカバーしないパターン（異常系・エッジケース等）を記載し手動で実行
