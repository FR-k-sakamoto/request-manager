"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import {
  createCategory,
  toggleCategoryStatus,
  updateCategory,
  type CategoryActionState,
} from "./actions";

export type CategoryListItem = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

const initialActionState: CategoryActionState = {
  status: "idle",
  message: "",
};

type CategoriesClientProps = {
  categories: CategoryListItem[];
};

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createCategory, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <Grid container spacing={2.5} sx={{ alignItems: "flex-start" }}>
      {/* 新規カテゴリ追加フォーム */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card variant="outlined">
          <CardHeader
            title="新規カテゴリ追加"
            titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
            sx={{ borderBottom: (theme) => `1px solid ${theme.palette.border}`, pb: 2 }}
          />
          <CardContent>
            <Stack
              ref={formRef}
              component="form"
              action={formAction}
              spacing={2}
            >
              <TextField
                label="カテゴリ名"
                name="name"
                required
                slotProps={{ htmlInput: { maxLength: 80 } }}
                size="small"
                fullWidth
              />

              <TextField
                label="説明"
                name="description"
                multiline
                rows={4}
                slotProps={{ htmlInput: { maxLength: 240 } }}
                size="small"
                fullWidth
              />

              <Box>
                <FormLabel component="legend" sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>
                  状態
                </FormLabel>
                <RadioGroup defaultValue="true" name="isActive" row>
                  <FormControlLabel value="true" control={<Radio size="small" />} label="有効" />
                  <FormControlLabel value="false" control={<Radio size="small" />} label="無効" />
                </RadioGroup>
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={pending}
                fullWidth
              >
                {pending ? "追加中" : "追加する"}
              </Button>

              <ActionMessage state={state} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* 登録済みカテゴリ一覧 */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card variant="outlined">
          <CardHeader
            title="登録済みカテゴリ一覧"
            titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
            sx={{ borderBottom: (theme) => `1px solid ${theme.palette.border}`, pb: 2 }}
          />
          <CardContent sx={{ p: 0 }}>
            {categories.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 2.5 }} variant="body2">
                登録済みカテゴリはありません。
              </Typography>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 560 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>カテゴリ名</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>説明</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>状態</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((category) => (
                      <CategoryRow key={category.id} category={category} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function CategoryRow({ category }: { category: CategoryListItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, editAction, editPending] = useActionState(updateCategory, initialActionState);
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleCategoryStatus,
    initialActionState,
  );

  if (isEditing) {
    return (
      <TableRow>
        <TableCell colSpan={4} sx={{ p: 2 }}>
          <Card variant="outlined" sx={{ backgroundColor: "action.hover" }}>
            <CardContent>
              <Stack
                component="form"
                action={editAction}
                spacing={2}
              >
                <input type="hidden" name="id" value={category.id} />

                <TextField
                  label="カテゴリ名"
                  name="name"
                  required
                  slotProps={{ htmlInput: { maxLength: 80 } }}
                  defaultValue={category.name}
                  size="small"
                  fullWidth
                />

                <TextField
                  label="説明"
                  name="description"
                  multiline
                  rows={3}
                  slotProps={{ htmlInput: { maxLength: 240 } }}
                  defaultValue={category.description ?? ""}
                  size="small"
                  fullWidth
                />

                <Box>
                  <FormLabel component="legend" sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>
                    状態
                  </FormLabel>
                  <RadioGroup
                    defaultValue={String(category.isActive)}
                    name="isActive"
                    row
                  >
                    <FormControlLabel value="true" control={<Radio size="small" />} label="有効" />
                    <FormControlLabel value="false" control={<Radio size="small" />} label="無効" />
                  </RadioGroup>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={editPending}
                    size="small"
                  >
                    {editPending ? "保存中" : "保存する"}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    disabled={editPending}
                    size="small"
                    onClick={() => setIsEditing(false)}
                  >
                    キャンセル
                  </Button>
                </Stack>

                <ActionMessage state={editState} />
              </Stack>
            </CardContent>
          </Card>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 700, fontSize: 14 }}>{category.name}</TableCell>
      <TableCell sx={{ fontSize: 14 }}>{category.description || "－"}</TableCell>
      <TableCell>
        <Chip
          label={category.isActive ? "有効" : "無効"}
          size="small"
          sx={
            category.isActive
              ? {
                  backgroundColor: (theme) => theme.palette.status.completed.bg,
                  color: (theme) => theme.palette.status.completed.main,
                  fontWeight: 700,
                }
              : {
                  backgroundColor: "action.hover",
                  color: "text.secondary",
                  fontWeight: 700,
                }
          }
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <IconButton
            aria-label={`${category.name}を編集`}
            size="small"
            onClick={() => setIsEditing(true)}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <form action={toggleAction}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="isActive" value={String(!category.isActive)} />
            <Button
              type="submit"
              variant="outlined"
              size="small"
              disabled={togglePending}
            >
              {togglePending ? "変更中" : category.isActive ? "無効化" : "有効化"}
            </Button>
          </form>

          <ActionMessage state={toggleState} compact />
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function ActionMessage({
  state,
  compact = false,
}: {
  state: CategoryActionState;
  compact?: boolean;
}) {
  if (!state.message) {
    return null;
  }

  return (
    <Alert
      severity={state.status === "error" ? "error" : "success"}
      sx={compact ? { py: 0.25, fontSize: 13 } : undefined}
    >
      {state.message}
    </Alert>
  );
}
