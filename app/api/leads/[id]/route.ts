import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { updateCrmLead, getCrmLead } from '@/lib/crm';
import { getAdminActorLabel, getPortalSessionFromRequest } from '@/lib/admin-session';
import { canSessionAccessLead } from '@/lib/crm-access';
import { upsertWorkflowMetaInNotes } from '@/lib/lead-workflow-meta';

export const runtime = 'nodejs';

const patchSchema = z.object({
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedAgent: z.string().optional(),
  nextFollowUpAt: z.union([z.string(), z.null()]).optional(),
  markContacted: z.boolean().optional(),
  note: z.string().optional(),
  notes: z.string().optional(),
  score: z.number().int().optional()
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // allow admin via session cookie OR x-admin-pass header
  const session = getPortalSessionFromRequest(request);
  const adminPass = request.headers.get('x-admin-pass') || '';
  const headerAuthorized = Boolean(process.env.ADMIN_PASSWORD && adminPass === process.env.ADMIN_PASSWORD);
  if (!session) {
    if (!headerAuthorized) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });

    const lead = await getCrmLead(id);
    if (!lead) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    if (session && !canSessionAccessLead(session, lead)) {
      return NextResponse.json({ ok: false, error: 'Access denied for this lead.' }, { status: 403 });
    }

    if (session && !session.canAssign && parsed.data.assignedTo !== undefined && parsed.data.assignedTo !== lead.assignedTo) {
      return NextResponse.json({ ok: false, error: 'Assignment updates are restricted for your role.' }, { status: 403 });
    }

    const actor = getAdminActorLabel(session);
    const dbStatus = (() => {
      const normalized = String(parsed.data.status ?? '').toUpperCase();
      if (!normalized) return undefined;
      if (normalized === 'IN_PROGRESS') return 'CONTACTED';
      if (normalized === 'QUOTED') return 'QUALIFIED';
      if (normalized === 'WON') return 'CLOSED';
      if (normalized === 'LOST') return 'LOST';
      return normalized;
    })();

    const nowIso = new Date().toISOString();
    const existingNotes = lead.notes ?? '';
    const noteLine = String(parsed.data.note ?? '').trim();
    const freeformNotes = String(parsed.data.notes ?? '').trim();
    const composedNotes = [existingNotes, freeformNotes, noteLine ? `${actor}: ${noteLine}` : ''].filter(Boolean).join('\n');
    const notesWithWorkflow = upsertWorkflowMetaInNotes(composedNotes, {
      nextFollowUpAt: parsed.data.nextFollowUpAt === undefined ? undefined : parsed.data.nextFollowUpAt,
      lastContactedAt: parsed.data.markContacted ? nowIso : undefined,
      firstContactAt: parsed.data.markContacted && !lead.firstContactAt ? nowIso : undefined,
      firstContactBy: parsed.data.markContacted && !lead.firstContactBy ? actor : undefined
    });

    const updated = await updateCrmLead(id, {
      status: dbStatus,
      assignedTo: parsed.data.assignedTo ?? parsed.data.assignedAgent ?? undefined,
      notes: notesWithWorkflow,
      score: parsed.data.score
    });
    return NextResponse.json({ ok: true, lead: updated });
  } catch (err) {
    console.error('LEAD_PATCH_ERROR', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
