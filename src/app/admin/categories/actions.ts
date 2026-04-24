"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const CATEGORIES_PATH = "/admin/categories";

export type CategoryActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

function errorState(message: string): CategoryActionState {
  return { status: "error", message };
}

function successState(message: string): CategoryActionState {
  return { status: "success", message };
}

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const name = getString(formData, "name");

  if (!name) {
    return errorState("カテゴリ名を入力してください。");
  }

  try {
    await prisma.category.create({
      data: {
        name,
        description: getOptionalString(formData, "description"),
        isActive: getBoolean(formData, "isActive"),
      },
    });

    revalidatePath(CATEGORIES_PATH);
    return successState("カテゴリを追加しました。");
  } catch {
    return errorState("カテゴリの追加に失敗しました。");
  }
}

export async function updateCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const id = getString(formData, "id");
  const name = getString(formData, "name");

  if (!id) {
    return errorState("更新対象のカテゴリが見つかりません。");
  }

  if (!name) {
    return errorState("カテゴリ名を入力してください。");
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        description: getOptionalString(formData, "description"),
        isActive: getBoolean(formData, "isActive"),
      },
    });

    revalidatePath(CATEGORIES_PATH);
    return successState("カテゴリを更新しました。");
  } catch {
    return errorState("カテゴリの更新に失敗しました。");
  }
}

export async function toggleCategoryStatus(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const id = getString(formData, "id");
  const isActive = getBoolean(formData, "isActive");

  if (!id) {
    return errorState("状態を変更するカテゴリが見つかりません。");
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath(CATEGORIES_PATH);
    return successState(isActive ? "カテゴリを有効化しました。" : "カテゴリを無効化しました。");
  } catch {
    return errorState("カテゴリ状態の変更に失敗しました。");
  }
}
