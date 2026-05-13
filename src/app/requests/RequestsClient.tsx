"use client";

import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { UserHeader } from "@/components/user-header";
import { formatDate, requestCategoryLabels, requestStatusLabels } from "@/lib/request-ui";
import type { RequestCategoryType, RequestStatus } from "@/lib/request-store";
import styles from "@/app/design.module.css";

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

const statusChipClassName: Record<RequestStatus, string> = {
  PENDING: `${styles.statusChip} ${styles.statusPending}`,
  COMPLETED: `${styles.statusChip} ${styles.statusCompleted}`,
  REJECTED: `${styles.statusChip} ${styles.statusRejected}`,
};

export function RequestsClient({ requests, created }: RequestsClientProps) {
  return (
    <div className={styles.shell}>
      <UserHeader />
      <main className={styles.container}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Requests</p>
            <Typography className={styles.pageTitle} component="h1">
              依頼一覧
            </Typography>
            <Typography className={styles.description}>
              投稿された依頼の内容と対応状況を確認できます。
            </Typography>
          </div>
          <Button className={styles.primaryButton} component={Link} href="/requests/new" variant="contained">
            新しい依頼を投稿
          </Button>
        </section>

        {created ? (
          <Alert className={styles.infoNote} severity="info">
            依頼を投稿しました。管理者の対応をお待ちください。
          </Alert>
        ) : null}

        <section className={styles.requestGrid}>
          {requests.length === 0 ? (
            <Card className={styles.emptyCard} elevation={0}>
              <CardContent>
                <Typography className={styles.mutedText}>まだ依頼は投稿されていません。</Typography>
                <Button className={styles.primaryButton} component={Link} href="/requests/new" variant="contained">
                  最初の依頼を投稿する
                </Button>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card
                key={request.id}
                className={styles.requestCard}
                component={Link}
                elevation={0}
                href={`/requests/${request.id}`}
              >
                <CardContent className={styles.requestCardContent}>
                  <div className={styles.requestCardHead}>
                    <div>
                      <Typography className={styles.requestTitle}>{request.title}</Typography>
                      <Typography className={styles.requestMeta}>
                        {requestCategoryLabels[request.categoryType]} ・ {request.requesterName}
                      </Typography>
                    </div>
                    <Chip className={statusChipClassName[request.status]} label={requestStatusLabels[request.status]} />
                  </div>
                  <Typography className={styles.requestBody}>{request.description}</Typography>
                  <div className={styles.footerActions}>
                    <Typography className={styles.requestMeta}>
                      投稿日: {formatDate(new Date(request.createdAt))}
                    </Typography>
                    <Typography className={styles.detailLink}>詳細を見る</Typography>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
