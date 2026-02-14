import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import { PRODUCT_PAGES } from "@/lib/products-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Security Product Areas | Endpoint, EDR, DLP and Patch Governance",
  description:
    "Explore procurement-first solution pages for endpoint security, EDR, DLP, patch management and device control.",
  path: "/products"
});

export default function ProductsPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Product Solution Areas"
          subtitle="Short procurement-focused pages for security controls, deployment outcomes and renewal governance."
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: "/seqrite", label: "View Seqrite", variant: "secondary" }
          ]}
          bullets={[
            "North India delivery focus",
            "Compliance-oriented outcomes",
            "Commercial clarity"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_PAGES.map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`}>
              <Card className="space-y-2 p-4 transition hover:-translate-y-0.5">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{product.title}</h2>
                <p className="text-sm">{product.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
