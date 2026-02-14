import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/app/components/Button";
import Card from "@/app/components/Card";
import Section from "@/app/components/Section";
import { getTheme, withThemeStyles } from "@/lib/brand/themes";
import { SOLUTION_LINES } from "@/lib/solutions-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Solutions Portfolio | Workspace, Security, Network, Vision, Access",
  description:
    "Conjoin service line portfolio for workspace, cybersecurity, networking, surveillance, and access delivery.",
  path: "/solutions"
});

export default function SolutionsPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-12 md:pt-12">
        <header className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-8">
          <h1 className="text-[clamp(2rem,5vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)]">
            Service line portfolio
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
            Explore Conjoin service families across modern workspace, cybersecurity, networking, surveillance, and access programs.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/request-quote" variant="primary">Request Quote</ButtonLink>
            <ButtonLink href="/commercial" variant="secondary">Commercial Model</ButtonLink>
          </div>
        </header>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SOLUTION_LINES.map((solution) => {
            const theme = getTheme(solution.key);
            return (
              <Card
                key={solution.slug}
                data-theme={solution.key}
                className="space-y-3 p-6"
                style={{ ...withThemeStyles(solution.key), background: theme.gradientWash, boxShadow: theme.glow }}
              >
                <span
                  className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "var(--theme-badge-bg)", color: "var(--theme-badge-text)" }}
                >
                  {theme.label}
                </span>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{solution.title}</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">{solution.promise}</p>
                <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                  {solution.summaryBullets.map((bullet) => (
                    <li key={`${solution.slug}-${bullet}`} className="flex items-center gap-2">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: theme.accent }} />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <ButtonLink href={`/solutions/${solution.slug}`} variant="secondary" className="mt-1 min-h-10 w-full text-xs">
                  View Details
                </ButtonLink>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-secondary)]">
          Looking for quote-led commercial guidance? Visit{" "}
          <Link href="/commercial" className="font-semibold text-[var(--color-primary)] hover:underline">
            Commercial Model
          </Link>
          .
        </div>
      </Section>
    </div>
  );
}
