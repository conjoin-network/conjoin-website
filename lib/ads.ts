export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-17956533755";
export const ADS_CONVERSION_PLACEHOLDER_LABEL = "REPLACE_LATER";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function getAdsSendTo(label = ADS_CONVERSION_PLACEHOLDER_LABEL) {
  if (!ADS_ID) {
    return "";
  }
  return `${ADS_ID}/${label}`;
}

export function trackAdsConversion(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params ?? {});
}
