import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatDate,
  requestCategoryLabels,
  requestStatusDescriptions,
  requestStatusLabels,
} from "@/lib/request-ui";
import { getRequestById } from "@/lib/request-store";
import styles from "./page.module.css";

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

function InfoIcon({ children }: { children: React.ReactNode }) {
  return <span className={styles.infoIcon}>{children}</span>;
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;
  const request = await getRequestById(id);

  if (!request) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            <span className={styles.brandDot} />
            <span className={styles.brandSlotTop} />
            <span className={styles.brandSlotBottom} />
          </div>
          <h1 className={styles.brandTitle}>棚からリクエスト</h1>
        </div>
        <Link href="/requests" className={styles.backLink}>
          <span className={styles.backArrow} aria-hidden="true">
            ←
          </span>
          一覧に戻る
        </Link>
      </header>

      <main className={styles.content}>
        <section className={styles.hero}>
          <h2 className={styles.pageTitle}>依頼詳細</h2>
          <p className={styles.pageDescription}>依頼内容と現在の対応状況を確認できます</p>
        </section>

        <section className={styles.card}>
          <div className={styles.badgeRow}>
            <span className={styles.statusBadge}>{requestStatusLabels[request.status]}</span>
          </div>

          <h3 className={styles.title}>{request.title}</h3>
          <p className={styles.categoryChip}>{requestCategoryLabels[request.categoryType]}</p>

          <div className={styles.divider} />

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <InfoIcon>人</InfoIcon>
              <div>
                <p className={styles.infoLabel}>依頼者</p>
                <p className={styles.infoValue}>{request.requesterName}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <InfoIcon>日</InfoIcon>
              <div>
                <p className={styles.infoLabel}>投稿日</p>
                <p className={styles.infoValue}>{formatDate(new Date(request.createdAt), false)}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <InfoIcon>更</InfoIcon>
              <div>
                <p className={styles.infoLabel}>更新日時</p>
                <p className={styles.infoValue}>{formatDate(new Date(request.updatedAt))}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <InfoIcon>状</InfoIcon>
              <div>
                <p className={styles.infoLabel}>現在のステータス</p>
                <div className={styles.statusValueWrap}>
                  <p className={styles.infoValue}>{requestStatusLabels[request.status]}</p>
                  <span className={styles.inlineStatusBadge}>
                    {requestStatusLabels[request.status]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>詳細内容</h4>
            <p className={styles.description}>{request.description}</p>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>対応状況</h4>
            <div className={styles.statusPanel}>
              <span className={styles.statusPanelIcon}>⏳</span>
              <p>{requestStatusDescriptions[request.status]}</p>
            </div>
          </section>
        </section>

        <div className={styles.footerActions}>
          <Link href="/requests" className={styles.outlineButton}>
            <span className={styles.backArrow} aria-hidden="true">
              ←
            </span>
            一覧に戻る
          </Link>

          <Link
            href={`/requests?category=${request.categoryType}`}
            className={styles.primaryOutlineButton}
          >
            <span aria-hidden="true">▣</span>
            同じカテゴリの依頼を見る
          </Link>
        </div>

        <p className={styles.note}>管理者は管理者画面からステータスを更新できます</p>
      </main>
    </div>
  );
}
