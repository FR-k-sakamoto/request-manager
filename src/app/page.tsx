import Form from "next/form";
import styles from "./page.module.css";
import { CategoryType, Prisma, RequestStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type RequestRow = {
  id: string;
  title: string;
  requesterName: string;
  status: RequestStatus;
  categoryType: CategoryType;
  createdAt: Date;
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "すべて" },
  { value: RequestStatus.PENDING, label: "未対応" },
  { value: RequestStatus.COMPLETED, label: "完了" },
  { value: RequestStatus.REJECTED, label: "却下" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "すべて" },
  { value: CategoryType.OFFICE_SUPPLY, label: "日用品" },
  { value: CategoryType.IMPROVEMENT, label: "改善要望" },
] as const;

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "未対応",
  COMPLETED: "完了",
  REJECTED: "却下",
};

const CATEGORY_LABELS: Record<CategoryType, string> = {
  OFFICE_SUPPLY: "日用品",
  IMPROVEMENT: "改善要望",
};

const FALLBACK_ROWS: RequestRow[] = [
  {
    id: "demo-1",
    title: "コピー用紙を補充してほしい",
    requesterName: "田中",
    status: RequestStatus.PENDING,
    categoryType: CategoryType.OFFICE_SUPPLY,
    createdAt: new Date("2026-04-24T09:00:00+09:00"),
  },
  {
    id: "demo-2",
    title: "会議室にHDMIケーブルがほしい",
    requesterName: "佐藤",
    status: RequestStatus.COMPLETED,
    categoryType: CategoryType.IMPROVEMENT,
    createdAt: new Date("2026-04-23T10:30:00+09:00"),
  },
  {
    id: "demo-3",
    title: "椅子を交換したい",
    requesterName: "山田",
    status: RequestStatus.REJECTED,
    categoryType: CategoryType.IMPROVEMENT,
    createdAt: new Date("2026-04-22T13:15:00+09:00"),
  },
  {
    id: "demo-4",
    title: "トイレットペーパーを補充してほしい",
    requesterName: "鈴木",
    status: RequestStatus.PENDING,
    categoryType: CategoryType.OFFICE_SUPPLY,
    createdAt: new Date("2026-04-21T16:45:00+09:00"),
  },
];

function pickSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isRequestStatus(value: string | undefined): value is RequestStatus {
  return value === RequestStatus.PENDING || value === RequestStatus.COMPLETED || value === RequestStatus.REJECTED;
}

function isCategoryType(value: string | undefined): value is CategoryType {
  return value === CategoryType.OFFICE_SUPPLY || value === CategoryType.IMPROVEMENT;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getStatusClassName(status: RequestStatus) {
  if (status === RequestStatus.COMPLETED) {
    return styles.statusCompleted;
  }
  if (status === RequestStatus.REJECTED) {
    return styles.statusRejected;
  }
  return styles.statusPending;
}

function filterRows(rows: RequestRow[], filters: { query: string; status?: RequestStatus; category?: CategoryType }) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      row.title.toLowerCase().includes(normalizedQuery) ||
      row.requesterName.toLowerCase().includes(normalizedQuery);

    const matchesStatus = !filters.status || row.status === filters.status;
    const matchesCategory = !filters.category || row.categoryType === filters.category;

    return matchesQuery && matchesStatus && matchesCategory;
  });
}

async function getRequestRows(filters: { query: string; status?: RequestStatus; category?: CategoryType }) {
  const where: Prisma.RequestWhereInput = {
    ...(filters.query
      ? {
          OR: [
            {
              title: {
                contains: filters.query,
                mode: "insensitive",
              },
            },
            {
              requester: {
                name: {
                  contains: filters.query,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.category ? { category: { type: filters.category } } : {}),
  };

  try {
    const { prisma } = await import("@/lib/prisma");
    const records = await prisma.request.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        requester: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            type: true,
          },
        },
      },
    });

    if (records.length > 0) {
      return {
        rows: records.map((record) => ({
          id: record.id,
          title: record.title,
          requesterName: record.requester.name,
          status: record.status,
          categoryType: record.category.type,
          createdAt: record.createdAt,
        })),
        isFallback: false,
      };
    }
  } catch {
    return {
      rows: filterRows(FALLBACK_ROWS, filters),
      isFallback: true,
    };
  }

  return {
    rows: filterRows(FALLBACK_ROWS, filters),
    isFallback: true,
  };
}

