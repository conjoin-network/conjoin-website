import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cisco Networking Advisory",
  description: "Coming-soon networking procurement pathways for routing, switching and Wi-Fi outcomes.",
  path: "/cisco/networking"
});

export default function CiscoNetworkingPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Cisco Networking"
          subtitle="High-level advisory for switching, routing and wireless modernization scopes."
          ctas={[
            { href: "/request-quote?brand=Cisco&category=Switching&source=/cisco/networking", label: "Request Quote" },
            { href: "/cisco", label: "Back to Cisco", variant: "secondary" }
          ]}
          bullets={["Topology-aligned scope", "TCO and risk review", "Rollout support planning"]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Coming soon</h2>
          <p className="text-sm">Detailed procurement and deployment notes are being added for networking workflows.</p>
        </Card>
      </Section>

      <Section className="py-10 md:py-14">
        <PartnerDisclaimer sourceLabel="Cisco OEM documentation" />
      </Section>
    </div>
  );
}
