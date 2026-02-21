import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { updateCrmLead } from '@/lib/crm';

export const runtime = 'nodejs';

const patchSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'closed', 'lost']).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional()
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminPass = request.headers.get('x-admin-pass') || "";
  if (!process.env.ADMIN_PASSWORD || adminPass !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.errors[0].message }, { status: 400 });
    const { id } = await context.params;
    const lead = await updateCrmLead(id, parsed.data);
    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    console.error("CRM_LEAD_PATCH_ERROR", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
