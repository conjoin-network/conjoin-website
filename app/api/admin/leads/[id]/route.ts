import { NextResponse } from "next/server";
import { isValidAgentName } from "@/lib/agents";
import { getAuthorizedUsername } from "@/lib/admin-auth";
import { patchLead } from "@/lib/leads";
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

  const nextFollowUpAt =
    payload.nextFollowUpAt === null
      ? null
      : String(payload.nextFollowUpAt ?? "").trim() || undefined;

  const note = String(payload.note ?? "").trim();
  if (!status && !priority && payload.assignedTo === undefined && nextFollowUpAt === undefined && !payload.markContacted && !note) {
    return NextResponse.json({ ok: false, message: "No changes submitted." }, { status: 400 });
  }

  const actor = getAuthorizedUsername(request.headers.get("authorization"));
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

  return NextResponse.json({ ok: true, lead: updated });
}
