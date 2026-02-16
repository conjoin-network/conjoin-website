import type { Metadata } from "next";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Microsoft Enterprise Plans | Governance and Security",
  description:
    "Enterprise plan guidance for Microsoft environments requiring governance, identity depth, compliance and renewal continuity.",
  path: "/microsoft/enterprise"
});

export default function MicrosoftEnterprisePage() {
  const relatedKnowledge = getRelatedKnowledge(["microsoft", "enterprise", "compliance", "renewals"], 3);

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Microsoft Enterprise Plans"
          subtitle="Enterprise-grade licensing and deployment planning for governance-heavy IT and purchase workflows."
          ctas={[
            {
              href: "/request-quote?brand=Microsoft&category=Enterprise&source=/microsoft/enterprise",
              label: "Request Quote"
            },
            {
              href: "/microsoft/addons",
              label: "See Add-ons",
              variant: "secondary"
            }
          ]}
          bullets={[
            "E3/E5 pathway planning",
            "Identity and compliance posture mapping",
            "Renewal governance and support continuity"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Discovery</h2>
            <p className="text-sm">Review workloads, security obligations and commercial constraints.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Design</h2>
            <p className="text-sm">Define licensing structure, migration checkpoints and identity baseline.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Operate</h2>
            <p className="text-sm">Plan renewals, support ownership and ongoing seat governance.</p>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <FaqAccordion
          items={[
            {
              question: "Do you share inclusion details before purchase?",
              answer:
                "Yes. We reference OEM documentation in the proposal and avoid custom claims outside OEM terms."
            },
            {
              question: "Can enterprise plans be phased across departments?",
              answer:
                "Yes. We can phase rollout by business units while keeping governance and support continuity intact."
            }
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
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
