import type { Metadata } from "next";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Microsoft Business Plans | Users/Seats Guidance",
  description:
    "Procurement support for Microsoft 365 Business plan selection with migration readiness and renewal governance.",
  path: "/microsoft/business"
});

export default function MicrosoftBusinessPage() {
  const relatedKnowledge = getRelatedKnowledge(["microsoft", "licensing", "business", "renewals"], 3);

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Microsoft Business Plans"
          subtitle="Choose the right plan for users/seats with licensing fit, migration readiness and support continuity."
          ctas={[
            {
              href: "/request-quote?brand=Microsoft&category=Business&source=/microsoft/business",
              label: "Request Quote"
            },
            {
              href: "/microsoft/enterprise",
              label: "See Enterprise",
              variant: "secondary"
            }
          ]}
          bullets={[
            "Plan fit by user profile",
            "Commercial clarity before purchase",
            "Renewal and lifecycle management"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Business Basic</h2>
            <p className="text-sm">Entry collaboration and email pathway for cost-sensitive seat planning.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Business Standard</h2>
            <p className="text-sm">Balanced productivity and collaboration with structured onboarding support.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Business Premium</h2>
            <p className="text-sm">Expanded security and management posture for growing business operations.</p>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <FaqAccordion
          items={[
            {
              question: "How do you map the right business plan?",
              answer:
                "We review seat counts, collaboration patterns and compliance needs, then align a procurement-ready recommendation."
            },
            {
              question: "Can we start with one tier and scale later?",
              answer:
                "Yes. We plan phased licensing so seats can be optimized as your team grows."
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
