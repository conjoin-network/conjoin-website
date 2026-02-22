const INDUSTRY_ITEMS = [
  { icon: "🏛", title: "Government Departments", hint: "GeM-ready documentation and compliance support." },
  { icon: "🏢", title: "PSU Enterprises", hint: "Procurement clarity for public-sector IT programs." },
  { icon: "🏦", title: "Banks & Financial Institutions", hint: "Secure licensing and renewal lifecycle support." },
  { icon: "💳", title: "NBFCs", hint: "Fast commercial turnaround with governance-ready paperwork." },
  { icon: "🏥", title: "Healthcare & Hospitals", hint: "Endpoint security and collaboration continuity." },
  { icon: "🧪", title: "Pharma & Labs", hint: "Compliance-sensitive rollout planning and renewals." },
  { icon: "🏭", title: "Manufacturing Units", hint: "Multi-site procurement and operations support." },
  { icon: "💻", title: "IT & SaaS Companies", hint: "Role-based licensing and security posture alignment." },
  { icon: "🎓", title: "Education Institutions", hint: "Campus collaboration and identity governance." },
  { icon: "📘", title: "Universities & Coaching Institutes", hint: "Scale-ready user onboarding and access controls." },
  { icon: "🏗", title: "Real Estate & Builders", hint: "Site-ready IT procurement and coordination support." },
  { icon: "🛒", title: "Retail Chains", hint: "Branch-wide endpoint and collaboration consistency." },
  { icon: "🚚", title: "Logistics & Warehousing", hint: "Operational continuity with secure endpoint programs." },
  { icon: "📡", title: "Telecom & Infrastructure", hint: "Complex environment support with SLA discipline." },
  { icon: "🤝", title: "System Integrators / IT Partners", hint: "Channel-safe billing and partner-led delivery." },
  { icon: "📈", title: "MSMEs & Growing Businesses", hint: "Right-sized procurement with expansion-ready planning." }
] as const;

export default function IndustriesWeServe() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Industries We Serve</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {INDUSTRY_ITEMS.map((item) => (
          <article
            key={item.title}
            className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 transition hover:border-[var(--color-primary)]/40"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
              <span aria-hidden>{item.icon}</span>
              <span>{item.title}</span>
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)] opacity-80 transition group-hover:opacity-100">{item.hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
