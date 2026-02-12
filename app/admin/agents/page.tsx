import type { Metadata } from "next";
import Container from "@/app/components/Container";
import { buildAgentSummary } from "@/lib/admin-metrics";
import { readLeads } from "@/lib/leads";

export const metadata: Metadata = {
  title: "Admin Agents",
  description: "Agent-level lead counters and ownership visibility.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminAgentsPage() {
  const leads = await readLeads();
  const summary = buildAgentSummary(leads);

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-5">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Agents</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Assignment counters for management tracking and daily coordination.
          </p>
        </header>

        <section className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white">
          <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
            <thead className="bg-[var(--color-alt-bg)] text-left text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">New</th>
                <th className="px-4 py-3">In-Progress</th>
                <th className="px-4 py-3">Won</th>
                <th className="px-4 py-3">Touched Today</th>
                <th className="px-4 py-3">Total Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {summary.map((agent) => (
                <tr key={agent.name}>
                  <td className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">{agent.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{agent.role}</td>
                  <td className="px-4 py-3">{agent.newCount}</td>
                  <td className="px-4 py-3">{agent.inProgressCount}</td>
                  <td className="px-4 py-3">{agent.wonCount}</td>
                  <td className="px-4 py-3">{agent.touchedToday}</td>
                  <td className="px-4 py-3">{agent.totalAssigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </Container>
    </div>
  );
}
