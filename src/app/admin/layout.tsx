import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";
import styles from "./shell.module.css";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>▣</div>
          <div>
            <p className={styles.brandTitle}>棚からリクエスト</p>
            <p className={styles.brandSubtitle}>管理者向けダッシュボード</p>
          </div>
        </div>
        <div className={styles.actions}>
          <nav className={styles.nav}>
            <Link className={styles.navLink} href="/admin">
              管理者
            </Link>
            <Link className={styles.navLink} href="/admin/categories">
              カテゴリ管理
            </Link>
          </nav>
          <div className={styles.userBlock}>
            <span className={styles.userName}>{session.user.name}</span>
            <SignOutButton className={styles.signOutButton} />
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
