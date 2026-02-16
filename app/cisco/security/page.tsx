import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cisco Security Advisory",
  description: "Coming-soon security procurement pathways for firewall, access and threat defense planning.",
  path: "/cisco/security"
});

export default function CiscoSecurityPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Cisco Security"
          subtitle="High-level security procurement pathways for risk-aware business environments."
          ctas={[
            { href: "/request-quote?brand=Cisco&category=Firewall&source=/cisco/security", label: "Request Quote" },
            { href: "/cisco", label: "Back to Cisco", variant: "secondary" }
          ]}
          bullets={["Risk-oriented planning", "Compliance-ready commercials", "Lifecycle support"]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Coming soon</h2>
          <p className="text-sm">Detailed procurement outcomes and implementation guides are being prepared.</p>
        </Card>
      </Section>
    </div>
  );
}
