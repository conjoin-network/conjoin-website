import type { Metadata } from "next";
import JsonLd from "@/app/components/JsonLd";
import Container from "@/app/components/Container";
import ProcurementReadyBlock from "@/app/components/ProcurementReadyBlock";
import Section from "@/app/components/Section";
import ContactLeadForm from "@/app/contact/ContactLeadForm";
import RequestQuoteWizard from "@/app/request-quote/RequestQuoteWizard";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Request Quote | Microsoft & Seqrite 5-Step RFQ",
  description:
    "Five-step RFQ wizard: choose brand, choose product, users/devices, deployment type, and contact details.",
  path: "/request-quote"
});

export default function RequestQuotePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How quickly do you respond after RFQ submission?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We target a first response within 30 minutes during business hours."
        }
      },
      {
        "@type": "Question",
        name: "Can I quote Microsoft and Seqrite products from the same flow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The wizard is brand-aware and only shows valid product combinations per selected brand."
        }
      }
    ],
    url: absoluteUrl("/request-quote")
  };

  return (
    <>
      <Section tone="alt" className="pb-0 pt-10 md:pt-14">
        <Container className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Request Quote</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Quick lead capture for immediate callback.
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">GST Invoice • Same-day activation • Local support</p>
          </div>
          <ContactLeadForm mode="minimal" />
        </Container>
      </Section>
      <Section className="py-8 md:py-10">
        <Container>
          <ProcurementReadyBlock />
        </Container>
      </Section>
      <RequestQuoteWizard />
      <JsonLd id="request-quote-faq-jsonld" data={faqJsonLd} />
    </>
  );
}
