export const CRM_HOSTNAME = "crm.conjoinnetwork.com";

function firstHeaderValue(value: string) {
  return value.split(",")[0]?.trim() ?? "";
}

export function normalizeHost(host?: string | null) {
  if (!host) {
    return "";
  }

  const normalized = firstHeaderValue(host).toLowerCase();
  const withoutPort = normalized.split(":")[0]?.trim() ?? "";
  return withoutPort;
}

export function isCrmHost(host?: string | null) {
  return normalizeHost(host) === CRM_HOSTNAME;
}
