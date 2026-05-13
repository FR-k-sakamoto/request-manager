"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { createRequest } from "./actions";
import styles from "@/app/design.module.css";

const categoryOptions = [
  { value: "OFFICE_SUPPLY", label: "事務的・日用品" },
  { value: "IMPROVEMENT", label: "改善要望" },
] as const;

function RequiredChip() {
  return <Chip className={styles.requiredChip} label="必須" size="small" />;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={styles.fieldLabel}>{children}</label>;
}

export function NewRequestForm() {
  return (
    <form action={createRequest} className={styles.formStack}>
      <div>
        <FieldLabel>
          タイトル
          <RequiredChip />
        </FieldLabel>
        <TextField
          className={styles.textField}
          defaultValue="コピー用紙を補充してほしい"
          fullWidth
          id="title"
          name="title"
          required
        />
      </div>

      <div>
        <FieldLabel>
          カテゴリ
          <RequiredChip />
        </FieldLabel>
        <TextField
          className={styles.textField}
          defaultValue={categoryOptions[0].value}
          fullWidth
          id="categoryType"
          name="categoryType"
          required
          select
        >
          {categoryOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div>
        <FieldLabel>
          詳細内容
          <RequiredChip />
        </FieldLabel>
        <TextField
          className={styles.textField}
          defaultValue="在庫が残り少ないため、A4コピー用紙を追加で購入してほしいです。"
          fullWidth
          id="description"
          multiline
          name="description"
          required
          rows={4}
        />
      </div>

      <div>
        <FieldLabel>
          依頼者名
          <RequiredChip />
        </FieldLabel>
        <TextField
          className={styles.textField}
          defaultValue="田中"
          fullWidth
          id="requesterName"
          name="requesterName"
          required
        />
      </div>

      <Divider className={styles.sectionDivider} />

      <div className={styles.formActions}>
        <Button className={styles.secondaryButton} component={Link} href="/requests" variant="outlined">
          キャンセル
        </Button>
        <Button className={styles.primaryButton} type="submit" variant="contained">
          依頼を投稿
        </Button>
      </div>
    </form>
  );
}
