import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cisco Solutions Advisory",
  description:
    "Cisco collaboration, networking and security procurement pathways with neutral advisory and support planning.",
  path: "/cisco"
});

const cards = [
  {
    title: "Collaboration",
    href: "/cisco/collaboration",
    detail: "Meetings, calling and workspace collaboration pathways."
  },
  {
    title: "Networking",
    href: "/cisco/networking",
    detail: "Routing, switching and Wi-Fi planning for business operations."
  },
  {
    title: "Security",
    href: "/cisco/security",
    detail: "Risk-aware security architecture and procurement guidance."
  }
];

export default function CiscoPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Cisco Solutions"
          subtitle="High-level procurement advisory across collaboration, networking and security scopes."
          ctas={[
            {
              href: "/request-quote?brand=Cisco&source=/cisco",
              label: "Request Quote"
            },
            {
              href: "/brands/cisco",
              label: "Brand Overview",
              variant: "secondary"
            }
          ]}
          bullets={[
            "Neutral OEM optioning",
            "TCO and compliance focus",
            "Support continuity planning"
          ]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.href} className="space-y-2">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{card.title}</h2>
              <p className="text-sm">{card.detail}</p>
              <Link href={card.href} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                Explore
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="Cisco OEM documentation" />
      </Section>
    </div>
  );
}
