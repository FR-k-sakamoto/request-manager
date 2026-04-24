import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { getDatabaseUrl, shouldUseDatabaseSsl } from "../src/lib/database-url";
import {
  PrismaClient,
  CategoryType,
  RequestStatus,
  UserRole,
  type Prisma,
} from "../src/generated/prisma/client";

const connectionString = getDatabaseUrl();
const pool = new Pool({
  connectionString,
  ssl: shouldUseDatabaseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

type SeedRequest = Omit<Prisma.RequestUncheckedCreateInput, "status"> & {
  status: RequestStatus;
  handledById?: string;
  rejectedReason?: string | null;
};

async function main() {
  const [adminPasswordHash, userPasswordHash] = await Promise.all([
    bcrypt.hash("Admin123!", 10),
    bcrypt.hash("User123!", 10),
  ]);

  const officeSupply = await prisma.category.upsert({
    where: { type: CategoryType.OFFICE_SUPPLY },
    update: {
      name: "事務的（日用品）",
      description: "コピー用紙やトイレットペーパーなどの消耗品",
    },
    create: {
      name: "事務的（日用品）",
      type: CategoryType.OFFICE_SUPPLY,
      description: "コピー用紙やトイレットペーパーなどの消耗品",
    },
  });

  const improvement = await prisma.category.upsert({
    where: { type: CategoryType.IMPROVEMENT },
    update: {
      name: "改善要望",
      description: "設備や備品の改善・追加の要望",
    },
    create: {
      name: "改善要望",
      type: CategoryType.IMPROVEMENT,
      description: "設備や備品の改善・追加の要望",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "管理者",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
    create: {
      name: "管理者",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {
      name: "一般ユーザー",
      passwordHash: userPasswordHash,
      role: UserRole.USER,
    },
    create: {
      name: "一般ユーザー",
      email: "user@example.com",
      passwordHash: userPasswordHash,
      role: UserRole.USER,
    },
  });

  const sampleRequests: SeedRequest[] = [
    {
      title: "コピー用紙を補充してほしい",
      description: "3階プリンター横のコピー用紙が残り少ないです。",
      status: RequestStatus.PENDING,
      requesterId: user.id,
      categoryId: officeSupply.id,
      createdAt: new Date("2026-04-24T09:00:00+09:00"),
    },
    {
      title: "会議室にHDMIケーブルがほしい",
      description: "会議室Aで持ち込みPCを使うことが多く、常設したいです。",
      status: RequestStatus.COMPLETED,
      requesterId: user.id,
      handledById: admin.id,
      categoryId: improvement.id,
      completedAt: new Date("2026-04-23T14:00:00+09:00"),
      createdAt: new Date("2026-04-23T09:00:00+09:00"),
    },
    {
      title: "椅子を交換したい",
      description: "執務室の椅子が破損しており、交換を希望します。",
      status: RequestStatus.REJECTED,
      requesterId: user.id,
      handledById: admin.id,
      categoryId: improvement.id,
      rejectedReason: "今月の予算都合により来月対応予定です。",
      rejectedAt: new Date("2026-04-22T16:00:00+09:00"),
      createdAt: new Date("2026-04-22T09:00:00+09:00"),
    },
    {
      title: "トイレットペーパーを補充してほしい",
      description: "2階女子トイレの在庫が少なくなっています。",
      status: RequestStatus.PENDING,
      requesterId: user.id,
      categoryId: officeSupply.id,
      createdAt: new Date("2026-04-21T09:00:00+09:00"),
    },
  ];

  for (const request of sampleRequests) {
    const existing = await prisma.request.findFirst({
      where: {
        title: request.title,
      },
      select: { id: true },
    });

    if (existing) {
      continue;
    }

    const created = await prisma.request.create({
      data: request,
    });

    await prisma.requestStatusHistory.create({
      data: {
        requestId: created.id,
        fromStatus: null,
        toStatus: request.status,
        changedById: request.handledById ?? null,
        comment: request.rejectedReason ?? "初期データ投入",
        createdAt: request.createdAt,
      },
    });
  }
}

main()
  .then(async () => {
    await pool.end();
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    await prisma.$disconnect();
    process.exit(1);
  });
