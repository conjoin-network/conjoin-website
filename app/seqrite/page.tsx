import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import PageHero from "@/app/components/PageHero";
import RelatedLinks from "@/app/components/RelatedLinks";
import Section from "@/app/components/Section";
import { getRelatedKnowledge } from "@/lib/knowledge-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Seqrite Endpoint Security for Business",
  description:
    "Seqrite endpoint security advisory for cloud and on-prem deployment models with procurement, support and renewal governance.",
  path: "/seqrite"
});

export default function SeqritePage() {
  const relatedKnowledge = getRelatedKnowledge(["seqrite", "endpoint", "edr", "renewals"], 3);

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Seqrite Endpoint Security — Cloud and On-Prem"
          subtitle="Deployment planning, policy hardening, renewal governance and support continuity for business teams."
          ctas={[
            {
              href: "/request-quote?brand=Seqrite&source=/seqrite",
              label: "Request Quote"
            },
            {
              href: "/seqrite/cloud",
              label: "View Plans",
              variant: "secondary"
            }
          ]}
          bullets={[
            "Endpoints/Servers-based scoping",
            "Cloud managed and on-prem pathways",
            "Renewal and support continuity"
          ]}
          microcopy="Request a quote (best price + compliance-ready proposal). Get renewal reminders & license management."
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Cloud managed</h2>
            <p className="text-sm">Central policy control with distributed endpoint visibility.</p>
            <Link href="/seqrite/cloud" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Explore cloud
            </Link>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">On-prem console</h2>
            <p className="text-sm">Local control model for policy-resident or restricted environments.</p>
            <Link href="/seqrite/on-prem" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Explore on-prem
            </Link>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">EDR readiness</h2>
            <p className="text-sm">Response-aware endpoint maturity planning and rollout sequencing.</p>
            <Link href="/seqrite/edr" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Explore EDR
            </Link>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <FaqAccordion
          items={[
            {
              question: "How do you choose cloud vs on-prem deployment?",
              answer:
                "We align deployment model with policy ownership, infrastructure constraints and security operations maturity."
            },
            {
              question: "Can renewals be handled with deployment support?",
              answer:
                "Yes. Renewal governance and support continuity are included in procurement planning."
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
