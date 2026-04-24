import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  buildRequestWhere,
  categoryTypeLabels,
  formatDate,
  normalizeQueryValue,
  sortRequestsByPriority,
  statusLabels,
} from "@/lib/request-utils";
import { updateRequestStatus } from "./actions";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type AdminPageProps = {
  searchParams: Promise<{
    query?: string | string[];
    status?: string | string[];
    category?: string | string[];
    prioritizePending?: string | string[];
    error?: string | string[];
  }>;
};

function getErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "rejected-reason-required":
      return "却下時は理由の入力が必要です。";
    case "invalid":
      return "入力内容を確認してください。";
    case "not-found":
      return "対象の依頼が見つかりませんでした。";
    default:
      return "";
  }
}

type RequestStatus = "PENDING" | "COMPLETED" | "REJECTED";

const statusPaletteKey: Record<RequestStatus, "pending" | "completed" | "rejected"> = {
  PENDING: "pending",
  COMPLETED: "completed",
  REJECTED: "rejected",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const query = normalizeQueryValue(params.query);
  const status = normalizeQueryValue(params.status);
  const category = normalizeQueryValue(params.category);
  const prioritizePending = normalizeQueryValue(params.prioritizePending) === "1";
  const error = getErrorMessage(normalizeQueryValue(params.error));

  const where = buildRequestWhere({ query, status, category });

  const [categories, requests, totalCount, pendingCount, completedCount, rejectedCount] =
    await Promise.all([
      prisma.category.findMany({
        orderBy: { createdAt: "asc" },
      }),
      prisma.request.findMany({
        where,
        include: {
          requester: { select: { name: true } },
          category: { select: { id: true, name: true, type: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.request.count(),
      prisma.request.count({ where: { status: "PENDING" } }),
      prisma.request.count({ where: { status: "COMPLETED" } }),
      prisma.request.count({ where: { status: "REJECTED" } }),
    ]);

  const sortedRequests = sortRequestsByPriority(requests, prioritizePending);

  return (
    <Box>
      {/* ヘッディング */}
      <Stack
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-start" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: "-0.04em" }}
          >
            管理者ダッシュボード
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
            投稿された依頼の対応状況を確認・更新できます
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", whiteSpace: "nowrap", pt: 0.5 }}
        >
          {formatDate(new Date())} 時点
        </Typography>
      </Stack>

      {/* 統計カード（4列） */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.border}`, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                すべて
              </Typography>
              <Stack sx={{ flexDirection: "row", alignItems: "baseline", gap: 0.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main" }}>
                  {totalCount}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>件</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.border}`, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                未対応
              </Typography>
              <Stack sx={{ flexDirection: "row", alignItems: "baseline", gap: 0.5 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: (t) => t.palette.status.pending.main }}
                >
                  {pendingCount}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>件</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.border}`, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                完了
              </Typography>
              <Stack sx={{ flexDirection: "row", alignItems: "baseline", gap: 0.5 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: (t) => t.palette.status.completed.main }}
                >
                  {completedCount}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>件</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.border}`, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                却下
              </Typography>
              <Stack sx={{ flexDirection: "row", alignItems: "baseline", gap: 0.5 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: (t) => t.palette.status.rejected.main }}
                >
                  {rejectedCount}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>件</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* フィルターフォーム (method="get" 維持) */}
      <Paper
        component="form"
        method="get"
        elevation={0}
        sx={{
          border: (t) => `1px solid ${t.palette.border}`,
          borderRadius: 3,
          p: 2.5,
          mb: 3,
        }}
      >
        <Stack
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <TextField
            defaultValue={query}
            id="query"
            name="query"
            label="検索"
            placeholder="依頼タイトル・依頼者で検索"
            size="small"
            sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="status-label">ステータス</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              defaultValue={status}
              label="ステータス"
            >
              <MenuItem value="">すべて</MenuItem>
              <MenuItem value="PENDING">未対応</MenuItem>
              <MenuItem value="COMPLETED">完了</MenuItem>
              <MenuItem value="REJECTED">却下</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="category-label">カテゴリ</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              defaultValue={category}
              label="カテゴリ"
            >
              <MenuItem value="">すべて</MenuItem>
              {categories.map((item) => (
                <MenuItem key={item.id} value={item.type ?? ""}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={prioritizePending}
                name="prioritizePending"
                value="1"
                size="small"
              />
            }
            label="未対応を優先表示"
          />
          <Button type="submit" variant="contained">
            絞り込み
          </Button>
        </Stack>
      </Paper>

      {/* エラーバナー */}
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 依頼テーブル */}
      <Paper
        elevation={0}
        sx={{
          border: (t) => `1px solid ${t.palette.border}`,
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2.5,
            py: 2,
            borderBottom: (t) => `1px solid ${t.palette.border}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            依頼一覧
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {sortedRequests.length}件を表示中
          </Typography>
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>依頼タイトル</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>カテゴリ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>依頼者</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>投稿日</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ステータス</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRequests.map((request) => {
                const nextPositiveStatus =
                  request.status === "COMPLETED" ? "PENDING" : "COMPLETED";
                const positiveButtonLabel =
                  request.status === "COMPLETED" ? "未対応に戻す" : "完了にする";
                const sk =
                  statusPaletteKey[request.status as RequestStatus] ?? "pending";

                return (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Typography
                        component={Link}
                        href={`/admin/requests/${request.id}`}
                        sx={{
                          fontWeight: 600,
                          color: "primary.main",
                          textDecoration: "none",
                          display: "block",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {request.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {request.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{request.category.name}</TableCell>
                    <TableCell>{request.requester.name}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[request.status as keyof typeof statusLabels]}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          color: (t) => t.palette.status[sk].main,
                          bgcolor: (t) => t.palette.status[sk].bg,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack
                        sx={{
                          flexDirection: { xs: "column", lg: "row" },
                          gap: 1,
                          alignItems: "flex-start",
                        }}
                      >
                        <Button
                          component={Link}
                          href={`/admin/requests/${request.id}`}
                          variant="outlined"
                          size="small"
                        >
                          詳細
                        </Button>
                        {/* 完了/未対応に戻すアクション */}
                        <Box component="form" action={updateRequestStatus}>
                          <input type="hidden" name="requestId" value={request.id} />
                          <input type="hidden" name="nextStatus" value={nextPositiveStatus} />
                          <input type="hidden" name="redirectTo" value="/admin" />
                          <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            color={nextPositiveStatus === "COMPLETED" ? "success" : "warning"}
                          >
                            {positiveButtonLabel}
                          </Button>
                        </Box>
                        {/* 却下アクション */}
                        <Stack
                          component="form"
                          action={updateRequestStatus}
                          sx={{ flexDirection: "row", gap: 0.5, alignItems: "center" }}
                        >
                          <input type="hidden" name="requestId" value={request.id} />
                          <input type="hidden" name="nextStatus" value="REJECTED" />
                          <input type="hidden" name="redirectTo" value="/admin" />
                          <TextField
                            aria-label={`${request.title} の却下理由`}
                            name="rejectedReason"
                            placeholder="却下理由"
                            size="small"
                            sx={{ width: 160 }}
                          />
                          <Button type="submit" variant="outlined" size="small" color="error">
                            却下
                          </Button>
                        </Stack>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* インフォバナー */}
      <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
        ステータス変更は管理者権限を持つユーザーのみ実行できます。カテゴリは現在、固定値で運用しています。
      </Alert>

      {/* カテゴリ凡例 */}
      <Stack sx={{ flexDirection: "row", flexWrap: "wrap", gap: 1 }}>
        {Object.entries(categoryTypeLabels).map(([key, label]) => (
          <Chip key={key} label={label} variant="outlined" size="small" />
        ))}
      </Stack>
    </Box>
  );
}
