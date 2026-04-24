import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const requestStatuses = ["PENDING", "COMPLETED", "REJECTED"] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const requestCategoryTypes = ["OFFICE_SUPPLY", "IMPROVEMENT"] as const;
export type RequestCategoryType = (typeof requestCategoryTypes)[number];

export type StoredRequest = {
  id: string;
  title: string;
  categoryType: RequestCategoryType;
  description: string;
  requesterName: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};

const dataDirectory = path.join(process.cwd(), "src", "data");
const dataFilePath = path.join(dataDirectory, "requests.json");

async function ensureStoreFile() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    await writeFile(dataFilePath, "[]", "utf8");
  }
}

export async function getRequests() {
  await ensureStoreFile();
  const raw = await readFile(dataFilePath, "utf8");
  const requests = (JSON.parse(raw) as Array<StoredRequest | Omit<StoredRequest, "updatedAt">>).map(
    (request) => ({
      ...request,
      updatedAt: "updatedAt" in request ? request.updatedAt : request.createdAt,
    }),
  );

  return requests.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getRequestById(id: string) {
  const requests = await getRequests();
  return requests.find((request) => request.id === id) ?? null;
}

export async function createStoredRequest(
  input: Omit<StoredRequest, "id" | "status" | "createdAt" | "updatedAt">,
) {
  const timestamp = new Date().toISOString();
  const requests = await getRequests();

  const newRequest: StoredRequest = {
    id: crypto.randomUUID(),
    status: "PENDING",
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };

  requests.unshift(newRequest);
  await writeFile(dataFilePath, JSON.stringify(requests, null, 2), "utf8");

  return newRequest;
}
