import { event as trackGaEvent } from "@/lib/ga";

export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-17956533755";
export const ADS_CONVERSION_LABEL = "gN4jCKrqhPsbEPvq_JC";

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

export function trackAdsConversion(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  const payload = params ?? {};
  pushDataLayerEvent(eventName, payload);
  window.gtag("event", eventName, payload);

  if (eventName === "quote_submit") {
    trackGaEvent("generate_lead", {
      form_name: "request_quote_wizard",
      lead_type: "quote",
      page_path: typeof payload.page_path === "string" ? payload.page_path : window.location.pathname,
      method: payload.method ?? "form",
      brand: payload.brand ?? undefined,
      category: payload.category ?? undefined,
      plan: payload.plan ?? undefined,
      value: payload.value ?? 1,
      currency: "INR"
    });
  }
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
