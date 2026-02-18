import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { AGENT_OPTIONS } from "@/lib/agents";
import { listCrmLeads } from "@/lib/crm";
import type { LeadFilters } from "@/lib/leads";
import { LEAD_STATUSES } from "@/lib/quote-catalog";
import { isPrismaInitializationError } from "@/lib/prisma-errors";

function parseFilters(url: URL): LeadFilters {
  const dateRangeParam = url.searchParams.get("dateRange");
  const dateRange = dateRangeParam === "7" || dateRangeParam === "30" ? dateRangeParam : "all";

  return {
    brand: url.searchParams.get("brand") ?? "all",
    source: url.searchParams.get("source") ?? "all",
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
  return isPrismaInitializationError(error);
}

function classifyLeadSource(lead: {
  source?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
}) {
  const raw = `${lead.source ?? ""} ${lead.utmSource ?? ""} ${lead.utmCampaign ?? ""} ${lead.referrer ?? ""}`.toLowerCase();
  if (raw.includes("google") || raw.includes("ads") || raw.includes("gclid")) {
    return "google_ads";
  }
  if (raw.includes("whatsapp") || raw.includes("wa.me")) {
    return "whatsapp";
  }
  if (raw.includes("call") || raw.includes("phone") || raw.includes("tel:")) {
    return "call";
  }
  return "organic";
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
    if (scopedFilters.brand && scopedFilters.brand !== "all") {
      const brandFilter = String(scopedFilters.brand).toLowerCase();
      leads = leads.filter((l) => {
        const brandText = String(l.campaign || l.requirement || l.source || "").toLowerCase();
        return brandText.includes(brandFilter);
      });
    }
    if (scopedFilters.source && scopedFilters.source !== "all") {
      const sourceFilter = String(scopedFilters.source).toLowerCase();
      leads = leads.filter((l) => classifyLeadSource(l) === sourceFilter);
    }
    if (scopedFilters.scoreBand && scopedFilters.scoreBand !== "all") {
      leads = leads.filter((l) => {
        const score = Number(l.score ?? 0);
        if (scopedFilters.scoreBand === "hot") return score >= 80;
        if (scopedFilters.scoreBand === "warm") return score >= 45 && score < 80;
        if (scopedFilters.scoreBand === "cold") return score < 45;
        return true;
      });
    }
    if (scopedFilters.city && scopedFilters.city !== "all") {
      leads = leads.filter((l) => (l.city || "").toLowerCase().includes(String(scopedFilters.city).toLowerCase()));
    }
    if (scopedFilters.agent && scopedFilters.agent !== "all") {
      leads = leads.filter((l) =>
        scopedFilters.agent === "Unassigned" ? !(l.assignedTo || "").trim() : (l.assignedTo || "") === scopedFilters.agent
      );
    }
    if (scopedFilters.dateRange && scopedFilters.dateRange !== "all") {
      const now = Date.now();
      const windowMs = scopedFilters.dateRange === "7" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      leads = leads.filter((l) => {
        const createdMs = new Date(l.createdAt).getTime();
        return Number.isFinite(createdMs) && now - createdMs <= windowMs;
      });
    }
    if (scopedFilters.q && scopedFilters.q.trim()) {
      const q = scopedFilters.q.trim().toLowerCase();
      leads = leads.filter((l) =>
        `${l.contactName} ${l.company} ${l.email} ${l.phone} ${l.notes}`.toLowerCase().includes(q)
      );
    }

    const brands = [...new Set(visibleLeads.map((lead) => String((lead.campaign || lead.source || lead.requirement || "")).trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
    const cities = [...new Set(visibleLeads.map((lead) => lead.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const sources = [...new Set(visibleLeads.map((lead) => classifyLeadSource(lead)))];

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
        sources,
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
          sources: [],
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
