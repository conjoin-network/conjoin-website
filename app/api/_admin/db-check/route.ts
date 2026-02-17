import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { listCrmLeads } from '@/lib/crm';
import { getPortalSessionFromRequest } from '@/lib/admin-session';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  // allow admin via session cookie OR x-admin-pass header
  const session = getPortalSessionFromRequest(request);
  const adminPass = request.headers.get('x-admin-pass') || '';
  if (!session) {
    if (!process.env.ADMIN_PASSWORD || adminPass !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const dbUrl = process.env.DATABASE_URL || '';
    let dbHost = 'unknown';
    try {
      const u = new URL(dbUrl);
      dbHost = u.host;
    } catch {
      // fall back to regex
      try {
        const m = dbUrl.match(/@([^/]+)/);
        if (m && m[1]) dbHost = m[1];
      } catch {}
    }

    // mask credentials — only return host:port
    const maskedHost = dbHost;

    // attempt to read latest lead
    let latest: any = null;
    try {
      const leads = await listCrmLeads();
      if (Array.isArray(leads) && leads.length) {
        const l = leads[0];
        latest = { leadId: l.leadId ?? null, contactName: l.contactName ?? null, createdAt: l.createdAt ?? null };
      }
    } catch (err) {
      try { console.error('DB_CHECK_READ_FAILED', err); } catch {}
    }

    return NextResponse.json({ ok: true, dbHost: maskedHost, latestLead: latest });
  } catch (err) {
    console.error('DB_CHECK_ERROR', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
