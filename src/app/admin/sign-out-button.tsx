"use client";

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <button
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
    >
      ログアウト
    </button>
  );
}
