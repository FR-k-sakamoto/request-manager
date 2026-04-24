import Link from "next/link";
import { createRequest } from "./actions";
import styles from "./page.module.css";

const categoryOptions = [
  { value: "OFFICE_SUPPLY", label: "事務的・日用品" },
  { value: "IMPROVEMENT", label: "改善要望" },
] as const;

function RequiredBadge() {
  return <span className={styles.requiredBadge}>必須</span>;
}

export default function NewRequestPage() {
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
          <h2 className={styles.pageTitle}>新しい依頼を投稿</h2>
          <p className={styles.pageDescription}>
            備品・日用品の購入依頼や、社内の改善要望を登録できます
          </p>
        </section>

        <section className={styles.card}>
          <div className={styles.cardBody}>
            <h3 className={styles.sectionTitle}>依頼内容</h3>

            <form action={createRequest} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="title" className={styles.label}>
                  タイトル
                  <RequiredBadge />
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  defaultValue="コピー用紙を補充してほしい"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="categoryType" className={styles.label}>
                  カテゴリ
                  <RequiredBadge />
                </label>
                <div className={styles.selectWrap}>
                  <select
                    id="categoryType"
                    name="categoryType"
                    required
                    defaultValue={categoryOptions[0].value}
                    className={styles.select}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="description" className={styles.label}>
                  詳細内容
                  <RequiredBadge />
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  defaultValue="在庫が残り少ないため、A4コピー用紙を追加で購入してほしいです。"
                  className={styles.textarea}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="requesterName" className={styles.label}>
                  依頼者名
                  <RequiredBadge />
                </label>
                <input
                  id="requesterName"
                  name="requesterName"
                  type="text"
                  required
                  defaultValue="田中"
                  className={styles.input}
                />
              </div>

              <div className={styles.formFooter}>
                <Link href="/requests" className={styles.cancelButton}>
                  キャンセル
                </Link>
                <button type="submit" className={styles.submitButton}>
                  依頼を投稿
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className={styles.note}>
          <span className={styles.noteIcon} aria-hidden="true">
            i
          </span>
          <p>投稿された依頼は一覧画面に表示され、管理者が対応状況を更新します</p>
        </aside>
      </main>
    </div>
  );
}
