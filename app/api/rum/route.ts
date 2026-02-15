import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { appendRumEvent, getRumSummary } from "@/lib/rum-store";
import { applyRateLimit, getClientIp } from "@/lib/request-guards";
import { captureServerError } from "@/lib/error-logger";

const rumMetricSchema = z.object({
  id: z.string().optional(),
  name: z.enum(["CLS", "INP", "LCP", "FCP", "TTFB"]),
  value: z.coerce.number(),
  rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  path: z.string().optional(),
  navigationType: z.string().optional(),
  userAgent: z.string().optional()
});

const noStoreHeaders = {
  "Cache-Control": "no-store"
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = applyRateLimit({
    key: `api:rum:${ip}`,
    limit: 240,
    windowMs: 60 * 1000
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, message: "Rate limit reached." },
      { status: 429, headers: { ...noStoreHeaders, "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400, headers: noStoreHeaders });
  }

  const parsed = rumMetricSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid metric payload." }, { status: 400, headers: noStoreHeaders });
  }

  const metric = parsed.data;

  try {
    await appendRumEvent({
      id: metric.id || randomUUID(),
      name: metric.name,
      value: metric.value,
      rating: metric.rating ?? "unknown",
      path: metric.path || "/",
      navigationType: metric.navigationType || "navigate",
      userAgent: metric.userAgent || request.headers.get("user-agent") || "unknown",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    await captureServerError(error, {
      route: "/api/rum",
      phase: "append",
      metric: metric.name
    });

    return NextResponse.json(
      { ok: false, message: "Unable to store metric right now." },
      { status: 503, headers: noStoreHeaders }
    );
  }
}

export async function GET() {
  try {
    const summary = await getRumSummary();
    return NextResponse.json({ ok: true, summary }, { headers: noStoreHeaders });
  } catch (error) {
    await captureServerError(error, {
      route: "/api/rum",
      phase: "summary"
    });

    return NextResponse.json(
      { ok: false, message: "Unable to read RUM summary right now." },
      { status: 503, headers: noStoreHeaders }
    );
  }
}
