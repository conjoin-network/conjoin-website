import type { Metadata } from "next";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { ButtonLink } from "@/app/components/Button";
import { buildMetadata } from "@/lib/seo";

const title = "Microsoft 365 for Business & Enterprise | Conjoin Network";
const description =
  "Licensing guidance, tenant setup, security baseline, migration planning, and ongoing support for Microsoft 365.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/microsoft-365"
});

export default function Microsoft365Page() {
  return (
    <div>
      <Section>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-6xl">
            Microsoft 365 for Business & Enterprise
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
            Get the right licensing, security posture, and rollout plan for
            teams of any size.
          </p>
        </div>
      </Section>

      <Section tone="alt">
        <Card>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
            What we do
          </h2>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[var(--color-text-secondary)] md:text-base">
            <li>Licensing guidance and plan selection</li>
            <li>Tenant setup and identity alignment</li>
            <li>Security baseline and policy hardening</li>
            <li>Migration planning and phased onboarding</li>
            <li>Ongoing support for admins and users</li>
          </ul>
        </Card>
      </Section>

      <Section>
        <Card className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              Scope your Microsoft 365 rollout
            </h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)] md:text-base">
              Get a clear timeline and licensing map.
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
