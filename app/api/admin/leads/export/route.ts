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
  const filters = parseFilters(url);
  const allLeads = await listCrmLeads();
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

  const rows = leads.map((lead) => {
    const anyLead = lead as any;
    return [
      anyLead.leadId,
      anyLead.createdAt,
      anyLead.updatedAt,
      anyLead.status ?? "",
      anyLead.priority ?? "",
      anyLead.score ?? "",
      anyLead.assignedTo ?? "",
      anyLead.nextFollowUpAt ?? "",
      anyLead.lastContactedAt ?? "",
      anyLead.firstContactAt ?? "",
      anyLead.firstContactBy ?? "",
      anyLead.brand ?? "",
      anyLead.category ?? "",
      anyLead.tier ?? "",
      anyLead.qty ?? "",
      anyLead.usersSeats ?? "",
      anyLead.endpoints ?? "",
      anyLead.servers ?? "",
      anyLead.ciscoUsers ?? "",
      anyLead.ciscoSites ?? "",
      anyLead.budgetRange ?? "",
      anyLead.city ?? "",
      anyLead.timeline ?? "",
      anyLead.source ?? "",
      anyLead.contactName ?? "",
      anyLead.company ?? "",
      anyLead.email ?? "",
      anyLead.phone ?? "",
      anyLead.sourcePage ?? "",
      anyLead.utmSource ?? "",
      anyLead.utmCampaign ?? "",
      anyLead.utmMedium ?? "",
      anyLead.utmContent ?? "",
      anyLead.utmTerm ?? "",
      anyLead.pagePath ?? "",
      anyLead.referrer ?? "",
      anyLead.notes ?? "",
      (anyLead.activityNotes ?? []).map((note: any) => `${note.createdAt} ${note.author}: ${note.text}`).join(" | ")
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
