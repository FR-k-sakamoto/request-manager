"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { signOut, useSession } from "next-auth/react";
import { NewRequestForm } from "./new-request-form";

export default function NewRequestPage() {
  const { data: session } = useSession();

  return (
    <Box sx={{ minHeight: "100vh", color: "#1e293b" }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 3,
          px: { xs: 2.5, md: 4.25 },
          py: 1.75,
          borderBottom: "1px solid #d9e0ec",
          bgcolor: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(12px)",
          flexDirection: { xs: "column", md: "row" },
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
            variant="h1"
            sx={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}
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
          <Button
            component={Link}
            href="/requests"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              px: 2.75,
              py: 1.75,
              borderRadius: "12px",
              border: "1px solid #d4dbea",
              bgcolor: "#fff",
              fontSize: 18,
              fontWeight: 600,
              color: "#334155",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
              textTransform: "none",
            }}
          >
            一覧に戻る
          </Button>
          {session?.user && (
            <>
              <Typography sx={{ color: "#64748b", fontSize: 14, display: "flex", alignItems: "center" }}>
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
        </Box>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          width: { xs: "calc(100% - 24px)", md: "min(1240px, calc(100% - 48px))" },
          mx: "auto",
          py: { xs: 2.75, md: 3.5 },
        }}
      >
        {/* Hero section */}
        <Box sx={{ px: 1.5, pb: 2.75 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: "clamp(2rem, 2.8vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#0f172a",
            }}
          >
            新しい依頼を投稿
          </Typography>
          <Typography sx={{ mt: 1.25, fontSize: 18, lineHeight: 1.7, color: "#64748b" }}>
            備品・日用品の購入依頼や、社内の改善要望を登録できます
          </Typography>
        </Box>

        {/* Form card */}
        <Card
          sx={{
            borderRadius: "18px",
            border: "1px solid #dde5f0",
            boxShadow: "0 18px 38px rgba(15, 23, 42, 0.08)",
          }}
        >
          <CardContent sx={{ px: { xs: 2.5, md: 4.5 }, pt: 3.5, pb: 0 }}>
            <Typography
              variant="h3"
              sx={{ mb: 2.75, fontSize: 22, fontWeight: 800, color: "#1e293b" }}
            >
              依頼内容
            </Typography>
            <NewRequestForm />
          </CardContent>
        </Card>

        {/* Info note */}
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{
            mt: 2,
            borderRadius: "16px",
            border: "1px solid #dce4f0",
            bgcolor: "rgba(255, 255, 255, 0.7)",
            color: "#475569",
            fontSize: 16,
            "& .MuiAlert-icon": {
              color: "#2563eb",
            },
          }}
        >
          投稿された依頼は一覧画面に表示され、管理者が対応状況を更新します
        </Alert>
      </Box>
    </Box>
  );
}
