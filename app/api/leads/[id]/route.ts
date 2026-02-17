import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateCrmLead, getCrmLead } from '@/lib/crm';
import { getPortalSessionFromRequest } from '@/lib/admin-session';

export const runtime = 'nodejs';

const patchSchema = z.object({
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedAgent: z.string().optional(),
  notes: z.string().optional(),
  score: z.number().int().optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  // allow admin via session cookie OR x-admin-pass header
  const session = getPortalSessionFromRequest(request);
  const adminPass = request.headers.get('x-admin-pass') || '';
  if (!session) {
    if (!process.env.ADMIN_PASSWORD || adminPass !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const id = params.id;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });

    const lead = await getCrmLead(id);
    if (!lead) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const updated = await updateCrmLead(id, parsed.data as any);
    return NextResponse.json({ ok: true, lead: updated });
  } catch (err) {
    console.error('LEAD_PATCH_ERROR', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
