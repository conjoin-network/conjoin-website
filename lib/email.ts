import nodemailer from "nodemailer";
import { LEADS_EMAIL, SALES_EMAIL } from "@/lib/contact";
import type { LeadRecord } from "@/lib/leads";

function getConfiguredTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendLeadNotification(lead: LeadRecord) {
  const transporter = getConfiguredTransport();
  if (!transporter) {
    return { sent: false, reason: "SMTP not configured" };
  }

  const from = process.env.MAIL_FROM ?? process.env.SMTP_USER ?? SALES_EMAIL;
  const primary = process.env.LEADS_EMAIL ?? LEADS_EMAIL;
  const recipients = primary;

  const subject = `[Lead ${lead.leadId}] ${lead.brand} • ${lead.category} • ${lead.tier}`;
  const text = [
    `Lead ID: ${lead.leadId}`,
    `Status: ${lead.status}`,
    `Timestamp: ${lead.createdAt}`,
    "",
    `Brand: ${lead.brand}`,
    `Category: ${lead.category}`,
    `Tier: ${lead.tier}`,
    `Plan: ${lead.plan ?? lead.tier}`,
    `Quantity: ${lead.qty}`,
    `Users/Seats: ${lead.usersSeats ?? "-"}`,
    `Endpoints: ${lead.endpoints ?? "-"}`,
    `Servers: ${lead.servers ?? "-"}`,
    `Cisco Users: ${lead.ciscoUsers ?? "-"}`,
    `Sites/Locations: ${lead.ciscoSites ?? "-"}`,
    `Budget Range: ${lead.budgetRange ?? "-"}`,
    `Other Brand: ${lead.otherBrand ?? "-"}`,
    `Add-ons: ${lead.addons?.join(", ") || "-"}`,
    `City: ${lead.city}`,
    `Timeline: ${lead.timeline ?? "-"}`,
    `Source Page: ${lead.sourcePage}`,
    `UTM Source: ${lead.utmSource ?? "-"}`,
    `UTM Campaign: ${lead.utmCampaign ?? "-"}`,
    `UTM Medium: ${lead.utmMedium ?? "-"}`,
    `Page Path: ${lead.pagePath ?? "-"}`,
    `Referrer: ${lead.referrer ?? "-"}`,
    "",
    `Contact: ${lead.contactName}`,
    `Company: ${lead.company}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    "",
    `Notes: ${lead.notes || "-"}`
  ].join("\n");

  await transporter.sendMail({
    from,
    to: recipients,
    subject,
    text
  });

  return { sent: true };
}
