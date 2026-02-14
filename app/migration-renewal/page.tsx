import type { Metadata } from "next";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { ButtonLink } from "@/app/components/Button";
import { buildMetadata } from "@/lib/seo";

const title = "Microsoft 365 Migration & Renewal | Conjoin Network";
const description =
  "Planned Microsoft 365 migrations, renewals, and continuity services with minimal downtime.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/migration-renewal"
});

export default function MigrationRenewalPage() {
  return (
    <div>
      <Section>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-6xl">
            Migration & Renewal
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
            Move or renew with a clear plan and zero-downtime approach.
          </p>
        </div>
      </Section>

      <Section tone="alt">
        <Card>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
            Common scenarios
          </h2>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[var(--color-text-secondary)] md:text-base">
            <li>Move from legacy email</li>
            <li>Renew Microsoft 365 licenses</li>
            <li>Tenant-to-tenant or domain changes</li>
            <li>Zero downtime approach</li>
          </ul>
        </Card>
      </Section>

      <Section>
        <Card className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              Plan your migration
            </h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)] md:text-base">
              Share your tenant size and timeline.
            </p>
          </div>
          <ButtonLink href="/request-quote" variant="primary">
            Request a Quote
          </ButtonLink>
        </Card>
      </Section>
    </div>
  );
}
