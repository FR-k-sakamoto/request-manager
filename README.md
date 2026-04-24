# Request Manager

Next.js 16 / Prisma / Auth.js で構成した在庫・備品リクエスト管理アプリです。

## Setup

```bash
npm install
npm run prisma:migrate:dev
npm run db:seed
npm run dev
```

`.env.example` を元に `.env` を作成し、`DATABASE_URL`、`NEXTAUTH_URL`、`NEXTAUTH_SECRET` を設定してください。

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
