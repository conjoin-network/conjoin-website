import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import {
  KNOWLEDGE_ARTICLES,
  KNOWLEDGE_CATEGORIES,
  getKnowledgeByCategory
} from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Knowledge Hub | Licensing, Compliance, TCO and Renewals",
  description:
    "Index of procurement-focused knowledge content for licensing decisions, security compliance, renewals and deployment playbooks.",
  path: "/knowledge"
});

export default function KnowledgeHubPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Knowledge Hub"
          subtitle="Licensing guides, compliance notes, procurement playbooks and renewal best practices for IT and purchase teams."
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: "/search", label: "Search Knowledge", variant: "secondary" }
          ]}
          bullets={[
            "Procurement-oriented writing",
            "North India business context",
            "Coming soon content roadmap"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-8">
          {KNOWLEDGE_CATEGORIES.map((category) => {
            const articles = getKnowledgeByCategory(category);
            return (
              <section key={category} className="space-y-3">
                <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{category}</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {articles.map((article) => (
                    <Link key={article.slug} href={`/knowledge/${article.slug}`}>
                      <Card className="space-y-2 p-4 transition hover:-translate-y-0.5">
                        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{article.title}</h3>
                        <p className="text-sm">{article.description}</p>
                        <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">Coming soon</p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <Card className="space-y-2 p-4">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Article index count</h2>
          <p className="text-sm">{KNOWLEDGE_ARTICLES.length} placeholder articles are live and indexable.</p>
        </Card>
      </Section>
    </div>
  );
}
