import type { CategoryType, RequestStatus } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

export const statusLabels: Record<RequestStatus, string> = {
  PENDING: "未対応",
  COMPLETED: "完了",
  REJECTED: "却下",
};

export const categoryTypeLabels: Record<CategoryType, string> = {
  OFFICE_SUPPLY: "事務的（日用品）",
  IMPROVEMENT: "改善要望",
};

export function normalizeQueryValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function buildRequestWhere({
  category,
  query,
  status,
}: {
  query: string;
  status: string;
  category: string;
}): Prisma.RequestWhereInput {
  const trimmedQuery = query.trim();

  return {
    ...(status ? { status: status as RequestStatus } : {}),
    ...(category ? { category: { type: category as CategoryType } } : {}),
    ...(trimmedQuery
      ? {
          OR: [
            { title: { contains: trimmedQuery, mode: "insensitive" } },
            { description: { contains: trimmedQuery, mode: "insensitive" } },
            { requester: { name: { contains: trimmedQuery, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}

export function formatDate(date: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function sortRequestsByPriority<T extends { status: RequestStatus; createdAt: Date }>(
  requests: T[],
  prioritizePending: boolean,
) {
  return [...requests].sort((left, right) => {
    if (prioritizePending && left.status !== right.status) {
      if (left.status === "PENDING") {
        return -1;
      }

      if (right.status === "PENDING") {
        return 1;
      }
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}
