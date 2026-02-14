import type { Metadata } from "next";
import { ButtonLink } from "@/app/components/Button";
import Card from "@/app/components/Card";
import Section from "@/app/components/Section";
import CommercialModelClient from "@/app/commercial/CommercialModelClient";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Commercial Model | Quote-led Licensing and Services",
  description:
    "How Conjoin structures licensing, services, and implementation commercials with quote-led proposals.",
  path: "/commercial"
});

export default function CommercialPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-12 md:pt-12">
        <header className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-8">
          <h1 className="text-[clamp(2rem,4.5vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)]">
            Commercial model
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
            Conjoin is quote-led. Final commercials depend on vendor policy, implementation scope, support requirements, and deployment complexity.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/request-quote" variant="primary">
              Request Quote
            </ButtonLink>
            <ButtonLink href="/solutions" variant="secondary">
              Explore Solutions
            </ButtonLink>
          </div>
        </header>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-[clamp(1.65rem,3.2vw,2.1rem)] font-semibold text-[var(--color-text-primary)]">How pricing works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="space-y-2 p-5">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Licensing</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Licensing terms can be seat-based, device-based, or workload-based depending on OEM policy.
              </p>
            </Card>
            <Card className="space-y-2 p-5">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Services</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Advisory, migration, and operational support are scoped against timeline, complexity, and outcomes.
              </p>
            </Card>
            <Card className="space-y-2 p-5">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Implementation</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Deployment effort is estimated by site count, user/device volume, and integration dependencies.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <CommercialModelClient />
      </Section>
    </div>
  );
}
