"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CategoryIcon from "@mui/icons-material/Category";
import { useTheme } from "@mui/material/styles";
import {
  formatDate,
  requestCategoryLabels,
  requestStatusDescriptions,
  requestStatusLabels,
} from "@/lib/request-ui";
import type { RequestStatus, RequestCategoryType } from "@/lib/request-store";

type RequestDetailData = {
  id: string;
  title: string;
  categoryType: RequestCategoryType;
  description: string;
  requesterName: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};

type RequestDetailClientProps = {
  request: RequestDetailData;
};

const statusChipColor: Record<RequestStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  COMPLETED: "success",
  REJECTED: "error",
};

const statusPanelIcon: Record<RequestStatus, string> = {
  PENDING: "⏳",
  COMPLETED: "✅",
  REJECTED: "❌",
};

function InfoIcon({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 52,
        height: 52,
        borderRadius: "50%",
        bgcolor: "#edf4ff",
        color: "primary.main",
        fontSize: 18,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

export function RequestDetailClient({ request }: RequestDetailClientProps) {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: "100vh", color: "#1e293b" }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          px: { xs: 2.5, md: 4.25 },
          py: 1.75,
          borderBottom: `1px solid ${theme.palette.border}`,
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
              borderRadius: 3,
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
                borderRadius: "50%",
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
                borderRadius: 999,
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
                borderRadius: 999,
                bgcolor: "#fff",
              }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.03em" }}>
            棚からリクエスト
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/requests"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{
            borderColor: theme.palette.border,
            color: "#334155",
            borderRadius: 3,
            px: 2.75,
            py: 1.5,
            fontWeight: 600,
            fontSize: 18,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
          }}
        >
          一覧に戻る
        </Button>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          width: { xs: "calc(100% - 24px)", md: "min(1260px, calc(100% - 48px))" },
          mx: "auto",
          pt: { xs: 2.75, md: 3.5 },
          pb: 2.5,
        }}
      >
        {/* Hero */}
        <Box sx={{ px: 1.5, pb: 2.75 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#0f172a",
              fontSize: "clamp(2rem, 2.8vw, 3rem)",
            }}
          >
            依頼詳細
          </Typography>
          <Typography sx={{ mt: 1.25, fontSize: 18, lineHeight: 1.7, color: "#64748b" }}>
            依頼内容と現在の対応状況を確認できます
          </Typography>
        </Box>

        {/* Detail Card */}
        <Card
          sx={{
            borderRadius: 4.5,
            border: `1px solid ${theme.palette.border}`,
            boxShadow: "0 18px 38px rgba(15, 23, 42, 0.08)",
          }}
        >
          <CardContent sx={{ p: { xs: "24px 20px", md: 4 } }}>
            {/* Status badge */}
            <Box sx={{ mb: 1.75 }}>
              <Chip
                label={requestStatusLabels[request.status]}
                color={statusChipColor[request.status]}
                sx={{ fontWeight: 700, fontSize: 14 }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#0f172a",
                fontSize: "clamp(2.2rem, 3vw, 3.25rem)",
              }}
            >
              {request.title}
            </Typography>

            {/* Category chip */}
            <Chip
              label={requestCategoryLabels[request.categoryType]}
              variant="outlined"
              sx={{
                mt: 2,
                borderColor: "#8db0ff",
                color: "primary.main",
                fontWeight: 700,
                fontSize: 16,
                height: "auto",
                py: 0.5,
                px: 1,
              }}
            />

            <Divider sx={{ my: 3 }} />

            {/* Info grid */}
            <Grid container spacing={{ xs: 2.5, md: 3 }} columns={{ xs: 1, md: 2 }}>
              <Grid size={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.25 }}>
                  <InfoIcon>人</InfoIcon>
                  <Box>
                    <Typography sx={{ color: "#64748b", fontSize: 15, fontWeight: 700 }}>
                      依頼者
                    </Typography>
                    <Typography sx={{ mt: 0.5, color: "#334155", fontSize: 17, fontWeight: 600 }}>
                      {request.requesterName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.25 }}>
                  <InfoIcon>日</InfoIcon>
                  <Box>
                    <Typography sx={{ color: "#64748b", fontSize: 15, fontWeight: 700 }}>
                      投稿日
                    </Typography>
                    <Typography sx={{ mt: 0.5, color: "#334155", fontSize: 17, fontWeight: 600 }}>
                      {formatDate(new Date(request.createdAt), false)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.25 }}>
                  <InfoIcon>更</InfoIcon>
                  <Box>
                    <Typography sx={{ color: "#64748b", fontSize: 15, fontWeight: 700 }}>
                      更新日時
                    </Typography>
                    <Typography sx={{ mt: 0.5, color: "#334155", fontSize: 17, fontWeight: 600 }}>
                      {formatDate(new Date(request.updatedAt))}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.25 }}>
                  <InfoIcon>状</InfoIcon>
                  <Box>
                    <Typography sx={{ color: "#64748b", fontSize: 15, fontWeight: 700 }}>
                      現在のステータス
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, flexWrap: "wrap", mt: 0.5 }}>
                      <Typography sx={{ color: "#334155", fontSize: 17, fontWeight: 600 }}>
                        {requestStatusLabels[request.status]}
                      </Typography>
                      <Chip
                        label={requestStatusLabels[request.status]}
                        color={statusChipColor[request.status]}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: 13 }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Description */}
            <Box component="section">
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                詳細内容
              </Typography>
              <Typography
                sx={{
                  mt: 1.75,
                  color: "#475569",
                  fontSize: 17,
                  lineHeight: 1.9,
                  whiteSpace: "pre-wrap",
                }}
              >
                {request.description}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Status panel */}
            <Box component="section">
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                対応状況
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 1.75,
                  p: "12px 16px",
                  borderColor: "#f7d49a",
                  borderRadius: 3.5,
                  bgcolor: "#fff9ef",
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#fff0d4",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {statusPanelIcon[request.status]}
                </Box>
                <Typography sx={{ color: "#475569", fontSize: 17 }}>
                  {requestStatusDescriptions[request.status]}
                </Typography>
              </Paper>
            </Box>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mt: 2.75,
          }}
        >
          <Button
            component={Link}
            href="/requests"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: "#cfd8e7",
              color: "#334155",
              borderRadius: 3,
              minHeight: 52,
              px: 2.75,
              fontWeight: 700,
              fontSize: 18,
              width: { xs: "100%", md: "auto" },
            }}
          >
            一覧に戻る
          </Button>
          <Button
            component={Link}
            href={`/requests?category=${request.categoryType}`}
            variant="outlined"
            startIcon={<CategoryIcon />}
            sx={{
              borderColor: "#8db0ff",
              color: "primary.main",
              borderRadius: 3,
              minHeight: 52,
              px: 2.75,
              fontWeight: 700,
              fontSize: 18,
              width: { xs: "100%", md: "auto" },
            }}
          >
            同じカテゴリの依頼を見る
          </Button>
        </Box>

        <Typography
          sx={{
            mt: 2.5,
            color: "#64748b",
            fontSize: 16,
            textAlign: { xs: "left", md: "right" },
          }}
        >
          管理者は管理者画面からステータスを更新できます
        </Typography>
      </Box>
    </Box>
  );
}
