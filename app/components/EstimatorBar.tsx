"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import AdsTrackedLink from "@/app/components/AdsTrackedLink";
import { SALES_PHONE_NUMBER, tel } from "@/lib/contact";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

type ServiceOption = "Microsoft 365" | "Seqrite" | "Cisco" | "Networking" | "Security" | "Other";

const SERVICE_OPTIONS: ServiceOption[] = ["Microsoft 365", "Seqrite", "Cisco", "Networking", "Security", "Other"];
const M365_PLANS = ["Business Basic", "Business Standard", "Business Premium", "E3", "E5"] as const;
const SEQRITE_QTY = ["25", "50", "100", "250", "500"] as const;
const MICROCOPY = [
  "GeM/PSU/Bank procurement support • Quote in 15 mins",
  "GST invoice • Partner-safe billing",
  "Enterprise SLA support available"
] as const;

function defaultServiceForPath(pathname: string): ServiceOption {
  if (pathname.includes("/microsoft-365-chandigarh")) {
    return "Microsoft 365";
  }
  if (pathname.includes("/seqrite-chandigarh")) {
    return "Seqrite";
  }
  return "Other";
}

function serviceToBrand(service: ServiceOption) {
  if (service === "Microsoft 365") return "Microsoft";
  if (service === "Seqrite") return "Seqrite";
  if (service === "Cisco") return "Cisco";
  return "Other";
}

export default function EstimatorBar() {
  const pathname = usePathname() ?? "/";
  const [service, setService] = useState<ServiceOption>(() => defaultServiceForPath(pathname));
  const [m365Plan, setM365Plan] = useState<(typeof M365_PLANS)[number]>("Business Standard");
  const [seqriteQty, setSeqriteQty] = useState<(typeof SEQRITE_QTY)[number]>("50");
  const [microcopyIndex, setMicrocopyIndex] = useState(0);

  useEffect(() => {
    setService(defaultServiceForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMicrocopyIndex((current) => (current + 1) % MICROCOPY.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const requestQuoteHref = useMemo(() => {
    const params = new URLSearchParams({
      source: "estimator-bar",
      brand: serviceToBrand(service)
    });

    if (service === "Microsoft 365") {
      params.set("plan", m365Plan);
      params.set("category", "Microsoft 365");
    }
    if (service === "Seqrite") {
      params.set("category", "Endpoint Security");
      params.set("qty", seqriteQty);
    }
    if (service === "Networking" || service === "Security") {
      params.set("category", service);
    }

    return `/request-quote?${params.toString()}`;
  }, [m365Plan, seqriteQty, service]);

  const whatsappHref = useMemo(
    () =>
      getWhatsAppLink(
        buildQuoteMessage({
          brand: service,
          city: "Chandigarh",
          requirement: "Need a procurement-ready quote"
        })
      ),
    [service]
  );

  return (
    <div className="border-b border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-alt-bg)_92%,black_8%)]">
      <div className="mx-auto grid max-w-[1280px] gap-2 px-3 py-2 text-[11px] sm:px-4 lg:grid-cols-[1.3fr_1.6fr_1.2fr] lg:items-center">
        <div className="min-h-8 space-y-0.5">
          <p className="font-semibold text-[var(--color-text-primary)]">Instant Quote • GST Invoice • Local Support</p>
          <p className="text-[var(--color-text-secondary)]">{MICROCOPY[microcopyIndex]}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1.1fr_1fr_0.8fr]">
          <label className="sr-only" htmlFor="estimator-service">
            Service
          </label>
          <select
            id="estimator-service"
            value={service}
            onChange={(event) => setService(event.target.value as ServiceOption)}
            className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-primary)]"
          >
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {service === "Microsoft 365" ? (
            <select
              value={m365Plan}
              onChange={(event) => setM365Plan(event.target.value as (typeof M365_PLANS)[number])}
              className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-primary)]"
              aria-label="Microsoft 365 plan"
            >
              {M365_PLANS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          ) : service === "Seqrite" ? (
            <select
              value={seqriteQty}
              onChange={(event) => setSeqriteQty(event.target.value as (typeof SEQRITE_QTY)[number])}
              className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-primary)]"
              aria-label="Seqrite endpoints"
            >
              {SEQRITE_QTY.map((qty) => (
                <option key={qty} value={qty}>
                  {qty} endpoints
                </option>
              ))}
            </select>
          ) : (
            <div className="hidden min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 sm:flex sm:items-center sm:text-xs sm:text-[var(--color-text-secondary)]">
              Quote details in RFQ
            </div>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <AdsTrackedLink
            href={requestQuoteHref}
            eventName="request_quote_click"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-white"
          >
            Request Quote
          </AdsTrackedLink>
          <AdsTrackedLink
            href={whatsappHref}
            eventName="whatsapp_click"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp Sales"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--brand-whatsapp)] text-white"
          >
            WA
          </AdsTrackedLink>
          <AdsTrackedLink
            href={tel(SALES_PHONE_NUMBER)}
            eventName="call_click"
            aria-label="Call Sales"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text-primary)]"
          >
            Call
          </AdsTrackedLink>
        </div>
      </div>
    </div>
  );
}
