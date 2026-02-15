import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Container from "@/app/components/Container";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminLeadsClient from "@/app/admin/leads/AdminLeadsClient";
import { getPortalSessionFromCookies } from "@/lib/admin-session";

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
              </>
            ) : null}
            <AdminLogoutButton redirectTo="/crm" />
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Signed in as {session.displayName} ({session.role})
          {session.assignee ? ` • Assigned scope: ${session.assignee}` : ""}
        </p>
        <AdminLeadsClient />
      </Container>
    </div>
  );
}
