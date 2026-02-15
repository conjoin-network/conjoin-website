import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/app/components/Container";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import PipelineBoardClient from "@/app/admin/pipeline/PipelineBoardClient";
import { getPortalSessionFromCookies } from "@/lib/admin-session";
import { PIPELINE_LATER, PIPELINE_NEXT, PIPELINE_NOW, PIPELINE_TASKS } from "@/lib/pipeline-data";

export const metadata: Metadata = {
  title: "Admin Pipeline",
  description: "Internal execution pipeline for revenue and automation tasks.",
  robots: {
    index: false,
    follow: false
  }
};

function statusCounts() {
  return PIPELINE_TASKS.reduce(
    (acc, task) => {
      acc[task.status] += 1;
      return acc;
    },
    { TODO: 0, DOING: 0, DONE: 0 }
  );
}

function formatIds(ids: string[]) {
  return ids.length ? ids.join(", ") : "-";
}

export default async function AdminPipelinePage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (!session) {
    redirect("/admin/login");
  }

  const counts = statusCounts();

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-5">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Execution Pipeline</h1>
            <AdminLogoutButton />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Revenue and automation execution board with P0-first ordering.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--color-primary)]">
            <Link href="/admin" className="hover:underline">
              Console Home
            </Link>
            <Link href="/admin/leads" className="hover:underline">
              Leads
            </Link>
            <Link href="/admin/messages" className="hover:underline">
              Message Queue
            </Link>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="admin-card rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">TODO</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">{counts.TODO}</p>
          </article>
          <article className="admin-card rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">DOING</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">{counts.DOING}</p>
          </article>
          <article className="admin-card rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">DONE</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">{counts.DONE}</p>
          </article>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <article className="admin-card rounded-xl p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Now</h2>
            <p className="mt-2 text-sm">{formatIds(PIPELINE_NOW)}</p>
          </article>
          <article className="admin-card rounded-xl p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Next</h2>
            <p className="mt-2 text-sm">{formatIds(PIPELINE_NEXT)}</p>
          </article>
          <article className="admin-card rounded-xl p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Later</h2>
            <p className="mt-2 text-sm">{formatIds(PIPELINE_LATER)}</p>
          </article>
        </section>

        <PipelineBoardClient tasks={PIPELINE_TASKS} />

        <section className="admin-card rounded-xl p-4 text-sm text-[var(--color-text-secondary)]">
          Pipeline source: <code>docs/Pipeline.md</code>
        </section>
      </Container>
    </div>
  );
}
