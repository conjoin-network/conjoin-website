import { NextResponse } from "next/server";
import { isValidAgentName } from "@/lib/agents";
import { getAdminActorLabel, getPortalSessionFromRequest } from "@/lib/admin-session";
import { getLeadById, patchLead } from "@/lib/leads";
import { logAuditEvent } from "@/lib/event-log";
import { LEAD_PRIORITIES, LEAD_STATUSES, type LeadPriority, type LeadStatus } from "@/lib/quote-catalog";

type UpdatePayload = {
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedTo?: string | null;
  nextFollowUpAt?: string | null;
  markContacted?: boolean;
  note?: string;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, message: "Lead ID is required." }, { status: 400 });
  }

  let payload: UpdatePayload;
  try {
    payload = (await request.json()) as UpdatePayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const status = payload.status;
  if (status && !LEAD_STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
  }

  const priority = payload.priority;
  if (priority && !LEAD_PRIORITIES.includes(priority)) {
    return NextResponse.json({ ok: false, message: "Invalid priority." }, { status: 400 });
  }

  const assignedTo = payload.assignedTo === null ? null : String(payload.assignedTo ?? "").trim();
  if (assignedTo && !isValidAgentName(assignedTo)) {
    return NextResponse.json({ ok: false, message: "Invalid agent assignment." }, { status: 400 });
  }

  const existingLead = await getLeadById(id);
  if (!existingLead) {
    return NextResponse.json({ ok: false, message: "Lead not found." }, { status: 404 });
  }

  if (!session.isManagement && existingLead.assignedTo !== session.assignee) {
    return NextResponse.json({ ok: false, message: "Access denied for this lead." }, { status: 403 });
  }

  if (!session.canAssign && payload.assignedTo !== undefined && assignedTo !== existingLead.assignedTo) {
    return NextResponse.json({ ok: false, message: "Assignment updates are restricted for your role." }, { status: 403 });
  }

  const nextFollowUpAt =
    payload.nextFollowUpAt === null
      ? null
      : String(payload.nextFollowUpAt ?? "").trim() || undefined;

  const note = String(payload.note ?? "").trim();
  if (!status && !priority && payload.assignedTo === undefined && nextFollowUpAt === undefined && !payload.markContacted && !note) {
    return NextResponse.json({ ok: false, message: "No changes submitted." }, { status: 400 });
  }

  const actor = getAdminActorLabel(session);
  const updated = await patchLead(id, {
    status,
    priority,
    assignedTo: payload.assignedTo === undefined ? undefined : assignedTo,
    nextFollowUpAt,
    markContacted: Boolean(payload.markContacted),
    note,
    actor
  });

  if (!updated) {
    return NextResponse.json({ ok: false, message: "Lead not found." }, { status: 404 });
  }

  if (existingLead.status !== updated.status) {
    await logAuditEvent({
      type: "status_changed",
      leadId: updated.leadId,
      actor,
      details: {
        from: existingLead.status,
        to: updated.status
      }
    });
  }

  if ((existingLead.assignedTo ?? "") !== (updated.assignedTo ?? "")) {
    await logAuditEvent({
      type: "lead_assigned",
      leadId: updated.leadId,
      actor,
      details: {
        from: existingLead.assignedTo ?? null,
        to: updated.assignedTo ?? null
      }
    });
  }

  if (note) {
    await logAuditEvent({
      type: "note_added",
      leadId: updated.leadId,
      actor,
      details: {
        note: note.slice(0, 180)
      }
    });
  }

  return NextResponse.json({ ok: true, lead: updated });
}
