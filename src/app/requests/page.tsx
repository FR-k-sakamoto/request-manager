import { getRequests } from "@/lib/request-store";
import { RequestsClient } from "./RequestsClient";

type RequestsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const created = resolvedSearchParams.created === "1";
  const requests = await getRequests();

  return (
    <RequestsClient
      requests={requests.map((r) => ({
        id: r.id,
        title: r.title,
        categoryType: r.categoryType,
        description: r.description,
        requesterName: r.requesterName,
        status: r.status,
        createdAt: r.createdAt,
      }))}
      created={created}
    />
  );
}
