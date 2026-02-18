import { NextResponse } from "next/server";
import { createCrmLead } from "@/lib/crm";
import type { LeadRecord } from "@/lib/leads";
import { enqueueMessageIntent, updateMessageIntentStatus } from "@/lib/message-queue";
import { sendEmail, sendWhatsApp } from "@/lib/messaging";
import { LEADS_EMAIL } from "@/lib/contact";
import { calculateLeadScore, scoreToPriority } from "@/lib/scoring";
import { suggestAgentForLead } from "@/lib/agents";
import { logAuditEvent } from "@/lib/event-log";
import { captureServerError } from "@/lib/error-logger";
import {
  QUOTE_CATALOG,
  type LeadBrand,
  getDeploymentOptions,
  isValidProductSelection
} from "@/lib/quote-catalog";
import { applyRateLimit, getClientIp, isHoneypotTriggered } from "@/lib/request-guards";
import { buildQuoteMessage, getPrimaryWhatsAppNumber } from "@/lib/whatsapp";
import { z } from "zod";

type QuotePayload = {
  brand?: string;
  otherBrand?: string;
  category?: string;
  plan?: string;
  deployment?: string;
  tier?: string;
  usersSeats?: number | string;
  endpoints?: number | string;
  servers?: number | string;
  ciscoUsers?: number | string;
  ciscoSites?: number | string;
  budgetRange?: string;
  addons?: string[];
  city?: string;
  sourcePage?: string;
  source?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmContent?: string;
  utmTerm?: string;
  pagePath?: string;
  referrer?: string;
  timeline?: string;
  notes?: string;
  contactName?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  whatsappOptIn?: boolean;
};

const quotePayloadSchema = z.object({
  brand: z.string().optional(),
  otherBrand: z.string().optional(),
  category: z.string().trim().min(1, "Please choose a product category."),
  plan: z.string().trim().min(1, "Please choose a plan."),
  deployment: z.string().optional(),
  tier: z.string().optional(),
  usersSeats: z.union([z.number(), z.string()]).optional(),
  endpoints: z.union([z.number(), z.string()]).optional(),
  servers: z.union([z.number(), z.string()]).optional(),
  ciscoUsers: z.union([z.number(), z.string()]).optional(),
  ciscoSites: z.union([z.number(), z.string()]).optional(),
  budgetRange: z.string().optional(),
  addons: z.array(z.string()).optional(),
  city: z.string().trim().min(1, "Please select a city."),
  sourcePage: z.string().optional(),
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmMedium: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  pagePath: z.string().optional(),
  referrer: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
  contactName: z.string().trim().min(1, "Contact name is required."),
  company: z.string().trim().min(1, "Company name is required."),
  email: z.string().trim().email("Please enter a valid business email."),
  phone: z.string().trim().min(8, "Phone number is required."),
  website: z.string().optional(),
  whatsappOptIn: z.boolean().optional()
});

function toNumber(value: number | string | undefined) {
  const next = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  return Number.isFinite(next) && next >= 0 ? next : 0;
}

function normalizeBrand(input: string | undefined): LeadBrand {
  const value = (input ?? "").trim().toLowerCase();
  if (value === "microsoft") {
    return "Microsoft";
  }
  if (value === "seqrite") {
    return "Seqrite";
  }
  if (value === "cisco") {
    return "Cisco";
  }
  return "Other";
}

