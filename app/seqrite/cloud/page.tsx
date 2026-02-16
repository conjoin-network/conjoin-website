import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Seqrite Cloud Deployment",
  description:
    "Cloud-managed Seqrite endpoint deployment for centralized policy operations and renewal lifecycle continuity.",
  path: "/seqrite/cloud"
});

export default function SeqriteCloudPage() {
  const relatedKnowledge = getRelatedKnowledge(["seqrite", "cloud", "endpoint", "procurement"], 3);

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Seqrite Cloud Managed Deployment"
          subtitle="Centralized endpoint governance for distributed teams with support continuity and renewal planning."
          ctas={[
            {
              href: "/request-quote?brand=Seqrite&delivery=Cloud&source=/seqrite/cloud",
              label: "Request Quote"
            },
            {
              href: "/seqrite/on-prem",
              label: "Compare On-Prem",
              variant: "secondary"
            }
          ]}
          bullets={[
            "Cloud-managed policy operations",
            "Endpoint-first quantity scoping",
            "Business support workflows"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Essentials</h2>
            <p className="text-sm">Baseline endpoint controls for smaller security operations teams.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Advanced</h2>
            <p className="text-sm">Expanded policy depth for growing endpoint footprints.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Complete</h2>
            <p className="text-sm">Wider controls and governance posture for mature operations.</p>
          </Card>
        </div>
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
    </div>
  );
}
