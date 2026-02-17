import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createCrmLead } from '@/lib/crm';
import { sendCaptureAlert } from '@/lib/captureEmail';
import { getPortalSessionFromRequest } from '@/lib/admin-session';
import { createLead } from '@/lib/leads';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  requirement: z.string().min(1),
  usersDevices: z.number().int().positive().optional(),
  city: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
  website: z.string().optional(), // honeypot
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  gclid: z.string().optional()
});

const RATE_LIMIT = new Map<string, { ts: number; count: number }>();
function checkRate(ip: string, limit = 20, windowMs = 60_000) {
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

function normalizePhone(v?: string) {
  if (!v) return undefined;
  let digits = String(v).replace(/[^\d]/g, "");
  if (!digits) return undefined;
  // If more than 10 digits (country code present), keep last 10 digits (Indian numbers)
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  if (digits.length === 0) return undefined;
  return digits;
}

function normalizeEmail(v?: string) {
  if (!v) return undefined;
  return String(v).trim().toLowerCase();
}

export async function POST(request: NextRequest) {
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

    // Log incoming payload (sanitized) for production verification
    try {
      const incoming = { name: parsed.data.name, email: parsed.data.email ?? null, phone: parsed.data.phone ?? null, city: parsed.data.city ?? null, requirement: parsed.data.requirement ?? null };
      console.info('LEAD_CAPTURE_INCOMING', JSON.stringify(incoming));
    } catch {}

    // require email OR phone
    const email = normalizeEmail(parsed.data.email);
    const phone = normalizePhone(parsed.data.phone);
    if (!email && !phone) {
      return NextResponse.json({ ok: false, error: 'Please provide phone or email.' }, { status: 400 });
    }

    const ua = request.headers.get('user-agent') || undefined;

    const lead = await createCrmLead({
      name: parsed.data.name,
      phone: phone as any,
      email: email as any,
      company: parsed.data.company,
      requirement: parsed.data.requirement,
      usersDevices: parsed.data.usersDevices,
      city: parsed.data.city,
      notes: parsed.data.notes,
      pageUrl: parsed.data.pageUrl,
      utm_source: parsed.data.utm_source,
      utm_medium: parsed.data.utm_medium,
      utm_campaign: parsed.data.utm_campaign,
      utm_term: parsed.data.utm_term,
      utm_content: parsed.data.utm_content,
      gclid: parsed.data.gclid,
      ip: String(ip),
      userAgent: ua
    });

    // email notify (best-effort) — log payload for temporary verification
    try {
      const alertPayload = { ...parsed.data, ip, userAgent: ua, email, phone };
      console.info('LEAD_CAPTURE_EMAIL_PAYLOAD', JSON.stringify({ name: alertPayload.name, email: alertPayload.email ?? null, phone: alertPayload.phone ?? null, city: alertPayload.city ?? null }));
      await sendCaptureAlert(alertPayload);
    } catch (e) {
      console.error('CAPTURE_ALERT_FAILED', e instanceof Error ? e.message : e);
    }

    try {
      const dbUrl = process.env.DATABASE_URL || '';
      let dbHost = 'unknown';
      try {
        const m = dbUrl.match(/@([^/]+)/);
        if (m && m[1]) dbHost = m[1];
      } catch {}
      console.info('LEAD_CAPTURE_STORED', JSON.stringify({ leadId: (lead as any).leadId ?? null, dbHost }));
    } catch {}

    return NextResponse.json({ ok: true, leadId: (lead as any).leadId ?? null }, { status: 201 });
  } catch (error) {
    console.error('LEAD_POST_ERROR', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-pass'
    }
  });
}

export async function GET(request: NextRequest) {
  // allow admin access via portal session cookie OR x-admin-pass header
  const session = getPortalSessionFromRequest(request);
  const adminPass = request.headers.get('x-admin-pass') || '';
  if (!session) {
    if (!process.env.ADMIN_PASSWORD || adminPass !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const url = new URL(request.url);
    const qStatus = url.searchParams.get('status') || undefined;
    const qCity = url.searchParams.get('city') || undefined;
    const qSource = url.searchParams.get('source') || undefined;
    const qCampaign = url.searchParams.get('campaign') || undefined;
    const qAssigned = url.searchParams.get('assignedAgent') || url.searchParams.get('assignedTo') || undefined;
    const range = url.searchParams.get('range') || undefined; // today|7d|30d
    const from = url.searchParams.get('from') || undefined;
    const to = url.searchParams.get('to') || undefined;

    const where: any = {};
    if (qStatus && qStatus !== 'all') where.status = String(qStatus).toUpperCase();
    if (qCity && qCity !== 'all') where.city = { contains: qCity, mode: 'insensitive' };
    if (qSource && qSource !== 'all') where.source = qSource;
    if (qCampaign) where.campaign = qCampaign;
    if (qAssigned) where.assignedAgent = qAssigned;

    if (range === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      where.createdAt = { gte: start.toISOString() };
    } else if (range === '7d' || range === '30d') {
      const days = range === '7d' ? 7 : 30;
      const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: start.toISOString() };
    }

    if (from) {
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(from).toISOString() };
    }
    if (to) {
      where.createdAt = { ...(where.createdAt || {}), lte: new Date(to).toISOString() };
    }

    const { listCrmLeads } = await import('@/lib/crm');
    const leads = await listCrmLeads();
      try {
        console.info('LEADS_GET', `returning ${leads.length} leads`);
      } catch {}
    return NextResponse.json({ ok: true, leads });
  } catch (error) {
    console.error('LEADS_GET_ERROR', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
