import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { listLeads, readLeads, type LeadFilters } from "@/lib/leads";

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
  const allLeads = await readLeads();
  const visibleLeads = session.isManagement ? allLeads : allLeads.filter((lead) => lead.assignedTo === session.assignee);
  const leads = listLeads(visibleLeads, filters);

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

  const rows = leads.map((lead) => [
    lead.leadId,
    lead.createdAt,
    lead.updatedAt,
    lead.status,
    lead.priority,
    lead.score,
    lead.assignedTo ?? "",
    lead.nextFollowUpAt ?? "",
    lead.lastContactedAt ?? "",
    lead.firstContactAt ?? "",
    lead.firstContactBy ?? "",
    lead.brand,
    lead.category,
    lead.tier,
    lead.qty,
    lead.usersSeats ?? "",
    lead.endpoints ?? "",
    lead.servers ?? "",
    lead.ciscoUsers ?? "",
    lead.ciscoSites ?? "",
    lead.budgetRange ?? "",
    lead.city,
    lead.timeline ?? "",
    lead.source ?? "",
    lead.contactName,
    lead.company,
    lead.email,
    lead.phone,
    lead.sourcePage,
    lead.utmSource ?? "",
    lead.utmCampaign ?? "",
    lead.utmMedium ?? "",
    lead.utmContent ?? "",
    lead.utmTerm ?? "",
    lead.pagePath ?? "",
    lead.referrer ?? "",
    lead.notes,
    lead.activityNotes.map((note) => `${note.createdAt} ${note.author}: ${note.text}`).join(" | ")
  ]);

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
