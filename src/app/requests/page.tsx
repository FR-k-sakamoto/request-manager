import Link from "next/link";
import { formatDate, requestCategoryLabels, requestStatusLabels } from "@/lib/request-ui";
import { getRequests } from "@/lib/request-store";
import styles from "./page.module.css";

type RequestsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const created = resolvedSearchParams.created === "1";
  const requests = await getRequests();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>依頼一覧</h1>
          <p className={styles.description}>投稿された依頼の内容と対応状況を確認できます。</p>
        </div>
        <Link href="/requests/new" className={styles.createLink}>
          新しい依頼を投稿
        </Link>
      </div>

      {created ? (
        <p className={styles.flash}>依頼を投稿しました。管理者の対応をお待ちください。</p>
      ) : null}

      <section className={styles.list}>
        {requests.length === 0 ? (
          <div className={styles.empty}>
            <p>まだ依頼は投稿されていません。</p>
            <Link href="/requests/new">最初の依頼を投稿する</Link>
          </div>
        ) : (
          requests.map((request) => (
            <Link key={request.id} href={`/requests/${request.id}`} className={styles.itemLink}>
              <article className={styles.item}>
                <div className={styles.itemHead}>
                  <div>
                    <p className={styles.itemTitle}>{request.title}</p>
                    <p className={styles.meta}>
                      {requestCategoryLabels[request.categoryType]} ・ {request.requesterName}
                    </p>
                  </div>
                  <span className={styles.status}>{requestStatusLabels[request.status]}</span>
                </div>
                <p className={styles.body}>{request.description}</p>
                <div className={styles.itemFooter}>
                  <p className={styles.time}>投稿日: {formatDate(new Date(request.createdAt))}</p>
                  <span className={styles.detailLink}>詳細を見る</span>
                </div>
              </article>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
