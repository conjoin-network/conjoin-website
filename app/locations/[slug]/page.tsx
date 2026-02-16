import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/app/components/Card";
import JsonLd from "@/app/components/JsonLd";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import RelatedLinks from "@/app/components/RelatedLinks";
import {
  ORG_AREA_SERVED,
  ORG_NAME,
  ORG_POSTAL_ADDRESS,
  getOrgContactPoints,
  getOrgEmails,
  getOrgPhones
} from "@/lib/contact";
import {
  LOCATION_PAGES,
  getLocationBySlug
} from "@/lib/locations-data";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LOCATION_PAGES.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  return buildMetadata({
    title: location ? location.title : "Location Coverage",
    description: location ? location.description : "Location service coverage page.",
    path: `/locations/${slug}`
  });
}

export default async function LocationPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location) {
    notFound();
  }

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: ORG_NAME,
    url: absoluteUrl(`/locations/${location.slug}`),
    areaServed: ORG_AREA_SERVED,
    address: ORG_POSTAL_ADDRESS,
    telephone: getOrgPhones(),
    email: getOrgEmails(),
    contactPoint: getOrgContactPoints()
  };

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title={location.title}
          subtitle={location.description}
          ctas={[
            {
              href: `/request-quote?city=${encodeURIComponent(location.name)}&source=/locations/${location.slug}`,
              label: "Request Quote"
            },
            {
              href: "/locations",
              label: "View All Locations",
              variant: "secondary"
            }
          ]}
          bullets={location.trust.slice(0, 3)}
          microcopy="Request a quote (best price + compliance-ready proposal). Get renewal reminders & license management."
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Coverage highlights</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {location.coverage.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
          <p className="text-sm">Serving Chandigarh Tricity + North India procurement and deployment workflows.</p>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
            <Link href="/request-quote" className="hover:underline">
              Request Quote
            </Link>
            <Link href="/knowledge" className="hover:underline">
              Knowledge Hub
            </Link>
            <Link href="/brands" className="hover:underline">
              Brands
            </Link>
          </div>
        </Card>
      </Section>

      <Section className="py-10 md:py-14">
        <RelatedLinks
          links={[
            { href: "/microsoft", title: "Microsoft advisory", description: "Licensing and migration support." },
            { href: "/seqrite", title: "Seqrite advisory", description: "Endpoint security options." },
            {
              href: "/knowledge/chandigarh-it-procurement-guide",
              title: "Procurement checklist",
              description: "Coming soon knowledge placeholder."
            }
          ]}
        />
      </Section>
      <JsonLd id={`local-business-${location.slug}`} data={localBusinessJsonLd} />
    </div>
  );
}
