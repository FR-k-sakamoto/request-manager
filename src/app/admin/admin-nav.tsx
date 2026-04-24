"use client";

import Button from "@mui/material/Button";
import Link from "next/link";

export function AdminNav() {
  return (
    <>
      <Button component={Link} href="/admin" variant="outlined">
        管理者
      </Button>
      <Button component={Link} href="/admin/categories" variant="outlined">
        カテゴリ管理
      </Button>
    </>
  );
}
