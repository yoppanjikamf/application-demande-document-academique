import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return undefined;
  }

  const url = new URL(databaseUrl);
  const isProduction = process.env.NODE_ENV === "production";
  const usesPooler =
    url.port === "6543" ||
    url.searchParams.get("pgbouncer") === "true" ||
    url.hostname.includes("pooler");

  if (!url.searchParams.has("connection_limit")) {
    const fromEnv = process.env.DATABASE_CONNECTION_LIMIT;
    const defaultLimit = fromEnv ?? (usesPooler ? "5" : isProduction ? "3" : "5");
    url.searchParams.set("connection_limit", defaultLimit);
  }

  if (!url.searchParams.has("pool_timeout")) {
    url.searchParams.set("pool_timeout", process.env.DATABASE_POOL_TIMEOUT ?? "60");
  }

  if (usesPooler && !url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true");
  }

  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getPrismaDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
