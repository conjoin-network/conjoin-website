import type { Metadata } from "next";
import Script from "next/script";
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
      <RequestQuoteWizard />
      <Script id="request-quote-faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </>
  );
}
