import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import { SUPPORT_EMAIL, mailto } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Privacy and data handling policy for Conjoin Network Private Limited.",
  path: "/privacy-policy"
});

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Privacy Policy"
          subtitle="How Conjoin Network Private Limited handles enquiry data, communication records and support requests."
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: "/contact", label: "Contact", variant: "secondary" }
          ]}
          bullets={["Procurement-focused workflows", "Business-hours response", "Data handled for service delivery"]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <Card className="space-y-3 text-sm">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Summary</h2>
          <p>We collect only information needed to respond to RFQs, provide proposals, and support active customers.</p>
          <p>Data is not sold. Access is limited to authorized staff handling sales, support and compliance workflows.</p>
          <p>
            For correction or deletion requests, contact{" "}
            <a href={mailto(SUPPORT_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </Card>
      </Section>
    </div>
  );
}
