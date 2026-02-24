"use client";

import { useEffect } from "react";
import { trackAdsConversionOncePerSession } from "@/lib/ads";

function getAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }
  const anchor = target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) {
    return null;
  }
  return anchor;
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

function inferQuoteContext(pathname: string) {
  const path = pathname.toLowerCase();
  if (path.includes("/microsoft-365-chandigarh")) {
    return { formSource: "microsoft365-page", brand: "Microsoft", category: "Microsoft 365" };
  }
  if (path.includes("/seqrite-chandigarh")) {
    return { formSource: "seqrite-page", brand: "Seqrite", category: "Endpoint Security" };
  }
  if (path.includes("/contact")) {
    return { formSource: "contact-page", brand: "Other", category: "General IT Requirement" };
  }
  if (path.includes("/request-quote")) {
    return { formSource: "request-quote", brand: "Other", category: "General IT Requirement" };
  }
  return { formSource: "nav", brand: "Other", category: "General IT Requirement" };
}

function applyQuotePrefill(anchor: HTMLAnchorElement) {
  if (typeof window === "undefined") {
    return;
  }

  const href = anchor.getAttribute("href") || "";
  if (!isRequestQuoteHref(href)) {
    return;
  }

  try {
    const url = new URL(href, window.location.origin);
    const context = inferQuoteContext(window.location.pathname);
    if (!url.searchParams.get("formSource")) {
      url.searchParams.set("formSource", context.formSource);
    }
    if (!url.searchParams.get("brand")) {
      url.searchParams.set("brand", context.brand);
    }
    if (!url.searchParams.get("category")) {
      url.searchParams.set("category", context.category);
    }
    if (!url.searchParams.get("city")) {
      url.searchParams.set("city", "Chandigarh");
    }
    if (!url.searchParams.get("landingPath")) {
      url.searchParams.set("landingPath", window.location.pathname);
    }
    anchor.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // no-op
  }
}

export default function OutboundClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = getAnchor(event.target);
      if (!anchor) {
        return;
      }
      applyQuotePrefill(anchor);

      const href = anchor.getAttribute("href") || "";
      if (!href || anchor.getAttribute("data-ads-tracked") === "1") {
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
