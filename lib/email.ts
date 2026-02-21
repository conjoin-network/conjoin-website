import nodemailer from "nodemailer";
import { LEADS_EMAIL, SALES_EMAIL } from "@/lib/contact";
import { buildCustomerLeadTemplate, buildInternalLeadTemplate } from "@/lib/emailTemplates";
import { isCustomerConfirmationEnabled, resolveLeadNotifyRecipients } from "@/lib/lead-notify";
import type { LeadRecord } from "@/lib/leads";
import { getAgentNotificationEmail } from "@/lib/agents";

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
    if (process.env.NODE_ENV !== "production") {
      console.warn("EMAIL_NOT_CONFIGURED", JSON.stringify({ leadId: lead.leadId, destination: process.env.LEADS_EMAIL ?? LEADS_EMAIL }));
    }
    return { sent: false, reason: "SMTP not configured" };
  }

  const fromAddress = process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || SALES_EMAIL;
  const primary = process.env.LEADS_EMAIL?.trim() || LEADS_EMAIL;
  const recipients = resolveLeadNotifyRecipients();
  if (!recipients.includes(primary)) {
    recipients.unshift(primary);
  }

  const internal = buildInternalLeadTemplate(lead);
  try {
    await transporter.sendMail({
      from: `"${internal.fromName}" <${fromAddress}>`,
      replyTo: internal.replyTo,
      to: recipients.join(", "),
      subject: internal.subject,
      text: internal.text,
      html: internal.html
    });
    console.info(
      "LEAD_EMAIL_SENT",
      JSON.stringify({ leadId: lead.leadId, recipientsCount: recipients.length })
    );
  } catch (error) {
    console.error("LEAD_EMAIL_SEND_FAILED", error instanceof Error ? error.message : "Unknown email error");
    return { sent: false, reason: "Email provider unavailable" };
  }

  const assignedEmail = getAgentNotificationEmail(lead.assignedTo);
  if (assignedEmail && !recipients.includes(assignedEmail)) {
    try {
      await transporter.sendMail({
        from: `"${internal.fromName}" <${fromAddress}>`,
        replyTo: internal.replyTo,
        to: assignedEmail,
        subject: `[Assigned] ${internal.subject}`,
        text: [
          `Assigned to: ${lead.assignedTo ?? "Unassigned"}`,
          `Lead ID: ${lead.leadId}`,
          "",
          internal.text
        ].join("\n"),
        html: `${internal.html}<p style="font-size:12px;color:#64748b;">Assigned to: ${lead.assignedTo ?? "Unassigned"}</p>`
      });
      console.info("LEAD_ASSIGNEE_EMAIL_SENT", JSON.stringify({ leadId: lead.leadId, assignee: lead.assignedTo, to: assignedEmail }));
    } catch (error) {
      console.warn(
        "LEAD_ASSIGNEE_EMAIL_FAILED",
        JSON.stringify({ leadId: lead.leadId, assignee: lead.assignedTo, message: error instanceof Error ? error.message : String(error) })
      );
    }
  }

  const sendCustomerConfirmation = isCustomerConfirmationEnabled();
  if (!sendCustomerConfirmation || !lead.email) {
    return { sent: true };
  }

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
