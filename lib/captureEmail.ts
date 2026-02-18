import nodemailer from 'nodemailer';
import { SALES_EMAIL } from '@/lib/contact';
import {
  isCustomerConfirmationEnabled,
  resolveLeadNotifyRecipients,
  toLeadFieldValue
} from '@/lib/lead-notify';

function getTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? '587');
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;
  const secureFromEnv = (process.env.SMTP_SECURE ?? "").trim().toLowerCase();
  const secure = secureFromEnv ? secureFromEnv === "true" || secureFromEnv === "1" : port === 465;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function sendCaptureAlert(payload: Record<string, unknown>) {
  const transporter = getTransport();
  const recipients = resolveLeadNotifyRecipients();
  const leadId = String(payload.rfqId ?? payload.leadId ?? payload.id ?? `RFQ-${Date.now()}`);
  const subjectName = String(payload.name ?? payload.company ?? "Website Lead").slice(0, 100);
  const subjectScope = String(payload.brand ?? payload.category ?? payload.requirement ?? "General Requirement").slice(0, 80);
  const subjectCity = String(payload.city ?? "-").slice(0, 60);
  const subject = `New Lead: ${subjectName} | ${subjectScope} | ${subjectCity}`;
  const fromAddress =
    process.env.SMTP_FROM?.trim() || process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || SALES_EMAIL;

  const fieldLines = Object.entries(payload).map(([key, value]) => `${key}: ${toLeadFieldValue(value)}`);
  const text = [
    `RFQ ID: ${leadId}`,
    `Received At: ${new Date().toISOString()}`,
    ...fieldLines
  ].join('\n');

  if (!transporter) {
    console.warn(
      "CAPTURE_EMAIL_NOT_CONFIGURED",
      JSON.stringify({ leadId, recipientsCount: recipients.length, message: "SMTP transport unavailable." })
    );
    return { ok: false, reason: 'SMTP not configured' };
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: recipients.join(", "),
      subject,
      text
    });
    console.info("CAPTURE_EMAIL_SENT", JSON.stringify({ leadId, recipientsCount: recipients.length }));
  } catch (err) {
    console.error(
      "CAPTURE_EMAIL_SEND_FAILED",
      JSON.stringify({ leadId, recipientsCount: recipients.length, error: err instanceof Error ? err.message : String(err) })
    );
    return { ok: false, reason: 'send_failed' };
  }

  const customerEmail = typeof payload.email === "string" ? payload.email.trim() : "";
  if (customerEmail && isCustomerConfirmationEnabled()) {
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: customerEmail,
        subject: `We received your request (${leadId})`,
        text: `We received your request.\nRFQ ID: ${leadId}\nOur team will contact you shortly.`
      });
    } catch (error) {
      console.warn(
        "CAPTURE_EMAIL_CUSTOMER_CONFIRMATION_FAILED",
        JSON.stringify({ leadId, error: error instanceof Error ? error.message : String(error) })
      );
    }
  }

  return { ok: true };
}
