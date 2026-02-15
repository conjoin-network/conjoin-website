export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function canTrack() {
  return Boolean(GA_ID && typeof window !== "undefined" && typeof window.gtag === "function");
}

export function pageview(url: string) {
  if (!canTrack()) {
    return;
  }

  window.gtag?.("event", "page_view", {
    page_path: url,
    page_location: `${window.location.origin}${url}`
  });
}

export function event(name: string, params?: Record<string, unknown>) {
  if (!canTrack()) {
    return;
  }

  window.gtag?.("event", name, params ?? {});
}
