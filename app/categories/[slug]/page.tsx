import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import PageHero from "@/app/components/PageHero";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import RelatedLinks from "@/app/components/RelatedLinks";
import Section from "@/app/components/Section";
import { CATEGORY_PAGES, getCategoryBySlug, getCategoryBrands } from "@/lib/categories-data";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

const FAQ_ITEMS = [
  {
    question: "How quickly can we receive a category-level quote response?",
    answer:
      "During business hours we target a first WhatsApp response in about 15 minutes, then align scope for proposal delivery."
  },
  {
    question: "Do you provide compliance-ready proposal formatting?",
    answer:
      "Yes. We structure scope language for procurement checkpoints, renewal governance and implementation ownership."
  },
  {
    question: "What information helps speed up pricing turnaround?",
    answer:
      "Category, preferred brand, quantity estimate, city, and timeline are enough to start with a compliant commercial response."
  }
] as const;

export function generateStaticParams() {
  return CATEGORY_PAGES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return buildMetadata({
      title: "Category Overview",
      description: "Category procurement overview page.",
      path: `/categories/${slug}`
    });
  }

  return buildMetadata({
    title: `${category.name} Category Solutions | Procurement Outcomes`,
    description: `${category.description} Compare live brands and open a prefilled RFQ by category.`,
    path: `/categories/${category.slug}`
  });
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const brands = getCategoryBrands(category);
  const quoteHref = `/request-quote?category=${encodeURIComponent(category.quoteCategory)}&source=/categories/${category.slug}`;
  const whatsappHref = getWhatsAppLink(
    buildQuoteMessage({
      brand: category.name,
      city: "Chandigarh",
      requirement: `${category.name} procurement support`
    })
  );

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
        name: "Categories",
        item: absoluteUrl("/categories")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: absoluteUrl(`/categories/${category.slug}`)
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title={category.title}
          subtitle={category.description}
          ctas={[
            { href: quoteHref, label: "Request Quote" },
            { href: whatsappHref, label: "WhatsApp Sales", variant: "secondary" }
          ]}
          bullets={[
            "Category-first procurement flow",
            "TCO and compliance outcomes",
            "Response in 15 minutes (business hours)"
          ]}
          microcopy="Request a quote (best price + compliance-ready proposal). Get renewal reminders & license management."
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Live brand options</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Card key={brand.slug} className="space-y-3">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{brand.name}</h3>
              <p className="text-sm">{brand.description}</p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
                <Link href={`/brands/${brand.slug}`} className="hover:underline">
                  Brand page
                </Link>
                <Link
                  href={`/request-quote?brand=${encodeURIComponent(brand.name)}&category=${encodeURIComponent(category.quoteCategory)}&source=/categories/${category.slug}`}
                  className="hover:underline"
                >
                  Quote this brand
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">
          FAQ / Procurement Q&amp;A
        </h2>
        <FaqAccordion items={FAQ_ITEMS.map((item) => ({ question: item.question, answer: item.answer }))} />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <RelatedLinks
          links={[
            { href: "/categories", title: "All categories", description: "Browse every category route." },
            { href: "/brands", title: "Brands hub", description: "Open brand pages and RFQ paths." },
            { href: "/knowledge", title: "Knowledge hub", description: "Procurement, TCO and compliance guides." },
            {
              href: "/locations/chandigarh",
              title: "Locations",
              description: "Chandigarh Tricity and North India coverage."
            }
          ]}
        />
      </Section>

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="OEM documentation" />
      </Section>

      <Script
        id={`category-breadcrumb-${category.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`category-faq-${category.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
