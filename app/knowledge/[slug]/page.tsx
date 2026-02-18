import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FaqAccordion from "@/app/components/FaqAccordion";
import JsonLd from "@/app/components/JsonLd";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import { PLATFORM_ARTICLES } from "@/lib/platform-catalog";
import { KNOWLEDGE_ARTICLES, getKnowledgeBySlug } from "@/lib/knowledge-data";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

function getServiceLinks(slug: string, tags: string[]) {
  const haystack = `${slug} ${tags.join(" ")}`.toLowerCase();
  if (haystack.includes("seqrite") || haystack.includes("endpoint")) {
    return [
      { href: "/seqrite-chandigarh", label: "Seqrite Endpoint Security Chandigarh" },
      { href: "/endpoint-security-chandigarh", label: "Endpoint Security Chandigarh" },
      { href: "/endpoint-security-mohali", label: "Endpoint Security Mohali" }
    ];
  }

  if (haystack.includes("procurement") || haystack.includes("rfq") || haystack.includes("tco")) {
    return [
      { href: "/it-procurement-chandigarh", label: "IT Procurement Chandigarh" },
      { href: "/request-quote", label: "Request Quote" },
      { href: "/contact", label: "Contact Sales" }
    ];
  }

  return [
    { href: "/microsoft-365-chandigarh", label: "Microsoft 365 Partner Chandigarh" },
    { href: "/microsoft-365-reseller-chandigarh", label: "Microsoft 365 Reseller Chandigarh" },
    { href: "/request-quote", label: "Request Quote" }
  ];
}

export function generateStaticParams() {
  return KNOWLEDGE_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getKnowledgeBySlug(slug);

  return buildMetadata({
    title: article ? article.title : "Knowledge Article",
    description: article ? article.description : "Knowledge placeholder article.",
    path: `/knowledge/${slug}`
  });
}

export default async function KnowledgeArticlePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getKnowledgeBySlug(slug);
  if (!article) {
    notFound();
  }
  const fallbackContent = [
    `${article.title} is written for procurement and technology owners who need clear buying decisions, deployment guardrails, and renewal continuity.`,
    "Use this guide to structure internal discussions around scope, commercial assumptions, and operational ownership before approval.",
    "For live proposals or deployment-aligned commercials, use Request Quote so recommendations can be mapped to your exact user count, city, and timeline."
  ].join("\n\n");
  const detailed = PLATFORM_ARTICLES.find((item) => item.slug === slug) ?? null;
  const contentBlocks = (detailed?.content ?? fallbackContent)
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  const serviceLinks = getServiceLinks(article.slug, article.tags);
  const faqItems = [
    {
      question: "Is this article aligned to procurement decisions?",
      answer: "Yes. Content is structured around commercial clarity, compliance, and deployment readiness."
    },
    {
      question: "When is this article updated?",
      answer: `Last verified on ${(detailed?.lastVerified ?? "2026-02-14").replaceAll("-", "-")}.`
    }
  ];
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: detailed?.publishedAt ?? "2026-02-14T00:00:00.000Z",
    dateModified: detailed?.publishedAt ?? "2026-02-14T00:00:00.000Z",
    author: {
      "@type": "Organization",
      name: "Conjoin Network Private Limited"
    },
    publisher: {
      "@type": "Organization",
      name: "Conjoin Network Private Limited"
    },
    mainEntityOfPage: absoluteUrl(`/knowledge/${slug}`),
    keywords: article.tags.join(", ")
  };
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

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title={article.title}
          subtitle={article.description}
          ctas={[
            {
              href: "/request-quote",
              label: "Request Quote"
            },
            {
              href: "/knowledge",
              label: "Back to Knowledge",
              variant: "secondary"
            }
          ]}
          bullets={[
            "Procurement-ready article",
            "Procurement and compliance focus",
            "Built for IT and purchase teams"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <article className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="rounded-full bg-[var(--color-alt-bg)] px-2 py-1 font-semibold">{article.category}</span>
            <span>Last verified: {detailed?.lastVerified ?? "2026-02-14"}</span>
          </div>
          <div className="space-y-4 text-sm leading-7 text-[var(--color-text-secondary)]">
            {contentBlocks.map((paragraph) => (
              <p key={paragraph.slice(0, 28)}>{paragraph}</p>
            ))}
            <ul className="list-disc space-y-2 pl-5">
              <li>Procurement scope framing with TCO and compliance checkpoints.</li>
              <li>Commercial and renewal guardrails for predictable lifecycle costs.</li>
              <li>Deployment considerations with risk controls and rollback readiness.</li>
              <li>Procurement Q&A patterns for IT, finance and leadership reviews.</li>
            </ul>
            <p>Use the Request Quote path for commercial proposals mapped to your exact scope.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
            <Link href="/request-quote" className="hover:underline">
              Request Quote
            </Link>
            <Link href="/microsoft" className="hover:underline">
              Microsoft
            </Link>
            <Link href="/seqrite" className="hover:underline">
              Seqrite
            </Link>
            <Link href="/brands" className="hover:underline">
              Brands
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
            {serviceLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ))}
          </div>
        </article>
      </Section>

      <Section className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">FAQ</h2>
        <FaqAccordion items={faqItems} />
      </Section>

      <Section className="py-10 md:py-14">
        <RelatedLinks
          title="Related knowledge"
          links={KNOWLEDGE_ARTICLES.filter((item) => item.slug !== article.slug)
            .slice(0, 3)
            .map((item) => ({ href: `/knowledge/${item.slug}`, title: item.title, description: item.category }))}
        />
      </Section>

      <JsonLd id={`knowledge-article-${slug}`} data={articleJsonLd} />
      <JsonLd id={`knowledge-faq-${slug}`} data={faqJsonLd} />
    </div>
  );
}
