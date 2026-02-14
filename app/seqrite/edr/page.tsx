import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Seqrite EDR Advisory",
  description:
    "EDR-focused procurement support for detection and response readiness with deployment and renewal governance.",
  path: "/seqrite/edr"
});

export default function SeqriteEdrPage() {
  const relatedKnowledge = getRelatedKnowledge(["seqrite", "edr", "endpoint", "security"], 3);

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Seqrite EDR Advisory"
          subtitle="Improve endpoint detection and response maturity with structured deployment and procurement outcomes."
          ctas={[
            {
              href: "/request-quote?brand=Seqrite&category=EDR&source=/seqrite/edr",
              label: "Request Quote"
            },
            {
              href: "/products/edr",
              label: "See EDR Product Page",
              variant: "secondary"
            }
          ]}
          bullets={[
            "Detection-response readiness",
            "Endpoint/server scope clarity",
            "Support and renewal continuity"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Assess</h2>
            <p className="text-sm">Review current controls and response workflow maturity.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Deploy</h2>
            <p className="text-sm">Align rollouts with policy hardening and operational ownership.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Operate</h2>
            <p className="text-sm">Track incident readiness with renewal and support governance.</p>
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

      <Section tone="alt" className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="Seqrite OEM documentation" />
      </Section>
    </div>
  );
}
