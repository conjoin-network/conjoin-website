import type { Metadata } from "next";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { ButtonLink } from "@/app/components/Button";
import { buildMetadata } from "@/lib/seo";

const title = "Reduce Total Cost of Ownership (TCO) | Conjoin Network";
const description =
  "Reduce IT costs with consolidated licensing, predictable budgets, and centralized admin support.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/tco"
});

export default function TcoPage() {
  return (
    <div>
      <Section>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-6xl">
            Reduce Total Cost of Ownership (TCO)
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
            Consolidate tools, improve uptime, and keep costs predictable.
          </p>
        </div>
      </Section>

      <Section tone="alt">
        <Card>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
            What lowers TCO
          </h2>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[var(--color-text-secondary)] md:text-base">
            <li>Consolidated licensing and fewer overlapping tools</li>
            <li>Reduced downtime and faster issue resolution</li>
            <li>Improved security posture and lower risk exposure</li>
            <li>Predictable costs with clear renewal planning</li>
            <li>Centralized administration and expert support</li>
          </ul>
        </Card>
      </Section>

      <Section>
        <Card className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              Align costs with outcomes
            </h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)] md:text-base">
              Get a clear plan to optimize licensing and operations.
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
