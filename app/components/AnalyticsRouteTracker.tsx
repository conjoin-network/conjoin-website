"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isGAEnabled, pageview } from "@/lib/ga";

export default function AnalyticsRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isGAEnabled || !pathname) {
      return;
    }

    const search = typeof window !== "undefined" ? window.location.search : "";
    const url = search ? `${pathname}${search}` : pathname;
    pageview(url);
  }, [pathname]);

  return null;
}
