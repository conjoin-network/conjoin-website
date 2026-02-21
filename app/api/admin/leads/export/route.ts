import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { listCrmLeads } from "@/lib/crm";
import type { LeadFilters } from "@/lib/leads";

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

function csvCell(value: unknown) {
  const next = String(value ?? "");
  const escaped = next.replaceAll('"', '""');
  return `"${escaped}"`;
}

export async function GET(request: Request) {
  const session = getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!session.canExport) {
    return NextResponse.json({ ok: false, message: "Export is restricted for your role." }, { status: 403 });
  }

  const url = new URL(request.url);
  parseFilters(url);
  let allLeads: Awaited<ReturnType<typeof listCrmLeads>> = [];
  try {
    allLeads = (await listCrmLeads()) || [];
  } catch (error) {
    const serialized =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { name: "UnknownError", message: String(error) };
    console.error("ADMIN_LEADS_EXPORT_FAILED", JSON.stringify({ error: serialized }));
    allLeads = [];
  }
  const visibleLeads = session.isManagement ? allLeads : allLeads.filter((lead) => lead.assignedTo === session.assignee);
  const leads = visibleLeads; // minimal export from CRM-normalized shape

  const headers = [
    "leadId",
    "createdAt",
    "updatedAt",
    "status",
    "priority",
    "score",
    "assignedTo",
    "nextFollowUpAt",
    "lastContactedAt",
    "firstContactAt",
    "firstContactBy",
    "brand",
    "category",
    "tier",
    "qty",
    "usersSeats",
    "endpoints",
    "servers",
    "ciscoUsers",
    "ciscoSites",
    "budgetRange",
    "city",
    "timeline",
    "source",
    "contactName",
    "company",
    "email",
    "phone",
    "sourcePage",
    "utmSource",
    "utmCampaign",
    "utmMedium",
    "utmContent",
    "utmTerm",
    "pagePath",
    "referrer",
    "notes",
    "activityNotes"
  ];

  type ExportLead = Awaited<ReturnType<typeof listCrmLeads>>[number] & {
    ciscoUsers?: number | null;
    ciscoSites?: number | null;
    budgetRange?: string | null;
  };

  const rows = leads.map((lead) => {
    const exportLead = lead as ExportLead;
    return [
      exportLead.leadId,
      exportLead.createdAt,
      exportLead.updatedAt,
      exportLead.status ?? "",
      exportLead.priority ?? "",
      exportLead.score ?? "",
      exportLead.assignedTo ?? "",
      exportLead.nextFollowUpAt ?? "",
      exportLead.lastContactedAt ?? "",
      exportLead.firstContactAt ?? "",
      exportLead.firstContactBy ?? "",
      exportLead.brand ?? "",
      exportLead.category ?? "",
      exportLead.tier ?? "",
      exportLead.qty ?? "",
      exportLead.usersSeats ?? "",
      exportLead.endpoints ?? "",
      exportLead.servers ?? "",
      exportLead.ciscoUsers ?? "",
      exportLead.ciscoSites ?? "",
      exportLead.budgetRange ?? "",
      exportLead.city ?? "",
      exportLead.timeline ?? "",
      exportLead.source ?? "",
      exportLead.contactName ?? "",
      exportLead.company ?? "",
      exportLead.email ?? "",
      exportLead.phone ?? "",
      exportLead.sourcePage ?? "",
      exportLead.utmSource ?? "",
      exportLead.utmCampaign ?? "",
      exportLead.utmMedium ?? "",
      exportLead.utmContent ?? "",
      exportLead.utmTerm ?? "",
      exportLead.pagePath ?? "",
      exportLead.referrer ?? "",
      exportLead.notes ?? "",
      (exportLead.activityNotes ?? []).map((note) => `${note.createdAt} ${note.author}: ${note.text}`).join(" | ")
    ];
  });

  const csv = [headers.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");
  const filename = `conjoin-leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Cache-Control": "no-store"
    }
  });
}
