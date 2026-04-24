import { prisma } from "@/lib/prisma";
import { categoryTypeLabels } from "@/lib/request-utils";
import styles from "./page.module.css";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h1>カテゴリ管理</h1>
        <p>今回は固定値で運用し、管理画面からの編集機能は持たせていません。</p>
      </div>

      <div className={styles.cardGrid}>
        {categories.map((category) => (
          <article className={styles.card} key={category.id}>
            <p className={styles.label}>カテゴリ種別</p>
            <h2>{category.name}</h2>
            <p className={styles.type}>{categoryTypeLabels[category.type]}</p>
            <p className={styles.description}>{category.description ?? "説明なし"}</p>
          </article>
        ))}
      </div>

      <div className={styles.notice}>
        将来的に追加・編集を行う場合は、Prisma の `Category` テーブルと管理フォームを拡張します。
      </div>
    </section>
  );
}
