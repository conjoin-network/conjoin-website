import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCrmLead } from '@/lib/crm';
import { sendCaptureAlert } from '@/lib/captureEmail';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(6),
  requirement: z.string().optional(),
  usersDevices: z.number().int().positive().optional(),
  city: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
  website: z.string().optional(), // honeypot
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  gclid: z.string().optional()
});

const RATE_LIMIT = new Map<string, { ts: number; count: number }>();
function checkRate(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const cur = RATE_LIMIT.get(ip);
  if (!cur || now - cur.ts > windowMs) {
    RATE_LIMIT.set(ip, { ts: now, count: 1 });
    return true;
  }
  if (cur.count >= limit) return false;
  cur.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('x-client-ip') || 'local';
    if (!checkRate(String(ip))) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
    }

    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid request payload. Please try again.' }, { status: 400 });

    // honeypot
    if (parsed.data.website && parsed.data.website.trim() !== '') {
      return NextResponse.json({ ok: true, message: 'Accepted' });
    }

    const ua = request.headers.get('user-agent') || undefined;

    const lead = await createCrmLead({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      company: parsed.data.company,
      requirement: parsed.data.requirement,
      usersDevices: parsed.data.usersDevices,
      city: parsed.data.city,
      notes: parsed.data.notes,
      utm_source: parsed.data.utm_source,
      utm_medium: parsed.data.utm_medium,
      utm_campaign: parsed.data.utm_campaign,
      utm_term: parsed.data.utm_term,
      utm_content: parsed.data.utm_content,
      gclid: parsed.data.gclid,
      ip: String(ip),
      userAgent: ua
    });

    // email notify (best-effort)
    try {
      await sendCaptureAlert({ ...parsed.data, ip, userAgent: ua });
    } catch (e) {
      console.error('CAPTURE_ALERT_FAILED', e);
    }

    return NextResponse.json({ ok: true, id: lead.leadId });
  } catch (error) {
    console.error('LEAD_CAPTURE_ERROR', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
