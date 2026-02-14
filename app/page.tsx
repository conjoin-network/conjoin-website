import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import FaqAccordion from "@/app/components/FaqAccordion";
import RelatedLinks from "@/app/components/RelatedLinks";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Microsoft, Seqrite & Cisco Solutions for Business Teams",
  description:
    "Licensing, migration, security, renewals and support with procurement-ready proposals for Microsoft, Seqrite and Cisco requirements.",
  path: "/"
});

const fiveFinger = [
  {
    title: "Email",
    line: "Exchange Online + mail flow"
  },
  {
    title: "Collaboration",
    line: "Teams + SharePoint + OneDrive"
  },
  {
    title: "Identity",
    line: "Entra ID (Azure AD) + SSO"
  },
  {
    title: "Security",
    line: "Defender + compliance basics"
  },
  {
    title: "Access & Device",
    line: "Intune + device + conditional access"
  }
];

export default function Home() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <div className="space-y-4">
          <PageHero
            title="Microsoft, Seqrite & Cisco Solutions for Business Teams"
            subtitle="Licensing, migration, security, renewals & support — procurement-ready proposals."
            ctas={[
              {
                href: "/request-quote",
                label: "Request a Quote"
              },
              {
                href: "#solutions",
                label: "Browse Solutions",
                variant: "secondary"
              }
            ]}
            bullets={[
              "Since 2014",
              "Response in 15 minutes (business hours)",
              "Chandigarh Tricity + North India coverage"
            ]}
            microcopy="Request a quote (best price + compliance-ready proposal). Get renewal reminders & license management."
          />
          <div className="pt-1">
            <Link
              href="#solutions"
              className="scroll-cue inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
            >
              Scroll
              <span aria-hidden>↓</span>
            </Link>
          </div>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14" id="solutions">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Microsoft 365</h2>
            <p className="text-sm">Business and enterprise plan mapping, migration strategy, and support.</p>
            <Link href="/microsoft" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              See Microsoft plans
            </Link>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Seqrite Security</h2>
            <p className="text-sm">Cloud or on-prem endpoint protection with procurement and renewal governance.</p>
            <Link href="/seqrite" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              See Seqrite plans
            </Link>
          </Card>
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Commercial Clarity</h2>
            <p className="text-sm">Compliance-ready proposals focused on TCO, renewals, and budget predictability.</p>
            <Link href="/request-quote" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Start quote workflow
            </Link>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">
            Microsoft — The 5-Finger Model (Easy to Remember)
          </h2>
          <div className="grid gap-3 md:grid-cols-5">
            {fiveFinger.map((item) => (
              <Card key={item.title} className="space-y-2 p-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
                <p className="text-xs">{item.line}</p>
              </Card>
            ))}
          </div>
          <p className="text-sm">
            We align your tenant around these five pillars so licensing, migration, security, and support stay
            predictable.
          </p>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Learn more</h2>
        <FaqAccordion
          items={[
            {
              question: "How fast do you respond to quote requests?",
              answer:
                "During business hours, we respond first on WhatsApp, then share an email summary and next-step checklist."
            },
            {
              question: "Can you help with renewals and compliance documentation?",
              answer:
                "Yes. We structure renewal reminders, plan mapping, and compliance-ready proposals for procurement teams."
            },
            {
              question: "Do you provide migration advisory before purchase?",
              answer:
                "Yes. Discovery and migration suitability are reviewed before commercial recommendations are shared."
            }
          ]}
        />
      </Section>

      <Section className="py-10 md:py-14">
        <RelatedLinks
          links={[
            {
              href: "/microsoft",
              title: "Microsoft advisory",
              description: "Licensing, migration and enterprise rollout guidance."
            },
            {
              href: "/seqrite",
              title: "Seqrite advisory",
              description: "Cloud and on-prem endpoint security procurement support."
            },
            {
              href: "/knowledge",
              title: "Knowledge hub",
              description: "Licensing, TCO, compliance and renewal content."
            }
          ]}
        />
      </Section>
    </div>
  );
}
