import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import PageHero from "@/app/components/PageHero";
import RelatedLinks from "@/app/components/RelatedLinks";
import Section from "@/app/components/Section";
import { buildCampaignQuoteHref, buildCampaignWhatsAppHref, type CampaignQuery } from "@/lib/campaign-links";
import { SALES_EMAIL, SUPPORT_EMAIL, mailto } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Seqrite Endpoint Security Campaign",
  description:
    "Seqrite endpoint security campaign page for cloud and on-prem deployment quotes with renewal and support continuity.",
  path: "/campaigns/seqrite-endpoint"
});

type PageProps = {
  searchParams: Promise<CampaignQuery>;
};

export default async function SeqriteCampaignPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const quoteHref = buildCampaignQuoteHref(params, {
    brand: "Seqrite",
    source: "/campaigns/seqrite-endpoint",
    utmSourceDefault: "campaign-seqrite-endpoint"
  });
  const whatsappHref = buildCampaignWhatsAppHref(params, {
    brand: "Seqrite",
    requirement: "Endpoint security with cloud or on-prem deployment"
  });

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Seqrite Endpoint Security for Business Teams"
          subtitle="Cloud and on-prem deployment planning with procurement clarity, renewal governance and support."
          ctas={[
            { href: quoteHref, label: "Request Quote" },
            { href: whatsappHref, label: "WhatsApp Sales", variant: "secondary" }
          ]}
          bullets={["Since 2014", "Call in 15 minutes (business hours)", "Chandigarh Tricity + North India"]}
          microcopy={
            <>
              Request a quote (best price + compliance-ready proposal). Get renewal reminders &amp; license management.
              {" "}For urgent help:{" "}
              <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                {SALES_EMAIL}
              </a>
              . Support:{" "}
              <a href={mailto(SUPPORT_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </>
          }
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">TCO clarity</h2>
            <p className="text-sm">License and deployment scope aligned to endpoint/server footprint.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Compliance-ready</h2>
            <p className="text-sm">Scope built for security governance and procurement review workflows.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">SLA & support</h2>
            <p className="text-sm">Post-deployment support and renewal checkpoints with clear ownership.</p>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">What you get</h2>
        <FaqAccordion
          items={[
            {
              question: "Cloud vs on-prem model guidance",
              answer: "Choose deployment based on policy control, infrastructure and operations readiness."
            },
            {
              question: "Endpoint and server quantity mapping",
              answer: "Commercial scope aligned to actual asset count and growth expectations."
            },
            {
              question: "Operational continuity",
              answer: "Structured onboarding, support checkpoints and renewal governance."
            }
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <RelatedLinks
          links={[
            { href: "/seqrite", title: "Seqrite page", description: "Review cloud, on-prem and EDR pathways." },
            { href: "/brands", title: "Brands hub", description: "See live and coming-soon OEM routes." },
            { href: "/knowledge", title: "Knowledge hub", description: "Procurement, compliance and renewal guidance." }
          ]}
        />
      </Section>

      <Section className="py-10 md:py-14">
        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
          <Link href="/request-quote" className="hover:underline">
            Request Quote
          </Link>
          <Link href="/brands" className="hover:underline">
            Brands
          </Link>
          <Link href="/locations/chandigarh" className="hover:underline">
            Locations
          </Link>
          <Link href="/knowledge" className="hover:underline">
            Knowledge
          </Link>
        </div>
      </Section>
    </div>
  );
}
