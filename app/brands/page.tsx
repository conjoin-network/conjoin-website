import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import BrandsCatalogClient from "@/app/brands/BrandsCatalogClient";
import {
  BRAND_CATEGORIES,
  BRAND_CATEGORY_HINTS,
  BRAND_TILES
} from "@/lib/brands-data";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Brands Portfolio | Security, Networking, Cloud, Collaboration and Data Center",
  description:
    "Browse Conjoin's procurement-aligned brand portfolio across security, networking, cloud, collaboration, endpoint and data center pathways.",
  path: "/brands"
});

export default function BrandsPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Brands Portfolio"
          subtitle="Security, networking, cloud, collaboration, endpoint and data center options for IT procurement teams."
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: "/search", label: "Search Routes", variant: "secondary" }
          ]}
          bullets={[
            "Distribution & Technology Solutions Partner",
            "Procurement-focused guidance",
            "Call in 15 minutes (business hours)"
          ]}
          microcopy="Request a quote (best price + compliance-ready proposal). Get renewal reminders & license management."
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <BrandsCatalogClient brands={BRAND_TILES} categories={[...BRAND_CATEGORIES]} categoryHints={BRAND_CATEGORY_HINTS} />
      </Section>

      <Section className="py-10 md:py-14">
        <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
          We&apos;ll map the right-fit SKUs and licensing based on your requirement and procurement policy.
        </p>
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href="/request-quote?source=/brands"
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
          >
            Request Quote
          </Link>
          <a
            href={getWhatsAppLink(buildQuoteMessage({ brand: "multiple OEM options", city: "Chandigarh", requirement: "Procurement support" }))}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            WhatsApp Sales
          </a>
        </div>
        <PartnerDisclaimer sourceLabel="OEM documentation" />
      </Section>
    </div>
  );
}
