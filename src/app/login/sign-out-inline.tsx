"use client";

import { signOut } from "next-auth/react";
import styles from "./page.module.css";

export function SignOutInline() {
  return (
    <button
      className={styles.secondaryButton}
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
    >
      別アカウントでログイン
    </button>
  );
}
