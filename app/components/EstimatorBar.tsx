"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import AdsTrackedLink from "@/app/components/AdsTrackedLink";
import { SALES_PHONE_NUMBER, tel } from "@/lib/contact";
import {
  buildEstimatorQuoteHref,
  defaultEstimatorService,
  ESTIMATOR_M365_PLANS,
  ESTIMATOR_SEQRITE_QTY,
  ESTIMATOR_SERVICE_OPTIONS,
  type EstimatorServiceOption
} from "@/lib/estimator";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";
const MICROCOPY = [
  "GeM/PSU/Bank procurement support • Quote in 15 mins",
  "GST invoice • Partner-safe billing",
  "Enterprise SLA support available"
] as const;

export default function EstimatorBar() {
  const pathname = usePathname() ?? "/";
  const [service, setService] = useState<EstimatorServiceOption>(() => defaultEstimatorService(pathname));
  const [m365Plan, setM365Plan] = useState<(typeof ESTIMATOR_M365_PLANS)[number]>("Business Standard");
  const [seqriteQty, setSeqriteQty] = useState<(typeof ESTIMATOR_SEQRITE_QTY)[number]>("50");
  const [microcopyIndex, setMicrocopyIndex] = useState(0);

  useEffect(() => {
    setService(defaultEstimatorService(pathname));
  }, [pathname]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMicrocopyIndex((current) => (current + 1) % MICROCOPY.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const requestQuoteHref = useMemo(() => {
    return buildEstimatorQuoteHref({
      service,
      source: "estimator-bar",
      m365Plan,
      seqriteQty
    });
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
    <div className="border-b border-[var(--color-border)] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-alt-bg)_92%,#030814),color-mix(in_srgb,var(--color-surface)_88%,#030814))]">
      <div className="mx-auto max-w-[1280px] px-3 py-1.5 lg:hidden">
        <p className="truncate text-[11px] font-semibold tracking-[0.02em] text-[var(--color-text-primary)]">
          Instant Quote • GST Invoice • Local Support
        </p>
      </div>

      <div className="mx-auto hidden max-w-[1280px] gap-2 px-3 py-2 text-[11px] sm:px-4 lg:grid lg:grid-cols-[1.3fr_1.6fr_1.2fr] lg:items-center">
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
            onChange={(event) => setService(event.target.value as EstimatorServiceOption)}
            className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            {ESTIMATOR_SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {service === "Microsoft 365" ? (
            <select
              value={m365Plan}
              onChange={(event) => setM365Plan(event.target.value as (typeof ESTIMATOR_M365_PLANS)[number])}
              className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              aria-label="Microsoft 365 plan"
            >
              {ESTIMATOR_M365_PLANS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          ) : service === "Seqrite" ? (
            <select
              value={seqriteQty}
              onChange={(event) => setSeqriteQty(event.target.value as (typeof ESTIMATOR_SEQRITE_QTY)[number])}
              className="min-h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              aria-label="Seqrite endpoints"
            >
              {ESTIMATOR_SEQRITE_QTY.map((qty) => (
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
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-600/30 bg-gradient-to-r from-[#2b6fff] via-[#2a62ef] to-[#1d47bc] px-3 text-xs font-semibold text-white shadow-[0_14px_26px_-20px_rgba(33,91,230,0.95)]"
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
