import {
  COVERAGE,
  ORG_NAME,
  PHONE_1,
  PHONE_2,
  SALES_EMAIL,
  SUPPORT_EMAIL,
  ADDRESS_LINES
} from "@/lib/contact";

export const EMAIL_SIGNATURE = {
  companyName: ORG_NAME,
  salesEmail: SALES_EMAIL,
  supportEmail: SUPPORT_EMAIL,
  phonePrimary: PHONE_1,
  phoneSecondary: PHONE_2,
  address: ADDRESS_LINES,
  coverageLine: `${COVERAGE.join(" • ")} • Canada remote support`
} as const;

export function getEmailSignatureHtml() {
  return `
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;font-family:Arial,sans-serif;color:#475569;font-size:13px;line-height:1.55;">
      <p style="margin:0 0 6px 0;font-weight:600;color:#0f172a;">${EMAIL_SIGNATURE.companyName}</p>
      <p style="margin:0;">${EMAIL_SIGNATURE.address.join(", ")}</p>
      <p style="margin:6px 0 0 0;">Sales: <a href="mailto:${EMAIL_SIGNATURE.salesEmail}" style="color:#2563eb;text-decoration:none;">${EMAIL_SIGNATURE.salesEmail}</a></p>
      <p style="margin:2px 0 0 0;">Support: <a href="mailto:${EMAIL_SIGNATURE.supportEmail}" style="color:#2563eb;text-decoration:none;">${EMAIL_SIGNATURE.supportEmail}</a></p>
      <p style="margin:2px 0 0 0;">Phone: ${EMAIL_SIGNATURE.phonePrimary}, ${EMAIL_SIGNATURE.phoneSecondary}</p>
      <p style="margin:8px 0 0 0;color:#64748b;">Coverage: ${EMAIL_SIGNATURE.coverageLine}</p>
    </div>
  `.trim();
}

export function getEmailSignatureText() {
  return [
    EMAIL_SIGNATURE.companyName,
    EMAIL_SIGNATURE.address.join(", "),
    `Sales: ${EMAIL_SIGNATURE.salesEmail}`,
    `Support: ${EMAIL_SIGNATURE.supportEmail}`,
    `Phone: ${EMAIL_SIGNATURE.phonePrimary}, ${EMAIL_SIGNATURE.phoneSecondary}`,
    `Coverage: ${EMAIL_SIGNATURE.coverageLine}`
  ].join("\n");
}
