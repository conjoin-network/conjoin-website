"use client";

import { useEffect } from "react";
import { trackAdsConversionOncePerSession } from "@/lib/ads";

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
        trackAdsConversionOncePerSession(
          "call_click",
          { value: 1, link_url: href, page_path: pagePath },
          "call_click"
        );
        return;
      }

      if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
        trackAdsConversionOncePerSession(
          "whatsapp_click",
          { value: 1, link_url: href, page_path: pagePath },
          "whatsapp_click"
        );
        return;
      }

      if (isRequestQuoteHref(href)) {
        trackAdsConversionOncePerSession(
          "request_quote_click",
          {
            value: 1,
            link_url: href,
            page_path: pagePath
          },
          "request_quote_click"
        );
      }
    };

    const onScroll = () => {
      if (typeof window === "undefined") {
        return;
      }
      const root = document.documentElement;
      const maxScrollable = Math.max(root.scrollHeight - window.innerHeight, 0);
      if (maxScrollable <= 0) {
        return;
      }
      const depth = window.scrollY / maxScrollable;
      if (depth >= 0.5) {
        const pagePath = `${window.location.pathname}${window.location.search}`;
        trackAdsConversionOncePerSession("scroll_50", { value: 50, page_path: pagePath }, "scroll_50");
      }
    };

    document.addEventListener("click", onClick, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
