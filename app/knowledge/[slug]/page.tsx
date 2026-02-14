import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import { KNOWLEDGE_ARTICLES, getKnowledgeBySlug } from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

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
            "Coming soon article",
            "Procurement and compliance focus",
            "Built for IT and purchase teams"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Coming soon</h2>
          <p className="text-sm">
            This article is being prepared for IT and purchase teams that need commercial clarity without vendor noise.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>Procurement scope framing with TCO and compliance checkpoints.</li>
            <li>Commercial and renewal guardrails for predictable lifecycle costs.</li>
            <li>Deployment considerations with risk controls and rollback readiness.</li>
            <li>Procurement Q&amp;A patterns for IT, finance and leadership reviews.</li>
          </ul>
          <p className="text-sm">Coming soon: official matrices and buyer worksheets.</p>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
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
        </Card>
      </Section>

      <Section className="py-10 md:py-14">
        <RelatedLinks
          title="Related knowledge"
          links={KNOWLEDGE_ARTICLES.filter((item) => item.slug !== article.slug)
            .slice(0, 3)
            .map((item) => ({ href: `/knowledge/${item.slug}`, title: item.title, description: item.category }))}
        />
      </Section>
    </div>
  );
}
