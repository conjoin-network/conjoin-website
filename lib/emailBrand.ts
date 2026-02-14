import { absoluteUrl } from "@/lib/seo";

export type EmailTriggeredBy = "user" | "admin" | "system";

export const EMAIL_BRAND = {
  brandName: "Conjoin Network",
  logoPath: "/brand/conjoin-logo.png",
  colors: {
    primary: "#2563eb",
    text: "#0f172a",
    muted: "#64748b",
    surface: "#f8fafc",
    border: "#e2e8f0"
  }
} as const;

export function getEmailLogoUrl() {
  return absoluteUrl(EMAIL_BRAND.logoPath);
}

export function getRoleContextMessage(triggeredBy: EmailTriggeredBy) {
  if (triggeredBy === "user") {
    return "Sent for your account access / verification.";
  }
  if (triggeredBy === "admin") {
    return "This was initiated by your organization administrator.";
  }
  return "This was generated automatically by the Conjoin operations workflow.";
}

export const EMAIL_SECURITY_LINE = "If you didn't request this, ignore this email or contact Support.";
