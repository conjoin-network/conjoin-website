import Link from "next/link";
import AdsTrackedLink from "@/app/components/AdsTrackedLink";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import JsonLd from "@/app/components/JsonLd";
import MicroLeadForm from "@/app/components/MicroLeadForm";
import Section from "@/app/components/Section";
import type { SeqriteRoiPageData } from "@/lib/seqrite-roi-data";
import { SALES_PHONE_DISPLAY, SALES_PHONE_NUMBER, tel } from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

export default function SeqriteRoiLandingPage({ page }: { page: SeqriteRoiPageData }) {
  const callHref = tel(`+91${SALES_PHONE_NUMBER}`);
  const whatsappHref = getWhatsAppLink(
    buildQuoteMessage({
      brand: page.h1,
      city: "Chandigarh",
      requirement: "Need quote and deployment support"
    })
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
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
    name: page.h1,
    serviceType: "Seqrite security licensing and deployment support",
    areaServed: ["Chandigarh", "Mohali", "Panchkula", "Punjab", "Haryana", "Himachal Pradesh"],
    provider: {
      "@type": "Organization",
      name: "Conjoin Network Pvt. Ltd.",
      url: absoluteUrl("/")
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl(`/${page.slug}`),
      servicePhone: SALES_PHONE_DISPLAY
    }
  };

  return (
    <div className="pb-28 md:pb-10">
      <Section className="pb-8 pt-10 md:pb-12 md:pt-12">
        <div className="hero-panel rounded-3xl p-6 md:p-10">
          <div className="space-y-5">
            <h1 className="type-h1 text-balance text-[var(--color-text-primary)]">{page.h1}</h1>
            <p className="type-body text-balance">{page.outcome}</p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-text-primary)]">
              {["GST invoice", "Partner-safe billing", "Response < 30 mins"].map((item) => (
                <span key={item} className="rounded-full border border-[var(--color-border)] px-3 py-1">
                  {item}
                </span>
              ))}
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
                WhatsApp
              </AdsTrackedLink>
              <AdsTrackedLink
                href={callHref}
                eventName="call_click"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-text-primary)]"
              >
                Call {SALES_PHONE_DISPLAY}
              </AdsTrackedLink>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="alt" className="py-8 md:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Best for</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {page.bestFor.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-2 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Key outcomes</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {page.keyOutcomes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-2 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Deployment</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {page.deployment.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section className="py-8 md:py-10">
        <Card className="space-y-3 p-5 md:p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Proof pattern</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{page.caseProof}</p>
        </Card>
      </Section>

      <Section id="rfq-form" tone="alt" className="py-8 md:py-10">
        <MicroLeadForm
          sourceContext={page.slug}
          presetService="Seqrite"
          planName={page.h1}
          usersLabel="Users / Devices"
          title="2-step RFQ"
          showServiceSelect={false}
          showCity
          showWhatsAppAfterSuccess
        />
      </Section>

      <Section className="py-8 md:py-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">FAQs</h2>
          <FaqAccordion items={page.faqs} />
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
            {page.related.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {link.label}
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

      <JsonLd id={`${page.slug}-faq`} data={faqJsonLd} />
      <JsonLd id={`${page.slug}-service`} data={serviceJsonLd} />
    </div>
  );
}
