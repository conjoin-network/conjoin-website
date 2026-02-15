import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import { BRAND_TILES, getBrandBySlug } from "@/lib/brands-data";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { PLATFORM_PRODUCTS } from "@/lib/platform-catalog";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

function toTitleCase(input: string) {
  return input
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getQuoteDefaults(displayName: string) {
  const lower = displayName.toLowerCase();
  if (lower === "microsoft") {
    return { category: "Business", tier: "Business Standard" };
  }
  if (lower === "seqrite") {
    return { category: "Cloud", tier: "Advanced" };
  }
  if (lower === "cisco") {
    return { category: "Firewall", tier: "Standard" };
  }
  return { category: "Firewall", tier: "Standard" };
}

export function generateStaticParams() {
  return BRAND_TILES.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) {
    return buildMetadata({
      title: "Brand Overview",
      description: "Brand page overview.",
      path: `/brands/${slug}`
    });
  }

  return buildMetadata({
    title: `${brand.name} Solutions for IT Procurement`,
    description: `${brand.name} solutions focused on TCO, compliance, deployment clarity, renewals and support governance.`,
    path: `/brands/${brand.slug}`
  });
}

export default async function BrandDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) {
    notFound();
  }

  const displayName = brand?.name ?? toTitleCase(slug);
  const defaults = getQuoteDefaults(displayName);
  const quoteHref = `/request-quote?brand=${encodeURIComponent(displayName)}&category=${encodeURIComponent(defaults.category)}&tier=${encodeURIComponent(defaults.tier)}&source=/brands/${slug}`;
  const whatsappHref = getWhatsAppLink(
    buildQuoteMessage({
      brand: displayName,
      city: "Chandigarh",
      requirement: "Procurement-ready proposal"
    })
  );

  const relatedKnowledge = getRelatedKnowledge(
    [displayName.toLowerCase(), ...brand.categories.map((category) => category.toLowerCase())],
    3
  );
  const productGroups = PLATFORM_PRODUCTS.filter((product) => product.brandSlug === slug)
    .reduce<Record<string, typeof PLATFORM_PRODUCTS>>((acc, product) => {
      const bucket = acc[product.category] ?? [];
      acc[product.category] = [...bucket, product];
      return acc;
    }, {});
  const faqItems = [
    {
      question: `How quickly can we receive a ${displayName} quote?`,
      answer:
        "During business hours we target a first response in about 15 minutes and share a scoped proposal next."
    },
    {
      question: "Do you support renewals and commercial governance?",
      answer:
        "Yes. We support renewal timelines, compliance-ready scope and procurement documentation."
    },
    {
      question: "What details are needed to prepare a quote?",
      answer:
        "Brand requirement, expected quantity, city, and implementation timeline are enough to start."
    }
  ] as const;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
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
        name: "Brands",
        item: absoluteUrl("/brands")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: absoluteUrl(`/brands/${slug}`)
      }
    ]
  };
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${displayName} procurement advisory`,
    provider: {
      "@type": "Organization",
      name: "Conjoin Network Private Limited",
      url: absoluteUrl("/")
    },
    areaServed: ["Chandigarh", "Punjab", "Haryana", "North India"],
    serviceType: brand.categories.join(", "),
    url: absoluteUrl(`/brands/${slug}`)
  };

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title={`${displayName} Solutions for IT & Procurement Teams`}
          subtitle={`${brand.description} Built for TCO transparency, compliance confidence, renewal continuity and SLA-backed support planning.`}
          ctas={[
            {
              href: quoteHref,
              label: "Request Quote"
            },
            {
              href: "#brand-use-cases",
              label: "Browse Use Cases",
              variant: "secondary"
            }
          ]}
          bullets={[
            "TCO and compliance focused",
            "Deployment and renewal clarity",
            "Call in 15 minutes (business hours)"
          ]}
          microcopy="Request a quote (best price + compliance-ready proposal). Get renewal reminders & license management."
        />
      </Section>

      <Section id="brand-use-cases" tone="alt" className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Use cases</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">Modernization planning</h3>
            <p className="text-sm">Align platform choices with business roadmap, audit posture and rollout priorities.</p>
            <Link href={quoteHref} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Quote this use case
            </Link>
          </Card>
          <Card className="space-y-3">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">Renewal governance</h3>
            <p className="text-sm">Reduce commercial risk through structured renewal reminders and license hygiene.</p>
            <Link href={quoteHref} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Quote this use case
            </Link>
          </Card>
          <Card className="space-y-3">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">Support continuity</h3>
            <p className="text-sm">Define SLA-style response, ownership, and escalation path before go-live.</p>
            <Link href={quoteHref} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Quote this use case
            </Link>
          </Card>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Product catalog by category</h2>
        {Object.keys(productGroups).length === 0 ? (
          <Card className="space-y-2">
            <p className="text-sm">Official product matrix is being expanded for this brand.</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Request a quote and we&apos;ll map the right-fit SKUs and licensing options.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(productGroups).map(([group, items]) => (
              <div key={group} className="space-y-2">
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{group}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {items.map((item) => (
                    <Card key={item.id} className="space-y-2 p-4">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.name}</p>
                      <p className="text-xs">{item.description}</p>
                      <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                        {item.licenseModel}
                      </p>
                      <Link
                        href={`/request-quote?brand=${encodeURIComponent(displayName)}&category=${encodeURIComponent(group)}&product=${encodeURIComponent(item.name)}&source=/brands/${slug}`}
                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        Quote this product
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Procurement outcomes</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">TCO transparency</h3>
            <p className="text-sm">Budget visibility with fit-for-purpose licensing and phased commercial planning.</p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Compliance readiness</h3>
            <p className="text-sm">Quote-ready language for procurement checks and governance review cycles.</p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Risk mitigation</h3>
            <p className="text-sm">Reduce procurement and deployment risk with clear ownership and scope control.</p>
          </Card>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Deployment clarity</h2>
        <Card className="space-y-2">
          <ul className="space-y-1 text-sm">
            <li>Discovery and requirement freeze before commercial closure.</li>
            <li>Implementation checkpoints with stakeholder sign-off.</li>
            <li>Post-go-live support and renewal schedule visibility.</li>
          </ul>
        </Card>
      </Section>

      <Section className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">FAQ</h2>
        <FaqAccordion items={faqItems.map((item) => ({ question: item.question, answer: item.answer }))} />
      </Section>

      <Section className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">What we need to quote</h2>
            <p className="text-sm">Share city, quantity, timeline, and procurement context for an accurate RFQ response.</p>
            <Link href={quoteHref} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Request Quote
            </Link>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Talk to sales now</h2>
            <p className="text-sm">Use WhatsApp for fast requirement capture and quote coordination.</p>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              WhatsApp Sales
            </a>
            <Link href="/contact" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Talk to specialist
            </Link>
          </Card>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <RelatedLinks
          title="Related links"
          links={[
            { href: "/brands", title: "All brands", description: "Browse every live brand route." },
            { href: "/categories", title: "Categories", description: "Explore category-specific procurement paths." },
            {
              href: "/locations/chandigarh",
              title: "Locations",
              description: "Coverage across Chandigarh Tricity and North India."
            },
            { href: quoteHref, title: "Request Quote", description: "Open RFQ flow with this brand prefilled." },
            ...relatedKnowledge.slice(0, 1).map((article) => ({
              href: `/knowledge/${article.slug}`,
              title: article.title,
              description: article.category
            }))
          ]}
        />
      </Section>

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="OEM documentation" />
      </Section>

      <Script
        id={`brand-faq-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`brand-breadcrumb-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`brand-service-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </div>
  );
}
