import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { LEADS_EMAIL } from "@/lib/contact";
import { createLead } from "@/lib/leads";
import { applyRateLimit, getClientIp, isHoneypotTriggered } from "@/lib/request-guards";
import { sendEmail } from "@/lib/messaging";
import { calculateLeadScore, scoreToPriority } from "@/lib/scoring";
import { suggestAgentForLead } from "@/lib/agents";
import { logAuditEvent } from "@/lib/event-log";
import { captureServerError } from "@/lib/error-logger";
import { isPrismaInitializationError } from "@/lib/prisma-errors";
import { suggestAssigneeForService } from "@/lib/crm-access";
import { z } from "zod";

export const runtime = "nodejs";

type LeadPayload = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  requirement?: unknown;
  users?: unknown;
  city?: unknown;
  timeline?: unknown;
  source?: unknown;
  pagePath?: unknown;
  referrer?: unknown;
  website?: unknown;
  message?: unknown;
};

const SAFE_HEADER_KEYS = new Set([
  "user-agent",
  "origin",
  "referer",
  "host",
  "x-forwarded-for",
  "x-real-ip",
  "x-forwarded-proto",
  "content-type"
]);

const DELIVERY_ENV_KEYS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const;

const normalizedLeadSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(120, "Name is too long."),
    company: z.string().trim().max(160, "Company is too long.").default(""),
    email: z.string().trim().max(200).default(""),
    phone: z.string().trim().max(32).default(""),
    requirement: z.string().trim().min(1, "Requirement is required.").max(500, "Requirement is too long."),
    users: z.number().int().positive("Users/Devices must be greater than zero.").default(1),
    city: z.string().trim().max(80).default("Chandigarh"),
    timeline: z.string().trim().max(80).default("This Week"),
    source: z.string().trim().max(120).default("contact-form"),
    pagePath: z.string().trim().max(240).default("/contact"),
    referrer: z.string().trim().max(500).default(""),
    website: z.string().trim().max(200).default(""),
    message: z.string().trim().max(2000).default("")
  })
  .superRefine((value, ctx) => {
    if (!value.email && !value.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email or phone is required.",
        path: ["email"]
      });
    }

    if (value.email) {
      const emailCheck = z.string().email("Valid email is required.").safeParse(value.email);
      if (!emailCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid email is required.",
          path: ["email"]
        });
      }
    }

    if (value.phone && value.phone.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone is too short.",
        path: ["phone"]
      });
    }
  });

function jsonError(status: number, requestId: string, error: string) {
  return NextResponse.json({ ok: false, requestId, error }, { status });
}

function jsonSuccess(status: number, requestId: string, payload?: Record<string, unknown>) {
  return NextResponse.json({ ok: true, requestId, ...(payload ?? {}) }, { status });
}

function normalizeString(value: unknown, maxLength: number, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim().slice(0, maxLength);
}

function normalizeUsers(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return 1;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.trunc(value) : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizePayload(payload: LeadPayload) {
  return {
    name: normalizeString(payload.name, 120),
    company: normalizeString(payload.company, 160),
    email: normalizeString(payload.email, 200),
    phone: normalizeString(payload.phone, 32),
    requirement: normalizeString(payload.requirement, 500),
    users: normalizeUsers(payload.users),
    city: normalizeString(payload.city, 80, "Chandigarh") || "Chandigarh",
    timeline: normalizeString(payload.timeline, 80, "This Week") || "This Week",
    source: normalizeString(payload.source, 120, "contact-form") || "contact-form",
    pagePath: normalizeString(payload.pagePath, 240, "/contact") || "/contact",
    referrer: normalizeString(payload.referrer, 500),
    website: normalizeString(payload.website, 200),
    message: normalizeString(payload.message, 2000)
  };
}

function safeHeaders(headers: Headers) {
  const output: Record<string, string> = {};
  for (const [key, value] of headers.entries()) {
    const lowerKey = key.toLowerCase();
    if (SAFE_HEADER_KEYS.has(lowerKey)) {
      output[lowerKey] = value;
    }
  }
  return output;
}

function requestContext(request: Request, bodyKeys: string[]) {
  return {
    method: request.method,
    url: request.url,
    headers: safeHeaders(request.headers),
    bodyKeys
  };
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error
        ? {
            name: error.cause.name,
            message: error.cause.message,
            stack: error.cause.stack
          }
        : error.cause ?? null;

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : "Unknown error",
    stack: null,
    cause: null
  };
}

