import type { Metadata } from "next";
import Card from "@/app/components/Card";
import PageHero from "@/app/components/PageHero";
import Section from "@/app/components/Section";
import { SUPPORT_EMAIL, mailto } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Refund Policy",
  description: "Refund and cancellation policy for procurement and subscription orders.",
  path: "/refund-policy"
});

export default function RefundPolicyPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <PageHero
          title="Refund Policy"
          subtitle="Refund outcomes depend on OEM program terms, order status and signed commercial conditions."
          ctas={[
            { href: "/request-quote", label: "Request Quote" },
            { href: "/contact", label: "Contact", variant: "secondary" }
          ]}
          bullets={["Case-by-case review", "OEM and distributor policy aligned", "Commercial documentation required"]}
        />
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <Card className="space-y-3 text-sm">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Summary</h2>
          <p>Subscription and licensing orders are generally non-refundable once provisioned, unless OEM policy states otherwise.</p>
          <p>Cancellation requests should be submitted in writing with order reference and reason for review.</p>
          <p>
            For assistance, contact{" "}
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
