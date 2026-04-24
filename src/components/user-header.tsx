"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { signOut, useSession } from "next-auth/react";

export function UserHeader() {
  const { data: session } = useSession();

  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        px: { xs: 2.5, md: 4.25 },
        py: 1.75,
        borderBottom: "1px solid #d9e0ec",
        bgcolor: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box
          sx={{
            position: "relative",
            width: 52,
            height: 52,
            borderRadius: "12px",
            background: "linear-gradient(180deg, #5f9bff 0%, #3b82f6 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.36)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-hidden="true"
        >
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 10,
              height: 10,
              borderRadius: "999px",
              bgcolor: "#fff",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 24,
              left: "50%",
              transform: "translateX(-50%)",
              width: 26,
              height: 8,
              borderRadius: "999px",
              bgcolor: "#fff",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 36,
              left: "50%",
              transform: "translateX(-50%)",
              width: 18,
              height: 6,
              borderRadius: "999px",
              bgcolor: "#fff",
            }}
          />
        </Box>
        <Typography
          component={Link}
          href="/"
          variant="h1"
          sx={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          棚からリクエスト
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
        }}
      >
        {session?.user && (
          <>
            <Typography sx={{ color: "#64748b", fontSize: 14 }}>
              {session.user.name}
            </Typography>
            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              variant="outlined"
              sx={{
                borderColor: "#d4dbea",
                color: "#334155",
                borderRadius: "12px",
                px: 2,
                py: 0.75,
                fontWeight: 600,
                fontSize: 14,
                textTransform: "none",
              }}
            >
              ログアウト
            </Button>
          </>
        )}
        {!session?.user && (
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            sx={{
              borderColor: "#d4dbea",
              color: "#334155",
              borderRadius: "12px",
              px: 2,
              py: 0.75,
              fontWeight: 600,
              fontSize: 14,
              textTransform: "none",
            }}
          >
            ログイン
          </Button>
        )}
      </Box>
    </Box>
  );
}
