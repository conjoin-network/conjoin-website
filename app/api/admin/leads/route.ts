import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { AGENT_OPTIONS } from "@/lib/agents";
import { listLeads, readLeads, type LeadFilters } from "@/lib/leads";
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

export async function GET(request: Request) {
  const session = getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filters = parseFilters(url);
  const storedLeads = await readLeads();
  const visibleLeads = session.isManagement
    ? storedLeads
    : storedLeads.filter((lead) => lead.assignedTo === session.assignee);
  const scopedFilters = {
    ...filters,
    agent: session.isManagement ? filters.agent : "all"
  } satisfies LeadFilters;
  const leads = listLeads(visibleLeads, scopedFilters);

  const brands = [...new Set(visibleLeads.map((lead) => String(lead.brand)).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  const cities = [...new Set(visibleLeads.map((lead) => lead.city).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  return NextResponse.json({
    ok: true,
    leads,
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
}
