import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import { LOCATION_PAGES } from "@/lib/locations-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "North India Coverage | Chandigarh, Panchkula, Mohali and Regional Delivery",
  description:
    "Conjoin coverage pages for Chandigarh Tricity and North India regions including Haryana, Punjab, Himachal, Uttarakhand and Jammu & Kashmir.",
  path: "/locations"
});

export default function LocationsIndexPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Locations We Serve"
          subtitle="Chandigarh Tricity-first and North India-wide delivery for licensing, security and renewal support."
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: "/search", label: "Search Routes", variant: "secondary" }
          ]}
          bullets={[
            "Chandigarh • Panchkula • Mohali",
            "Regional delivery model",
            "Since 2014"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {LOCATION_PAGES.map((location) => (
            <Link key={location.slug} href={`/locations/${location.slug}`}>
              <Card className="space-y-2 p-4 transition hover:-translate-y-0.5">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{location.name}</h2>
                <p className="text-sm">{location.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