function getMissingDeliveryEnvKeys() {
  return DELIVERY_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

function getDbRuntimeInfo() {
  return {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    vercelEnv: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown"
  };
}

function isStorageNotConfigured(error: unknown) {
  return isPrismaInitializationError(error);
}

async function safeCapture(error: unknown, context: Record<string, unknown>) {
  try {
    await captureServerError(error, context);
  } catch (captureError) {
    console.error("LEAD_API_CAPTURE_FAILED", JSON.stringify({ context, error: serializeError(captureError) }));
  }
}

async function safeAudit(input: Parameters<typeof logAuditEvent>[0], requestId: string) {
  try {
    await logAuditEvent(input);
  } catch (error) {
    console.error(
      "LEAD_API_AUDIT_FAILED",
      JSON.stringify({ requestId, type: input.type, leadId: input.leadId, error: serializeError(error) })
    );
  }
}

async function safeEmailAudit(leadId: string, actor: string, requestId: string, details: Record<string, unknown>) {
  await safeAudit(
    {
      type: "email_sent",
      leadId,
      actor,
      details: {
        to: LEADS_EMAIL,
        requestId,
        ...details
      }
    },
    requestId
  );
}

function logDeliveryDisabledWarning(missingEnvKeys: string[], requestId: string, leadId?: string) {
  const envList = missingEnvKeys.length > 0 ? missingEnvKeys.join(", ") : DELIVERY_ENV_KEYS.join(", ");
  console.warn(
    "LEAD_DELIVERY_DISABLED",
    JSON.stringify({ requestId, leadId: leadId ?? null, message: `Lead captured but delivery disabled: missing ENV ${envList}` })
  );
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  let parsedBodyKeys: string[] = [];

  try {
    const ip = getClientIp(request);
    const rate = applyRateLimit({
      key: `api:lead:${ip}`,
      limit: 12,
      windowMs: 10 * 60 * 1000
    });

    if (!rate.allowed) {
      console.warn(
        "LEAD_API_RATE_LIMITED",
        JSON.stringify({ requestId, retryAfterSeconds: rate.retryAfterSeconds, context: requestContext(request, parsedBodyKeys) })
      );
      return jsonError(400, requestId, "Too many requests. Please retry shortly.");
    }

    let payload: LeadPayload;
    try {
      payload = (await request.json()) as LeadPayload;
      parsedBodyKeys = payload && typeof payload === "object" ? Object.keys(payload) : [];
    } catch (error) {
      console.error(
        "LEAD_API_INVALID_JSON",
        JSON.stringify({ requestId, context: requestContext(request, parsedBodyKeys), error: serializeError(error) })
      );
      return jsonError(400, requestId, "Invalid JSON");
    }

    const parsed = normalizedLeadSchema.safeParse(normalizePayload(payload));
    if (!parsed.success) {
      const issueMessage = parsed.error.issues[0]?.message || "Please review the required fields and try again.";
      console.warn(
        "LEAD_API_VALIDATION_FAILED",
        JSON.stringify({ requestId, context: requestContext(request, parsedBodyKeys), error: issueMessage })
      );
      return jsonError(400, requestId, issueMessage);
    }

    if (isHoneypotTriggered(parsed.data.website)) {
      return jsonSuccess(200, requestId, { message: "Request accepted." });
    }

    const leadScore = calculateLeadScore({
      brand: "Other",
      qty: parsed.data.users,
      timeline: parsed.data.timeline,
      source: parsed.data.source,
      category: "Contact Form",
      city: parsed.data.city
    });
    const assignment = suggestAssigneeForService({
      service: parsed.data.requirement,
      source: parsed.data.source
    });

    const provisionalLeadId = `RFQ-${Date.now()}`;
    let lead;
    try {
      lead = await createLead({
        brand: "Other",
        category: "Contact Form",
        tier: parsed.data.requirement,
        qty: parsed.data.users,
        score: leadScore,
        priority: scoreToPriority(leadScore),
        assignedTo: assignment.assignee || suggestAgentForLead("Other", "Contact Form"),
        plan: parsed.data.requirement,
        usersSeats: parsed.data.users,
        city: parsed.data.city,
        source: parsed.data.source,
        sourcePage: "/contact",
        pagePath: parsed.data.pagePath,
        referrer: parsed.data.referrer || request.headers.get("referer") || undefined,
        timeline: parsed.data.timeline,
        notes: parsed.data.message,
        contactName: parsed.data.name,
        company: parsed.data.company || "Not provided",
        email: parsed.data.email,
        phone: parsed.data.phone
      });
    } catch (error) {
      const errorInfo = serializeError(error);
      const dbRuntime = getDbRuntimeInfo();
      console.error(
        "LEAD_SAVE_FAILED",
        JSON.stringify({
          requestId,
          leadId: provisionalLeadId,
          errorName: errorInfo.name,
          errorMessage: errorInfo.message,
          hasDatabaseUrl: dbRuntime.hasDatabaseUrl,
          vercelEnv: dbRuntime.vercelEnv
        })
      );
      await safeCapture(error, {
        requestId,
        route: "/api/lead",
        phase: "create_lead",
        hasDatabaseUrl: dbRuntime.hasDatabaseUrl,
        vercelEnv: dbRuntime.vercelEnv,
        context: requestContext(request, parsedBodyKeys)
      });
      console.error(
        "LEAD_API_CREATE_FAILED",
        JSON.stringify({ requestId, leadId: provisionalLeadId, context: requestContext(request, parsedBodyKeys), error: errorInfo })
      );
      if (isStorageNotConfigured(error)) {
        return jsonError(503, requestId, "Lead storage is not configured.");
      }
      return jsonError(500, requestId, "Unable to save lead.");
    }

    await safeAudit(
      {
        type: "lead_created",
        leadId: lead.leadId,
        actor: "contact_api",
        details: {
          category: lead.category,
          tier: lead.tier,
          qty: lead.qty,
          city: lead.city,
          source: lead.source,
          requestId
        }
      },
      requestId
    );

    console.info(
      "CONTACT_LEAD",
      JSON.stringify({
        requestId,
        leadId: lead.leadId,
        destination: LEADS_EMAIL,
        context: requestContext(request, parsedBodyKeys)
      })
    );

    const missingDeliveryEnvKeys = getMissingDeliveryEnvKeys();
    if (missingDeliveryEnvKeys.length > 0) {
      logDeliveryDisabledWarning(missingDeliveryEnvKeys, requestId, lead.leadId);
      await safeEmailAudit(lead.leadId, "contact_api", requestId, {
        ok: false,
        queued: false,
        reason: `missing env: ${missingDeliveryEnvKeys.join(", ")}`
      });
      return jsonSuccess(200, requestId, {
        leadId: lead.leadId,
        message: "Request received. Delivery is disabled; our team will follow up."
      });
    }

    let emailResult: { ok: boolean; reason?: string };
    try {
      emailResult = await sendEmail({ lead });
    } catch (error) {
      console.error(
        "CONTACT_LEAD_EMAIL_THROWN",
        JSON.stringify({ requestId, leadId: lead.leadId, error: serializeError(error) })
      );
      await safeEmailAudit(lead.leadId, "contact_api", requestId, {
        ok: false,
        queued: false,
        reason: "email send threw"
      });
      return jsonSuccess(200, requestId, {
        leadId: lead.leadId,
        message: "Request received. Email delivery issue detected; our team will follow up."
      });
    }

    await safeEmailAudit(lead.leadId, "contact_api", requestId, {
      ok: emailResult.ok,
      reason: emailResult.reason ?? null
    });

    if (!emailResult.ok) {
      console.warn(
        "CONTACT_LEAD_EMAIL_NOT_SENT",
        JSON.stringify({ requestId, leadId: lead.leadId, reason: emailResult.reason ?? "unknown" })
      );
      return jsonSuccess(200, requestId, {
        leadId: lead.leadId,
        message: "Request received. Email delivery issue detected; our team will follow up."
      });
    }

    return jsonSuccess(200, requestId, {
      leadId: lead.leadId,
      message: "Request received. We will contact you shortly."
    });
  } catch (error) {
    await safeCapture(error, {
      requestId,
      route: "/api/lead",
      phase: "post_unhandled",
      context: requestContext(request, parsedBodyKeys)
    });

    console.error(
      "LEAD_API_UNHANDLED",
      JSON.stringify({ requestId, context: requestContext(request, parsedBodyKeys), error: serializeError(error) })
    );

    return jsonError(500, requestId, "Internal Server Error");
  }
}
