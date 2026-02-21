export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
  process.env.NEXT_PUBLIC_GA_ID?.trim() ||
  "G-QEC3H4JS1Y";
export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-17956533755";
export const ADS_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() || "gN4jCKrqhPsbEPvq_JC";
const TRACKING_DEBUG_FLAG = process.env.NEXT_PUBLIC_TRACKING_DEBUG === "1";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function getAdsSendTo(label = ADS_CONVERSION_LABEL) {
  if (!ADS_ID) {
    return "";
  }
  return `${ADS_ID}/${label}`;
}

function shouldDebugTracking() {
  if (typeof window === "undefined") {
    return false;
  }
  return TRACKING_DEBUG_FLAG || process.env.NODE_ENV !== "production";
}

function debugTracking(eventName: string, params?: Record<string, unknown>) {
  if (!shouldDebugTracking()) {
    return;
  }

  console.info("[tracking:event]", eventName, params ?? {});
}

function normalizeEventName(eventName: string) {
  if (eventName === "phone_click") {
    return "call_click";
  }
  return eventName;
}

export function trackAdsConversion(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedEventName = normalizeEventName(eventName);
  const payload = params ?? {};
  pushDataLayerEvent(normalizedEventName, payload);
  if (typeof window.gtag === "function") {
    window.gtag("event", normalizedEventName, payload);
  }
  debugTracking(normalizedEventName, payload);
}

export function pushDataLayerEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = [];
  }

  window.dataLayer.push({
    event: eventName,
    ...(params ?? {})
  });
}

type LeadConversionInput = {
  leadId?: string;
  pagePath: string;
  formSource: string;
  city?: string;
  leadType?: string;
};

export function trackLeadConversion(input: LeadConversionInput) {
  const payload = {
    lead_id: input.leadId || undefined,
    page_path: input.pagePath,
    form_source: input.formSource,
    lead_type: input.leadType || input.formSource,
    city: input.city || undefined,
    value: 1,
    currency: "INR"
  };

  trackAdsConversion("generate_lead", payload);

  // Prevent double-counting when Google Ads imports GA4 key events by default.
  if (process.env.NEXT_PUBLIC_ADS_CONVERSION_MODE === "direct" && getAdsSendTo()) {
    const conversionPayload = {
      send_to: getAdsSendTo(),
      value: 1,
      currency: "INR",
      transaction_id: input.leadId || undefined
    };
    pushDataLayerEvent("ads_conversion", conversionPayload);
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", conversionPayload);
    }
    debugTracking("conversion", conversionPayload);
  }

}
