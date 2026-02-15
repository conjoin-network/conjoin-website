import type { Metadata } from "next";
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
    "Conjoin Network Pvt. Ltd. delivers procurement-led IT programs across workspace, security, networking, surveillance, and access with commercial clarity.",
  path: "/"
});

const trustItems = ["Partner-led", "Response < 30 mins", "Canada + India delivery"];
const panelPrimaryButtonClass = "min-h-10 w-full sm:w-auto px-4 text-xs";
const panelSecondaryButtonClass =
  "min-h-10 w-full sm:w-auto border-slate-300 bg-slate-50 px-4 text-xs text-slate-900 hover:border-slate-400 hover:bg-slate-100";

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
      <div className="flex h-full flex-col rounded-3xl p-4 pb-14 text-slate-900 sm:p-5 sm:pb-14 md:p-6 md:pb-6" style={withThemeStyles("workspace")}>
        <div className="space-y-2">
          <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Workspace
          </span>
          <h2 className="text-2xl font-semibold text-slate-900">Microsoft 365 + Endpoint Governance</h2>
          <p className="text-sm text-slate-600">Rollout clarity for users, devices, identity, and adoption operations.</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:grid-cols-3 sm:gap-3">
          {[
            ["Email & Collaboration", "Exchange", "Teams", "SharePoint"],
            ["Identity", "Entra ID", "SSO", "Conditional access"],
            ["Device Management", "Intune", "Compliance policies", "Remote support"]
          ].map(([title, a, b, c]) => (
            <div
              key={title}
              className="interactive-card rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(37,99,235,0.35)] sm:p-4"
            >
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-500">
                {[a, b, c].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--brand-microsoft)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
          <ButtonLink href="/request-quote?brand=Microsoft&source=/" variant="primary" className={panelPrimaryButtonClass}>
            Request Quote
          </ButtonLink>
          <ButtonLink
            href="/solutions/workspace"
            variant="secondary"
            className={panelSecondaryButtonClass}
          >
            Explore Solutions
          </ButtonLink>
        </div>
      </div>
    )
  },
  {
    id: "secure",
    title: "Secure service line",
    description: "Endpoint, email, and backup resilience for business continuity.",
    panel: (
      <div className="flex h-full flex-col rounded-3xl p-4 pb-14 text-slate-900 sm:p-5 sm:pb-14 md:p-6 md:pb-6" style={withThemeStyles("secure")}>
        <div className="space-y-2">
          <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Secure
          </span>
          <h2 className="text-2xl font-semibold text-slate-900">Security and Resilience Operations</h2>
          <p className="text-sm text-slate-600">Policy-first rollout for endpoint, email, and recovery governance.</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:grid-cols-3 sm:gap-3">
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
              className="interactive-card rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(37,99,235,0.35)] sm:p-4"
            >
              <h3 className="text-sm font-semibold text-slate-900">{block.title}</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-500">
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

        <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
          <ButtonLink
            href="/solutions/secure"
            variant="secondary"
            className={panelSecondaryButtonClass}
          >
            View details
          </ButtonLink>
          <ButtonLink href="/request-quote?brand=Seqrite&source=/" variant="primary" className={panelPrimaryButtonClass}>
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
      <div className="flex h-full flex-col rounded-3xl p-4 pb-14 text-slate-900 sm:p-5 sm:pb-14 md:p-6 md:pb-6" style={withThemeStyles("vision")}>
        <div className="space-y-2">
          <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Vision
          </span>
          <h2 className="text-2xl font-semibold text-slate-900">Surveillance and visibility programs</h2>
          <p className="text-sm text-slate-600">Coverage, retention, and monitoring workflows aligned for operational continuity.</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:grid-cols-3 sm:gap-3">
          {[
            ["Monitoring", "Live dashboards", "Centralized alerts", "Operator handover"],
            ["Recording", "NVR/VMS planning", "Retention design", "Audit readiness"],
            ["Access & Incident", "Visitor flow", "Policy controls", "Incident evidence"]
          ].map(([title, a, b, c]) => (
            <div
              key={title}
              className="interactive-card rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(37,99,235,0.35)] sm:p-4"
            >
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-500">
                {[a, b, c].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
          <ButtonLink href="/request-quote?brand=Cisco&source=/" variant="primary" className={panelPrimaryButtonClass}>
            Request Quote
          </ButtonLink>
          <ButtonLink
            href="/solutions/vision"
            variant="secondary"
            className={panelSecondaryButtonClass}
          >
            Explore Solutions
          </ButtonLink>
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
          <header className="space-y-4 py-2 md:py-3">
            <h1 className="text-[clamp(1.75rem,7vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)]">
              Partner-led IT service lines for modern business operations.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] md:text-base md:leading-7">
              Conjoin Network Pvt. Ltd. delivers procurement-led IT programs across workspace, security, networking, surveillance, and access, with commercial clarity.
            </p>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <ButtonLink href="/request-quote" variant="primary" className="min-h-11 w-full sm:w-auto">
                Request Quote
              </ButtonLink>
              <ButtonLink href="/solutions" variant="secondary" className="min-h-11 w-full sm:w-auto">
                Explore Solutions
              </ButtonLink>
            </div>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-text-secondary)] md:text-sm">
              {trustItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                  {item}
                </li>
              ))}
            </ul>
          </header>

          <Carousel
            slides={heroSlides}
            autoplayMs={2000}
            className="h-full w-full max-w-full"
            heightClassName="min-h-[460px] sm:min-h-[480px] md:min-h-[450px]"
          />
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
                  className="space-y-3 rounded-2xl p-5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.45)]"
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
              <Card key={step.title} className="space-y-2 rounded-2xl p-5 shadow-[0_8px_22px_-20px_rgba(15,23,42,0.5)]">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Step {index + 1}</p>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{step.line}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="space-y-4">
          <h2 className="text-[clamp(1.7rem,3.5vw,2.2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--color-text-primary)]">
            Proof and trust
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {proofMetrics.map((metric) => (
              <Card key={metric.label} className="space-y-2 rounded-2xl p-4 text-center shadow-[0_10px_20px_-18px_rgba(15,23,42,0.45)]">
                <p className="text-3xl font-semibold text-[var(--color-text-primary)]">{metric.value}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{metric.label}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((entry) => (
              <Card key={entry.author} className="space-y-3 rounded-2xl p-4 shadow-[0_8px_22px_-20px_rgba(15,23,42,0.5)]">
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
