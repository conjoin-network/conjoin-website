import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import JsonLd from "@/app/components/JsonLd";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import Section from "@/app/components/Section";
import ContactLeadForm from "@/app/contact/ContactLeadForm";
import {
  ORG_NAME,
  SALES_EMAIL,
  SALES_PHONE_MOBILE,
  SUPPORT_EMAIL,
  mailto,
  tel
} from "@/lib/contact";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = buildMetadata({
  title: "Seqrite Endpoint Security Chandigarh | Purchase, Renewal & Support",
  description:
    "Seqrite endpoint security partner in Chandigarh for new purchase, renewal, add-ons and deployment support across Tricity and nearby states.",
  path: "/seqrite-chandigarh"
});

const serviceArea = [
  "Chandigarh",
  "Mohali",
  "Panchkula",
  "Punjab",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Uttarakhand"
];

const seqriteFaqs = [
  {
    question: "Do you support Seqrite for both SMB and enterprise teams?",
    answer:
      "Yes. We align policy depth, endpoint volume, and deployment model to your organization size."
  },
  {
    question: "Can you handle Seqrite renewals for existing deployments?",
    answer:
      "Yes. We process renewals with continuity checks so security controls remain uninterrupted."
  },
  {
    question: "What add-ons can be included?",
    answer:
      "We scope add-ons such as EDR/XDR and management enhancements based on your risk and operations requirements."
  },
  {
    question: "Is deployment support included?",
    answer:
      "Yes. We support policy setup, roll-out planning, and onboarding coordination for IT teams."
  },
  {
    question: "Can multi-site businesses be covered under one engagement?",
    answer:
      "Yes. Multi-branch and distributed endpoint environments are handled with centralized planning."
  },
  {
    question: "Do you support remote workforce endpoint coverage?",
    answer:
      "Yes. Remote and hybrid workforce scenarios are included with deployment and policy controls."
  },
  {
    question: "How quickly can we receive a commercial proposal?",
    answer:
      "For standard requirements we share a proposal quickly after endpoint count and timeline confirmation."
  },
  {
    question: "Is support available after purchase?",
    answer:
      "Yes. Post-purchase support and renewal follow-up are included for continuity."
  },
  {
    question: "How can we start quickly?",
    answer:
      "Use the form below or contact us on call/WhatsApp with endpoint count and city to begin."
  }
];

const testimonials = [
  {
    quote: "Seqrite rollout across our branch offices was structured and practical. No disruption to daily work.",
    author: "IT Head, Retail Group, Chandigarh"
  },
  {
    quote: "Renewal and add-on planning was clearly documented for procurement and audit tracking.",
    author: "Compliance Lead, Finance Firm, Mohali"
  },
  {
    quote: "Conjoin supported us from scope to deployment handover with local coordination.",
    author: "Operations Manager, Services Company, Panchkula"
  }
];

export default function SeqriteChandigarhPage() {
  const callHref = tel(`+91${SALES_PHONE_MOBILE}`);
  const whatsappHref = getWhatsAppLink(
    buildQuoteMessage({
      brand: "Seqrite Endpoint Security",
      city: "Chandigarh",
      requirement: "Purchase, renewal, add-ons and support"
    })
  );

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Seqrite Endpoint Security Deployment and Renewal Services",
    serviceType: "Endpoint security planning, deployment and support",
    provider: {
      "@type": "Organization",
      name: ORG_NAME,
      url: absoluteUrl("/")
    },
    areaServed: serviceArea,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl("/seqrite-chandigarh"),
      servicePhone: `+91-${SALES_PHONE_MOBILE}`
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seqriteFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <div className="pb-28 md:pb-0">
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <header className="hero-panel rounded-3xl p-7 md:p-10">
          <div className="max-w-4xl space-y-5">
            <h1 className="type-h1 text-balance text-[var(--color-text-primary)]">Seqrite Endpoint Security Chandigarh</h1>
            <p className="type-body text-balance">SMB • Enterprise • Renewal • Add-ons • Support</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Seqrite (Quick Heal) endpoint advisory with Chandigarh-centric service coverage for Tricity and nearby
              states within practical delivery radius.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={callHref} className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-5 text-sm font-semibold text-white">
                Call +91 9466663015
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300/90 bg-slate-900 px-5 text-sm font-semibold text-white"
              >
                WhatsApp
              </a>
              <a
                href="#lead-form"
                className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300/90 bg-transparent px-5 text-sm font-semibold text-[var(--color-text-primary)]"
              >
                Get Quote
              </a>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Coverage: Chandigarh, Mohali, Panchkula, Punjab, Haryana, Himachal Pradesh, Jammu and Kashmir, Uttarakhand.
            </p>
          </div>
        </header>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Use cases and package pathways</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "SME deployment",
                detail: "Endpoint visibility and policy controls for lean IT teams."
              },
              {
                title: "Enterprise security coverage",
                detail: "Scaled controls, reporting and support continuity for larger estates."
              },
              {
                title: "Multi-site rollout",
                detail: "Centralized planning for distributed offices and branch networks."
              },
              {
                title: "Remote workforce protection",
                detail: "Policy consistency for devices across office and remote users."
              }
            ].map((item) => (
              <Card key={item.title} className="space-y-2 p-5 md:p-6">
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{item.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Commercial focus</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>New purchase with right-fit package mapping</span></li>
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Renewal continuity with expiry-risk tracking</span></li>
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Add-on alignment for advanced security needs</span></li>
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Support ownership with transparent checkpoints</span></li>
            </ul>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Trust blocks</h2>
            <div className="flex flex-wrap gap-2">
              {["Local support", "Renewal governance", "Procurement clarity", "Security baseline", "Deployment planning"].map((badge) => (
                <span key={badge} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                  {badge}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Client feedback</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.author} className="space-y-3 p-5 md:p-6">
                <p className="text-sm text-[var(--color-text-secondary)]">&ldquo;{item.quote}&rdquo;</p>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">{item.author}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">FAQs</h2>
          <FaqAccordion items={seqriteFaqs} />
        </div>
      </Section>

      <Section id="lead-form" tone="alt" className="py-10 md:py-14">
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,1.05fr)]">
          <Card className="space-y-3">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Get a Seqrite quote</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Share endpoint count, city and timeline. We respond with package recommendation and commercial clarity.
            </p>
            <div className="space-y-2 text-sm">
              <p>
                Sales:{" "}
                <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                  {SALES_EMAIL}
                </a>
              </p>
              <p>
                Support:{" "}
                <a href={mailto(SUPPORT_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
              <Link href="/" className="hover:underline">Back to Home</Link>
              <Link href="/contact" className="hover:underline">Contact Page</Link>
            </div>
          </Card>
          <ContactLeadForm />
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="Seqrite OEM documentation" />
      </Section>

      <div className="fixed inset-x-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] md:hidden bottom-[calc(env(safe-area-inset-bottom,0px)+4.5rem)]">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,transparent)] p-2 backdrop-blur-sm">
          <a href={callHref} className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-3 text-sm font-semibold text-white">
            Call
          </a>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--brand-whatsapp)] px-3 text-sm font-semibold text-white">
            WhatsApp
          </a>
        </div>
      </div>

      <JsonLd id="seqrite-chd-service" data={serviceJsonLd} />
      <JsonLd id="seqrite-chd-faq" data={faqJsonLd} />
    </div>
  );
}
