import type { Metadata } from "next";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import KnowledgeHubClient from "@/app/knowledge/KnowledgeHubClient";
import {
  KNOWLEDGE_ARTICLES,
  KNOWLEDGE_CATEGORIES
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
            "Last-verified publishing cadence"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <KnowledgeHubClient articles={KNOWLEDGE_ARTICLES} categories={KNOWLEDGE_CATEGORIES} />
      </Section>

      <Section className="py-10 md:py-14">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Knowledge index status</h2>
          <p className="text-sm">
            {KNOWLEDGE_ARTICLES.length} procurement-focused articles are live, indexed, and connected to the RFQ flow.
          </p>
        </div>
      </Section>
    </div>
  );
}
