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
import styles from "./page.module.css";

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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const query = normalizeQueryValue(params.query);
  const status = normalizeQueryValue(params.status);
  const category = normalizeQueryValue(params.category);
  const prioritizePending = normalizeQueryValue(params.prioritizePending) === "1";
  const error = getErrorMessage(normalizeQueryValue(params.error));

  const where = buildRequestWhere({ query, status, category });

  const [categories, requests, totalCount, pendingCount, completedCount, rejectedCount] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.request.findMany({
      where,
      include: {
        requester: {
          select: { name: true },
        },
        category: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.request.count(),
    prisma.request.count({ where: { status: "PENDING" } }),
    prisma.request.count({ where: { status: "COMPLETED" } }),
    prisma.request.count({ where: { status: "REJECTED" } }),
  ]);

  const sortedRequests = sortRequestsByPriority(requests, prioritizePending);

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div>
          <h1>管理者ダッシュボード</h1>
          <p>投稿された依頼の対応状況を確認・更新できます</p>
        </div>
        <div className={styles.meta}>
          <span>{formatDate(new Date())} 時点</span>
        </div>
      </div>

      <div className={styles.stats}>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statBlue}`}>□</span>
          <div>
            <p>すべて</p>
            <strong>{totalCount}</strong>
            <span>件</span>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statAmber}`}>⌛</span>
          <div>
            <p>未対応</p>
            <strong>{pendingCount}</strong>
            <span>件</span>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statGreen}`}>✓</span>
          <div>
            <p>完了</p>
            <strong>{completedCount}</strong>
            <span>件</span>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statRed}`}>×</span>
          <div>
            <p>却下</p>
            <strong>{rejectedCount}</strong>
            <span>件</span>
          </div>
        </article>
      </div>

      <form className={styles.filterCard} method="get">
        <div className={styles.filterGroup}>
          <label htmlFor="query">検索</label>
          <input
            defaultValue={query}
            id="query"
            name="query"
            placeholder="依頼タイトル・依頼者で検索"
            type="search"
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="status">ステータス</label>
          <select defaultValue={status} id="status" name="status">
            <option value="">すべて</option>
            <option value="PENDING">未対応</option>
            <option value="COMPLETED">完了</option>
            <option value="REJECTED">却下</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="category">カテゴリ</label>
          <select defaultValue={category} id="category" name="category">
            <option value="">すべて</option>
            {categories.map((item) => (
              <option key={item.id} value={item.type}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <label className={styles.toggle}>
          <input
            defaultChecked={prioritizePending}
            name="prioritizePending"
            type="checkbox"
            value="1"
          />
          未対応を優先表示
        </label>
        <button className={styles.filterButton} type="submit">
          絞り込み
        </button>
      </form>

      {error ? <p className={styles.errorBanner}>{error}</p> : null}

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2>依頼一覧</h2>
          <span>{sortedRequests.length}件を表示中</span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>依頼タイトル</th>
                <th>カテゴリ</th>
                <th>依頼者</th>
                <th>投稿日</th>
                <th>ステータス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map((request) => {
                const nextPositiveStatus = request.status === "COMPLETED" ? "PENDING" : "COMPLETED";
                const positiveButtonLabel =
                  request.status === "COMPLETED" ? "未対応に戻す" : "完了にする";

                return (
                  <tr key={request.id}>
                    <td>
                      <Link className={styles.requestLink} href={`/admin/requests/${request.id}`}>
                        {request.title}
                      </Link>
                      <p className={styles.requestDescription}>{request.description}</p>
                    </td>
                    <td>{request.category.name}</td>
                    <td>{request.requester.name}</td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
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
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link className={styles.detailButton} href={`/admin/requests/${request.id}`}>
                          詳細
                        </Link>
                        <form action={updateRequestStatus} className={styles.inlineForm}>
                          <input name="requestId" type="hidden" value={request.id} />
                          <input name="nextStatus" type="hidden" value={nextPositiveStatus} />
                          <input name="redirectTo" type="hidden" value="/admin" />
                          <button className={styles.completeButton} type="submit">
                            {positiveButtonLabel}
                          </button>
                        </form>
                        <form action={updateRequestStatus} className={styles.rejectForm}>
                          <input name="requestId" type="hidden" value={request.id} />
                          <input name="nextStatus" type="hidden" value="REJECTED" />
                          <input name="redirectTo" type="hidden" value="/admin" />
                          <input
                            aria-label={`${request.title} の却下理由`}
                            name="rejectedReason"
                            placeholder="却下理由"
                            type="text"
                          />
                          <button className={styles.rejectButton} type="submit">
                            却下
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.infoBanner}>
        ステータス変更は管理者権限を持つユーザーのみ実行できます。カテゴリは現在、固定値で運用しています。
      </div>

      <div className={styles.categoryLegend}>
        {Object.entries(categoryTypeLabels).map(([key, label]) => (
          <span key={key} className={styles.categoryChip}>
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
