import { NextResponse } from "next/server";
import { getAdminActorLabel, getPortalSessionFromRequest } from "@/lib/admin-session";
import { logAuditEvent } from "@/lib/event-log";
import { generateLeadSummary } from "@/lib/ai";
import { getLeadById, setLeadAiSummary } from "@/lib/leads";
import { canSessionAccessLead } from "@/lib/crm-access";
import { z } from "zod";

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

  const summary = await generateLeadSummary(lead);
  const updated = await setLeadAiSummary(
    lead.leadId,
    {
      summary: summary.summary,
      nextStep: summary.nextStep,
      priority: summary.priority,
      source: summary.source
    },
    getAdminActorLabel(session)
  );

  await logAuditEvent({
    type: "note_added",
    leadId: lead.leadId,
    actor: getAdminActorLabel(session),
    details: {
      action: "ai_summary_generated",
      source: summary.source,
      model: summary.model,
      priority: summary.priority
    }
  });

  return NextResponse.json({
    ok: true,
    summary: updated?.aiSummary ?? {
      summary: summary.summary,
      nextStep: summary.nextStep,
      priority: summary.priority,
      generatedAt: new Date().toISOString(),
      source: summary.source
    }
  });
}
