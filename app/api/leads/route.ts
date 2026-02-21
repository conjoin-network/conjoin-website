import { randomUUID } from "node:crypto";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { createCrmLead, listCrmLeads } from "@/lib/crm";
import { sendCaptureAlert } from "@/lib/captureEmail";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { AGENT_OPTIONS } from "@/lib/agents";
import { LEAD_STATUSES } from "@/lib/quote-catalog";
import { isPrismaInitializationError } from "@/lib/prisma-errors";
import { appendAttributionToNotes } from "@/lib/lead-attribution";
import { canSessionAccessLead, suggestAssigneeForService } from "@/lib/crm-access";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1),
  company: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  requirement: z.string().trim().min(1),
  source: z.string().trim().optional(),
  usersDevices: z.number().int().positive().optional(),
  city: z.string().trim().optional(),
  timeline: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  website: z.string().trim().optional(),
  pageUrl: z.string().trim().optional(),
  landing_page: z.string().trim().optional(),
  referrer: z.string().trim().optional(),
  utm_source: z.string().trim().optional(),
  utm_medium: z.string().trim().optional(),
  utm_campaign: z.string().trim().optional(),
  utm_term: z.string().trim().optional(),
  utm_content: z.string().trim().optional(),
  gclid: z.string().trim().optional(),
  gbraid: z.string().trim().optional(),
  wbraid: z.string().trim().optional()
});

const RATE_LIMIT = new Map<string, { ts: number; count: number }>();

function checkRate(ip: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const cur = RATE_LIMIT.get(ip);
  if (!cur || now - cur.ts > windowMs) {
    RATE_LIMIT.set(ip, { ts: now, count: 1 });
    return true;
  }
  if (cur.count >= limit) return false;
  cur.count += 1;
  return true;
}

