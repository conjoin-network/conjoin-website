import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/app/components/Button";
import Card from "@/app/components/Card";
import Carousel from "@/app/components/ui/Carousel";
import RelatedLinks from "@/app/components/RelatedLinks";
import Section from "@/app/components/Section";
import { getTheme, withThemeStyles } from "@/lib/brand/themes";
import { SOLUTION_LINES } from "@/lib/solutions-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Conjoin Network | Partner-led IT Service Lines for Business Teams",
  description:
    "Conjoin portfolio and services across workspace, security, networking, surveillance, and access with quote-led commercial delivery.",
  path: "/"
});

const trustItems = ["Partner-led", "Response < 30 mins", "Canada + India delivery"];

const processSteps = [
  {
    title: "Discover",
    line: "Clarify business outcomes, risk, and rollout constraints."
  },
  {
    title: "Design",
    line: "Map the right solution family and implementation pathway."
  },
  {
    title: "Deliver",
    line: "Execute with milestones, support ownership, and renewal continuity."
  }
] as const;

const proofMetrics = [
  { label: "Service lines", value: "5" },
  { label: "Partner-led response", value: "< 30 min" },
  { label: "Delivery footprint", value: "India + Canada" }
] as const;

const testimonials = [
  {
    quote:
      "Conjoin simplified our licensing and rollout decisions in one cycle, without confusing SKU-level noise.",
    author: "IT Lead, Manufacturing Group"
  },
  {
    quote:
      "Commercial proposals were structured for procurement and compliance from day one.",
    author: "Purchase Head, Multi-site Services Firm"
  }
] as const;

const heroSlides = [
  {
    id: "workspace",
    title: "Workspace service line",
    description: "Microsoft 365, endpoint governance, and modern workplace rollout.",
    panel: (
      <div className="flex h-full flex-col justify-between rounded-3xl p-6" style={withThemeStyles("workspace")}>
        <div className="space-y-3">
          <span
            className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "var(--theme-badge-bg)",
              color: "var(--theme-badge-text)"
            }}
          >
            Workspace
          </span>
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Microsoft 365 + Endpoint Governance</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Rollout clarity for users, devices, and identity operations.</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <ButtonLink href="/solutions/workspace" variant="secondary" className="min-h-10 px-4 text-xs">
            View details
          </ButtonLink>
          <Image
            src="/brand/conjoin-logo.png"
            alt="Conjoin workspace service line"
            width={120}
            height={120}
            sizes="120px"
            className="h-auto w-auto"
            priority
          />
        </div>
      </div>
    )
  },
  {
    id: "secure",
    title: "Secure service line",
    description: "Endpoint, email, and backup resilience for business continuity.",
    panel: (
      <div className="flex h-full flex-col rounded-3xl p-5 md:p-6" style={withThemeStyles("secure")}>
        <div className="space-y-2">
          <span
            className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "var(--theme-badge-bg)",
              color: "var(--theme-badge-text)"
            }}
          >
            Secure
          </span>
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Security and Resilience Operations</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Policy-first rollout for endpoint, email, and recovery governance.</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Endpoint Protection",
              bullets: ["EDR / XDR", "Device Control", "Policy Enforcement"]
            },
            {
              title: "Email Security",
              bullets: ["Anti-Phishing", "SPF / DKIM / DMARC", "Microsoft 365 Protection"]
            },
            {
              title: "Backup & Recovery",
              bullets: ["M365 Backup", "Endpoint Backup", "Disaster Recovery"]
            }
          ].map((block) => (
            <div
              key={block.title}
              className="interactive-card rounded-xl border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_96%,transparent)] p-4 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(37,99,235,0.35)]"
            >
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{block.title}</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                {block.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--brand-seqrite)]" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <ButtonLink href="/solutions/secure" variant="secondary" className="min-h-10 px-4 text-xs">
            View details
          </ButtonLink>
          <ButtonLink href="/request-quote?brand=Seqrite&source=/" variant="primary" className="min-h-10 px-4 text-xs">
            Request Quote
          </ButtonLink>
        </div>
      </div>
    )
  },
  {
    id: "vision",
    title: "Vision service line",
    description: "Surveillance and monitoring architecture for multi-site operations.",
    panel: (
      <div className="flex h-full flex-col justify-between rounded-3xl p-6" style={withThemeStyles("vision")}>
        <div className="space-y-3">
          <span
            className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "var(--theme-badge-bg)",
              color: "var(--theme-badge-text)"
            }}
          >
            Vision
          </span>
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Surveillance and visibility programs</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Coverage, retention, and monitoring workflows aligned for growth.</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <ButtonLink href="/solutions/vision" variant="secondary" className="min-h-10 px-4 text-xs">
            View details
          </ButtonLink>
          <Image
            src="/brand/conjoin-logo.png"
            alt="Conjoin vision service line"
            width={120}
            height={120}
            sizes="120px"
            className="h-auto w-auto"
          />
        </div>
      </div>
    )
  }
];

