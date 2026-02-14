import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import {
  BRAND_CATEGORIES,
  BRAND_CATEGORY_HINTS,
  getBrandsByCategory
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
  const categoryAccent: Record<(typeof BRAND_CATEGORIES)[number], string> = {
    Security: "rgba(14, 116, 144, 0.16)",
    Networking: "rgba(59, 130, 246, 0.16)",
    "Cloud & Productivity": "rgba(37, 99, 235, 0.16)",
    "Enterprise Software": "rgba(79, 70, 229, 0.16)",
    "Endpoint & Devices": "rgba(15, 118, 110, 0.16)",
    "Data Center & Backup": "rgba(51, 65, 85, 0.16)"
  };

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
        <div className="space-y-8">
          {BRAND_CATEGORIES.map((category) => {
            const brands = getBrandsByCategory(category);
            return (
              <section key={category} className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{category}</h2>
                  <p className="text-sm">{BRAND_CATEGORY_HINTS[category]}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {brands.map((brand) => (
                    <Link
                      key={brand.slug}
                      href={`/request-quote?brand=${encodeURIComponent(brand.name)}&source=/brands`}
                    >
                      <Card className="space-y-3 p-4 transition hover:-translate-y-0.5">
                        <span
                          aria-hidden
                          className="block h-1 w-16 rounded-full"
                          style={{ backgroundColor: categoryAccent[category] }}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{brand.name}</h3>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            LIVE
                          </span>
                        </div>
                        <p className="text-xs">{brand.description}</p>
                        <p className="text-xs font-semibold text-[var(--color-primary)]">Request quote for this brand</p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
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
