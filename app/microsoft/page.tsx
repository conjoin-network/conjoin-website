import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import PageHero from "@/app/components/PageHero";
import RelatedLinks from "@/app/components/RelatedLinks";
import Section from "@/app/components/Section";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Microsoft 365 Licensing, Migration and Support",
  description:
    "Microsoft 365 procurement advisory for licensing, migration, security baselines, renewals and support continuity.",
  path: "/microsoft"
});

export default function MicrosoftPage() {
  const relatedKnowledge = getRelatedKnowledge(["microsoft", "licensing", "migration", "renewals"], 3);

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Microsoft 365 Plans for Business Procurement Teams"
          subtitle="Licensing, migration, identity, security baseline and renewal governance with commercial clarity."
          ctas={[
            {
              href: "/request-quote?brand=Microsoft&source=/microsoft",
              label: "Request Quote"
            },
            {
              href: "/microsoft/business",
              label: "View Plans",
              variant: "secondary"
            }
          ]}
          bullets={[
            "Users/Seats aligned recommendations",
            "Migration-readiness checkpoints",
            "Renewal reminders and lifecycle support"
          ]}
          microcopy="Request a quote (best price + compliance-ready proposal). Get renewal reminders & license management."
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Business plans</h2>
            <p className="text-sm">For 1-300 users requiring productivity and security balance.</p>
            <Link href="/microsoft/business" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Explore business plans
            </Link>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Enterprise plans</h2>
            <p className="text-sm">For compliance-heavy environments with governance and identity depth.</p>
            <Link
              href="/microsoft/enterprise"
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              Explore enterprise plans
            </Link>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Security add-ons</h2>
            <p className="text-sm">Identity, endpoint and advanced controls mapped to procurement outcomes.</p>
            <Link href="/microsoft/addons" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Explore add-ons
            </Link>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <FaqAccordion
          items={[
            {
              question: "Can you compare Business vs Enterprise without overspec?",
              answer:
                "Yes. We map user roles, compliance scope and admin requirements before suggesting plan tiers."
            },
            {
              question: "Do you support migration before procurement closure?",
              answer:
                "Yes. We run a migration-readiness checkpoint so the commercial proposal reflects deployment risk and timeline."
            },
            {
              question: "Are OEM inclusions guaranteed?",
              answer:
                "Inclusions are always validated against OEM documentation at proposal time, and final licensing follows OEM terms."
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

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="Microsoft OEM documentation" />
      </Section>
    </div>
  );
}
