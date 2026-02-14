import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

export type CampaignQuery = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function copyQuery(params: CampaignQuery) {
  const query = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    const value = firstValue(raw).trim();
    if (value) {
      query.set(key, value);
    }
  }
  return query;
}

export function buildCampaignQuoteHref(
  params: CampaignQuery,
  input: {
    brand: string;
    source: string;
    utmSourceDefault: string;
  }
) {
  const query = copyQuery(params);
  query.set("brand", input.brand);
  query.set("source", input.source);

  if (!query.has("utm_source")) {
    query.set("utm_source", input.utmSourceDefault);
  }

  return `/request-quote?${query.toString()}`;
}

export function buildCampaignWhatsAppHref(
  params: CampaignQuery,
  input: {
    brand: string;
    requirement: string;
  }
) {
  const city = firstValue(params.city).trim() || "Chandigarh";
  return getWhatsAppLink(
    buildQuoteMessage({
      brand: input.brand,
      city,
      requirement: input.requirement
    })
  );
}

