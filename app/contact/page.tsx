import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import ContactLeadForm from "@/app/contact/ContactLeadForm";
import {
  ORG_AREA_SERVED,
  ORG_NAME,
  ORG_OFFICE_BLOCK,
  ORG_POSTAL_ADDRESS,
  SALES_EMAIL,
  SALES_PHONE_LANDLINE,
  SALES_PHONE_MOBILE,
  SUPPORT_EMAIL,
  getOrgContactPoints,
  getOrgEmails,
  getOrgPhones,
  mailto,
  tel
} from "@/lib/contact";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = buildMetadata({
  title: "Contact Conjoin Network",
  description: "Registered office, sales and support contacts for Conjoin Network Private Limited.",
  path: "/contact"
});

export default function ContactPage() {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: ORG_NAME,
    url: absoluteUrl("/contact"),
    areaServed: ORG_AREA_SERVED,
    address: ORG_POSTAL_ADDRESS,
    telephone: getOrgPhones(),
    email: getOrgEmails(),
    contactPoint: getOrgContactPoints()
  };

  const whatsappHref = getWhatsAppLink(
    buildQuoteMessage({ brand: "IT solution", city: "Chandigarh", requirement: "Sales support" })
  );

  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Contact Conjoin Network"
          subtitle="Reach sales and support for procurement-ready IT licensing and security proposals."
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: whatsappHref, label: "WhatsApp Sales", variant: "secondary" }
          ]}
          bullets={["Since 2014", "Business-hours response", "North India coverage"]}
          microcopy="For urgent help, share your requirement on WhatsApp or email and we will coordinate the next step."
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,1.05fr)]">
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{ORG_OFFICE_BLOCK.title}</h2>
            <p className="font-semibold text-[var(--color-text-primary)]">{ORG_NAME}</p>
            {ORG_OFFICE_BLOCK.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>
              Sales:{" "}
              <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                {SALES_EMAIL}
              </a>
            </p>
            <p>
              Support:{" "}
              <a href={mailto(SUPPORT_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
            <p>
              Phone:{" "}
              <a href={tel(SALES_PHONE_LANDLINE)} className="font-semibold text-[var(--color-primary)] hover:underline">
                {SALES_PHONE_LANDLINE}
              </a>
              {" • "}
              <a href={tel(SALES_PHONE_MOBILE)} className="font-semibold text-[var(--color-primary)] hover:underline">
                {SALES_PHONE_MOBILE}
              </a>
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
              <Link href="/brands" className="hover:underline">
                Brands
              </Link>
              <Link href="/knowledge" className="hover:underline">
                Knowledge Hub
              </Link>
              <Link href="/locations/chandigarh" className="hover:underline">
                Locations
              </Link>
            </div>
          </Card>

          <ContactLeadForm />
        </div>
      </Section>

      <Section tone="alt" className="pt-0">
        <div className="text-xs text-[var(--color-text-secondary)]">
          <p>
            If the form is temporarily unavailable, email{" "}
            <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
              {SALES_EMAIL}
            </a>{" "}
            and we will respond during business hours.
          </p>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="OEM documentation" />
      </Section>

      <Script
        id="contact-localbusiness-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
    </div>
  );
}
