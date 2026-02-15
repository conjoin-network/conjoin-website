import { NextResponse } from "next/server";
import { LEADS_EMAIL } from "@/lib/contact";
import { createLead, type LeadRecord } from "@/lib/leads";
import { applyRateLimit, getClientIp, isHoneypotTriggered } from "@/lib/request-guards";
import { sendEmail } from "@/lib/messaging";
import { calculateLeadScore, scoreToPriority } from "@/lib/scoring";
import { suggestAgentForLead } from "@/lib/agents";
import { logAuditEvent } from "@/lib/event-log";
import { z } from "zod";

type LeadPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  requirement?: string;
  users?: string | number;
  city?: string;
  timeline?: string;
  source?: string;
  pagePath?: string;
  referrer?: string;
  website?: string;
  message?: string;
};

const leadPayloadSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  company: z.string().trim().min(1, "Company is required."),
  email: z.string().trim().email("Valid email is required."),
  phone: z.string().trim().min(8, "Phone is required."),
  requirement: z.string().trim().min(1, "Requirement is required."),
  users: z.union([z.number(), z.string()]),
  city: z.string().trim().optional(),
  timeline: z.string().trim().optional(),
  source: z.string().trim().optional(),
  pagePath: z.string().trim().optional(),
  referrer: z.string().trim().optional(),
  website: z.string().optional(),
  message: z.string().trim().optional()
});

function toNumber(value: string | number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function serviceUnavailable(message = "Service temporarily unavailable. Please try again shortly.") {
  return NextResponse.json({ ok: false, message }, { status: 503 });
}

export async function POST(request: Request) {
  let fallbackContext: {
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
  } | null = null;

  const ip = getClientIp(request);
  const rate = applyRateLimit({
    key: `api:lead:${ip}`,
    limit: 12,
    windowMs: 10 * 60 * 1000
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please retry shortly." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  let payload: LeadPayload;
  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request payload." }, { status: 400 });
  }

  const parsed = leadPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const issueMessage = parsed.error.issues[0]?.message;
    return NextResponse.json(
      {
        ok: false,
        message:
          !issueMessage || issueMessage === "Required"
            ? "Please review the required fields and try again."
            : issueMessage
      },
      { status: 400 }
    );
  }

  if (isHoneypotTriggered(parsed.data.website)) {
    return NextResponse.json({ ok: true, message: "Request accepted." });
  }

  const users = toNumber(parsed.data.users);
  if (users <= 0) {
    return NextResponse.json({ ok: false, message: "Users/Devices must be greater than zero." }, { status: 400 });
  }

  try {
    const leadScore = calculateLeadScore({
      brand: "Other",
      qty: users,
      timeline: parsed.data.timeline || "This Week",
      source: parsed.data.source || "contact-form",
      category: "Contact Form",
      city: parsed.data.city || "Chandigarh"
    });

    fallbackContext = {
      requirement: parsed.data.requirement,
      users,
      city: parsed.data.city || "Chandigarh",
      timeline: parsed.data.timeline || "This Week",
      source: parsed.data.source || "contact-form",
      sourcePage: "/contact",
      pagePath: parsed.data.pagePath || "/contact",
      referrer: parsed.data.referrer || request.headers.get("referer") || undefined,
      notes: parsed.data.message || "",
      contactName: parsed.data.name,
      company: parsed.data.company,
      email: parsed.data.email,
      phone: parsed.data.phone
    };

    const lead = await createLead({
      brand: "Other",
      category: "Contact Form",
      tier: parsed.data.requirement,
      qty: users,
      score: leadScore,
      priority: scoreToPriority(leadScore),
      assignedTo: suggestAgentForLead("Other", "Contact Form"),
      plan: parsed.data.requirement,
      usersSeats: users,
      city: parsed.data.city || "Chandigarh",
      source: parsed.data.source || "contact-form",
      sourcePage: "/contact",
      pagePath: parsed.data.pagePath || "/contact",
      referrer: parsed.data.referrer || request.headers.get("referer") || undefined,
      timeline: parsed.data.timeline || "This Week",
      notes: parsed.data.message || "",
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

    console.info("CONTACT_LEAD", JSON.stringify({ leadId: lead.leadId, destination: LEADS_EMAIL }));

    const emailResult = await sendEmail({ lead });
    await logAuditEvent({
      type: "email_sent",
      leadId: lead.leadId,
      actor: "contact_api",
      details: {
        to: LEADS_EMAIL,
        ok: emailResult.ok,
        reason: emailResult.reason ?? null
      }
    });
    if (!emailResult.ok) {
      console.error("CONTACT_LEAD_EMAIL_FAILED", emailResult.reason ?? "unknown");
    }

    return NextResponse.json({
      ok: true,
      message: "Request received. We will contact you shortly.",
      leadId: lead.leadId
    });
  } catch (error) {
    console.error("CONTACT_LEAD_ERROR", error);
    if (error instanceof Error && error.message.includes("LEAD_STORAGE_UNSAFE")) {
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
        await sendEmail({ lead: fallbackLead });
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
        await logAuditEvent({
          type: "email_sent",
          leadId: fallbackLead.leadId,
          actor: "contact_api_fallback",
          details: {
            to: LEADS_EMAIL,
            fallback: true
          }
        });
        console.warn("CONTACT_FALLBACK_CAPTURE", JSON.stringify({ leadId, destination: LEADS_EMAIL }));
      }

      return NextResponse.json({
        ok: true,
        message: "Request received in fallback mode. We will contact you shortly.",
        leadId
      });
    }
    return serviceUnavailable();
  }
}
