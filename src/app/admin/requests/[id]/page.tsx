import Link from "next/link";
import { notFound } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Grid2 from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { prisma } from "@/lib/prisma";
import { formatDate, statusLabels } from "@/lib/request-utils";
import { updateRequestStatus } from "../../actions";
import type { RequestStatus } from "@/generated/prisma/client";
import type { Theme } from "@mui/material/styles";

type RequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function statusChipSx(status: RequestStatus) {
  if (status === "PENDING") {
    return {
      backgroundColor: (theme: Theme) => theme.palette.status.pending.bg,
      color: (theme: Theme) => theme.palette.status.pending.main,
      fontWeight: 700,
    };
  }
  if (status === "COMPLETED") {
    return {
      backgroundColor: (theme: Theme) => theme.palette.status.completed.bg,
      color: (theme: Theme) => theme.palette.status.completed.main,
      fontWeight: 700,
    };
  }
  return {
    backgroundColor: (theme: Theme) => theme.palette.status.rejected.bg,
    color: (theme: Theme) => theme.palette.status.rejected.main,
    fontWeight: 700,
  };
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      requester: true,
      handledBy: true,
      category: true,
      statusHistories: {
        include: {
          changedBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <Box sx={{ maxWidth: 1120, mx: "auto" }}>
      {/* 戻るリンク */}
      <Button
        component={Link}
        href="/admin"
        startIcon={<ArrowBackIcon />}
        variant="text"
        sx={{ mb: 2, fontWeight: 700 }}
      >
        一覧に戻る
      </Button>

      {/* ページヘッダー */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" }, gap: 2, mb: 3 }}
      >
        <Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, mb: 1, fontSize: { xs: "1.75rem", md: "2.25rem" } }}
          >
            {request.title}
          </Typography>
          <Typography color="text.secondary" variant="body1" sx={{ lineHeight: 1.8 }}>
            {request.description}
          </Typography>
        </Box>
        <Chip
          label={statusLabels[request.status]}
          sx={{ ...statusChipSx(request.status), alignSelf: { xs: "flex-start", sm: "center" }, flexShrink: 0 }}
        />
      </Stack>

      {/* 詳細グリッド */}
      <Grid2 container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* 基本情報カード */}
        <Grid2 size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardHeader
              title="基本情報"
              titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
              sx={{ borderBottom: (theme) => `1px solid ${theme.palette.border}`, pb: 2 }}
            />
            <CardContent sx={{ px: 2, py: 1.5 }}>
              <List disablePadding>
                {[
                  { label: "依頼者", value: request.requester.name },
                  { label: "カテゴリ", value: request.category.name },
                  { label: "投稿日", value: formatDate(request.createdAt) },
                  { label: "最終対応者", value: request.handledBy?.name ?? "－" },
                  { label: "却下理由", value: request.rejectedReason ?? "－" },
                ].map(({ label, value }) => (
                  <ListItem
                    key={label}
                    disablePadding
                    sx={{ borderBottom: (theme) => `1px solid ${theme.palette.border}`, py: 1.5 }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.25 }}>
                        {label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {value}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid2>

        {/* ステータス更新カード（単一フォーム） */}
        <Grid2 size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardHeader
              title="ステータス更新"
              titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
              sx={{ borderBottom: (theme) => `1px solid ${theme.palette.border}`, pb: 2 }}
            />
            <CardContent>
              <Stack
                component="form"
                action={updateRequestStatus}
                sx={{ gap: 2 }}
              >
                <input type="hidden" name="requestId" value={request.id} />
                <input type="hidden" name="redirectTo" value={`/admin/requests/${request.id}`} />

                <FormControl fullWidth size="small">
                  <InputLabel id="nextStatus-label">ステータス</InputLabel>
                  <Select
                    labelId="nextStatus-label"
                    id="nextStatus"
                    name="nextStatus"
                    defaultValue={request.status}
                    label="ステータス"
                  >
                    <MenuItem value="PENDING">未対応</MenuItem>
                    <MenuItem value="COMPLETED">完了</MenuItem>
                    <MenuItem value="REJECTED">却下</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="却下理由"
                  name="rejectedReason"
                  id="rejectedReason"
                  multiline
                  rows={4}
                  placeholder="却下を選択した場合に入力"
                  defaultValue={request.rejectedReason ?? ""}
                  size="small"
                  fullWidth
                  helperText="ステータスを「却下」にする場合は入力してください"
                />

                <Button type="submit" variant="contained" fullWidth sx={{ fontWeight: 700 }}>
                  ステータスを更新する
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* ステータス履歴 */}
      <Card variant="outlined">
        <CardHeader
          title="ステータス履歴"
          titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
          sx={{ borderBottom: (theme) => `1px solid ${theme.palette.border}`, pb: 2 }}
        />
        <CardContent>
          {request.statusHistories.length === 0 ? (
            <Alert severity="info" sx={{ fontSize: 14 }}>
              ステータス履歴はありません。
            </Alert>
          ) : (
            <List disablePadding>
              {request.statusHistories.map((history) => (
                <ListItem key={history.id} disablePadding sx={{ mb: 1.5 }}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, width: "100%", backgroundColor: "rgba(255,255,255,0.72)" }}
                  >
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.75 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {statusLabels[history.toStatus]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(history.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      変更者: {history.changedBy?.name ?? "システム"}
                    </Typography>
                    {history.comment && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {history.comment}
                      </Typography>
                    )}
                  </Paper>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
