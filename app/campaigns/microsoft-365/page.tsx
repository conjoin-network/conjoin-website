import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import FaqAccordion from "@/app/components/FaqAccordion";
import PageHero from "@/app/components/PageHero";
import RelatedLinks from "@/app/components/RelatedLinks";
import Section from "@/app/components/Section";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import { buildCampaignQuoteHref, buildCampaignWhatsAppHref, type CampaignQuery } from "@/lib/campaign-links";
import { SALES_EMAIL, SUPPORT_EMAIL, mailto } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Microsoft 365 Licensing & Migration Campaign",
  description:
    "Microsoft 365 procurement-ready quote flow for licensing, migration, compliance and renewal support in Chandigarh Tricity and North India.",
  path: "/campaigns/microsoft-365"
});

type PageProps = {
  searchParams: Promise<CampaignQuery>;
};

export default async function MicrosoftCampaignPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const quoteHref = buildCampaignQuoteHref(params, {
    brand: "Microsoft",
    source: "/campaigns/microsoft-365",
    utmSourceDefault: "campaign-microsoft-365"
  });
  const whatsappHref = buildCampaignWhatsAppHref(params, {
    brand: "Microsoft 365",
    requirement: "Licensing, migration and renewal planning"
  });

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Microsoft 365 Procurement Made Simple"
          subtitle="Licensing, migration and renewal governance with compliance-ready proposals for business teams."
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
            <p className="text-sm">Align users/seats with budget and avoid over-licensing risk.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Compliance-ready</h2>
            <p className="text-sm">Proposal scope mapped for policy, procurement and audit workflows.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">SLA & support</h2>
            <p className="text-sm">Renewal reminders and support ownership with clear checkpoints.</p>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">What you get</h2>
        <FaqAccordion
          items={[
            {
              question: "License mapping for your team structure",
              answer: "Business and enterprise pathways mapped by user roles, governance needs and renewal cycle."
            },
            {
              question: "Migration and rollout planning",
              answer: "Scope, checkpoints and cutover readiness aligned before commercial confirmation."
            },
            {
              question: "Commercial transparency",
              answer: "Procurement-ready proposal with seat counts, support scope and renewal visibility."
            }
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <RelatedLinks
          links={[
            { href: "/microsoft", title: "Microsoft page", description: "Compare plan pathways and scope options." },
            { href: "/brands", title: "Brands hub", description: "See live and coming-soon OEM routes." },
            { href: "/knowledge", title: "Knowledge hub", description: "Procurement, compliance and renewal guidance." }
          ]}
        />
      </Section>

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="Microsoft OEM documentation" />
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