async function getSummary() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const counts = await prisma.request.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    });

    return {
      pending: counts.find((count) => count.status === RequestStatus.PENDING)?._count._all ?? 0,
      completed: counts.find((count) => count.status === RequestStatus.COMPLETED)?._count._all ?? 0,
      rejected: counts.find((count) => count.status === RequestStatus.REJECTED)?._count._all ?? 0,
      isFallback: false,
    };
  } catch {
    return {
      pending: FALLBACK_ROWS.filter((row) => row.status === RequestStatus.PENDING).length,
      completed: FALLBACK_ROWS.filter((row) => row.status === RequestStatus.COMPLETED).length,
      rejected: FALLBACK_ROWS.filter((row) => row.status === RequestStatus.REJECTED).length,
      isFallback: true,
    };
  }
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = pickSingleValue(params.query)?.trim() ?? "";
  const statusValue = pickSingleValue(params.status);
  const categoryValue = pickSingleValue(params.category);
  const status = isRequestStatus(statusValue) ? statusValue : undefined;
  const category = isCategoryType(categoryValue) ? categoryValue : undefined;

  const [requestResult, summary] = await Promise.all([
    getRequestRows({ query, status, category }),
    getSummary(),
  ]);

  const rows = requestResult.rows;
  const isFallback = requestResult.isFallback || summary.isFallback;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Request Manager</p>
            <h1>依頼一覧</h1>
            <p className={styles.description}>投稿された依頼を一覧で確認し、カテゴリとステータスごとに状況を把握できます。</p>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.heroLabel}>対応ステータス</span>
            <strong>未対応 / 完了 / 却下</strong>
          </div>
        </section>

        {isFallback ? (
          <div className={styles.notice}>
            DB の依頼データが未投入、または接続できなかったためサンプル表示に切り替えています。
          </div>
        ) : null}

        <section className={styles.summaryGrid}>
          <article className={`${styles.summaryCard} ${styles.pendingCard}`}>
            <span className={styles.summaryLabel}>未対応</span>
            <strong>{summary.pending}件</strong>
          </article>
          <article className={`${styles.summaryCard} ${styles.completedCard}`}>
            <span className={styles.summaryLabel}>完了</span>
            <strong>{summary.completed}件</strong>
          </article>
          <article className={`${styles.summaryCard} ${styles.rejectedCard}`}>
            <span className={styles.summaryLabel}>却下</span>
            <strong>{summary.rejected}件</strong>
          </article>
        </section>

        <section className={styles.panel}>
          <Form action="" className={styles.filters}>
            <label className={styles.field}>
              <span>検索</span>
              <input name="query" defaultValue={query} placeholder="依頼タイトル・依頼者で検索" />
            </label>

            <label className={styles.field}>
              <span>ステータス</span>
              <select name="status" defaultValue={status ?? "ALL"}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>カテゴリ</span>
              <select name="category" defaultValue={category ?? "ALL"}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className={styles.submitButton}>
              絞り込む
            </button>
          </Form>
        </section>

        <section className={styles.panel}>
          <div className={styles.tableHeader}>
            <div>
              <h2>投稿一覧</h2>
              <p>{rows.length}件を表示しています。</p>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>タイトル</th>
                  <th>カテゴリ</th>
                  <th>ステータス</th>
                  <th>依頼者</th>
                  <th>投稿日時</th>
                  <th>詳細リンク</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.empty}>
                      条件に一致する依頼はありません。
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className={styles.titleCell}>{row.title}</td>
                      <td>{CATEGORY_LABELS[row.categoryType]}</td>
                      <td>
                        <span className={`${styles.statusChip} ${getStatusClassName(row.status)}`}>
                          {STATUS_LABELS[row.status]}
                        </span>
                      </td>
                      <td>{row.requesterName}</td>
                      <td>{formatDate(row.createdAt)}</td>
                      <td>
                        <span className={styles.detailLink}>詳細を見る</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
