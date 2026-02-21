import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminActorLabel, getPortalSessionFromRequest } from "@/lib/admin-session";
import { logAuditEvent } from "@/lib/event-log";
import { generateLeadEmailDraft } from "@/lib/ai";
import { getLeadById, patchLead } from "@/lib/leads";
import { canSessionAccessLead } from "@/lib/crm-access";

const payloadSchema = z.object({
  leadId: z.string().trim().min(1, "Lead ID is required.")
});

export async function POST(request: Request) {
  const session = getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  let payload: z.infer<typeof payloadSchema>;
  try {
    payload = payloadSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const lead = await getLeadById(payload.leadId);
  if (!lead) {
    return NextResponse.json({ ok: false, message: "Lead not found." }, { status: 404 });
  }

  if (!canSessionAccessLead(session, lead)) {
    return NextResponse.json({ ok: false, message: "Access denied for this lead." }, { status: 403 });
  }

  const draft = await generateLeadEmailDraft(lead);
  const actor = getAdminActorLabel(session);

  await patchLead(lead.leadId, {
    note: `AI email draft generated: ${draft.subject}`,
    actor
  });

  await logAuditEvent({
    type: "note_added",
    leadId: lead.leadId,
    actor,
    details: {
      action: "ai_email_drafted",
      source: draft.source,
      model: draft.model,
      subject: draft.subject
    }
  });

  return NextResponse.json({
    ok: true,
    draft: {
      subject: draft.subject,
      body: draft.body,
      source: draft.source,
      generatedAt: new Date().toISOString()
    }
  });
}
