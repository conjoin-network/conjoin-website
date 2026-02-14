import nodemailer from "nodemailer";
import { LEADS_EMAIL, SALES_EMAIL } from "@/lib/contact";
import { buildCustomerLeadTemplate, buildInternalLeadTemplate } from "@/lib/emailTemplates";
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

  const fromAddress = process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || SALES_EMAIL;
  const primary = process.env.LEADS_EMAIL ?? LEADS_EMAIL;
  const recipients = primary;

  const internal = buildInternalLeadTemplate(lead);

  await transporter.sendMail({
    from: `"${internal.fromName}" <${fromAddress}>`,
    replyTo: internal.replyTo,
    to: recipients,
    subject: internal.subject,
    text: internal.text,
    html: internal.html
  });

  const customer = buildCustomerLeadTemplate(lead);
  try {
    await transporter.sendMail({
      from: `"${customer.fromName}" <${fromAddress}>`,
      replyTo: customer.replyTo,
      to: lead.email,
      subject: customer.subject,
      text: customer.text,
      html: customer.html
    });
  } catch (error) {
    console.error("Customer confirmation email failed", error instanceof Error ? error.message : "Unknown error");
  }

  return { sent: true };
}
