import type { Metadata } from "next";
import { connection } from "next/server";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { prisma } from "@/lib/prisma";
import { CategoriesClient, type CategoryListItem } from "./CategoriesClient";

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
    <Box sx={{ maxWidth: 1120, mx: "auto" }}>
      <Stack component="header" spacing={0.5} sx={{ mb: 3 }}>
        <Typography color="text.secondary" sx={{ fontWeight: 600 }} variant="body2">
          管理者設定
        </Typography>
        <Typography component="h1" sx={{ fontWeight: 700 }} variant="h4">
          カテゴリ管理
        </Typography>
      </Stack>

      <CategoriesClient categories={categories} />
    </Box>
  );
}