export default function Home() {
  return (
    <div>
      <Section className="pb-9 pt-6 md:pb-11 md:pt-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
          <header className="space-y-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <h1 className="text-[clamp(2rem,5vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)]">
              Partner-led IT service lines for modern business operations.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
              Conjoin is a portfolio and services firm delivering workspace, security, networking, surveillance, and access programs with commercial clarity.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/solutions" variant="secondary" className="min-h-11">
                Explore Solutions
              </ButtonLink>
              <ButtonLink href="/request-quote" variant="primary" className="min-h-11">
                Request Quote
              </ButtonLink>
            </div>
            <ul className="grid gap-2 text-sm text-[var(--color-text-secondary)] md:grid-cols-3">
              {trustItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                  {item}
                </li>
              ))}
            </ul>
          </header>

          <Carousel slides={heroSlides} autoplayMs={2000} className="h-full" heightClassName="min-h-[350px] md:min-h-[405px]" />
        </div>
      </Section>

      <Section id="service-lines" tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-[clamp(1.7rem,3.5vw,2.2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--color-text-primary)]">
            Service lines at a glance
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {SOLUTION_LINES.map((line) => {
              const theme = getTheme(line.key);
              return (
                <Card
                  key={line.slug}
                  className="space-y-3 p-5"
                  data-theme={line.key}
                  data-service-card="true"
                  style={{
                    ...withThemeStyles(line.key),
                    background: theme.gradientWash,
                    boxShadow: theme.glow
                  }}
                >
                  <span
                    className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold"
                    data-card-badge="true"
                    style={{
                      background: "var(--theme-badge-bg)",
                      color: "var(--theme-badge-text)"
                    }}
                  >
                    {theme.label}
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{line.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{line.promise}</p>
                  <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                    {line.summaryBullets.map((bullet) => (
                      <li key={`${line.slug}-${bullet}`} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.accent }} aria-hidden />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <ButtonLink href={`/solutions/${line.slug}`} variant="secondary" className="mt-2 min-h-10 w-full text-xs">
                    View Details
                  </ButtonLink>
                </Card>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="space-y-4">
          <h2 className="text-[clamp(1.7rem,3.5vw,2.2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--color-text-primary)]">
            How Conjoin works
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <Card key={step.title} className="space-y-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Step {index + 1}</p>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{step.line}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-[clamp(1.7rem,3.5vw,2.2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--color-text-primary)]">
            Proof and trust
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {proofMetrics.map((metric) => (
              <Card key={metric.label} className="space-y-2 p-5 text-center">
                <p className="text-3xl font-semibold text-[var(--color-text-primary)]">{metric.value}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{metric.label}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((entry) => (
              <Card key={entry.author} className="space-y-3 p-5">
                <blockquote className="text-sm leading-7 text-[var(--color-text-secondary)]">“{entry.quote}”</blockquote>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">{entry.author}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <RelatedLinks
          links={[
            {
              href: "/solutions",
              title: "Explore all solutions",
              description: "Workspace, secure, network, vision, and access service lines."
            },
            {
              href: "/commercial",
              title: "Commercial model",
              description: "How quote-led pricing and implementation scope are structured."
            },
            {
              href: "/request-quote",
              title: "Start RFQ",
              description: "Send your requirement and receive a compliance-ready proposal."
            }
          ]}
        />
      </Section>
    </div>
  );
}
