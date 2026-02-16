import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Microsoft Security Add-ons Procurement",
  description:
    "Identity, endpoint, email and cloud app security add-on pathways for Microsoft-aligned procurement scopes.",
  path: "/microsoft/addons"
});

export default function MicrosoftAddonsPage() {
  const relatedKnowledge = getRelatedKnowledge(["microsoft", "compliance", "security", "licensing"], 3);

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Microsoft Security Add-ons"
          subtitle="Scope identity, endpoint and workload protection add-ons based on compliance and risk priorities."
          ctas={[
            {
              href: "/request-quote?brand=Microsoft&category=Add-ons&source=/microsoft/addons",
              label: "Request Quote"
            },
            {
              href: "/microsoft",
              label: "Back to Microsoft",
              variant: "secondary"
            }
          ]}
          bullets={[
            "Identity and access controls",
            "Endpoint and device policies",
            "Compliance-oriented recommendation"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Identity</h2>
            <p className="text-sm">Plan around SSO and access posture outcomes.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Endpoint</h2>
            <p className="text-sm">Align device security and policy controls with user groups.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Email &amp; Apps</h2>
            <p className="text-sm">Map workload controls to risk and compliance requirements.</p>
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
