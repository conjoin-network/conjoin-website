"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import AdsTrackedLink from "@/app/components/AdsTrackedLink";
import { buildEstimatorQuoteHref, defaultEstimatorService } from "@/lib/estimator";
import { SALES_PHONE_NUMBER, tel } from "@/lib/contact";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

function inferBrandFromPath(pathname: string) {
  if (pathname.includes("microsoft")) return "Microsoft 365";
  if (pathname.includes("seqrite")) return "Seqrite";
  if (pathname.includes("cisco")) return "Cisco";
  return "IT Solutions";
}

export default function MobileBottomCtaBar() {
  const pathname = usePathname() ?? "/";
  const hiddenByPath = pathname.startsWith("/admin") || pathname.startsWith("/api");

  const requestQuoteHref = useMemo(
    () =>
      buildEstimatorQuoteHref({
        service: defaultEstimatorService(pathname),
        source: "mobile-bottom-cta"
      }),
    [pathname]
  );

  const whatsappHref = useMemo(
    () =>
      getWhatsAppLink(
        buildQuoteMessage({
          brand: inferBrandFromPath(pathname),
          city: "Chandigarh",
          requirement: "Quick quote support"
        })
      ),
    [pathname]
  );

  if (hiddenByPath) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,black_6%)] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2 shadow-[0_-10px_24px_rgba(2,6,23,0.35)] lg:hidden">
      <div className="grid grid-cols-3 gap-2">
        <AdsTrackedLink
          href={whatsappHref}
          eventName="whatsapp_click"
          target="_blank"
          rel="noreferrer"
          className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--brand-whatsapp)] px-2 text-xs font-semibold text-white"
        >
          WhatsApp
        </AdsTrackedLink>
        <AdsTrackedLink
          href={tel(SALES_PHONE_NUMBER)}
          eventName="call_click"
          className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-2 text-xs font-semibold text-white"
        >
          Call
        </AdsTrackedLink>
        <AdsTrackedLink
          href={requestQuoteHref}
          eventName="request_quote_click"
          className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-alt-bg)] px-2 text-xs font-semibold text-[var(--color-text-primary)]"
        >
          Request Quote
        </AdsTrackedLink>
      </div>
    </div>
  );
}
