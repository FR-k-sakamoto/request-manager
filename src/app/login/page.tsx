import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "./login-form";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function getLoginErrorMessage(error: string) {
  switch (error) {
    case "forbidden":
      return "管理操作には管理者権限が必要です。";
    case "CredentialsSignin":
      return "メールアドレスまたはパスワードが正しくありません。";
    default:
      return "";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const rawError = Array.isArray(params.error) ? params.error[0] : params.error ?? "";
  const error = getLoginErrorMessage(rawError);

  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.logo}>棚</div>
        <p className={styles.kicker}>Inventory Request Manager</p>
        <h1>棚からリクエスト</h1>
        <p className={styles.description}>
          一般ユーザーは依頼の参照と投稿、管理者は依頼の承認・却下などの管理操作を行えます。
        </p>
        <div className={styles.credentials}>
          <p>開発用の初期ユーザー</p>
          <code>admin@example.com / Admin123!</code>
          <code>user@example.com / User123!</code>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>ログイン</h2>
          <p>ログイン後は権限に応じて利用できる画面へ自動で遷移します。</p>
        </div>

        <LoginForm defaultError={error} />
        <div className={styles.helperText}>
          <p>Auth.js の Credentials 認証を使用しています。</p>
          <p>管理操作は `User.role` が `ADMIN` のユーザーのみに制限されます。</p>
        </div>
      </section>
    </div>
  );
}
