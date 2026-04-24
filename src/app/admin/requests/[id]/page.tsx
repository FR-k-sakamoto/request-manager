import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, statusLabels } from "@/lib/request-utils";
import { updateRequestStatus } from "../../actions";
import styles from "./page.module.css";

type RequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <Link className={styles.backLink} href="/admin">
            ← 一覧に戻る
          </Link>
          <h1>{request.title}</h1>
          <p>{request.description}</p>
        </div>
        <span
          className={`${styles.statusBadge} ${
            request.status === "PENDING"
              ? styles.pending
              : request.status === "COMPLETED"
                ? styles.completed
                : styles.rejected
          }`}
        >
          {statusLabels[request.status]}
        </span>
      </div>

      <div className={styles.detailsGrid}>
        <article className={styles.detailCard}>
          <h2>基本情報</h2>
          <dl>
            <div>
              <dt>依頼者</dt>
              <dd>{request.requester.name}</dd>
            </div>
            <div>
              <dt>カテゴリ</dt>
              <dd>{request.category.name}</dd>
            </div>
            <div>
              <dt>投稿日</dt>
              <dd>{formatDate(request.createdAt)}</dd>
            </div>
            <div>
              <dt>最終対応者</dt>
              <dd>{request.handledBy?.name ?? "-"}</dd>
            </div>
            <div>
              <dt>却下理由</dt>
              <dd>{request.rejectedReason ?? "-"}</dd>
            </div>
          </dl>
        </article>

        <article className={styles.detailCard}>
          <h2>ステータス更新</h2>
          <div className={styles.actionStack}>
            <form action={updateRequestStatus} className={styles.actionForm}>
              <input name="requestId" type="hidden" value={request.id} />
              <input name="nextStatus" type="hidden" value="PENDING" />
              <input name="redirectTo" type="hidden" value={`/admin/requests/${request.id}`} />
              <button className={styles.pendingButton} type="submit">
                未対応に戻す
              </button>
            </form>
            <form action={updateRequestStatus} className={styles.actionForm}>
              <input name="requestId" type="hidden" value={request.id} />
              <input name="nextStatus" type="hidden" value="COMPLETED" />
              <input name="redirectTo" type="hidden" value={`/admin/requests/${request.id}`} />
              <button className={styles.completeButton} type="submit">
                完了にする
              </button>
            </form>
            <form action={updateRequestStatus} className={styles.rejectPanel}>
              <input name="requestId" type="hidden" value={request.id} />
              <input name="nextStatus" type="hidden" value="REJECTED" />
              <input name="redirectTo" type="hidden" value={`/admin/requests/${request.id}`} />
              <label htmlFor="rejectedReason">却下理由</label>
              <textarea
                defaultValue={request.rejectedReason ?? ""}
                id="rejectedReason"
                name="rejectedReason"
                placeholder="却下理由を入力"
                rows={4}
              />
              <button className={styles.rejectButton} type="submit">
                却下する
              </button>
            </form>
          </div>
        </article>
      </div>

      <article className={styles.timelineCard}>
        <h2>ステータス履歴</h2>
        <ul className={styles.timeline}>
          {request.statusHistories.map((history) => (
            <li key={history.id}>
              <div>
                <strong>{statusLabels[history.toStatus]}</strong>
                <span>{formatDate(history.createdAt)}</span>
              </div>
              <p>変更者: {history.changedBy?.name ?? "システム"}</p>
              <p>{history.comment ?? "コメントなし"}</p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
