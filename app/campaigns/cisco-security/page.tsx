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
  title: "Cisco Security & Networking Campaign",
  description:
    "Cisco campaign page for security, switching, Wi-Fi and collaboration RFQs with procurement-focused outcomes.",
  path: "/campaigns/cisco-security"
});

type PageProps = {
  searchParams: Promise<CampaignQuery>;
};

export default async function CiscoCampaignPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const quoteHref = buildCampaignQuoteHref(params, {
    brand: "Cisco",
    source: "/campaigns/cisco-security",
    utmSourceDefault: "campaign-cisco-security"
  });
  const whatsappHref = buildCampaignWhatsAppHref(params, {
    brand: "Cisco",
    requirement: "Firewall, switching, Wi-Fi or collaboration requirement"
  });

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Cisco Security and Networking RFQ Support"
          subtitle="Category-first procurement flow for firewall, switching, Wi-Fi and collaboration requirements."
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
            <p className="text-sm">Category-led optioning to align budget, scale and support lifecycle.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Compliance-ready</h2>
            <p className="text-sm">Scope built for governance checks and procurement documentation.</p>
          </Card>
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">SLA & support</h2>
            <p className="text-sm">Clear post-sales ownership, timeline checkpoints and renewal handling.</p>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">What you get</h2>
        <FaqAccordion
          items={[
            {
              question: "Category-first requirement mapping",
              answer: "Firewall, switching, Wi-Fi and collaboration pathways matched to business need."
            },
            {
              question: "Commercial proposal structure",
              answer: "Clear scope with quantity assumptions, support expectations and governance-ready wording."
            },
            {
              question: "Execution and support continuity",
              answer: "Deployment planning and post-go-live support ownership defined before closure."
            }
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <RelatedLinks
          links={[
            { href: "/cisco", title: "Cisco page", description: "Explore networking, collaboration and security pathways." },
            { href: "/brands", title: "Brands hub", description: "See live and coming-soon OEM routes." },
            { href: "/knowledge", title: "Knowledge hub", description: "Procurement, compliance and renewal guidance." }
          ]}
        />
      </Section>

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="Cisco OEM documentation" />
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
