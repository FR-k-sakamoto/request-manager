"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CategoryIcon from "@mui/icons-material/Category";
import { UserHeader } from "@/components/user-header";
import {
  formatDate,
  requestCategoryLabels,
  requestStatusDescriptions,
  requestStatusLabels,
} from "@/lib/request-ui";
import type { RequestCategoryType, RequestStatus } from "@/lib/request-store";
import styles from "@/app/design.module.css";

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

const statusChipClassName: Record<RequestStatus, string> = {
  PENDING: `${styles.statusChip} ${styles.statusPending}`,
  COMPLETED: `${styles.statusChip} ${styles.statusCompleted}`,
  REJECTED: `${styles.statusChip} ${styles.statusRejected}`,
};

const statusPanelIcon: Record<RequestStatus, string> = {
  PENDING: "!",
  COMPLETED: "✓",
  REJECTED: "×",
};

function InfoItem({
  icon,
  label,
  value,
  children,
}: {
  icon: string;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.infoItem}>
      <span className={styles.infoIcon}>{icon}</span>
      <div>
        <Typography className={styles.summaryLabel}>{label}</Typography>
        {children ?? <Typography className={styles.requestTitle}>{value}</Typography>}
      </div>
    </div>
  );
}

export function RequestDetailClient({ request }: RequestDetailClientProps) {
  return (
    <div className={styles.shell}>
      <UserHeader />
      <main className={styles.container}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Request Detail</p>
            <Typography className={styles.pageTitle} component="h1">
              依頼詳細
            </Typography>
            <Typography className={styles.description}>依頼内容と現在の対応状況を確認できます。</Typography>
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

        <Card className={styles.detailCard} elevation={0}>
          <CardContent className={styles.detailContent}>
            <div className={styles.detailHero}>
              <Chip className={statusChipClassName[request.status]} label={requestStatusLabels[request.status]} />
              <Typography className={styles.pageTitle} component="h2">
                {request.title}
              </Typography>
              <Chip
                className={styles.categoryChip}
                label={requestCategoryLabels[request.categoryType]}
                variant="outlined"
              />
            </div>

            <Divider className={styles.sectionDivider} />

            <section className={styles.infoGrid}>
              <InfoItem icon="人" label="依頼者" value={request.requesterName} />
              <InfoItem icon="日" label="投稿日" value={formatDate(new Date(request.createdAt), false)} />
              <InfoItem icon="更" label="更新日時" value={formatDate(new Date(request.updatedAt))} />
              <InfoItem icon="状" label="現在のステータス">
                <div className={styles.navActions}>
                  <Typography className={styles.requestTitle}>{requestStatusLabels[request.status]}</Typography>
                  <Chip className={statusChipClassName[request.status]} label={requestStatusLabels[request.status]} />
                </div>
              </InfoItem>
            </section>

            <Divider className={styles.sectionDivider} />

            <section>
              <Typography className={styles.sectionTitle} component="h3">
                詳細内容
              </Typography>
              <Typography className={styles.requestBody}>{request.description}</Typography>
            </section>

            <Divider className={styles.sectionDivider} />

            <section>
              <Typography className={styles.sectionTitle} component="h3">
                対応状況
              </Typography>
              <Paper className={styles.statusPanel} elevation={0} variant="outlined">
                <span className={styles.statusIcon}>{statusPanelIcon[request.status]}</span>
                <Typography className={styles.requestBody}>{requestStatusDescriptions[request.status]}</Typography>
              </Paper>
            </section>
          </CardContent>
        </Card>

        <div className={styles.footerActions}>
          <Button
            className={styles.secondaryButton}
            component={Link}
            href="/requests"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            一覧に戻る
          </Button>
          <Button
            className={styles.secondaryButton}
            component={Link}
            href={`/requests?category=${request.categoryType}`}
            startIcon={<CategoryIcon />}
            variant="outlined"
          >
            同じカテゴリの依頼を見る
          </Button>
        </div>
        <Typography className={styles.mutedText}>管理者は管理者画面からステータスを更新できます。</Typography>
      </main>
    </div>
  );
}
