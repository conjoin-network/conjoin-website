import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Container from "@/app/components/Container";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminLeadsClient from "@/app/admin/leads/AdminLeadsClient";
import { getPortalSessionFromCookies } from "@/lib/admin-session";
import { listCrmLeads } from "@/lib/crm";
import { canSessionAccessLead } from "@/lib/crm-access";

export const metadata: Metadata = {
  title: "CRM Leads",
  description: "Internal CRM lead inbox for assignments and status workflow.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function CrmLeadsPage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (!session) {
    redirect("/crm");
  }

  let openQueue = 0;
  let followUpsToday = 0;
  let overdueFollowUps = 0;

  try {
    const visibleLeads = (await listCrmLeads({ take: 500 })).filter((lead) => canSessionAccessLead(session, lead));
    const now = Date.now();
    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);
    const dayEndMs = dayEnd.getTime();

    for (const lead of visibleLeads) {
      const normalizedStatus = String(lead.status || "").toUpperCase();
      if (normalizedStatus === "WON" || normalizedStatus === "LOST") {
        continue;
      }
      openQueue += 1;
      if (!lead.nextFollowUpAt) {
        continue;
      }
      const followUpMs = new Date(lead.nextFollowUpAt).getTime();
      if (!Number.isFinite(followUpMs)) {
        continue;
      }
      if (followUpMs < now) {
        overdueFollowUps += 1;
      } else if (followUpMs <= dayEndMs) {
        followUpsToday += 1;
      }
    }
  } catch {
    // Keep CRM view available during temporary storage issues.
  }

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Internal Use Only</p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--color-primary)]">
            <Link href="/crm" className="hover:underline">
              CRM Login
            </Link>
            <Link href="/admin" className="hover:underline">
              Console Home
            </Link>
            {session.isManagement ? (
              <>
                <Link href="/admin/agents" className="hover:underline">
                  Agents
                </Link>
                <Link href="/admin/scoreboard" className="hover:underline">
                  Scoreboard
                </Link>
                <Link href="/admin/messages" className="hover:underline">
                  Message Queue
                </Link>
                <Link href="/crm/team" className="hover:underline">
                  Team
                </Link>
              </>
            ) : null}
            <AdminLogoutButton redirectTo="/crm" />
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Signed in as {session.displayName} ({session.role})
          {session.assignee ? ` • Assigned scope: ${session.assignee}` : ""}
        </p>
        <section className="admin-card grid gap-3 rounded-2xl p-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Open Queue</p>
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{openQueue}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Follow-ups Today</p>
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{followUpsToday}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Overdue</p>
            <p className="text-2xl font-semibold text-rose-300">{overdueFollowUps}</p>
          </div>
        </section>
        <AdminLeadsClient />
      </Container>
    </div>
  );
}
