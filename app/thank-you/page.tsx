import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import ThankYouConversion from "@/app/thank-you/ThankYouConversion";
import { getLeadById } from "@/lib/leads";
import { SALES_EMAIL, mailto } from "@/lib/contact";
import { absoluteUrl } from "@/lib/seo";
import { getLeadWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Thank You | Quote Received",
  description: "Quote request confirmation page.",
  alternates: {
    canonical: absoluteUrl("/thank-you")
  },
  openGraph: {
    title: "Thank You | Quote Received",
    description: "Quote request confirmation page.",
    url: absoluteUrl("/thank-you"),
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Thank You | Quote Received",
    description: "Quote request confirmation page."
  }
};

type SearchParams = {
  leadId?: string;
  brand?: string;
  city?: string;
  qty?: string;
  category?: string;
  plan?: string;
  timeline?: string;
};

export default async function ThankYouPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const lead = params.leadId ? await getLeadById(params.leadId) : null;
  const brand = params.brand ?? String(lead?.brand ?? "IT solution");
  const city = params.city ?? lead?.city ?? "Chandigarh";
  const requirement = params.plan ?? params.category ?? lead?.tier ?? lead?.category ?? "General requirement";
  const qty = params.qty ?? (typeof lead?.qty === "number" ? String(lead.qty) : "-");
  const timeline = params.timeline ?? lead?.timeline ?? "This Week";
  const quantityLabel = lead?.brand === "Microsoft" ? "Users / Seats" : lead?.brand === "Seqrite" ? "Endpoints" : "Quantity";
  const message = `Hi Conjoin, I need a quote for ${brand} - ${requirement}. City: ${city}. Qty: ${qty}. Timeline: ${timeline}.`;
  const whatsappLink = getLeadWhatsAppLink({ message, assignedTo: lead?.assignedTo ?? null });

  return (
    <Section tone="alt" className="py-10 md:py-14">
      <div className="mx-auto max-w-3xl space-y-6">
        <ThankYouConversion
          leadId={params.leadId}
          brand={brand}
          requirement={requirement}
          qty={qty}
          city={city}
          timeline={timeline}
        />
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-5xl">We received your request</h1>
          <p className="text-sm md:text-base">We received your request. Our team will contact you.</p>
          <p className="text-xs text-[var(--color-text-secondary)] md:text-sm">
            We respond on WhatsApp and email in about 15 minutes during business hours. For urgent support, email{" "}
            <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
              {SALES_EMAIL}
            </a>
            .
          </p>
          {params.leadId ? <p className="text-sm font-semibold text-[var(--color-text-primary)]">Lead ID: {params.leadId}</p> : null}
        </header>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Next steps</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>We confirm your requirement and quantity with a lead reference.</li>
            <li>We share two options: best-fit and cost-optimized proposal.</li>
            <li>We continue on WhatsApp and book a short review call if needed.</li>
          </ol>

          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand-whatsapp)] px-5 text-sm font-semibold text-white"
            >
              Continue on WhatsApp
            </a>
            <a
              href="#"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text-primary)]"
            >
              Book a 10-min call
            </a>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-alt-bg)] p-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Request summary</h3>
            <dl className="mt-2 grid grid-cols-[120px_1fr] gap-y-1 text-sm">
              <dt className="font-medium text-[var(--color-text-primary)]">Brand</dt>
              <dd>{brand}</dd>
              <dt className="font-medium text-[var(--color-text-primary)]">Requirement</dt>
              <dd>{requirement}</dd>
              <dt className="font-medium text-[var(--color-text-primary)]">{quantityLabel}</dt>
              <dd>{qty}</dd>
              <dt className="font-medium text-[var(--color-text-primary)]">City</dt>
              <dd>{city}</dd>
              <dt className="font-medium text-[var(--color-text-primary)]">Timeline</dt>
              <dd>{timeline}</dd>
            </dl>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
            <Link href="/microsoft" className="hover:underline">
              Microsoft
            </Link>
            <Link href="/seqrite" className="hover:underline">
              Seqrite
            </Link>
            <Link href="/request-quote" className="hover:underline">
              Submit another quote
            </Link>
          </div>
        </Card>
      </div>
    </Section>
  );
}
