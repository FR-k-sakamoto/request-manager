"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createStoredRequest,
  requestCategoryTypes,
  type RequestCategoryType,
} from "@/lib/request-store";

function normalizeValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createRequest(formData: FormData) {
  const title = normalizeValue(formData.get("title"));
  const categoryType = normalizeValue(formData.get("categoryType")) as RequestCategoryType;
  const description = normalizeValue(formData.get("description"));
  const requesterName = normalizeValue(formData.get("requesterName"));

  if (
    !title ||
    !description ||
    !requesterName ||
    !requestCategoryTypes.includes(categoryType)
  ) {
    throw new Error("入力内容が不足しています。");
  }

  await createStoredRequest({
    title,
    categoryType,
    description,
    requesterName,
  });

  revalidatePath("/requests");
  redirect("/requests?created=1");
}
