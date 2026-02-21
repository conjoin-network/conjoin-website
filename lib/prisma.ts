import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function ensureDatabaseUrl() {
  const selected = process.env.POSTGRES_PRISMA_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!selected) {
    return;
  }

  process.env.DATABASE_URL = selected;
  if (process.env.NODE_ENV !== "production") {
    console.info("PRISMA_DATABASE_URL_SELECTED", JSON.stringify({ source: process.env.POSTGRES_PRISMA_URL?.trim() ? "POSTGRES_PRISMA_URL" : "DATABASE_URL" }));
  }
}

ensureDatabaseUrl();

const prisma = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

export default prisma;
