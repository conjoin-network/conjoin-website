import type { Metadata } from "next";
import Link from "next/link";
import AdsTrackedLink from "@/app/components/AdsTrackedLink";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import JsonLd from "@/app/components/JsonLd";
import Section from "@/app/components/Section";
import ContactLeadForm from "@/app/contact/ContactLeadForm";
import {
  ORG_NAME,
  ORG_POSTAL_ADDRESS,
  SALES_EMAIL,
  SALES_PHONE_DISPLAY,
  SALES_PHONE_NUMBER,
  SUPPORT_EMAIL,
  mailto,
  tel
} from "@/lib/contact";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = buildMetadata({
  title: "Microsoft 365 Partner Chandigarh | Licensing, Setup & Renewal",
  description:
    "Microsoft 365 partner in Chandigarh for licensing, setup, migration, Teams enablement and renewal support across Tricity and nearby states.",
  path: "/microsoft-365-chandigarh"
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

const microsoftFaqs = [
  {
    question: "What is the Microsoft 365 pricing approach for Chandigarh businesses?",
    answer:
      "Pricing depends on plan mix, seat count, and support scope. We share a clear commercial summary for Basic, Standard, and Premium options before purchase."
  },
  {
    question: "How long does renewal usually take?",
    answer:
      "Standard renewals are usually completed the same day once tenant and quantity details are confirmed."
  },
  {
    question: "How quickly can new licenses be activated?",
    answer:
      "For common business plans, activation typically starts within hours after order confirmation and compliance checks."
  },
  {
    question: "Can you migrate from Google Workspace or legacy email to Microsoft 365?",
    answer:
      "Yes. We plan migration waves, mailbox transfer, and cutover checkpoints to minimize disruption."
  },
  {
    question: "Do you provide GST invoice and procurement-ready documents?",
    answer:
      "Yes. We provide GST-compliant invoicing and commercial documentation suitable for procurement and finance approvals."
  },
  {
    question: "What are your support hours after deployment?",
    answer:
      "Business-hours support is available with SLA-governed response windows, and escalation paths are defined in the handover pack."
  },
  {
    question: "How should we choose between Business Basic, Standard, and Premium?",
    answer:
      "We map each plan to role-based needs, security requirements, and collaboration usage so you avoid both under- and over-licensing."
  },
  {
    question: "Is secure migration and compliance readiness included?",
    answer:
      "Yes. We include baseline identity/security checks and migration controls aligned to compliance-friendly operations."
  }
];

const testimonials = [
  {
    quote: "Conjoin completed our Microsoft 365 renewal and Teams rollout in one planning cycle without disruption.",
    author: "IT Manager, Manufacturing Company, Mohali"
  },
  {
    quote: "Their licensing guidance was practical and finance-ready. We got clarity on plan mix and TCO.",
    author: "Procurement Lead, Services Firm, Chandigarh"
  },
  {
    quote: "Migration was smooth and user onboarding was structured. Local coordination made the process easier.",
    author: "Operations Head, Education Group, Panchkula"
  }
];

export default function Microsoft365ChandigarhPage() {
  const callHref = tel(`+91${SALES_PHONE_NUMBER}`);
  const whatsappHref = getWhatsAppLink(
    buildQuoteMessage({
      brand: "Microsoft 365",
      city: "Chandigarh",
      requirement: "Licensing, setup, migration and renewal support"
    })
  );

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: ORG_NAME,
    url: absoluteUrl("/microsoft-365-chandigarh"),
    telephone: [SALES_PHONE_DISPLAY],
    email: [SALES_EMAIL, SUPPORT_EMAIL],
    areaServed: serviceArea,
    address: ORG_POSTAL_ADDRESS
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Microsoft 365 Licensing, Setup and Renewal Support",
    serviceType: "Microsoft 365 procurement and deployment services",
    provider: {
      "@type": "Organization",
      name: ORG_NAME,
      url: absoluteUrl("/")
    },
    areaServed: serviceArea,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl("/microsoft-365-chandigarh"),
      servicePhone: SALES_PHONE_DISPLAY
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: microsoftFaqs.map((item) => ({
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
            <h1 className="type-h1 text-balance text-[var(--color-text-primary)]">Microsoft 365 Partner Chandigarh</h1>
            <p className="type-body text-balance">Licensing • Setup • Migration • Renewal</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Chandigarh-first delivery for organizations across Mohali, Panchkula and nearby serviceable states:
              Punjab, Haryana, Himachal Pradesh, Jammu and Kashmir, and Uttarakhand.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#lead-form"
                className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-5 text-sm font-semibold text-white"
              >
                Request Quote
              </a>
              <AdsTrackedLink
                href={whatsappHref}
                eventName="whatsapp_click"
                target="_blank"
                rel="noreferrer"
                className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-[var(--brand-whatsapp)] px-5 text-sm font-semibold text-white hover:bg-[#0b4b45] focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
              >
                WhatsApp Now
              </AdsTrackedLink>
              <AdsTrackedLink href={callHref} eventName="phone_click" className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300/90 bg-transparent px-5 text-sm font-semibold text-[var(--color-text-primary)]">
                Call {SALES_PHONE_DISPLAY}
              </AdsTrackedLink>
            </div>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">GST Invoice • Same-day activation • Local support</p>
            <div className="grid gap-2 text-xs font-semibold text-[var(--color-text-primary)] sm:grid-cols-2 lg:grid-cols-4">
              {["Partner-led", "SLA support", "Secure migration", "Compliance-ready"].map((item) => (
                <span key={item} className="rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-center">
                  {item}
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Urgent help:{" "}
              <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                {SALES_EMAIL}
              </a>
            </p>
          </div>
        </header>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Plans, setup and renewal support</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Plans and licensing alignment",
              "Business email setup",
              "Microsoft Teams onboarding",
              "Mailbox migration and cutover",
              "Renewal and true-up planning",
              "Security baseline hardening"
            ].map((item) => (
              <Card key={item} className="p-5 md:p-6">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Why Conjoin</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Local support team with Chandigarh delivery hub</span></li>
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>GST invoice and procurement-ready documentation</span></li>
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Same-day setup window for standard requirements</span></li>
              <li className="flex items-start gap-2"><span aria-hidden>•</span><span>Onboarding checklist and admin handover</span></li>
            </ul>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Trust signals</h2>
            <div className="flex flex-wrap gap-2">
              {["GST Invoice", "Local Support", "Microsoft 365 Advisory", "Renewal Governance", "Deployment Clarity"].map((badge) => (
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
          <FaqAccordion items={microsoftFaqs} />
        </div>
      </Section>

      <Section id="lead-form" tone="alt" className="py-10 md:py-14">
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,1.05fr)]">
          <Card className="space-y-3">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Get a Microsoft 365 quote</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Share your user count, city and timeline. We respond with a procurement-ready scope and commercial summary.
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
          <ContactLeadForm mode="minimal" />
        </div>
      </Section>
      <div className="fixed inset-x-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] md:hidden bottom-[calc(env(safe-area-inset-bottom,0px)+4.5rem)]">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,transparent)] p-2 backdrop-blur-sm">
          <AdsTrackedLink href={callHref} eventName="phone_click" className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-3 text-sm font-semibold text-white">
            Call
          </AdsTrackedLink>
          <AdsTrackedLink href={whatsappHref} eventName="whatsapp_click" target="_blank" rel="noreferrer" className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--brand-whatsapp)] px-3 text-sm font-semibold text-white">
            WhatsApp
          </AdsTrackedLink>
        </div>
      </div>

      <JsonLd id="m365-chd-localbusiness" data={localBusinessJsonLd} />
      <JsonLd id="m365-chd-service" data={serviceJsonLd} />
      <JsonLd id="m365-chd-faq" data={faqJsonLd} />
    </div>
  );
}
