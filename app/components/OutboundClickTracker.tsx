"use client";

import { useEffect } from "react";
import { trackAdsConversion } from "@/lib/ads";

function getHref(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return "";
  }
  const anchor = target.closest("a");
  if (!anchor) {
    return "";
  }
  if (anchor.getAttribute("data-ads-tracked") === "1") {
    return "";
  }
  return anchor.getAttribute("href") || "";
}

function isRequestQuoteHref(href: string) {
  if (href.startsWith("/request-quote")) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  try {
    const parsed = new URL(href, window.location.origin);
    return parsed.pathname === "/request-quote";
  } catch {
    return false;
  }
}

export default function OutboundClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const href = getHref(event.target);
      if (!href) {
        return;
      }

      const pagePath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : undefined;

      if (href.startsWith("tel:")) {
        trackAdsConversion("call_click", { value: 1, link_url: href, page_path: pagePath });
        return;
      }

      if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
        trackAdsConversion("whatsapp_click", { value: 1, link_url: href, page_path: pagePath });
        return;
      }

      if (isRequestQuoteHref(href)) {
        trackAdsConversion("request_quote_click", {
          value: 1,
          link_url: href,
          page_path: pagePath
        });
      }
    };

    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
