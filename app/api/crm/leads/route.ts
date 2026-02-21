import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCrmLead, listCrmLeads } from '@/lib/crm';
import { sendInternalLeadAlert } from '@/lib/whatsapp-internal-alert';

export const runtime = 'nodejs';

const leadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional()
});

// very light in-memory rate limit per IP
const RATE_LIMIT_MAP = new Map<string, { count: number; ts: number }>();
function checkRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const item = RATE_LIMIT_MAP.get(key);
  if (!item || now - item.ts > windowMs) {
    RATE_LIMIT_MAP.set(key, { count: 1, ts: now });
    return { allowed: true };
  }
  if (item.count >= limit) return { allowed: false };
  item.count += 1;
  return { allowed: true };
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local';
    const rate = checkRateLimit(`crm:lead:${ip}`, 10, 60_000);
    if (!rate.allowed) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.errors[0].message }, { status: 400 });

    const lead = await createCrmLead(parsed.data);
    try {
      await sendInternalLeadAlert({
        leadId: lead.leadId,
        name: lead.contactName,
        company: lead.company ?? "",
        phone: lead.phone ?? "",
        city: lead.city ?? "",
        requirement: lead.requirement ?? "",
        qty: lead.usersDevices ?? null,
        usersSeats: lead.usersDevices ?? null,
        sourcePage: "/crm/leads",
        pagePath: "/crm/leads",
        assignedTo: lead.assignedTo ?? null,
        ip: String(ip)
      });
    } catch (error) {
      console.error("CRM_LEAD_WHATSAPP_ALERT_FAILED", error);
    }
    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    console.error('CRM_LEAD_POST_ERROR', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const adminPass = request.headers.get('x-admin-pass') || '';
  if (!process.env.ADMIN_PASSWORD || adminPass !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leads = await listCrmLeads();
    return NextResponse.json({ ok: true, leads });
  } catch (error) {
    console.error('CRM_LEADS_GET_ERROR', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
