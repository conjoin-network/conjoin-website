import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { listAuditEvents, type AuditEventFilters } from "@/lib/event-log";
import { canSessionAccessLead, inferLeadScope } from "@/lib/crm-access";

function parseFilters(url: URL): AuditEventFilters {
  const dateRangeParam = url.searchParams.get("dateRange");
  const dateRange = dateRangeParam === "7" || dateRangeParam === "30" ? dateRangeParam : "all";
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "200", 10);

  return {
    type: url.searchParams.get("type") ?? "all",
    leadId: url.searchParams.get("leadId") ?? "",
    q: url.searchParams.get("q") ?? "",
    dateRange,
    limit: Number.isFinite(limit) ? limit : 200
  };
}

export async function GET(request: Request) {
  const session = getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filters = parseFilters(url);
  const events = await listAuditEvents(filters);
  const scopedEvents = events.filter((event) => {
    if (session.isManagement) {
      return true;
    }
    const assignedTo = typeof event.details.assignedTo === "string" ? event.details.assignedTo : null;
    const source = typeof event.details.source === "string" ? event.details.source : null;
    const campaign = typeof event.details.brand === "string" ? event.details.brand : null;
    const requirement = typeof event.details.category === "string" ? event.details.category : null;
    const note = typeof event.details.note === "string" ? event.details.note : null;
    return canSessionAccessLead(session, {
      assignedTo,
      source,
      campaign,
      requirement,
      notes: note
    }) || (session.crmRole === "LOCAL_OPS" && inferLeadScope({ assignedTo, source, campaign, requirement, notes: note }) === "LOCAL_OPS");
  });

  return NextResponse.json({
    ok: true,
    events: scopedEvents,
    filters,
    meta: {
      total: scopedEvents.length
    }
  });
}
