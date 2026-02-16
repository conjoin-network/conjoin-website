import type { Metadata } from "next";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { ButtonLink } from "@/app/components/Button";
import { buildMetadata } from "@/lib/seo";

const title = "Endpoint Security for Business | Conjoin Network";
const description =
  "Endpoint protection, policy control, and visibility with Seqrite endpoint security available.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/security/endpoint-protection"
});

export default function EndpointProtectionPage() {
  return (
    <div>
      <Section>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-6xl">
            Endpoint Security for Business
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
            Protect every device with policy control and real-time visibility.
          </p>
        </div>
      </Section>

      <Section tone="alt">
        <Card>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
            Business outcomes
          </h2>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[var(--color-text-secondary)] md:text-base">
            <li>Endpoint protection with centralized control</li>
            <li>Policy enforcement for web, USB, and apps</li>
            <li>Visibility across devices and users</li>
            <li>Ransomware and phishing protection layer</li>
            <li>Seqrite endpoint security available</li>
          </ul>
        </Card>
      </Section>

      <Section>
        <Card className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              Strengthen endpoint protection
            </h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)] md:text-base">
              Get a phased rollout plan for your fleet.
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
