"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { event as trackEvent } from "@/lib/ga";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

function inferBrand(pathname: string) {
  if (pathname.includes("microsoft")) {
    return "Microsoft";
  }
  if (pathname.includes("seqrite")) {
    return "Seqrite";
  }
  if (pathname.includes("cisco")) {
    return "Cisco";
  }
  return "IT solutions";
}

function inferCity(pathname: string) {
  if (pathname.startsWith("/locations/")) {
    const slug = pathname.split("/")[2] ?? "";
    if (slug) {
      return slug.replace(/-/g, " ");
    }
  }
  return "Chandigarh";
}

export default function FloatingWhatsApp() {
  const pathname = usePathname() ?? "/";
  const [nearFooter, setNearFooter] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(900);
  const hiddenByPath = pathname.startsWith("/admin") || pathname.startsWith("/api");
  const isFormRoute = pathname.startsWith("/request-quote");

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
      {
        rootMargin: "0px 0px 200px 0px",
        threshold: 0
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const brand = inferBrand(pathname);
  const city = inferCity(pathname);
  const requirement = pathname.startsWith("/products/") ? "Product advisory" : "Quote support";
  const href = getWhatsAppLink(buildQuoteMessage({ brand, city, requirement }));
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

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      onClick={() =>
        trackEvent("whatsapp_click", {
          page_path: pathname
        })
      }
      className={`floating-whatsapp interactive-btn fixed z-[60] inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-whatsapp)] px-4 text-sm font-semibold text-white transition-all duration-200 ${isFormRoute ? "is-form-route" : ""} ${nearFooter ? "is-near-footer" : ""}`}
      style={{ "--floating-bottom-offset": `${bottomOffset}px` } as CSSProperties}
    >
      WhatsApp
    </a>
  );
}
