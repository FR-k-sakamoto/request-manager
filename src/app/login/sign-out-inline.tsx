"use client";

import { signOut } from "next-auth/react";
import Button from "@mui/material/Button";

export function SignOutInline() {
  return (
    <Button
      variant="text"
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
      sx={{
        height: 52,
        borderRadius: "16px",
        fontWeight: 700,
        bgcolor: "#eef4ff",
        color: "primary.dark",
        textTransform: "none",
        fontSize: "inherit",
        "&:hover": {
          bgcolor: "#dbeafe",
        },
      }}
    >
      別アカウントでログイン
    </Button>
  );
}
