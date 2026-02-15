import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { getLeadById, updateLeadStatus } from "@/lib/leads";
import { logAuditEvent } from "@/lib/event-log";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/quote-catalog";

export async function POST(request: Request) {
  const session = getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const formData = await request.formData();
  const leadId = String(formData.get("leadId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as LeadStatus;
  const redirectPath = String(formData.get("redirectPath") ?? "/admin/leads").trim();

  if (!leadId || !LEAD_STATUSES.includes(status)) {
    return NextResponse.redirect(new URL("/admin/leads?error=invalid", request.url), 303);
  }

  const lead = await getLeadById(leadId);
  if (!lead) {
    return NextResponse.redirect(new URL("/admin/leads?error=missing", request.url), 303);
  }

  if (!session.isManagement && lead.assignedTo !== session.assignee) {
    return NextResponse.redirect(new URL("/admin/leads?error=unauthorized", request.url), 303);
  }

  const updated = await updateLeadStatus(leadId, status);
  if (!updated) {
    return NextResponse.redirect(new URL("/admin/leads?error=missing", request.url), 303);
  }
  await logAuditEvent({
    type: "status_changed",
    leadId: updated.leadId,
    actor: session.displayName || session.role,
    details: {
      from: lead.status,
      to: updated.status,
      source: "status_form"
    }
  });

  const safeRedirect = redirectPath.startsWith("/admin/leads") ? redirectPath : "/admin/leads";
  return NextResponse.redirect(new URL(safeRedirect, request.url), 303);
}