function validationError(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

function serviceUnavailable(message = "Service temporarily unavailable. Please try again shortly.") {
  return NextResponse.json({ ok: false, message }, { status: 503 });
}

async function safeLogAuditEvent(input: Parameters<typeof logAuditEvent>[0]) {
  try {
    await logAuditEvent(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("QUOTE_AUDIT_EVENT_FAILED", JSON.stringify({ type: input.type, leadId: input.leadId ?? null, message }));
  }
}

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_PORT?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

export async function POST(request: Request) {
  let fallbackContext: {
    brand: LeadBrand;
    category: string;
    plan: string;
    city: string;
    qty: number;
    timeline: string;
    contactName: string;
    company: string;
    email: string;
    phone: string;
    notes: string;
    source: string;
    sourcePage: string;
  } | null = null;

  const ip = getClientIp(request);
  const rate = applyRateLimit({
    key: `api:quote:${ip}`,
    limit: 20,
    windowMs: 10 * 60 * 1000
  });
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please retry shortly." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  let rawPayload: QuotePayload;
  try {
    rawPayload = (await request.json()) as QuotePayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request payload. Please try again." },
      { status: 400 }
    );
  }

  try {
    const parsed = quotePayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      const issueMessage = parsed.error.issues[0]?.message;
      return validationError(
        !issueMessage || issueMessage === "Required"
          ? "Please review the required fields and try again."
          : issueMessage
      );
    }
    const payload = parsed.data;

    if (isHoneypotTriggered(payload.website)) {
      return NextResponse.json({ ok: true, message: "Request accepted." });
    }

    const requireNotifications = process.env.REQUIRE_LEAD_NOTIFICATIONS === "true";
    const smtpConfigured = isSmtpConfigured();
    if (requireNotifications && !smtpConfigured) {
      console.warn("QUOTE_NOTIFICATION_WARN", "SMTP configuration missing while REQUIRE_LEAD_NOTIFICATIONS=true");
    }

    const brand = normalizeBrand(payload.brand);
    const category = payload.category?.trim() ?? "";
    const plan = payload.plan?.trim() ?? payload.tier?.trim() ?? "";
    const deployment = payload.deployment?.trim() ?? "";
    const usersSeats = toNumber(payload.usersSeats);
    const endpoints = toNumber(payload.endpoints);
    const servers = toNumber(payload.servers);
    const ciscoUsers = toNumber(payload.ciscoUsers);
    const ciscoSites = toNumber(payload.ciscoSites);
    const budgetRange = payload.budgetRange?.trim() ?? "";
    const city = payload.city?.trim() ?? "";
    const sourcePage = payload.sourcePage?.trim() || "/request-quote";
    const source = payload.source?.trim() || sourcePage;
    const utmSource = payload.utmSource?.trim() ?? "";
    const utmCampaign = payload.utmCampaign?.trim() ?? "";
    const utmMedium = payload.utmMedium?.trim() ?? "";
    const utmContent = payload.utmContent?.trim() ?? "";
    const utmTerm = payload.utmTerm?.trim() ?? "";
    const pagePath = payload.pagePath?.trim() || sourcePage;
    const referrer = payload.referrer?.trim() || request.headers.get("referer") || "";
    const timeline = payload.timeline?.trim() || "This Week";
    const notes = payload.notes?.trim() ?? "";
    const contactName = payload.contactName?.trim() ?? "";
    const company = payload.company?.trim() ?? "";
    const email = payload.email?.trim() ?? "";
    const phone = payload.phone?.trim() ?? "";
    const addons = Array.isArray(payload.addons)
      ? payload.addons.map((item) => item.trim()).filter(Boolean)
      : [];
    const otherBrand = payload.otherBrand?.trim() ?? "";

    if (!category || !plan || !city || !contactName || !company || !email || !phone) {
      return validationError("Please complete all required fields.");
    }

    if (!(brand in QUOTE_CATALOG)) {
      return validationError("Please select a valid brand.");
    }

    if (!isValidProductSelection(brand, category, plan)) {
      return validationError("Please select a valid category and plan combination.");
    }

    const deploymentOptions = getDeploymentOptions(brand, category, plan);
    if (deploymentOptions.length > 0 && !deployment) {
      return validationError("Please select a valid deployment option.");
    }
    if (deployment && deploymentOptions.length > 0 && !deploymentOptions.includes(deployment as "Cloud" | "On-Prem" | "Hybrid")) {
      return validationError("Please select a valid deployment option.");
    }

    if (brand === "Microsoft" && usersSeats <= 0) {
      return validationError("Please enter Users/Seats greater than zero.");
    }

    if (brand === "Seqrite" && endpoints <= 0) {
      return validationError("Please enter Endpoints greater than zero.");
    }

    if ((brand === "Cisco" || brand === "Other") && ciscoUsers <= 0) {
      return validationError("Please enter users greater than zero.");
    }

    if (brand === "Other" && !otherBrand) {
      return validationError("Please provide the brand name.");
    }

    const qty = brand === "Microsoft" ? usersSeats : brand === "Seqrite" ? endpoints : ciscoUsers;
    const mergedNotes =
      brand === "Cisco" || brand === "Other"
        ? [notes, ciscoSites > 0 ? `Sites/Locations: ${ciscoSites}` : "", budgetRange ? `Budget: ${budgetRange}` : ""]
            .filter(Boolean)
            .join(" | ")
        : notes;
    const leadScore = calculateLeadScore({
      brand,
      qty,
      timeline,
      source,
      category,
      city
    });
    const leadPriority = scoreToPriority(leadScore);
    const suggestedAgent = suggestAgentForLead(brand, category);

    const normalizedPayload = {
      brand,
      category,
      plan,
      deployment: deployment || undefined,
      tier: plan,
      usersSeats: brand === "Microsoft" ? usersSeats : undefined,
      endpoints: brand === "Seqrite" ? endpoints : undefined,
      servers: brand === "Seqrite" ? servers : undefined,
      ciscoUsers: brand === "Cisco" || brand === "Other" ? ciscoUsers : undefined,
      ciscoSites: brand === "Cisco" || brand === "Other" ? ciscoSites : undefined,
      budgetRange: brand === "Cisco" || brand === "Other" ? budgetRange : undefined,
      qty,
      city,
      sourcePage,
      source,
      utmSource: utmSource || undefined,
      utmCampaign: utmCampaign || undefined,
      utmMedium: utmMedium || undefined,
      utmContent: utmContent || undefined,
      utmTerm: utmTerm || undefined,
      pagePath: pagePath || undefined,
      referrer: referrer || undefined,
      timeline,
      addons,
      score: leadScore
    };

    console.info("QUOTE_LEAD", JSON.stringify(normalizedPayload));

    fallbackContext = {
      brand,
      category,
      plan,
      city,
      qty,
      timeline,
      contactName,
      company,
      email,
      phone,
      notes: mergedNotes,
      source,
      sourcePage
    };

    const crmLead = await createCrmLead({
      name: contactName,
      phone,
      email,
      company,
      city,
      source,
      campaign: brand,
      requirement: plan || category,
      usersDevices: brand === 'Microsoft' ? usersSeats : qty,
      notes: mergedNotes,
      pageUrl: pagePath || sourcePage,
      utm_source: utmSource || undefined,
      utm_campaign: utmCampaign || undefined,
      utm_medium: utmMedium || undefined,
      utm_content: utmContent || undefined,
      utm_term: utmTerm || undefined,
      gclid: utmTerm || undefined,
      ip: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      score: leadScore,
      assignedTo: suggestedAgent
    } as any);

    // Normalize a lightweight legacy-shaped lead object for downstream messaging and email templates
    const leadForMessaging: LeadRecord = {
      leadId: crmLead.leadId,
      status: crmLead.status as any,
      priority: crmLead.priority as any,
      score: crmLead.score ?? 0,
      assignedTo: crmLead.assignedTo ?? null,
      lastContactedAt: null,
      firstContactAt: null,
      firstContactBy: null,
      nextFollowUpAt: null,
      brand: crmLead.campaign ?? undefined,
      category: undefined,
      tier: plan,
      qty: crmLead.usersDevices ?? 0,
      plan: crmLead.requirement ?? undefined,
      city: crmLead.city ?? undefined,
      sourcePage: crmLead.pagePath ?? crmLead.sourcePage ?? undefined,
      source: crmLead.source ?? undefined,
      timeline: undefined,
      notes: crmLead.notes ?? undefined,
      activityNotes: [],
      contactName: crmLead.contactName,
      company: crmLead.company ?? undefined,
      email: crmLead.email ?? undefined,
      phone: crmLead.phone ?? undefined,
      createdAt: crmLead.createdAt,
      updatedAt: crmLead.updatedAt
    } as LeadRecord;

    await safeLogAuditEvent({
      type: "lead_created",
      leadId: crmLead.leadId,
      actor: "quote_api",
      details: {
        brand,
        category,
        tier: plan,
        qty,
        city,
        source
      }
    });
    console.info("[quote] lead_saved", {
      leadId: crmLead.leadId,
      brand,
      city,
      sourcePage
    });

    const messageText = buildQuoteMessage({
      brand: String(leadForMessaging.brand),
      city: String(leadForMessaging.city ?? ""),
      requirement: String(leadForMessaging.plan ?? leadForMessaging.category ?? "General requirement"),
      qty: Number(leadForMessaging.qty ?? 0),
      timeline: leadForMessaging.timeline ?? "This Week"
    });
    const whatsappTo = getPrimaryWhatsAppNumber();

    const whatsappIntent = await enqueueMessageIntent({
      leadId: leadForMessaging.leadId,
      channel: "whatsapp",
      to: whatsappTo,
      payload: messageText
    });
    const emailIntent = await enqueueMessageIntent({
      leadId: leadForMessaging.leadId,
      channel: "email",
      to: process.env.LEADS_EMAIL ?? LEADS_EMAIL,
      payload: `Lead ${leadForMessaging.leadId} notification`
    });

    const whatsappResult = await sendWhatsApp({ to: whatsappTo, message: messageText });
    if (whatsappResult.ok) {
      await updateMessageIntentStatus(whatsappIntent.id, "SENT");
    }
    await safeLogAuditEvent({
      type: "whatsapp_sent",
      leadId: leadForMessaging.leadId,
      actor: "quote_api",
      details: {
        to: whatsappTo,
        ok: whatsappResult.ok,
        reason: whatsappResult.reason ?? null
      }
    });

    if (!smtpConfigured) {
      await updateMessageIntentStatus(emailIntent.id, "FAILED", "SMTP not configured");
      await safeLogAuditEvent({
        type: "email_sent",
        leadId: leadForMessaging.leadId,
        actor: "quote_api",
        details: {
          to: process.env.LEADS_EMAIL ?? LEADS_EMAIL,
          ok: false,
          reason: "SMTP not configured"
        }
      });
    } else {
      const emailResult = await sendEmail({ lead: leadForMessaging });
      if (emailResult.ok) {
        await updateMessageIntentStatus(emailIntent.id, "SENT");
      } else {
        await updateMessageIntentStatus(emailIntent.id, "FAILED", emailResult.reason ?? "Email send failed");
        console.error("Lead notification failed", emailResult.reason);
      }
      await safeLogAuditEvent({
        type: "email_sent",
        leadId: leadForMessaging.leadId,
        actor: "quote_api",
        details: {
          to: process.env.LEADS_EMAIL ?? LEADS_EMAIL,
          ok: emailResult.ok,
          reason: emailResult.reason ?? null
        }
      });
    }

    return NextResponse.json({
      ok: true,
      success: true,
      leadId: leadForMessaging.leadId,
      rfqId: leadForMessaging.leadId,
      status: leadForMessaging.status,
      createdAt: leadForMessaging.createdAt
    });
  } catch (error) {
    await captureServerError(error, {
      route: "/api/quote",
      phase: "post",
      fallbackEligible: Boolean(fallbackContext)
    });
    if (error instanceof Error && error.message.includes("LEAD_STORAGE_UNSAFE")) {
      const rfqId = `RFQ-${Date.now()}`;
      const now = new Date().toISOString();
      if (fallbackContext) {
        const fallbackLead: LeadRecord = {
          leadId: rfqId,
          status: "NEW",
          priority: "WARM",
          score: calculateLeadScore({
            brand: fallbackContext.brand,
            qty: fallbackContext.qty,
            timeline: fallbackContext.timeline,
            source: fallbackContext.source,
            category: fallbackContext.category,
            city: fallbackContext.city
          }),
          assignedTo: suggestAgentForLead(fallbackContext.brand, fallbackContext.category),
          lastContactedAt: null,
          firstContactAt: null,
          firstContactBy: null,
          nextFollowUpAt: null,
          brand: fallbackContext.brand,
          category: fallbackContext.category,
          tier: fallbackContext.plan,
          qty: fallbackContext.qty,
          plan: fallbackContext.plan,
          city: fallbackContext.city,
          source: fallbackContext.source,
          sourcePage: fallbackContext.sourcePage,
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
        await safeLogAuditEvent({
          type: "lead_created",
          leadId: fallbackLead.leadId,
          actor: "quote_api_fallback",
          details: {
            fallback: true,
            brand: fallbackLead.brand,
            category: fallbackLead.category,
            city: fallbackLead.city
          }
        });
        await safeLogAuditEvent({
          type: "email_sent",
          leadId: fallbackLead.leadId,
          actor: "quote_api_fallback",
          details: {
            to: process.env.LEADS_EMAIL ?? LEADS_EMAIL,
            fallback: true
          }
        });
        console.warn("QUOTE_FALLBACK_CAPTURE", JSON.stringify({ rfqId, brand: fallbackLead.brand, city: fallbackLead.city }));
      }

      return NextResponse.json({
        ok: true,
        success: true,
        leadId: rfqId,
        rfqId,
        status: "NEW",
        createdAt: now,
        message: "Request received in fallback mode. We will contact you shortly."
      });
    }
    return serviceUnavailable();
  }
}
