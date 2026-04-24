import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategoriesClient, type CategoryListItem } from "./CategoriesClient";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "カテゴリ管理 | 棚からリクエスト",
};

export default async function AdminCategoriesPage() {
  await connection();

  const categories: CategoryListItem[] = await prisma.category.findMany({
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
    },
  });

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p>管理者設定</p>
          <h1>カテゴリ管理</h1>
        </header>

        <CategoriesClient categories={categories} />
      </div>
    </main>
  );
}
