export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-17956533755";
export const ADS_CONVERSION_LABEL = "gN4jCKrqhPsbEPvq_JC";
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
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  const normalizedEventName = normalizeEventName(eventName);
  const payload = params ?? {};
  pushDataLayerEvent(normalizedEventName, payload);
  window.gtag("event", normalizedEventName, payload);
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
