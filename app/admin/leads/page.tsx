import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Container from "@/app/components/Container";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminLeadsClient from "@/app/admin/leads/AdminLeadsClient";
import { getPortalSessionFromCookies } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "CRM Lite | Leads",
  description: "Management lead inbox for quote operations and assignments.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLeadsPage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Internal Use Only</p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--color-primary)]">
            <Link href="/admin" className="hover:underline">
              Console Home
            </Link>
            {session.isManagement ? (
              <Link href="/admin/pipeline" className="hover:underline">
                Pipeline
              </Link>
            ) : null}
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
                <Link href="/admin/events" className="hover:underline">
                  Events
                </Link>
              </>
            ) : null}
            <AdminLogoutButton />
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
