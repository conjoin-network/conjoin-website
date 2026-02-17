import nodemailer from 'nodemailer';

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

export async function sendCaptureAlert(payload: Record<string, unknown>) {
  // temporary console log for payload verification in production (sanitized)
  try {
    console.info('SEND_CAPTURE_ALERT_PAYLOAD', JSON.stringify({ name: payload.name ?? null, email: payload.email ?? null, phone: payload.phone ?? null, city: payload.city ?? null }));
  } catch {}
  const transporter = getTransport();
  const primary = process.env.SMTP_TO || process.env.LEADS_EMAIL || 'sales@conjoinnetwork.com';
  const extra = process.env.SMTP_TO_EXTRA || 'manod1326@gmail.com';
  if (!transporter) {
    console.warn('CAPTURE_EMAIL_NOT_CONFIGURED', JSON.stringify({ to: primary, payloadSummary: { name: payload.name ?? null } }));
    return { ok: false, reason: 'SMTP not configured' };
  }

  const subject = `[NEW LEAD] ${String(payload.company ?? payload.name ?? '').slice(0,100)} - ${String(payload.city ?? '').slice(0,60)} - ${String(payload.timeline ?? '')}`;

  const lines: string[] = [];
  lines.push('New lead captured at ' + new Date().toISOString());
  for (const [k, v] of Object.entries(payload)) {
    lines.push(`${k}: ${String(v ?? '')}`);
  }

  const text = lines.join('\n');

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.SMTP_USER,
      to: primary,
      cc: extra,
      subject,
      text
    });
  } catch (err) {
    console.error('CAPTURE_EMAIL_SEND_FAILED', err instanceof Error ? err.message : err);
    return { ok: false, reason: 'send_failed' };
  }

  return { ok: true };
}
