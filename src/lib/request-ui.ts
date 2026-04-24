import type { RequestCategoryType, RequestStatus } from "@/lib/request-store";

export const requestStatusLabels: Record<RequestStatus, string> = {
  PENDING: "未対応",
  COMPLETED: "完了",
  REJECTED: "却下",
};

export const requestStatusDescriptions: Record<RequestStatus, string> = {
  PENDING: "管理者の確認待ちです",
  COMPLETED: "対応が完了しています",
  REJECTED: "却下されました。必要に応じて管理者へ確認してください",
};

export const requestCategoryLabels: Record<RequestCategoryType, string> = {
  OFFICE_SUPPLY: "事務的（日用品）",
  IMPROVEMENT: "改善要望",
};

export function formatDate(date: Date, withTime = true) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}
