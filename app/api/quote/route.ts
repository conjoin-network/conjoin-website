import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads";
import { enqueueMessageIntent, updateMessageIntentStatus } from "@/lib/message-queue";
import { sendEmail, sendWhatsApp } from "@/lib/messaging";
import {
  QUOTE_CATALOG,
  type LeadBrand,
  isValidSelection
} from "@/lib/quote-catalog";
import { buildQuoteMessage, getPrimaryWhatsAppNumber } from "@/lib/whatsapp";

type QuotePayload = {
  brand?: string;
  otherBrand?: string;
  category?: string;
  plan?: string;
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
  pagePath?: string;
  referrer?: string;
  timeline?: string;
  notes?: string;
  contactName?: string;
  company?: string;
  email?: string;
  phone?: string;
};

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
  return NextResponse.json({ ok: false, message });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as QuotePayload;

    const brand = normalizeBrand(payload.brand);
    const category = payload.category?.trim() ?? "";
    const plan = payload.plan?.trim() ?? payload.tier?.trim() ?? "";
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

    if (!isValidSelection(brand, category, plan)) {
      return validationError("Please select a valid category and plan combination.");
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

    const normalizedPayload = {
      brand,
      category,
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
      pagePath: pagePath || undefined,
      referrer: referrer || undefined,
      timeline,
      addons
    };

    console.info("QUOTE_LEAD", JSON.stringify(normalizedPayload));

    const lead = await createLead({
      brand,
      category,
      tier: plan,
      qty,
      delivery: brand === "Seqrite" ? category : undefined,
      plan,
      usersSeats: brand === "Microsoft" ? usersSeats : null,
      endpoints: brand === "Seqrite" ? endpoints : null,
      servers: brand === "Seqrite" ? servers : null,
      ciscoUsers: brand === "Cisco" || brand === "Other" ? ciscoUsers : null,
      ciscoSites: brand === "Cisco" || brand === "Other" ? ciscoSites : null,
      budgetRange: brand === "Cisco" || brand === "Other" ? budgetRange : undefined,
      addons,
      otherBrand: brand === "Other" ? otherBrand : undefined,
      city,
      sourcePage,
      source,
      utmSource: utmSource || undefined,
      utmCampaign: utmCampaign || undefined,
      utmMedium: utmMedium || undefined,
      pagePath: pagePath || undefined,
      referrer: referrer || undefined,
      timeline,
      notes: mergedNotes,
      contactName,
      company,
      email,
      phone
    });
    console.info("[quote] lead_saved", {
      leadId: lead.leadId,
      brand: lead.brand,
      city: lead.city,
      sourcePage: lead.sourcePage
    });

    const messageText = buildQuoteMessage({
      brand: String(lead.brand),
      city: lead.city,
      requirement: lead.plan ?? lead.category ?? "General requirement",
      qty: lead.qty,
      timeline: lead.timeline ?? "This Week"
    });
    const whatsappTo = getPrimaryWhatsAppNumber();

    const whatsappIntent = await enqueueMessageIntent({
      leadId: lead.leadId,
      channel: "whatsapp",
      to: whatsappTo,
      payload: messageText
    });
    const emailIntent = await enqueueMessageIntent({
      leadId: lead.leadId,
      channel: "email",
      to: process.env.SALES_EMAIL ?? process.env.NEXT_PUBLIC_SALES_EMAIL ?? "sales@conjoinnewtork.com",
      payload: `Lead ${lead.leadId} notification`
    });

    const whatsappResult = await sendWhatsApp({ to: whatsappTo, message: messageText });
    if (whatsappResult.ok) {
      await updateMessageIntentStatus(whatsappIntent.id, "SENT");
    }

    const emailResult = await sendEmail({ lead });
    if (emailResult.ok) {
      await updateMessageIntentStatus(emailIntent.id, "SENT");
    } else {
      await updateMessageIntentStatus(emailIntent.id, "FAILED", emailResult.reason ?? "Email send failed");
      console.error("Lead notification failed", emailResult.reason);
    }

    return NextResponse.json({
      ok: true,
      leadId: lead.leadId,
      status: lead.status,
      createdAt: lead.createdAt
    });
  } catch {
    return validationError("Invalid request payload.");
  }
}
