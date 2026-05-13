"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { signOut, useSession } from "next-auth/react";
import styles from "@/app/design.module.css";

export function UserHeader() {
  const { data: session } = useSession();

  return (
    <header className={styles.topNav}>
      <Link className={styles.brand} href="/">
        <span className={styles.brandMark} aria-hidden="true">
          棚
        </span>
        <Typography className={styles.brandText} component="span">
          棚からリクエスト
        </Typography>
      </Link>

      <div className={styles.navActions}>
        {session?.user ? (
          <>
            <Typography className={styles.navUser}>{session.user.name}</Typography>
            <Button
              className={styles.secondaryButton}
              onClick={() => signOut({ callbackUrl: "/login" })}
              variant="outlined"
            >
              ログアウト
            </Button>
          </>
        ) : (
          <Button className={styles.secondaryButton} component={Link} href="/login" variant="outlined">
            ログイン
          </Button>
        )}
      </div>
    </header>
  );
}
