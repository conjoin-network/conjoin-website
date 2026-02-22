export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
  process.env.NEXT_PUBLIC_GA_ID?.trim() ||
  "G-QEC3H4JS1Y";
export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-17956533755";
export const ADS_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() || "gN4jCKrqhPsbEPvq_JC";
const TRACKING_DEBUG_FLAG = process.env.NEXT_PUBLIC_TRACKING_DEBUG === "1";
const SESSION_EVENT_PREFIX = "conjoin_event_once:";
const memoryEventDedupe = new Set<string>();
const SERVER_TRACKED_EVENTS = new Set([
  "form_start",
  "form_submit_success",
  "whatsapp_click",
  "call_click",
  "request_quote_click"
]);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export type TrackingEventPayload = {
  name: string;
  params: Record<string, unknown>;
  timestamp: number;
};

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

function dispatchTrackingEvent(payload: TrackingEventPayload) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent("conjoin:tracking-event", { detail: payload }));
}

function getAttributionFromUrl() {
  if (typeof window === "undefined") {
    return {};
  }
  const params = new URLSearchParams(window.location.search);
  return {
    gclid: params.get("gclid") ?? undefined,
    utm_source: params.get("utm_source") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_term: params.get("utm_term") ?? undefined,
    utm_content: params.get("utm_content") ?? undefined
  };
}

function trackServerEvent(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || !SERVER_TRACKED_EVENTS.has(eventName)) {
    return;
  }

  const body = JSON.stringify({
    event: eventName,
    pagePath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : undefined,
    ...getAttributionFromUrl(),
    ...params
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/track/event", blob);
      if (sent) {
        return;
      }
    }
  } catch {
    // noop: fallback to fetch below
  }

  void fetch("/api/track/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => undefined);
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
  trackServerEvent(normalizedEventName, payload);
  dispatchTrackingEvent({
    name: normalizedEventName,
    params: payload,
    timestamp: Date.now()
  });
  debugTracking(normalizedEventName, payload);
}

function markEventOncePerSession(key: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    if (window.sessionStorage.getItem(key) === "1") {
      return false;
    }
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    if (memoryEventDedupe.has(key)) {
      return false;
    }
    memoryEventDedupe.add(key);
    return true;
  }
}

export function trackAdsConversionOncePerSession(
  eventName: string,
  params?: Record<string, unknown>,
  scopeKey?: string
) {
  const dedupeKey = `${SESSION_EVENT_PREFIX}${scopeKey ?? normalizeEventName(eventName)}`;
  if (!markEventOncePerSession(dedupeKey)) {
    return;
  }
  trackAdsConversion(eventName, params);
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

  trackAdsConversionOncePerSession("form_submit_success", payload, "form_submit_success");
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
