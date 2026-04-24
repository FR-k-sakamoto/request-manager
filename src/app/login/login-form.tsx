"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import styles from "./page.module.css";

type LoginFormProps = {
  defaultError?: string;
};

export function LoginForm({ defaultError = "" }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState(defaultError);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        setError("");

        startTransition(async () => {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/login",
          });

          if (!result || result.error) {
            setError("メールアドレスまたはパスワードが正しくありません。");
            return;
          }

          router.push("/login");
          router.refresh();
        });
      }}
    >
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input autoComplete="email" id="email" name="email" required type="email" />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input
          autoComplete="current-password"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      {error ? <p className={styles.errorText}>{error}</p> : null}
      <button className={styles.submitButton} disabled={isPending} type="submit">
        {isPending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
