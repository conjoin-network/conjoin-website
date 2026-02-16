import { NextResponse } from "next/server";
import { LEADS_EMAIL } from "@/lib/contact";
import { createLead, type LeadRecord } from "@/lib/leads";
import { applyRateLimit, getClientIp, isHoneypotTriggered } from "@/lib/request-guards";
import { sendEmail } from "@/lib/messaging";
import { calculateLeadScore, scoreToPriority } from "@/lib/scoring";
import { suggestAgentForLead } from "@/lib/agents";
import { logAuditEvent } from "@/lib/event-log";
import { captureServerError } from "@/lib/error-logger";
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

type FallbackContext = {
  requirement: string;
  users: number;
  city: string;
  timeline: string;
  source: string;
  sourcePage: string;
  pagePath: string;
  referrer?: string;
  notes: string;
  contactName: string;
  company: string;
  email: string;
  phone: string;
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
    company: z.string().trim().min(1, "Company is required.").max(160, "Company is too long."),
    email: z.string().trim().max(200).default(""),
    phone: z.string().trim().max(32).default(""),
    requirement: z.string().trim().min(1, "Requirement is required.").max(500, "Requirement is too long."),
    users: z.number().int().positive("Users/Devices must be greater than zero."),
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

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error, message: error }, { status });
}

function jsonSuccess(status: number, payload?: Record<string, unknown>) {
  return NextResponse.json({ ok: true, ...(payload ?? {}) }, { status });
}

function normalizeString(value: unknown, maxLength: number, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim().slice(0, maxLength);
}

