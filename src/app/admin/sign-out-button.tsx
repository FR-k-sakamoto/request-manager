"use client";

import Button from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  sx?: SxProps<Theme>;
};

export function SignOutButton({ sx }: SignOutButtonProps) {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/login" })}
      sx={sx}
      type="button"
      variant="outlined"
    >
      ログアウト
    </Button>
  );
}
