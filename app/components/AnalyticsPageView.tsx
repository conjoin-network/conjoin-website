"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type AnalyticsPageViewProps = {
  ga4Id?: string;
  adsId?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function AnalyticsPageView({ ga4Id, adsId }: AnalyticsPageViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }
    const query = searchParams?.toString() ?? "";
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (ga4Id) {
      window.gtag("config", ga4Id, { page_path: pagePath });
    }
    if (adsId) {
      window.gtag("event", "page_view", { send_to: adsId, page_path: pagePath });
    }
  }, [adsId, ga4Id, pathname, searchParams]);

  return null;
}