function normalizeUsers(value: unknown) {
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

function isStorageUnsafeError(error: unknown) {
  return error instanceof Error && error.message.includes("LEAD_STORAGE_UNSAFE");
}

function logDeliveryDisabledWarning(missingEnvKeys: string[], leadId?: string) {
  const envList = missingEnvKeys.length > 0 ? missingEnvKeys.join(", ") : DELIVERY_ENV_KEYS.join(", ");
  const context = leadId ? { leadId } : {};
  console.warn(`Lead captured but delivery disabled: missing ENV ${envList}`, JSON.stringify(context));
}

async function emailAudit(leadId: string, actor: string, details: Record<string, unknown>) {
  await logAuditEvent({
    type: "email_sent",
    leadId,
    actor,
    details: {
      to: LEADS_EMAIL,
      ...details
    }
  });
}

export async function POST(request: Request) {
  let fallbackContext: FallbackContext | null = null;
  let parsedBodyKeys: string[] = [];

  const ip = getClientIp(request);
  const rate = applyRateLimit({
    key: `api:lead:${ip}`,
    limit: 12,
    windowMs: 10 * 60 * 1000
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please retry shortly.", message: "Too many requests. Please retry shortly." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  let payload: LeadPayload;
  try {
    payload = (await request.json()) as LeadPayload;
    parsedBodyKeys = payload && typeof payload === "object" ? Object.keys(payload) : [];
  } catch (error) {
    console.error(
      "LEAD_API_INVALID_JSON",
      JSON.stringify({
        ...requestContext(request, parsedBodyKeys),
        error: serializeError(error)
      })
    );
    return jsonError(400, "Invalid request payload.");
  }

  const normalized = normalizePayload(payload);
  const parsed = normalizedLeadSchema.safeParse(normalized);

  if (!parsed.success) {
    const issueMessage = parsed.error.issues[0]?.message || "Please review the required fields and try again.";
    console.warn(
      "LEAD_API_VALIDATION_FAILED",
      JSON.stringify({
        ...requestContext(request, parsedBodyKeys),
        error: issueMessage
      })
    );
    return jsonError(400, issueMessage);
  }

  if (isHoneypotTriggered(parsed.data.website)) {
    return jsonSuccess(200, { message: "Request accepted." });
  }

  try {
    const leadScore = calculateLeadScore({
      brand: "Other",
      qty: parsed.data.users,
      timeline: parsed.data.timeline,
      source: parsed.data.source,
      category: "Contact Form",
      city: parsed.data.city
    });

    fallbackContext = {
      requirement: parsed.data.requirement,
      users: parsed.data.users,
      city: parsed.data.city,
      timeline: parsed.data.timeline,
      source: parsed.data.source,
      sourcePage: "/contact",
      pagePath: parsed.data.pagePath,
      referrer: parsed.data.referrer || request.headers.get("referer") || undefined,
      notes: parsed.data.message,
      contactName: parsed.data.name,
      company: parsed.data.company,
      email: parsed.data.email,
      phone: parsed.data.phone
    };

    const lead = await createLead({
      brand: "Other",
      category: "Contact Form",
      tier: parsed.data.requirement,
      qty: parsed.data.users,
      score: leadScore,
      priority: scoreToPriority(leadScore),
      assignedTo: suggestAgentForLead("Other", "Contact Form"),
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
      company: parsed.data.company,
      email: parsed.data.email,
      phone: parsed.data.phone
    });

    await logAuditEvent({
      type: "lead_created",
      leadId: lead.leadId,
      actor: "contact_api",
      details: {
        category: lead.category,
        tier: lead.tier,
        qty: lead.qty,
        city: lead.city,
        source: lead.source
      }
    });

    console.info(
      "CONTACT_LEAD",
      JSON.stringify({
        leadId: lead.leadId,
        destination: LEADS_EMAIL,
        context: requestContext(request, parsedBodyKeys)
      })
    );

    const missingDeliveryEnvKeys = getMissingDeliveryEnvKeys();
    const deliveryDisabled = process.env.NODE_ENV === "production" && missingDeliveryEnvKeys.length > 0;

    if (deliveryDisabled) {
      logDeliveryDisabledWarning(missingDeliveryEnvKeys, lead.leadId);
      await emailAudit(lead.leadId, "contact_api", {
        ok: false,
        reason: `missing env: ${missingDeliveryEnvKeys.join(", ")}`,
        queued: true
      });

      return jsonSuccess(202, {
        queued: true,
        leadId: lead.leadId,
        message: "Request received. Delivery is queued and our team will contact you shortly."
      });
    }

    const emailResult = await sendEmail({ lead });
    await emailAudit(lead.leadId, "contact_api", {
      ok: emailResult.ok,
      reason: emailResult.reason ?? null
    });

    if (!emailResult.ok) {
      console.error(
        "CONTACT_LEAD_EMAIL_FAILED",
        JSON.stringify({
          leadId: lead.leadId,
          reason: emailResult.reason ?? "unknown"
        })
      );

      if (process.env.NODE_ENV === "production" && (emailResult.reason ?? "").toLowerCase().includes("not configured")) {
        logDeliveryDisabledWarning(getMissingDeliveryEnvKeys(), lead.leadId);
        return jsonSuccess(202, {
          queued: true,
          leadId: lead.leadId,
          message: "Request received. Delivery is queued and our team will contact you shortly."
        });
      }
    }

    return jsonSuccess(200, {
      leadId: lead.leadId,
      message: "Request received. We will contact you shortly."
    });
  } catch (error) {
    await captureServerError(error, {
      route: "/api/lead",
      phase: "post",
      fallbackEligible: Boolean(fallbackContext)
    });

    const serialized = serializeError(error);
    console.error(
      "LEAD_API_POST_FAILED",
      JSON.stringify({
        ...requestContext(request, parsedBodyKeys),
        error: serialized
      })
    );

    if (isStorageUnsafeError(error)) {
      const leadId = `RFQ-${Date.now()}`;
      const now = new Date().toISOString();

      if (fallbackContext) {
        const fallbackLead: LeadRecord = {
          leadId,
          status: "NEW",
          priority: "WARM",
          score: calculateLeadScore({
            brand: "Other",
            qty: fallbackContext.users,
            timeline: fallbackContext.timeline,
            source: fallbackContext.source,
            category: "Contact Form",
            city: fallbackContext.city
          }),
          assignedTo: suggestAgentForLead("Other", "Contact Form"),
          lastContactedAt: null,
          firstContactAt: null,
          firstContactBy: null,
          nextFollowUpAt: null,
          brand: "Other",
          category: "Contact Form",
          tier: fallbackContext.requirement,
          qty: fallbackContext.users,
          plan: fallbackContext.requirement,
          usersSeats: fallbackContext.users,
          city: fallbackContext.city,
          source: fallbackContext.source,
          sourcePage: fallbackContext.sourcePage,
          pagePath: fallbackContext.pagePath,
          referrer: fallbackContext.referrer,
          timeline: fallbackContext.timeline,
          notes: fallbackContext.notes,
          activityNotes: [],
          contactName: fallbackContext.contactName,
          company: fallbackContext.company,
          email: fallbackContext.email,
          phone: fallbackContext.phone,
          createdAt: now,
          updatedAt: now
        };

        const emailResult = await sendEmail({ lead: fallbackLead });

        await logAuditEvent({
          type: "lead_created",
          leadId: fallbackLead.leadId,
          actor: "contact_api_fallback",
          details: {
            fallback: true,
            city: fallbackLead.city,
            source: fallbackLead.source
          }
        });

        await emailAudit(fallbackLead.leadId, "contact_api_fallback", {
          fallback: true,
          ok: emailResult.ok,
          reason: emailResult.reason ?? null
        });

        const missingDeliveryEnvKeys = getMissingDeliveryEnvKeys();
        if (!emailResult.ok) {
          logDeliveryDisabledWarning(missingDeliveryEnvKeys, leadId);
        }

        console.warn(
          "CONTACT_FALLBACK_CAPTURE",
          JSON.stringify({
            leadId,
            destination: LEADS_EMAIL,
            queued: true
          })
        );
      }

      return jsonSuccess(202, {
        queued: true,
        leadId,
        message: "Request received in fallback mode. We will contact you shortly."
      });
    }

    return jsonError(500, "Internal Server Error");
  }
}
