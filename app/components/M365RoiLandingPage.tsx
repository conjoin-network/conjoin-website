"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdsTrackedLink from "@/app/components/AdsTrackedLink";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import JsonLd from "@/app/components/JsonLd";
import Section from "@/app/components/Section";
import MicroLeadForm from "@/app/components/MicroLeadForm";
import type { M365RoiPlan } from "@/lib/m365-roi-data";
import { M365_PRICING } from "@/lib/m365-roi-data";
import { SALES_PHONE_DISPLAY, SALES_PHONE_NUMBER, tel } from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

type BillingCycle = "monthly" | "annual";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export default function M365RoiLandingPage({ plan }: { plan: M365RoiPlan }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [users, setUsers] = useState(25);
  const callHref = tel(`+91${SALES_PHONE_NUMBER}`);
  const whatsappHref = getWhatsAppLink(
    buildQuoteMessage({
      brand: plan.h1,
      city: "Chandigarh",
      requirement: "Need licensing + rollout quote"
    })
  );
  const planPricing = M365_PRICING.plans[plan.slug];
  const monthlyPerUser = planPricing?.monthlyPerUser ?? 0;
  const annualPerUser =
    monthlyPerUser * (1 - M365_PRICING.annualDiscountPercent / 100);

  const estimate = useMemo(() => {
    const userCount = Number.isFinite(users) && users > 0 ? users : 1;
    const perUser = billingCycle === "annual" ? annualPerUser : monthlyPerUser;
    const monthlyTotal = perUser * userCount;
    return {
      userCount,
      perUser,
      monthlyTotal,
      annualTotal: monthlyTotal * 12
    };
  }, [annualPerUser, billingCycle, monthlyPerUser, users]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: plan.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: plan.h1,
    serviceType: "Microsoft 365 licensing and deployment support",
    areaServed: ["Chandigarh", "Mohali", "Panchkula", "Punjab", "Haryana", "Himachal Pradesh"],
    provider: {
      "@type": "Organization",
      name: "Conjoin Network Pvt. Ltd.",
      url: absoluteUrl("/")
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl(`/${plan.slug}`),
      servicePhone: SALES_PHONE_DISPLAY
    }
  };

  return (
    <div className="pb-28 md:pb-10">
      <Section className="pb-8 pt-10 md:pb-12 md:pt-12">
        <div className="hero-panel rounded-3xl p-6 md:p-10">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              {plan.responseBadge}
            </p>
            <h1 className="type-h1 text-balance text-[var(--color-text-primary)]">{plan.h1}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">{plan.bestFor}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="space-y-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-secondary)]">
                  Monthly
                </p>
                <p className="text-xl font-semibold text-[var(--color-text-primary)]">{plan.monthlyLabel}</p>
              </Card>
              <Card className="space-y-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-secondary)]">
                  Annual
                </p>
                <p className="text-xl font-semibold text-[var(--color-text-primary)]">{plan.annualLabel}</p>
              </Card>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#rfq-form"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white"
              >
                Request Quote
              </a>
              <AdsTrackedLink
                href={whatsappHref}
                eventName="whatsapp_click"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--brand-whatsapp)] bg-[var(--brand-whatsapp)] px-5 text-sm font-semibold text-white"
              >
                WhatsApp Now
              </AdsTrackedLink>
              <AdsTrackedLink
                href={callHref}
                eventName="call_click"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-text-primary)]"
              >
                Call {SALES_PHONE_DISPLAY}
              </AdsTrackedLink>
            </div>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
              GST Invoice • Same-day activation • Local support
            </p>
          </div>
        </div>
      </Section>

      <Section className="py-6 md:py-8">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-4 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">Billing</span>
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold ${
                  billingCycle === "monthly"
                    ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold ${
                  billingCycle === "annual"
                    ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                Annual
              </button>
            </div>
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              Users
              <input
                type="number"
                min={1}
                value={users}
                onChange={(event) => setUsers(Number.parseInt(event.target.value || "0", 10))}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-border)] px-3 py-3">
                <p className="text-xs text-[var(--color-text-secondary)]">Per user ({billingCycle})</p>
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">{formatINR(estimate.perUser)}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] px-3 py-3">
                <p className="text-xs text-[var(--color-text-secondary)]">Estimated monthly total</p>
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">{formatINR(estimate.monthlyTotal)}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Estimated annual run-rate: {formatINR(estimate.annualTotal)}. Final quote may vary by scope and taxes.
            </p>
          </Card>

          <Card className="space-y-3 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Best for</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {plan.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section tone="alt" className="py-8 md:py-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">{plan.compareTitle}</h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]">
                <tr>
                  {plan.compareColumns.map((column) => (
                    <th key={column} className="px-4 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.compareRows.map((row) => (
                  <tr
                    key={row[0]}
                    className={`border-t border-[var(--color-border)] ${
                      row[0].toLowerCase().includes(plan.h1.toLowerCase().replace(" chandigarh", ""))
                        ? "bg-[var(--color-alt-bg)]/65"
                        : ""
                    }`}
                  >
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section id="rfq-form" className="py-8 md:py-10">
        <MicroLeadForm
          sourceContext={plan.slug}
          presetService="Microsoft 365"
          planName={plan.h1}
          usersLabel="Users count"
          title="Quick RFQ"
          showServiceSelect={false}
        />
      </Section>

      <Section className="py-8 md:py-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">FAQs</h2>
          <FaqAccordion items={plan.faqs} />
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
            {plan.relatedPlans.map((item) => (
              <Link key={item.href} href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <a
        href="#rfq-form"
        className="fixed bottom-5 right-4 z-40 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white shadow-lg md:bottom-6 md:right-6"
      >
        Request Quote
      </a>

      <JsonLd id={`${plan.slug}-faq`} data={faqJsonLd} />
      <JsonLd id={`${plan.slug}-service`} data={serviceJsonLd} />
    </div>
  );
}
