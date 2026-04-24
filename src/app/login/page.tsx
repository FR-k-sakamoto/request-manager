import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { SignOutInline } from "./sign-out-inline";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function getLoginErrorMessage(error: string) {
  switch (error) {
    case "forbidden":
      return "このアカウントには管理画面へのアクセス権限がありません。";
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

  if (session?.user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.logo}>棚</div>
        <p className={styles.kicker}>Inventory Request Manager</p>
        <h1>棚からリクエスト</h1>
        <p className={styles.description}>
          依頼の状況確認、在庫カテゴリの管理、管理者向けステータス更新をひとつの画面で扱えます。
        </p>
        <div className={styles.credentials}>
          <p>開発用の初期ユーザー</p>
          <code>admin@example.com / Admin123!</code>
          <code>user@example.com / User123!</code>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>管理者ログイン</h2>
          <p>参考画像と同系統のデザインで、管理画面へ入るためのログイン導線を用意しました。</p>
        </div>

        {session?.user ? (
          <div className={styles.noticeBox}>
            <p className={styles.errorText}>現在のログインユーザーは管理者権限を持っていません。</p>
            <SignOutInline />
          </div>
        ) : (
          <>
            <LoginForm defaultError={error} />
            <div className={styles.helperText}>
              <p>Auth.js の Credentials 認証を使用しています。</p>
              <p>管理画面の操作権限は `User.role` が `ADMIN` のユーザーに限定されます。</p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
