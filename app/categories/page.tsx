import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import { CATEGORY_PAGES } from "@/lib/categories-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Category Index | Security, Networking, Cloud and IT Procurement Pathways",
  description:
    "Browse category-focused IT procurement pathways across security, networking, cloud, software, endpoint, backup and data center requirements.",
  path: "/categories"
});

export default function CategoriesIndexPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Category Index"
          subtitle="Find solution pathways by category and route directly into a prefilled procurement RFQ flow."
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: "/brands", label: "Browse Brands", variant: "secondary" }
          ]}
          bullets={[
            "Procurement-ready structure",
            "TCO and compliance focused",
            "Call in 15 minutes (business hours)"
          ]}
          microcopy="Request a quote (best price + compliance-ready proposal). Get renewal reminders & license management."
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_PAGES.map((category) => (
            <Card key={category.slug} className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{category.name}</h2>
              <p className="text-sm">{category.description}</p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
                <Link href={`/categories/${category.slug}`} className="hover:underline">
                  View category
                </Link>
                <Link
                  href={`/request-quote?category=${encodeURIComponent(category.quoteCategory)}&source=/categories/${category.slug}`}
                  className="hover:underline"
                >
                  Request Quote
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
