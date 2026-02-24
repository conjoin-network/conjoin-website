import type { Metadata } from "next";
import Card from "@/app/components/Card";
import Section from "@/app/components/Section";
import PageHero from "@/app/components/PageHero";
import ContactLeadForm from "@/app/contact/ContactLeadForm";

export const metadata: Metadata = {
  title: "WOW Test",
  description: "Internal UI preview for hero, cards, trust badges, and lead form.",
  robots: {
    index: false,
    follow: false
  }
};

const trustBadges = [
  "Partner-led",
  "SLA support",
  "Compliance-ready",
  "Response < 30 mins"
] as const;

export default function WowTestPage() {
  return (
    <div>
      <Section className="pb-10 pt-8 md:pb-12 md:pt-10">
        <PageHero
          title="Premium Experience Snapshot"
          subtitle="Hero clarity, CTA hierarchy, trust signals, and polished form interactions in one internal preview."
          ctas={[
            { href: "/request-quote", label: "Primary CTA", variant: "primary" },
            { href: "/contact", label: "Secondary CTA", variant: "secondary" }
          ]}
          bullets={["Clean hierarchy", "Fast decision flow", "Lead-ready"]}
          microcopy="Internal preview only. Keep conversion flow and /thank-you behavior unchanged."
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="type-h2 text-[var(--color-text-primary)]">Trust Badges + Card System</h2>
          <div className="flex flex-wrap gap-2">
            {trustBadges.map((item) => (
              <span
                key={item}
                className="inline-flex min-h-9 items-center rounded-full border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-3 text-xs font-semibold text-[var(--color-text-primary)]"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Hero direction",
                body: "One headline, one clear action, one confidence strip."
              },
              {
                title: "Micro-interactions",
                body: "Subtle lift, crisp focus rings, and smooth hover timing."
              },
              {
                title: "Enterprise tone",
                body: "Premium spacing, stronger contrast, calmer gradients."
              }
            ].map((item) => (
              <Card key={item.title} className="space-y-2">
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,1.05fr)]">
          <Card className="space-y-3">
            <h2 className="type-h2 text-[var(--color-text-primary)]">Form Preview</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Uses the live minimal lead form to validate spacing, labels, focus states, and success/error presentation.
            </p>
          </Card>
          <ContactLeadForm mode="minimal" />
        </div>
      </Section>
    </div>
  );
}
