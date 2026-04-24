import { PrismaPg } from "@prisma/adapter-pg";
import type { PoolConfig } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const prismaClientOptions = {
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
} as never;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    adapter: new PrismaPg(createPgConfig(connectionString)),
    ...prismaClientOptions,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function createPgConfig(connectionString: string): PoolConfig {
  return {
    connectionString,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  };
}

function shouldUseSsl(connectionString: string) {
  if (process.env.DATABASE_SSL === "true") {
    return true;
  }

  if (process.env.DATABASE_SSL === "false") {
    return false;
  }

  try {
    const host = new URL(connectionString).hostname;
    return !["localhost", "127.0.0.1", "::1"].includes(host);
  } catch {
    return false;
  }
}
