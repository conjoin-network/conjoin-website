import { NextResponse } from "next/server";
import { readLeads } from "@/lib/leads";
import { isPrismaInitializationError } from "@/lib/prisma-errors";

export const runtime = "nodejs";

function resolveEnvLabel() {
  if (process.env.NODE_ENV === "production") {
    return "prod";
  }
  if (process.env.NODE_ENV === "test") {
    return "test";
  }
  return "dev";
}

async function resolveStorageStatus() {
  try {
    await readLeads();
    return {
      storage: "postgres" as const,
      warning: null as string | null,
      reason: null as string | null
    };
  } catch (error) {
    if (isPrismaInitializationError(error)) {
      return {
        storage: "missing" as const,
        warning: "storage_not_configured",
        reason: error instanceof Error ? `${error.name}: ${error.message}` : "Prisma initialization failed"
      };
    }
    return {
      storage: "error" as const,
      warning: "storage_error",
      reason: error instanceof Error ? `${error.name}: ${error.message}` : "Unknown storage error"
    };
  }
}

function getDbHost() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).host;
  } catch {
    return "invalid";
  }
}

export async function GET() {
  const storageResult = await resolveStorageStatus();
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || process.env.npm_package_version || "unknown";
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

  return NextResponse.json(
    {
      ok: true,
      storage: storageResult.storage,
      warning: storageResult.warning,
      reason: storageResult.reason,
      backendReachable: storageResult.storage === "postgres",
      hasDatabaseUrl,
      dbHost: getDbHost(),
      version,
      env: resolveEnvLabel()
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
