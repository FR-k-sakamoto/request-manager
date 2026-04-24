"use client";

import { useActionState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import CardActions from "@mui/material/CardActions";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { createRequest } from "./actions";

const categoryOptions = [
  { value: "OFFICE_SUPPLY", label: "事務的・日用品" },
  { value: "IMPROVEMENT", label: "改善要望" },
] as const;

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
  },
} as const;

function RequiredChip() {
  return (
    <Chip
      label="必須"
      size="small"
      sx={{
        bgcolor: "#ffe8ea",
        color: "#ef4444",
        fontWeight: 700,
        fontSize: 12,
        height: 24,
      }}
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="label"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        fontSize: 18,
        fontWeight: 700,
        color: "#334155",
        mb: -0.5,
      }}
    >
      {children}
    </Box>
  );
}

export function NewRequestForm() {
  return (
    <Box
      component="form"
      action={createRequest}
      sx={{ display: "flex", flexDirection: "column", gap: 2.75 }}
    >
      <Box>
        <FieldLabel>
          タイトル
          <RequiredChip />
        </FieldLabel>
        <TextField
          id="title"
          name="title"
          required
          fullWidth
          defaultValue="コピー用紙を補充してほしい"
          sx={{ ...textFieldSx, mt: 1.25 }}
        />
      </Box>

      <Box>
        <FieldLabel>
          カテゴリ
          <RequiredChip />
        </FieldLabel>
        <TextField
          id="categoryType"
          name="categoryType"
          select
          required
          fullWidth
          defaultValue={categoryOptions[0].value}
          sx={{ ...textFieldSx, mt: 1.25 }}
        >
          {categoryOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box>
        <FieldLabel>
          詳細内容
          <RequiredChip />
        </FieldLabel>
        <TextField
          id="description"
          name="description"
          required
          fullWidth
          multiline
          rows={4}
          defaultValue="在庫が残り少ないため、A4コピー用紙を追加で購入してほしいです。"
          sx={{
            ...textFieldSx,
            mt: 1.25,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              lineHeight: 1.8,
            },
          }}
        />
      </Box>

      <Box>
        <FieldLabel>
          依頼者名
          <RequiredChip />
        </FieldLabel>
        <TextField
          id="requesterName"
          name="requesterName"
          required
          fullWidth
          defaultValue="田中"
          sx={{ ...textFieldSx, mt: 1.25 }}
        />
      </Box>

      <Divider sx={{ mx: -4.5, mt: 0.75, borderColor: "#e6ecf5" }} />

      <CardActions
        sx={{
          justifyContent: "space-between",
          gap: 2.5,
          p: 0,
          pb: 3.25,
          flexDirection: { xs: "column-reverse", md: "row" },
          "& > *": { minWidth: { xs: "100%", md: 164 } },
        }}
      >
        <Button
          component={Link}
          href="/requests"
          variant="outlined"
          sx={{
            height: 48,
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: 18,
            textTransform: "none",
            borderColor: "#cfd8e7",
            color: "#334155",
          }}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="contained"
          sx={{
            height: 48,
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: 18,
            textTransform: "none",
            background: "linear-gradient(180deg, #2f6ff2 0%, #1d5fe4 100%)",
            boxShadow: "0 14px 30px rgba(37, 99, 235, 0.28)",
          }}
        >
          依頼を投稿
        </Button>
      </CardActions>
    </Box>
  );
}
