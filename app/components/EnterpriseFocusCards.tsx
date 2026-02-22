import Card from "@/app/components/Card";

const FOCUS_CARDS = [
  {
    title: "Procurement",
    copy: "Structured procurement workflow, OEM-aligned commercials, and approval-ready quoting."
  },
  {
    title: "Security & Compliance",
    copy: "Documentation-first deployment with security baselines and compliance-friendly handover."
  },
  {
    title: "Support & SLA",
    copy: "Business-hour response, escalation ownership, and renewal continuity across locations."
  }
] as const;

export default function EnterpriseFocusCards() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">For Enterprises</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {FOCUS_CARDS.map((item) => (
          <Card key={item.title} className="space-y-2 p-5 md:p-6">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{item.copy}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
