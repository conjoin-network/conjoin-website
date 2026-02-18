import Link from "next/link";
import AdsTrackedLink from "@/app/components/AdsTrackedLink";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import JsonLd from "@/app/components/JsonLd";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import ContactLeadForm from "@/app/contact/ContactLeadForm";
import {
  LOCAL_SEO_SERVICE_AREA,
  type LocalSeoLandingPageData
} from "@/lib/local-seo-landing-data";
import { KNOWLEDGE_ARTICLES } from "@/lib/knowledge-data";
import {
  ORG_NAME,
  ORG_POSTAL_ADDRESS,
  SALES_EMAIL,
  SALES_PHONE_DISPLAY,
  SALES_PHONE_NUMBER,
  mailto,
  tel
} from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

function getKnowledgeLinks(slugs: string[]) {
  return slugs
    .map((slug) => KNOWLEDGE_ARTICLES.find((article) => article.slug === slug))
    .filter((article): article is (typeof KNOWLEDGE_ARTICLES)[number] => Boolean(article))
    .map((article) => ({
      href: `/knowledge/${article.slug}`,
      label: article.title
    }));
}

export default function LocalSeoLandingPage({ page }: { page: LocalSeoLandingPageData }) {
  const callHref = tel(`+91${SALES_PHONE_NUMBER}`);
  const whatsappHref = getWhatsAppLink(
    buildQuoteMessage({
      brand: page.h1,
      city: page.city,
      requirement: page.serviceType
    })
  );
  const knowledgeLinks = getKnowledgeLinks(page.relatedKnowledgeSlugs);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.h1,
    serviceType: page.serviceType,
    areaServed: LOCAL_SEO_SERVICE_AREA,
    provider: {
      "@type": "Organization",
      name: ORG_NAME,
      url: absoluteUrl("/")
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl(`/${page.slug}`),
      servicePhone: SALES_PHONE_DISPLAY
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.h1,
        item: absoluteUrl(`/${page.slug}`)
      }
    ]
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: ORG_NAME,
    url: absoluteUrl(`/${page.slug}`),
    telephone: [SALES_PHONE_DISPLAY],
    email: [SALES_EMAIL],
    areaServed: LOCAL_SEO_SERVICE_AREA,
    address: ORG_POSTAL_ADDRESS
  };

  return (
    <div className="pb-28 md:pb-0">
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title={page.h1}
          subtitle={page.subtitle}
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: "/contact", label: "Contact Sales", variant: "secondary" }
          ]}
          bullets={[
            "Procurement-led commercial clarity",
            "Response < 30 mins (business hours)",
            "Chandigarh + Tricity coverage"
          ]}
          microcopy={page.intro}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <AdsTrackedLink
            href={callHref}
            eventName="phone_click"
            className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-5 text-sm font-semibold text-white"
          >
            Call {SALES_PHONE_DISPLAY}
          </AdsTrackedLink>
          <AdsTrackedLink
            href={whatsappHref}
            eventName="whatsapp_click"
            target="_blank"
            rel="noreferrer"
            className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300/90 bg-slate-900 px-5 text-sm font-semibold text-white"
          >
            WhatsApp
          </AdsTrackedLink>
          <a
            href="#lead-form"
            className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300/90 bg-transparent px-5 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            Get Quote
          </a>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Commercial pathways</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {page.serviceHighlights.map((item) => (
              <Card key={item} className="p-5 md:p-6">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item}</p>
              </Card>
            ))}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]">
                <tr>
                  {page.offerTable.columns.map((column) => (
                    <th key={column} className="px-4 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.offerTable.rows.map((row) => (
                  <tr key={row[0]} className="border-t border-[var(--color-border)]">
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

      <Section className="py-10 md:py-14">
        <div className="space-y-6">
          {page.sections.map((section) => (
            <Card key={section.title} className="space-y-3 p-5 md:p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] md:text-2xl">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  {paragraph}
                </p>
              ))}
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3 p-5 md:p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Why Conjoin</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {page.whyConjoin.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-3 p-5 md:p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Recent delivery patterns</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {page.caseBullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">FAQs</h2>
          <FaqAccordion items={page.faqs} />
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3 p-5 md:p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Related solution pages</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {page.relatedPages.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-semibold text-[var(--color-primary)] hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-3 p-5 md:p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Knowledge links</h2>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {knowledgeLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-semibold text-[var(--color-primary)] hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section id="lead-form" className="py-10 md:py-14">
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,1.05fr)]">
          <Card className="space-y-3 p-5 md:p-6">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">
              Request a commercial proposal
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Share user/device count, city, and timeline. We return a procurement-ready response with scope and
              commercial clarity.
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Prefer direct contact?{" "}
              <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                {SALES_EMAIL}
              </a>
            </p>
          </Card>
          <ContactLeadForm />
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3 md:hidden">
        <div className="mx-auto flex w-full max-w-6xl gap-2">
          <AdsTrackedLink
            href={callHref}
            eventName="phone_click"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-3 text-sm font-semibold text-white"
          >
            Call
          </AdsTrackedLink>
          <AdsTrackedLink
            href={whatsappHref}
            eventName="whatsapp_click"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-300/90 bg-slate-900 px-3 text-sm font-semibold text-white"
          >
            WhatsApp
          </AdsTrackedLink>
        </div>
      </div>

      <JsonLd id={`service-${page.slug}`} data={serviceJsonLd} />
      <JsonLd id={`faq-${page.slug}`} data={faqJsonLd} />
      <JsonLd id={`breadcrumb-${page.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`localbusiness-${page.slug}`} data={localBusinessJsonLd} />
    </div>
  );
}
