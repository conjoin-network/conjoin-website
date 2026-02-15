import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { PRODUCT_PAGES, getProductBySlug } from "@/lib/products-data";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return PRODUCT_PAGES.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return buildMetadata({
    title: product ? product.title : "Product Solutions",
    description: product ? product.description : "Product solution page.",
    path: `/products/${slug}`
  });
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }
  const relatedKnowledge = getRelatedKnowledge(
    ["security", "procurement", ...product.slug.split("-"), ...product.title.toLowerCase().split(" ")],
    3
  );
  const faqItems = [
    {
      question: `Who is ${product.title} best for?`,
      answer: "Organizations that need controlled rollout, compliance visibility and renewal continuity."
    },
    {
      question: "Can we align this with existing policy controls?",
      answer: "Yes. Requirement mapping includes current controls, deployment constraints and governance checkpoints."
    },
    {
      question: "How quickly can we get a commercial proposal?",
      answer: "We target a first response within 30 minutes during business hours."
    }
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title={product.title}
          subtitle={product.description}
          ctas={[
            {
              href: `/request-quote?brand=Seqrite&category=${encodeURIComponent(product.title)}&source=/products/${slug}`,
              label: "Request Quote"
            },
            {
              href: "/seqrite",
              label: "View Seqrite",
              variant: "secondary"
            }
          ]}
          bullets={product.trust.slice(0, 3)}
          microcopy="Request a quote (best price + compliance-ready proposal). Get renewal reminders & license management."
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">What it is</h2>
            <p className="text-sm">{product.description}</p>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Who it&apos;s for</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {product.trust.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Use cases</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {product.useCases.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-3 md:col-span-2">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Procurement outcomes</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {product.outcomes.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">FAQ</h2>
        <FaqAccordion items={faqItems} />
      </Section>

      <Section className="py-10 md:py-14">
        <RelatedLinks
          title="Related knowledge"
          links={relatedKnowledge.map((article) => ({
            href: `/knowledge/${article.slug}`,
            title: article.title,
            description: article.category
          }))}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <RelatedLinks
          links={[
            { href: "/seqrite", title: "Seqrite overview", description: "Cloud and on-prem endpoint pathways." },
            { href: "/locations/chandigarh", title: "Chandigarh support", description: "North India coverage base." },
            { href: "/request-quote", title: "Request quote", description: "Submit quantities and city for pricing." }
          ]}
        />
      </Section>

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="OEM documentation" />
      </Section>

      <Script
        id={`product-faq-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...faqJsonLd,
            url: absoluteUrl(`/products/${slug}`)
          })
        }}
      />
    </div>
  );
}
