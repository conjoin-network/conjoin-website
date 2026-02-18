export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || "G-QEC3H4JS1Y";

export const isGAEnabled = Boolean(GA_ID);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function hasGtag() {
  return typeof window !== "undefined" && typeof window.gtag === "function" && Boolean(GA_ID);
}

function isDebugMode() {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get("ga_debug") === "1" || params.get("gtag_debug") === "1";
}

export function event(name: string, params?: Record<string, unknown>) {
  if (!hasGtag()) {
    return;
  }

  window.gtag!("event", name, {
    ...(params ?? {}),
    send_to: GA_ID,
    ...(isDebugMode() ? { debug_mode: true } : {})
  });
}

export function pageview(url: string) {
  if (!hasGtag()) {
    return;
  }

  window.gtag!("event", "page_view", {
    page_path: url,
    page_location: typeof window !== "undefined" ? window.location.href : undefined,
    page_title: typeof document !== "undefined" ? document.title : undefined,
    send_to: GA_ID,
    ...(isDebugMode() ? { debug_mode: true } : {})
  });
}
