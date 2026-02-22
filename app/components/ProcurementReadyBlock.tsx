import Card from "@/app/components/Card";

const PROCUREMENT_POINTS = [
  "Government & PSU procurement-ready (GeM process supported)",
  "Bank and enterprise documentation: GST invoice, formal quote, compliance-ready paperwork",
  "PO and tender assistance after requirement validation",
  "Transparent partner billing with non-circumvention commitment"
] as const;

const WHO_WE_SERVE = ["SMEs", "Enterprises", "System Integrators", "Government/PSU", "Banks"] as const;

const FAQS = [
  {
    q: "Do you support Government orders?",
    a: "Yes. We support GeM-process aligned documentation and procurement workflows after requirement validation."
  },
  {
    q: "Can partners bill through you?",
    a: "Yes. We support channel-safe, transparent billing flows across OEM, distributor, partner and end customer."
  },
  {
    q: "Do you provide GST-compliant quotations?",
    a: "Yes. GST-ready quotations and related commercial documentation are part of the standard engagement."
  }
] as const;

export default function ProcurementReadyBlock() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Procurement Ready</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Serving enterprises, government teams, and channel partners across Chandigarh Tricity with procurement-led licensing,
          security, compliance, and renewal lifecycle execution.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-primary)]">
          {PROCUREMENT_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {WHO_WE_SERVE.map((item) => (
            <span key={item} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2 p-5 md:p-6">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Channel-First. Partner-Safe.</h3>
          <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <li>OEM → Distributor → Partner → End Customer with clean billing flow.</li>
            <li>Partner-led delivery support for deployment, renewal, and continuity.</li>
            <li>Non-circumvention commitment for partner customer protection.</li>
          </ul>
        </Card>
        <Card className="space-y-2 p-5 md:p-6">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Seqrite (Quick Heal) Channel Positioning</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            We support Seqrite (Quick Heal) business security licensing and renewals through a channel-friendly,
            documentation-first process backed by authorized supply channels.
          </p>
        </Card>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">FAQ</h3>
        <div className="mt-3 space-y-3">
          {FAQS.map((item) => (
            <article key={item.q} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-alt-bg)]/65 p-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.q}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
