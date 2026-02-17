import { NextResponse } from "next/server";
import { readLeads } from "@/lib/leads";

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
    return "ok" as const;
  } catch (error) {
    const message = error instanceof Error ? `${error.name} ${error.message}`.toLowerCase() : "";
    if (message.includes("lead_storage_unsafe") || message.includes("database_url") || message.includes("sqlite")) {
      return "missing" as const;
    }
    return "missing" as const;
  }
}

export async function GET() {
  const storage = await resolveStorageStatus();
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || process.env.npm_package_version || "unknown";

  return NextResponse.json(
    {
      ok: true,
      storage,
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
