"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { trackAdsConversionOncePerSession } from "@/lib/ads";
import { SALES_PHONE_NUMBER, tel } from "@/lib/contact";

export default function FloatingCallButton() {
  const pathname = usePathname() ?? "/";
  const hiddenByPath = pathname.startsWith("/admin") || pathname.startsWith("/api");
  const isFormRoute = pathname.startsWith("/request-quote");
  const [nearFooter, setNearFooter] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(900);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight, { passive: true });
    window.addEventListener("orientationchange", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setNearFooter(entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const isShortViewport = viewportHeight < 720;
  const bottomOffset = useMemo(() => {
    let next = isFormRoute ? (isShortViewport ? 124 : 108) : (isShortViewport ? 28 : 20);
    if (nearFooter) {
      next = Math.max(next, isShortViewport ? 126 : 106);
    }
    return next;
  }, [isFormRoute, isShortViewport, nearFooter]);

  if (hiddenByPath) {
    return null;
  }

  const href = tel(SALES_PHONE_NUMBER);

  return (
    <a
      href={href}
      aria-label="Call Sales"
      data-ads-tracked="1"
      onClick={() =>
        trackAdsConversionOncePerSession(
          "call_click",
          {
            value: 1,
            page_path: pathname,
            link_url: href
          },
          "call_click"
        )
      }
      className={`floating-call interactive-btn fixed z-[59] inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-all duration-200 ${nearFooter ? "is-near-footer" : ""}`}
      style={{ "--floating-bottom-offset": `${bottomOffset}px` } as CSSProperties}
    >
      Call Now
    </a>
  );
}
