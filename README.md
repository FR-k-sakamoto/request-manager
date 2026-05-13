# Request Manager

Next.js 16 / Prisma / Auth.js で構成した在庫・備品リクエスト管理アプリです。

## Setup

パッケージマネージャは **pnpm** を使用します（`packageManager` フィールドで固定）。
Corepack が有効なら `corepack enable` で自動的にバージョン解決されます。

```bash
cp .env.example .env
docker compose up -d            # ローカル Postgres を起動 (host: 5532 / container: 5432)
pnpm install
pnpm prisma:migrate:dev
pnpm db:seed
pnpm dev                        # http://localhost:3131 で起動
```

`.env.example` を元に `.env` を作成し、`DATABASE_URL`、`NEXTAUTH_URL`、`NEXTAUTH_SECRET` を設定してください。

- DB は `docker-compose.yml` の `postgres` サービスを利用（`localhost:5532` で接続）。
- 停止は `docker compose down`、データを破棄したい場合は `docker compose down -v`。

## 開発用ログイン

```text
管理者: admin@example.com / Admin123!
一般ユーザー: user@example.com / User123!
```

## 画面

- `/login`: Auth.js Credentials による email / password ログイン
- `/admin`: 管理者ダッシュボード、検索・絞り込み、ステータス更新
- `/admin/categories`: 固定カテゴリ一覧
- `/admin/requests/[id]`: 依頼詳細と履歴確認

## 備考

- 管理画面は `ADMIN` ロールのみアクセス可能です。
- カテゴリ管理は固定値運用で、編集 UI は未実装です。
