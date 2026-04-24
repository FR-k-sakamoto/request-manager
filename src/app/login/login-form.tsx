"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type LoginFormProps = {
  defaultError?: string;
};

export function LoginForm({ defaultError = "" }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState(defaultError);
  const [isPending, startTransition] = useTransition();

  return (
    <Box
      component="form"
      sx={{ display: "grid", gap: 2.25 }}
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
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
      <TextField
        autoComplete="email"
        id="email"
        name="email"
        label="Email"
        required
        type="email"
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "16px",
            height: 54,
          },
        }}
      />
      <TextField
        autoComplete="current-password"
        id="password"
        name="password"
        label="Password"
        required
        type="password"
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "16px",
            height: 54,
          },
        }}
      />
      {error ? (
        <Typography sx={{ color: "error.main", fontSize: 14 }}>{error}</Typography>
      ) : null}
      <Button
        type="submit"
        variant="contained"
        disabled={isPending}
        sx={{
          height: 52,
          borderRadius: "16px",
          fontWeight: 700,
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          textTransform: "none",
          fontSize: "inherit",
        }}
      >
        {isPending ? "ログイン中..." : "ログイン"}
      </Button>
    </Box>
  );
}
