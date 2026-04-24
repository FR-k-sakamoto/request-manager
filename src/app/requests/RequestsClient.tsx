"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import { formatDate, requestCategoryLabels, requestStatusLabels } from "@/lib/request-ui";
import type { RequestStatus, RequestCategoryType } from "@/lib/request-store";
import { UserHeader } from "@/components/user-header";

type RequestItem = {
  id: string;
  title: string;
  categoryType: RequestCategoryType;
  description: string;
  requesterName: string;
  status: RequestStatus;
  createdAt: string;
};

type RequestsClientProps = {
  requests: RequestItem[];
  created: boolean;
};

const statusChipColor: Record<RequestStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  COMPLETED: "success",
  REJECTED: "error",
};

export function RequestsClient({ requests, created }: RequestsClientProps) {
  const theme = useTheme();

  return (
    <>
    <UserHeader />
    <Box
      component="main"
      sx={{
        width: { xs: "calc(100% - 24px)", sm: "min(1080px, calc(100% - 32px))" },
        mx: "auto",
        pt: { xs: 3, sm: 5 },
        pb: 7,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "flex-start" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2.5,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: "-0.04em", color: "#0f172a" }}
          >
            依頼一覧
          </Typography>
          <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 16 }}>
            投稿された依頼の内容と対応状況を確認できます。
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/requests/new"
          variant="contained"
          sx={{
            minHeight: 46,
            px: 2.5,
            borderRadius: 3,
            fontWeight: 700,
            background: "linear-gradient(180deg, #2f6ff2 0%, #1d5fe4 100%)",
            boxShadow: "0 14px 30px rgba(37, 99, 235, 0.22)",
            whiteSpace: "nowrap",
          }}
        >
          新しい依頼を投稿
        </Button>
      </Box>

      {created && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 3.5, fontWeight: 600 }}>
          依頼を投稿しました。管理者の対応をお待ちください。
        </Alert>
      )}

      <Box sx={{ display: "grid", gap: 2 }}>
        {requests.length === 0 ? (
          <Card
            sx={{
              borderRadius: 4.5,
              border: `1px solid ${theme.palette.border}`,
              backgroundColor: theme.palette.surface,
              boxShadow: "0 16px 34px rgba(15, 23, 42, 0.08)",
            }}
          >
            <CardContent sx={{ textAlign: "center", color: "#475569", py: 4 }}>
              <Typography>まだ依頼は投稿されていません。</Typography>
              <Button
                component={Link}
                href="/requests/new"
                sx={{ mt: 1.5, fontWeight: 700 }}
              >
                最初の依頼を投稿する
              </Button>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card
              key={request.id}
              component={Link}
              href={`/requests/${request.id}`}
              sx={{
                display: "block",
                borderRadius: 4.5,
                border: `1px solid ${theme.palette.border}`,
                backgroundColor: theme.palette.surface,
                boxShadow: "0 16px 34px rgba(15, 23, 42, 0.08)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: "#c8d7f4",
                  boxShadow: "0 20px 42px rgba(15, 23, 42, 0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 2.75, "&:last-child": { pb: 2.75 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: { xs: "stretch", sm: "flex-start" },
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}
                    >
                      {request.title}
                    </Typography>
                    <Typography sx={{ mt: 1, color: "#64748b", fontSize: 14 }}>
                      {requestCategoryLabels[request.categoryType]} ・ {request.requesterName}
                    </Typography>
                  </Box>
                  <Chip
                    label={requestStatusLabels[request.status]}
                    color={statusChipColor[request.status]}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: 13 }}
                  />
                </Box>
                <Typography sx={{ mt: 2, color: "#334155", lineHeight: 1.8 }}>
                  {request.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    mt: 2,
                  }}
                >
                  <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                    投稿日: {formatDate(new Date(request.createdAt))}
                  </Typography>
                  <Typography
                    sx={{ color: "primary.main", fontSize: 14, fontWeight: 700 }}
                  >
                    詳細を見る
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
    </>
  );
}
