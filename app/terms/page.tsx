import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import { SALES_EMAIL, mailto } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: "Commercial and service engagement terms for Conjoin Network Private Limited.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Terms of Use"
          subtitle="Commercial proposals, OEM licensing and service scope are governed by signed documents and OEM terms."
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: "/contact", label: "Contact", variant: "secondary" }
          ]}
          bullets={["Partner/reseller delivery", "OEM licensing governs final terms", "Proposal scope documented in writing"]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <Card className="space-y-3 text-sm">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Summary</h2>
          <p>Quotations are provided for evaluation and are subject to OEM policy, availability and final commercial approval.</p>
          <p>Project timelines depend on requirement confirmation, deployment readiness and mutual acceptance of scope.</p>
          <p>
            For legal and commercial clarifications, contact{" "}
            <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
              {SALES_EMAIL}
            </a>
            .
          </p>
        </Card>
      </Section>
    </div>
  );
}
