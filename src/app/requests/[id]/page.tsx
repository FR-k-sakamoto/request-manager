import { notFound } from "next/navigation";
import { getRequestById } from "@/lib/request-store";
import { RequestDetailClient } from "./RequestDetailClient";

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;
  const request = await getRequestById(id);

  if (!request) {
    notFound();
  }

  return (
    <RequestDetailClient
      request={{
        id: request.id,
        title: request.title,
        categoryType: request.categoryType,
        description: request.description,
        requesterName: request.requesterName,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      }}
    />
  );
}
