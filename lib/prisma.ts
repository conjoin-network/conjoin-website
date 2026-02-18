import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

type DbCandidate = {
  key: string;
  value: string;
};

function hostForLog(rawUrl: string) {
  try {
    return new URL(rawUrl).host;
  } catch {
    return "unknown";
  }
}

function withNeonPoolerHints(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.host.includes("-pooler.") && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "15");
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function candidate(key: string, value?: string | null): DbCandidate | null {
  const next = value?.trim();
  if (!next) return null;
  return { key, value: next };
}

function pickDatabaseUrl() {
  const candidates: DbCandidate[] = [];
  const primary = candidate("DATABASE_URL", process.env.DATABASE_URL);
  if (primary) candidates.push(primary);

  // Vercel Postgres/Neon integration commonly injects this as the Prisma-safe pooled URL.
  const preferredInVercel = candidate("POSTGRES_PRISMA_URL", process.env.POSTGRES_PRISMA_URL);
  if (process.env.VERCEL && preferredInVercel) {
    candidates.unshift(preferredInVercel);
  } else if (preferredInVercel) {
    candidates.push(preferredInVercel);
  }

  const fallbackKeys: Array<[string, string | undefined]> = [
    ["POSTGRES_URL", process.env.POSTGRES_URL],
    ["DATABASE_URL_UNPOOLED", process.env.DATABASE_URL_UNPOOLED],
    ["POSTGRES_URL_NON_POOLING", process.env.POSTGRES_URL_NON_POOLING],
    ["DIRECT_URL", process.env.DIRECT_URL]
  ];

  for (const [key, value] of fallbackKeys) {
    const item = candidate(key, value);
    if (item) candidates.push(item);
  }

  const seen = new Set<string>();
  for (const item of candidates) {
    if (seen.has(item.value)) continue;
    seen.add(item.value);
    const next = withNeonPoolerHints(item.value);
    try {
      console.warn(
        "PRISMA_DATABASE_URL_SELECTED",
        JSON.stringify({
          source: item.key,
          host: hostForLog(next),
          pgbouncerHint: next.includes("pgbouncer=true"),
          hasDatabaseUrl: true,
          vercelEnv: process.env.VERCEL_ENV ?? "local"
        })
      );
    } catch {
      // noop
    }
    return next;
  }

  return "";
}

function ensureDatabaseUrl() {
  const picked = pickDatabaseUrl();
  if (picked) {
    process.env.DATABASE_URL = picked;
  }

  if (!process.env.DIRECT_URL?.trim()) {
    const direct =
      process.env.DATABASE_URL_UNPOOLED?.trim() ||
      process.env.POSTGRES_URL_NON_POOLING?.trim() ||
      process.env.POSTGRES_URL?.trim();
    if (direct) {
      process.env.DIRECT_URL = direct;
    }
  }
}

ensureDatabaseUrl();

const prisma = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;

export default prisma;
