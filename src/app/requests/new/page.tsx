"use client";

import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { UserHeader } from "@/components/user-header";
import styles from "@/app/design.module.css";
import { NewRequestForm } from "./new-request-form";

export default function NewRequestPage() {
  return (
    <div className={styles.shell}>
      <UserHeader />
      <main className={styles.container}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>New Request</p>
            <Typography className={styles.pageTitle} component="h1">
              新しい依頼を投稿
            </Typography>
            <Typography className={styles.description}>
              備品・日用品の購入依頼や、社内の改善要望を登録できます。
            </Typography>
          </div>
          <Button
            className={styles.secondaryButton}
            component={Link}
            href="/requests"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            一覧に戻る
          </Button>
        </section>

        <Card className={styles.formCard} elevation={0}>
          <CardContent className={styles.formContent}>
            <Typography className={styles.sectionTitle} component="h2">
              依頼内容
            </Typography>
            <NewRequestForm />
          </CardContent>
        </Card>

        <Alert className={styles.infoNote} icon={<InfoOutlinedIcon />} severity="info">
          投稿された依頼は一覧画面に表示され、管理者が対応状況を更新します。
        </Alert>
      </main>
    </div>
  );
}
