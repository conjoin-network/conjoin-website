import { NextResponse } from "next/server";
import { z } from "zod";
import { logAuditEvent } from "@/lib/event-log";

export const runtime = "nodejs";

const EVENT_NAMES = [
  "form_start",
  "form_submit_success",
  "call_click",
  "whatsapp_click",
  "request_quote_click"
] as const;

const payloadSchema = z.object({
  event: z.enum(EVENT_NAMES),
  leadId: z.string().trim().optional(),
  pagePath: z.string().trim().optional(),
  gclid: z.string().trim().optional(),
  utm_source: z.string().trim().optional(),
  utm_campaign: z.string().trim().optional(),
  utm_medium: z.string().trim().optional(),
  utm_term: z.string().trim().optional(),
  utm_content: z.string().trim().optional(),
  link_url: z.string().trim().optional(),
  form_name: z.string().trim().optional(),
  form_source: z.string().trim().optional(),
  value: z.number().optional()
});

const RATE_LIMIT = new Map<string, { ts: number; count: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30;

function allowIp(ip: string) {
  const now = Date.now();
  const current = RATE_LIMIT.get(ip);
  if (!current || now - current.ts > WINDOW_MS) {
    RATE_LIMIT.set(ip, { ts: now, count: 1 });
    return true;
  }
  if (current.count >= MAX_PER_WINDOW) {
    return false;
  }
  current.count += 1;
  return true;
}

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-client-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!allowIp(ip)) {
    return new Response(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(null, { status: 204 });
  }

  const event = parsed.data;
  try {
    await logAuditEvent({
      type: event.event,
      leadId: event.leadId || null,
      actor: "tracking_client",
      details: {
        pagePath: event.pagePath || null,
        formName: event.form_name || null,
        formSource: event.form_source || null,
        linkUrl: event.link_url || null,
        value: typeof event.value === "number" ? event.value : null,
        utmSource: event.utm_source || null,
        utmCampaign: event.utm_campaign || null,
        utmMedium: event.utm_medium || null,
        utmTerm: event.utm_term || null,
        utmContent: event.utm_content || null,
        hasGclid: Boolean(event.gclid)
      }
    });
  } catch {
    return new Response(null, { status: 204 });
  }

  return NextResponse.json({ ok: true });
}
