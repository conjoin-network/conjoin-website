import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { listAuditEvents, type AuditEventFilters } from "@/lib/event-log";

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
  const scopedEvents = session.isManagement
    ? events
    : events.filter((event) => {
        const assignedTo = typeof event.details.assignedTo === "string" ? event.details.assignedTo : null;
        return !assignedTo || assignedTo === session.assignee;
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
