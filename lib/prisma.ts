import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) {
    return;
  }

  const fallbacks: Array<[string, string | undefined]> = [
    ["POSTGRES_PRISMA_URL", process.env.POSTGRES_PRISMA_URL],
    ["POSTGRES_URL", process.env.POSTGRES_URL],
    ["DATABASE_URL_UNPOOLED", process.env.DATABASE_URL_UNPOOLED],
    ["POSTGRES_URL_NON_POOLING", process.env.POSTGRES_URL_NON_POOLING],
    ["DIRECT_URL", process.env.DIRECT_URL]
  ];

  for (const [key, value] of fallbacks) {
    const next = value?.trim();
    if (!next) continue;
    process.env.DATABASE_URL = next;
    try {
      console.warn(
        "PRISMA_DATABASE_URL_FALLBACK",
        JSON.stringify({
          source: key,
          hasDatabaseUrl: true,
          vercelEnv: process.env.VERCEL_ENV ?? "local"
        })
      );
    } catch {
      // noop
    }
    return;
  }
}

ensureDatabaseUrl();

const prisma = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;

export default prisma;
