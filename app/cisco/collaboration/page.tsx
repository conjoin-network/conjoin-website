import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cisco Collaboration Advisory",
  description: "Coming-soon collaboration procurement pathways for calling, meetings and workspace outcomes.",
  path: "/cisco/collaboration"
});

export default function CiscoCollaborationPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Cisco Collaboration"
          subtitle="High-level advisory for meetings, calling and collaboration workflows."
          ctas={[
            { href: "/request-quote?brand=Cisco&category=Collaboration&source=/cisco/collaboration", label: "Request Quote" },
            { href: "/cisco", label: "Back to Cisco", variant: "secondary" }
          ]}
          bullets={["Use-case discovery", "Commercial clarity", "Support planning"]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <Card className="space-y-2">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Coming soon</h2>
          <p className="text-sm">We are adding structured collaboration procurement guides and deployment playbooks.</p>
        </Card>
      </Section>
    </div>
  );
}
