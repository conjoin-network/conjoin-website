import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/app/components/Button";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import RelatedLinks from "@/app/components/RelatedLinks";
import Section from "@/app/components/Section";
import { getTheme, withThemeStyles } from "@/lib/brand/themes";
import { getSolutionBySlug, SOLUTION_LINES } from "@/lib/solutions-data";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

type Params = {
  slug: string;
};

export async function generateStaticParams() {
  return SOLUTION_LINES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);
  if (!solution) {
    return buildMetadata({
      title: "Solution Not Found",
      description: "The requested service line could not be found.",
      path: "/solutions"
    });
  }

  return buildMetadata({
    title: `${solution.title} | Service Line Advisory`,
    description: solution.heroSubtitle,
    path: `/solutions/${solution.slug}`
  });
}

export default async function SolutionDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const theme = getTheme(solution.key);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: solution.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return (
    <div data-theme={solution.key}>
      <Section className="pb-10 pt-10 md:pb-12 md:pt-12">
        <header
          className="space-y-5 rounded-3xl border border-[var(--color-border)] p-7 md:p-8"
          style={{
            ...withThemeStyles(solution.key),
            background: theme.gradientWash,
            boxShadow: theme.glow
          }}
        >
          <span
            className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "var(--theme-badge-bg)",
              color: "var(--theme-badge-text)"
            }}
          >
            {theme.label} Service Line
          </span>
          <h1 className="text-[clamp(2rem,4.7vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)]">
            {solution.heroTitle}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">{solution.heroSubtitle}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href={`/request-quote?brand=${encodeURIComponent(solution.prefillBrand)}&category=${encodeURIComponent(
                solution.quoteCategory
              )}&source=/solutions/${solution.slug}`}
              variant="primary"
            >
              Request Quote
            </ButtonLink>
            <ButtonLink href="/solutions" variant="secondary">
              Browse Service Lines
            </ButtonLink>
          </div>
          <ul className="grid gap-2 text-sm text-[var(--color-text-secondary)] md:grid-cols-3">
            {solution.trustBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: theme.accent }} />
                {bullet}
              </li>
            ))}
          </ul>
        </header>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-[clamp(1.65rem,3.2vw,2.1rem)] font-semibold text-[var(--color-text-primary)]">Capabilities</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {solution.capabilities.map((item) => (
              <Card key={item} className="p-5">
                <p className="text-sm text-[var(--color-text-secondary)]">{item}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-[clamp(1.65rem,3.2vw,2.1rem)] font-semibold text-[var(--color-text-primary)]">Who it’s for</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {solution.audience.map((item) => (
              <Card key={item} className="p-5">
                <p className="text-sm text-[var(--color-text-secondary)]">{item}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-[clamp(1.65rem,3.2vw,2.1rem)] font-semibold text-[var(--color-text-primary)]">FAQ</h2>
          <FaqAccordion items={solution.faqs} />
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <RelatedLinks
          links={[
            {
              href: "/request-quote",
              title: "Request Quote",
              description: "Start a quote-ready discussion with your requirement details."
            },
            {
              href: "/locations/chandigarh",
              title: "Coverage",
              description: "Delivery support across Chandigarh, Punjab, Haryana, and North India."
            },
            {
              href: "/knowledge",
              title: "Knowledge Hub",
              description: "Procurement, compliance, and delivery guidance articles."
            }
          ]}
        />
      </Section>

      <div className="sticky bottom-3 z-30 mx-auto w-full max-w-6xl px-6 pb-2 md:hidden">
        <ButtonLink
          href={`/request-quote?brand=${encodeURIComponent(solution.prefillBrand)}&category=${encodeURIComponent(
            solution.quoteCategory
          )}&source=/solutions/${solution.slug}`}
          variant="primary"
          className="w-full"
        >
          Request Quote
        </ButtonLink>
      </div>

      <Script
        id={`solutions-faq-${solution.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...faqJsonLd,
            url: absoluteUrl(`/solutions/${solution.slug}`)
          })
        }}
      />
    </div>
  );
}
