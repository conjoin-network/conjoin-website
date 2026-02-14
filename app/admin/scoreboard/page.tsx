import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import Container from "@/app/components/Container";
import { getPortalSessionFromCookies } from "@/lib/admin-session";
import { buildScoreboard } from "@/lib/admin-metrics";
import { readLeads } from "@/lib/leads";

export const metadata: Metadata = {
  title: "Admin Scoreboard",
  description: "Lead operations KPI scoreboard for management.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminScoreboardPage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (!session) {
    redirect("/admin/login");
  }
  if (!session.isManagement) {
    redirect("/admin/leads");
  }

  const leads = await readLeads();
  const board = buildScoreboard(leads);

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-6">
        <header className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Scoreboard</h1>
            <AdminLogoutButton />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Daily KPI view for lead volume, response discipline, source mix and owner performance.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">Leads today</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">{board.leadsToday}</p>
          </article>
          <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">Response SLA met</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">{board.slaMetPercent}%</p>
          </article>
          <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">Tracked sources</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">{board.bySource.length}</p>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">By brand</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {board.byBrand.map((row) => (
                <li key={row.brand} className="flex items-center justify-between">
                  <span>{row.brand}</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{row.count}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">By source</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {board.bySource.map((row) => (
                <li key={row.source} className="flex items-center justify-between">
                  <span>{row.source}</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{row.count}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">By agent</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {board.byAgent.map((row) => (
                <li key={row.name}>
                  <p className="font-medium text-[var(--color-text-primary)]">{row.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {row.role} • Total: {row.total} • Contacted: {row.inProgress} • Won: {row.won}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </Container>
    </div>
  );
}
