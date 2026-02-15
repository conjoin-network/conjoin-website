"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { event, pageview } from "@/lib/ga";

export default function AnalyticsRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const currentPathname = pathname || "/";
    const query = typeof window !== "undefined" ? window.location.search : "";
    pageview(query ? `${currentPathname}${query}` : currentPathname);
  }, [pathname]);

  useEffect(() => {
    function onDocumentClick(mouseEvent: MouseEvent) {
      const target = mouseEvent.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const link = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!link) {
        return;
      }

      const href = link.getAttribute("href") || "";
      if (!href.startsWith("tel:")) {
        return;
      }

      event("phone_click", {
        page_path: `${window.location.pathname}${window.location.search}`
      });
    }

    document.addEventListener("click", onDocumentClick, true);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, []);

  return null;
}
