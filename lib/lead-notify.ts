const DEFAULT_LEAD_NOTIFY_LOCAL_PARTS = ["manod", "prabhjyot", "zeena"] as const;
const DEFAULT_LEAD_NOTIFY_DOMAIN = "conjoinnetwork.com";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value);
}

export function resolveLeadNotifyRecipients() {
  const envValue = process.env.LEAD_NOTIFY_TO ?? "";
  const parsed = envValue
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(Boolean)
    .filter((item) => isValidEmail(item));

  const unique = [...new Set(parsed)];
  if (unique.length > 0) {
    return unique;
  }

  return DEFAULT_LEAD_NOTIFY_LOCAL_PARTS.map((localPart) => `${localPart}@${DEFAULT_LEAD_NOTIFY_DOMAIN}`);
}

export function isCustomerConfirmationEnabled() {
  return (process.env.LEAD_CUSTOMER_CONFIRMATION_ENABLED ?? "true").trim().toLowerCase() !== "false";
}

export function toLeadFieldValue(value: unknown): string {
  if (value === undefined) {
    return "";
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
