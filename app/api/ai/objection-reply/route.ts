import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminActorLabel, getPortalSessionFromRequest } from "@/lib/admin-session";
import { logAuditEvent } from "@/lib/event-log";
import { OBJECTION_OPTIONS, generateObjectionReply } from "@/lib/ai";
import { getLeadById, patchLead } from "@/lib/leads";
import { canSessionAccessLead } from "@/lib/crm-access";

const payloadSchema = z.object({
  leadId: z.string().trim().min(1, "Lead ID is required."),
  objection: z.enum(OBJECTION_OPTIONS)
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

  const reply = await generateObjectionReply(lead, payload.objection);
  const actor = getAdminActorLabel(session);

  await patchLead(lead.leadId, {
    note: `AI objection reply (${payload.objection}): ${reply.shortReply}`,
    actor
  });

  await logAuditEvent({
    type: "note_added",
    leadId: lead.leadId,
    actor,
    details: {
      action: "ai_objection_reply",
      objection: payload.objection,
      source: reply.source,
      model: reply.model
    }
  });

  return NextResponse.json({
    ok: true,
    reply: {
      objection: payload.objection,
      shortReply: reply.shortReply,
      longReply: reply.longReply,
      source: reply.source,
      generatedAt: new Date().toISOString()
    }
  });
}