function normalizePhone(v?: string) {
  if (!v) return "";
  let digits = String(v).replace(/[^\d]/g, "");
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

function normalizeEmail(v?: string) {
  if (!v) return "";
  return String(v).trim().toLowerCase();
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

function parseDateInput(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function normalizeListStatusFilter(value: string | null) {
  if (!value || value === "all") {
    return "all";
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === "NEGOTIATION") return "QUOTED";
  if (normalized === "CONTACTED") return "IN_PROGRESS";
  if (normalized === "QUALIFIED") return "QUOTED";
  if (normalized === "CLOSED") return "WON";
  return normalized;
}

function buildPermissions(session: ReturnType<typeof getPortalSessionFromRequest>) {
  if (session) {
    return {
      role: session.role,
      crmRole: session.crmRole,
      displayName: session.displayName,
      assignee: session.assignee,
      canExport: session.canExport,
      canAssign: session.canAssign,
      isManagement: session.isManagement
    };
  }

  return {
    role: "OWNER",
    crmRole: "SUPER_ADMIN",
    displayName: "Owner",
    assignee: null,
    canExport: true,
    canAssign: true,
    isManagement: true
  };
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || request.headers.get("x-client-ip") || "local";
    if (!checkRate(String(ip))) {
      return NextResponse.json({ ok: false, requestId, error: "Too many requests" }, { status: 429 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ ok: false, requestId, error: "Invalid JSON payload." }, { status: 400 });
    }

    const parsed = schema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, requestId, error: "Invalid request payload. Please try again." }, { status: 400 });
    }

    if (parsed.data.website && parsed.data.website.trim() !== "") {
      return NextResponse.json({ ok: true, requestId, message: "Accepted" });
    }

    const email = normalizeEmail(parsed.data.email);
    const phone = normalizePhone(parsed.data.phone);
    if (!email && !phone) {
      return NextResponse.json({ ok: false, requestId, error: "Please provide phone or email." }, { status: 400 });
    }

    const ua = request.headers.get("user-agent") || undefined;
    let leadId = `RFQ-${Date.now()}`;
    let saved = false;
    let saveError: unknown = null;
    let assignedTo: string | null = null;
    const landingPage = parsed.data.landing_page?.trim() || parsed.data.pageUrl?.trim() || request.nextUrl.pathname;
    const referrer = parsed.data.referrer?.trim() || request.headers.get("referer") || "";
    const source = parsed.data.source?.trim() || landingPage || "website";
    const assignment = suggestAssigneeForService({
      service: parsed.data.requirement,
      source
    });
    const notes = appendAttributionToNotes(parsed.data.notes, {
      landing_page: landingPage,
      referrer,
      gclid: parsed.data.gclid,
      gbraid: parsed.data.gbraid,
      wbraid: parsed.data.wbraid
    });
    const hasGclid = Boolean(parsed.data.gclid?.trim());
    const hasUtmSource = Boolean(parsed.data.utm_source?.trim());

    try {
      const lead = await createCrmLead({
        name: parsed.data.name,
        phone,
        email: email || undefined,
        company: parsed.data.company,
        source,
        assignedTo: assignment.assignee,
        assignedAgent: assignment.assignee,
        requirement: parsed.data.requirement,
        usersDevices: parsed.data.usersDevices,
        city: parsed.data.city,
        notes,
        pageUrl: landingPage || undefined,
        utm_source: parsed.data.utm_source,
        utm_medium: parsed.data.utm_medium,
        utm_campaign: parsed.data.utm_campaign,
        utm_term: parsed.data.utm_term,
        utm_content: parsed.data.utm_content,
        gclid: parsed.data.gclid,
        ip: String(ip),
        userAgent: ua
      });
      leadId = String((lead as { leadId?: string }).leadId ?? leadId);
      assignedTo = (lead as { assignedTo?: string | null }).assignedTo ?? assignment.assignee ?? null;
      saved = true;
      console.info(
        "LEAD_SAVED_OK",
        JSON.stringify({
          requestId,
          leadId,
          createdAt: (lead as { createdAt?: string }).createdAt ?? null,
          pagePath: landingPage || null,
          hasGclid,
          hasUtmSource
        })
      );
    } catch (error) {
      saveError = error;
      const errorInfo = serializeError(error);
      const dbRuntime = getDbRuntimeInfo();
      console.error(
        "LEAD_SAVE_FAILED",
        JSON.stringify({
          requestId,
          leadId,
          errorName: errorInfo.name,
          errorMessage: errorInfo.message,
          hasDatabaseUrl: dbRuntime.hasDatabaseUrl,
          vercelEnv: dbRuntime.vercelEnv
        })
      );
      console.error("LEAD_SAVE_FAILED_DETAIL", JSON.stringify({ requestId, leadId, error: errorInfo }));
    }

    const submitted = rawBody && typeof rawBody === "object" ? (rawBody as Record<string, unknown>) : {};
    try {
      await sendCaptureAlert({
        ...submitted,
        rfqId: leadId,
        requestId,
        timestamp: new Date().toISOString(),
        email: email || submitted.email || "",
        phone: phone || submitted.phone || "",
        ip: String(ip),
        userAgent: ua ?? "",
        saved,
        assignedTo: assignedTo ?? undefined
      });
    } catch (error) {
      console.error("LEAD_ALERT_FAILED", JSON.stringify({ requestId, leadId, error: serializeError(error) }));
    }

    if (!saved) {
      if (isStorageNotConfigured(saveError)) {
        return NextResponse.json(
          {
            ok: false,
            requestId,
            leadId,
            warning: "storage_not_configured",
            storage_not_configured: true,
            error: "Lead storage is not configured."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ ok: false, requestId, leadId, error: "Unable to save lead." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, requestId, leadId }, { status: 201 });
  } catch (error) {
    console.error("LEAD_POST_ERROR", JSON.stringify({ requestId, error: serializeError(error) }));
    return NextResponse.json({ ok: false, requestId, error: "Server error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-admin-pass"
    }
  });
}

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const session = getPortalSessionFromRequest(request);
  const adminPass = request.headers.get("x-admin-pass") || "";
  if (!session) {
    if (!process.env.ADMIN_PASSWORD || adminPass !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, requestId, error: "Unauthorized" }, { status: 401 });
    }
  }

  const permissions = buildPermissions(session);

  try {
    const url = new URL(request.url);
    const qStatus = normalizeListStatusFilter(url.searchParams.get("status"));
    const qCity = (url.searchParams.get("city") || "").trim().toLowerCase();
    const qSource = (url.searchParams.get("source") || "").trim().toLowerCase();
    const qCampaign = (url.searchParams.get("campaign") || "").trim().toLowerCase();
    const qAssigned = (url.searchParams.get("assignedAgent") || url.searchParams.get("assignedTo") || "").trim();
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const dateRange = (url.searchParams.get("range") || url.searchParams.get("dateRange") || "").trim().toLowerCase();
    const fromDate = parseDateInput(url.searchParams.get("from"));
    const toDate = parseDateInput(url.searchParams.get("to"));

    const allLeads = (await listCrmLeads()) || [];
    const scopedLeads = allLeads.filter((lead) =>
      session
        ? canSessionAccessLead(session, lead)
        : permissions.isManagement
          ? true
          : (lead.assignedTo || "") === (permissions.assignee || "")
    );

    const leads = scopedLeads.filter((lead) => {
      const leadStatus = String(lead.status || "").toUpperCase();
      const leadCity = String(lead.city || "").toLowerCase();
      const leadSource = String(lead.source || "").toLowerCase();
      const leadCampaign = String(lead.campaign || lead.source || lead.requirement || "").toLowerCase();
      const leadAssigned = String(lead.assignedAgent || lead.assignedTo || "");
      const createdAt = new Date(lead.createdAt);
      const createdAtMs = Number.isNaN(createdAt.getTime()) ? 0 : createdAt.getTime();

      const statusOk = qStatus === "all" || leadStatus === qStatus;
      const cityOk = !qCity || qCity === "all" || leadCity.includes(qCity);
      const sourceOk = !qSource || qSource === "all" || leadSource === qSource;
      const campaignOk = !qCampaign || leadCampaign.includes(qCampaign);
      const assignedOk = !qAssigned || qAssigned === "all" || (qAssigned === "Unassigned" ? !leadAssigned : leadAssigned === qAssigned);

      let rangeOk = true;
      if (dateRange === "7" || dateRange === "7d") {
        rangeOk = createdAtMs >= Date.now() - 7 * 24 * 60 * 60 * 1000;
      } else if (dateRange === "30" || dateRange === "30d") {
        rangeOk = createdAtMs >= Date.now() - 30 * 24 * 60 * 60 * 1000;
      }

      const fromOk = !fromDate || createdAtMs >= fromDate.getTime();
      const toOk = !toDate || createdAtMs <= toDate.getTime();

      const queryOk =
        !q ||
        [
          lead.leadId,
          lead.contactName,
          lead.company,
          lead.email,
          lead.phone,
          lead.city,
          lead.source,
          lead.requirement,
          lead.notes,
          lead.campaign,
          lead.campaign
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return statusOk && cityOk && sourceOk && campaignOk && assignedOk && rangeOk && fromOk && toOk && queryOk;
    });

    const brands = [...new Set(scopedLeads.map((lead) => String((lead.campaign || lead.source || lead.requirement || "")).trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
    const cities = [...new Set(scopedLeads.map((lead) => String(lead.city || "").trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );

    return NextResponse.json({
      ok: true,
      requestId,
      backendReachable: true,
      warning: null,
      leads,
      items: leads,
      total: leads.length,
      meta: {
        total: leads.length,
        statuses: LEAD_STATUSES,
        brands,
        cities,
        agents: AGENT_OPTIONS,
        permissions
      }
    });
  } catch (error) {
    console.error("LEADS_GET_ERROR", JSON.stringify({ requestId, error: serializeError(error) }));

    if (isStorageNotConfigured(error)) {
      return NextResponse.json({
        ok: true,
        requestId,
        backendReachable: false,
        warning: "storage_not_configured",
        storage_not_configured: true,
        leads: [],
        items: [],
        total: 0,
        meta: {
          total: 0,
          statuses: LEAD_STATUSES,
          brands: [],
          cities: [],
          agents: AGENT_OPTIONS,
          permissions
        }
      });
    }

    return NextResponse.json({ ok: false, requestId, error: "Server error" }, { status: 500 });
  }
}
