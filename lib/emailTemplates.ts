import type { LeadRecord } from "@/lib/leads";
import { LEADS_EMAIL, SUPPORT_EMAIL } from "@/lib/contact";
import { EMAIL_BRAND, EMAIL_SECURITY_LINE, getEmailLogoUrl, getRoleContextMessage, type EmailTriggeredBy } from "@/lib/emailBrand";
import { getEmailSignatureHtml, getEmailSignatureText } from "@/lib/emailSignature";
import { buildQuoteMessage, getLeadWhatsAppLink } from "@/lib/whatsapp";
import { absoluteUrl } from "@/lib/seo";

type EmailRow = {
  label: string;
  value: string;
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
  fromName: "Conjoin Leads Desk" | "Conjoin Security";
  replyTo: string;
};

type BaseTemplateInput = {
  title: string;
  intro: string;
  triggeredBy: EmailTriggeredBy;
  rows: EmailRow[];
  ctaLabel: string;
  ctaUrl: string;
  fromName: EmailTemplate["fromName"];
  replyTo: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderRowTable(rows: EmailRow[]) {
  const htmlRows = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:7px 0;width:168px;color:${EMAIL_BRAND.colors.muted};font-size:13px;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:7px 0;color:${EMAIL_BRAND.colors.text};font-size:13px;font-weight:600;">${escapeHtml(row.value)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:14px 0 0 0;">
      ${htmlRows}
    </table>
  `;
}

function renderBaseTemplate(input: BaseTemplateInput) {
  const roleContext = getRoleContextMessage(input.triggeredBy);
  const safeTitle = escapeHtml(input.title);
  const safeIntro = escapeHtml(input.intro);
  const safeRoleContext = escapeHtml(roleContext);
  const safeCtaLabel = escapeHtml(input.ctaLabel);
  const safeCtaUrl = escapeHtml(input.ctaUrl);
  const safeSecurityLine = escapeHtml(EMAIL_SECURITY_LINE);
  const rowTable = renderRowTable(input.rows);

  const html = `
  <!doctype html>
  <html>
    <body style="margin:0;background:#f1f5f9;padding:18px;font-family:Arial,sans-serif;">
      <table role="presentation" width="100%" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid ${EMAIL_BRAND.colors.border};border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:18px 22px;border-bottom:1px solid ${EMAIL_BRAND.colors.border};background:${EMAIL_BRAND.colors.surface};">
            <table role="presentation" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="${getEmailLogoUrl()}" alt="${escapeHtml(EMAIL_BRAND.brandName)}" width="34" height="34" style="display:inline-block;vertical-align:middle;object-fit:contain;" />
                  <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-weight:700;color:${EMAIL_BRAND.colors.text};font-size:18px;">${escapeHtml(EMAIL_BRAND.brandName)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:22px;">
            <h1 style="margin:0 0 8px 0;font-size:22px;line-height:1.25;color:${EMAIL_BRAND.colors.text};">${safeTitle}</h1>
            <p style="margin:0 0 8px 0;font-size:13px;color:${EMAIL_BRAND.colors.muted};">${safeRoleContext}</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.colors.text};">${safeIntro}</p>
            ${rowTable}
            <div style="margin-top:16px;">
              <a href="${safeCtaUrl}" style="display:inline-block;padding:11px 18px;border-radius:10px;background:${EMAIL_BRAND.colors.primary};color:#ffffff;font-weight:700;font-size:13px;text-decoration:none;">${safeCtaLabel}</a>
            </div>
            <p style="margin:12px 0 0 0;font-size:12px;color:${EMAIL_BRAND.colors.muted};word-break:break-all;">If the button does not work, use this link: ${safeCtaUrl}</p>
            <p style="margin:12px 0 0 0;font-size:12px;color:${EMAIL_BRAND.colors.muted};">${safeSecurityLine}</p>
            ${getEmailSignatureHtml()}
          </td>
        </tr>
      </table>
    </body>
  </html>
  `.trim();

  const textRows = input.rows.map((row) => `${row.label}: ${row.value}`).join("\n");
  const text = [
    input.title,
    roleContext,
    input.intro,
    "",
    textRows,
    "",
    `${input.ctaLabel}: ${input.ctaUrl}`,
    EMAIL_SECURITY_LINE,
    "",
    getEmailSignatureText()
  ].join("\n");

  return {
    html,
    text,
    fromName: input.fromName,
    replyTo: input.replyTo
  };
}

function getQuantityLabel(lead: LeadRecord) {
  if (lead.brand === "Microsoft") {
    return "Users/Seats";
  }
  if (lead.brand === "Seqrite") {
    return "Endpoints";
  }
  return "Quantity";
}

export function buildInternalLeadTemplate(lead: LeadRecord): EmailTemplate {
  const subject = `[Lead ${lead.leadId}] ${lead.brand} • ${lead.category} • ${lead.tier}`;
  const rows: EmailRow[] = [
    { label: "Lead ID", value: lead.leadId },
    { label: "Created at", value: lead.createdAt },
    { label: "Brand", value: String(lead.brand) },
    { label: "Category", value: lead.category || "-" },
    { label: "Plan", value: lead.plan ?? lead.tier ?? "-" },
    { label: getQuantityLabel(lead), value: String(lead.qty || "-") },
    { label: "City", value: lead.city || "-" },
    { label: "Timeline", value: lead.timeline || "-" },
    { label: "Contact", value: `${lead.contactName} (${lead.company})` },
    { label: "Email", value: lead.email },
    { label: "Phone", value: lead.phone },
    { label: "Source", value: lead.sourcePage || "-" },
    { label: "UTM", value: [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ") || "-" }
  ];

  const rendered = renderBaseTemplate({
    title: "New RFQ received",
    intro: "A new lead has been captured from the website. Review and assign the lead in the admin console.",
    triggeredBy: "system",
    rows,
    ctaLabel: "Open Admin Leads",
    ctaUrl: absoluteUrl("/admin/leads"),
    fromName: "Conjoin Leads Desk",
    replyTo: LEADS_EMAIL
  });

  return {
    ...rendered,
    subject
  };
}

export function buildCustomerLeadTemplate(lead: LeadRecord): EmailTemplate {
  const subject = `We received your quote request - ${lead.brand} | Conjoin Leads Desk`;
  const whatsapp = getLeadWhatsAppLink({
    assignedTo: lead.assignedTo,
    message: buildQuoteMessage({
      brand: String(lead.brand),
      city: lead.city,
      requirement: lead.plan ?? lead.tier ?? lead.category,
      qty: lead.qty,
      timeline: lead.timeline ?? "This Week"
    })
  });
  const rows: EmailRow[] = [
    { label: "Lead ID", value: lead.leadId },
    { label: "Brand", value: String(lead.brand) },
    { label: "Product/Plan", value: lead.plan ?? lead.tier ?? lead.category ?? "-" },
    { label: getQuantityLabel(lead), value: String(lead.qty || "-") },
    { label: "City", value: lead.city || "-" },
    { label: "Timeline", value: lead.timeline || "-" }
  ];

  const rendered = renderBaseTemplate({
    title: "Quote request received",
    intro: "Thank you for your request. Our team will review your requirement and share a compliance-ready proposal.",
    triggeredBy: "user",
    rows,
    ctaLabel: "Continue on WhatsApp",
    ctaUrl: whatsapp,
    fromName: "Conjoin Leads Desk",
    replyTo: LEADS_EMAIL
  });

  return {
    ...rendered,
    subject
  };
}

export function buildSecurityVerificationTemplate(input: {
  title: string;
  actionUrl: string;
  triggeredBy: EmailTriggeredBy;
}): EmailTemplate {
  const rendered = renderBaseTemplate({
    title: input.title,
    intro: "Use the secure action link below to continue. This link is intended for a single account action.",
    triggeredBy: input.triggeredBy,
    rows: [{ label: "Support", value: SUPPORT_EMAIL }],
    ctaLabel: "Open Secure Link",
    ctaUrl: input.actionUrl,
    fromName: "Conjoin Security",
    replyTo: SUPPORT_EMAIL
  });

  return {
    ...rendered,
    subject: `${input.title} | Conjoin Security`
  };
}

export function buildAdminActionTemplate(input: {
  title: string;
  actionUrl: string;
}): EmailTemplate {
  const rendered = renderBaseTemplate({
    title: input.title,
    intro: "An administrator initiated an account-level action. Review the details and continue from the secure link.",
    triggeredBy: "admin",
    rows: [{ label: "Action", value: input.title }],
    ctaLabel: "Review Action",
    ctaUrl: input.actionUrl,
    fromName: "Conjoin Security",
    replyTo: SUPPORT_EMAIL
  });

  return {
    ...rendered,
    subject: `${input.title} | Conjoin Security`
  };
}

export function buildContactAcknowledgementTemplate(input: {
  name: string;
  requestTopic: string;
}): EmailTemplate {
  const rendered = renderBaseTemplate({
    title: "We received your message",
    intro: "Thank you for contacting Conjoin. A specialist will follow up during business hours.",
    triggeredBy: "user",
    rows: [
      { label: "Contact", value: input.name },
      { label: "Topic", value: input.requestTopic }
    ],
    ctaLabel: "Request Quote",
    ctaUrl: absoluteUrl("/request-quote"),
    fromName: "Conjoin Leads Desk",
    replyTo: LEADS_EMAIL
  });

  return {
    ...rendered,
    subject: `Contact request received | Conjoin Leads Desk`
  };
}
