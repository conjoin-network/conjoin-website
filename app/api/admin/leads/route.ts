import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { AGENT_OPTIONS } from "@/lib/agents";
import { listCrmLeads } from "@/lib/crm";
import type { LeadFilters } from "@/lib/leads";
import { LEAD_STATUSES } from "@/lib/quote-catalog";

function parseFilters(url: URL): LeadFilters {
  const dateRangeParam = url.searchParams.get("dateRange");
  const dateRange = dateRangeParam === "7" || dateRangeParam === "30" ? dateRangeParam : "all";

  return {
    brand: url.searchParams.get("brand") ?? "all",
    status: url.searchParams.get("status") ?? "all",
    scoreBand: url.searchParams.get("scoreBand") ?? "all",
    city: url.searchParams.get("city") ?? "all",
    agent: url.searchParams.get("agent") ?? "all",
    q: url.searchParams.get("q") ?? "",
    dateRange
  };
}

const SAFE_HEADER_KEYS = new Set(["host", "user-agent", "x-forwarded-for", "x-real-ip", "x-forwarded-proto", "referer"]);

function safeHeaders(headers: Headers) {
  const output: Record<string, string> = {};
  for (const [key, value] of headers.entries()) {
    const lower = key.toLowerCase();
    if (SAFE_HEADER_KEYS.has(lower)) {
      output[lower] = value;
    }
  }
  return output;
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error
        ? {
            name: error.cause.name,
            message: error.cause.message,
            stack: error.cause.stack
          }
        : error.cause ?? null;

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : "Unknown error",
    stack: null,
    cause: null
  };
}

function getDbRuntimeInfo() {
  return {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    vercelEnv: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown"
  };
}

function isStorageNotConfigured(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const detail = `${error.name} ${error.message}`.toLowerCase();
  return (
    detail.includes("lead_storage_unsafe") ||
    detail.includes("database_url") ||
    detail.includes("no such file or directory") ||
    detail.includes("unable to open database file") ||
    detail.includes("sqlite")
  );
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const session = getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, requestId, message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filters = parseFilters(url);
  const scopedFilters = {
    ...filters,
    agent: session.isManagement ? filters.agent : "all"
  } satisfies LeadFilters;

  try {
    const storedLeads = (await listCrmLeads()) || [];
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.info('ADMIN_LEADS_GET', `storedLeads=${Array.isArray(storedLeads) ? storedLeads.length : 0} for ${session.displayName}`);
      }
    } catch {}
    const visibleLeads = session.isManagement ? storedLeads : storedLeads.filter((lead) => lead.assignedTo === session.assignee);

    // Basic filtering similar to legacy listLeads
    let leads = visibleLeads.slice();
    if (scopedFilters.status && scopedFilters.status !== "all") {
      const statusFilter = String(scopedFilters.status).toUpperCase();
      leads = leads.filter((l) => String(l.status).toUpperCase() === statusFilter);
    }
    if (scopedFilters.city && scopedFilters.city !== "all") {
      leads = leads.filter((l) => (l.city || "").toLowerCase().includes(String(scopedFilters.city).toLowerCase()));
    }
    if (scopedFilters.q && scopedFilters.q.trim()) {
      const q = scopedFilters.q.trim().toLowerCase();
      leads = leads.filter((l) =>
        `${l.contactName} ${l.company} ${l.email} ${l.phone} ${l.notes}`.toLowerCase().includes(q)
      );
    }

    const brands = [...new Set(visibleLeads.map((lead) => String(lead.brand || lead.campaign || "").trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
    const cities = [...new Set(visibleLeads.map((lead) => lead.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      ok: true,
      requestId,
      warning: null,
      backendReachable: true,
      leads,
      items: leads,
      total: leads.length,
      filters: scopedFilters,
      meta: {
        total: leads.length,
        statuses: LEAD_STATUSES,
        brands,
        cities,
        agents: AGENT_OPTIONS,
        permissions: {
          role: session.role,
          displayName: session.displayName,
          assignee: session.assignee,
          canExport: session.canExport,
          canAssign: session.canAssign,
          isManagement: session.isManagement
        }
      }
    });
  } catch (error) {
    const errorPayload = serializeError(error);
    const dbRuntime = getDbRuntimeInfo();
    console.error(
      "ADMIN_LEADS_LOAD_FAILED",
      JSON.stringify({
        requestId,
        hasDatabaseUrl: dbRuntime.hasDatabaseUrl,
        vercelEnv: dbRuntime.vercelEnv,
        context: {
          method: request.method,
          url: request.url,
          queryKeys: [...url.searchParams.keys()],
          headers: safeHeaders(request.headers),
          role: session.role
        },
        error: errorPayload
      })
    );

    if (isStorageNotConfigured(error)) {
      return NextResponse.json({
        ok: true,
        requestId,
        storage_not_configured: true,
        warning: "storage_not_configured",
        backendReachable: false,
        message: "Lead storage is not configured.",
        leads: [],
        items: [],
        total: 0,
        filters: scopedFilters,
        meta: {
          total: 0,
          statuses: LEAD_STATUSES,
          brands: [],
          cities: [],
          agents: AGENT_OPTIONS,
          permissions: {
            role: session.role,
            displayName: session.displayName,
            assignee: session.assignee,
            canExport: session.canExport,
            canAssign: session.canAssign,
            isManagement: session.isManagement
          }
        }
      });
    }

    return NextResponse.json({ ok: false, requestId, message: "Unable to load leads." }, { status: 500 });
  }
}
