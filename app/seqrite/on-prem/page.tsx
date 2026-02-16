import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Seqrite On-Prem Console Deployment",
  description:
    "On-prem Seqrite deployment pathways for organizations requiring local policy governance and server-aware planning.",
  path: "/seqrite/on-prem"
});

export default function SeqriteOnPremPage() {
  const relatedKnowledge = getRelatedKnowledge(["seqrite", "on-prem", "endpoint", "compliance"], 3);

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Seqrite On-Prem Console Deployment"
          subtitle="Local policy control model for security teams needing in-environment governance and server planning."
          ctas={[
            {
              href: "/request-quote?brand=Seqrite&delivery=On-Prem&source=/seqrite/on-prem",
              label: "Request Quote"
            },
            {
              href: "/seqrite/cloud",
              label: "Compare Cloud",
              variant: "secondary"
            }
          ]}
          bullets={[
            "On-prem policy control",
            "Endpoints and servers scoping",
            "Renewal continuity support"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Deployment prep</h2>
            <p className="text-sm">Map infra readiness and endpoint/server inventory before rollout.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Policy baseline</h2>
            <p className="text-sm">Define access and hardening baselines aligned to compliance needs.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Run and renew</h2>
            <p className="text-sm">Set ownership for support workflows and renewal checkpoints.</p>
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
