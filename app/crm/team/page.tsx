import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/app/components/Container";
import { getPortalSessionFromCookies, getPortalUsers } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "CRM Team Onboarding",
  description: "Internal onboarding and role-access overview for CRM staff.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function CrmTeamPage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (!session) {
    redirect("/crm");
  }

  if (!session.isManagement) {
    redirect("/crm/leads");
  }

  const users = getPortalUsers();

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-5">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Team Onboarding</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Role-based access for CRM staff. Credentials remain admin-managed for operational safety.
          </p>
        </header>

        <section className="admin-card rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Quick Add User</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Account provisioning is controlled by management credentials and environment-backed access policy.
          </p>
          <p className="mt-3 text-sm text-[var(--color-text-primary)]">
            Ask admin to create account and assign role:
            <span className="ml-2 rounded-full border border-[var(--color-border)] px-2 py-1 text-xs font-semibold">
              Sales / Dealer / Enterprise / LocalOps
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-primary)]">
            <Link href="/admin/agents" className="hover:underline">
              Open Agent Console
            </Link>
            <Link href="/crm/leads" className="hover:underline">
              Back to CRM Leads
            </Link>
          </div>
        </section>

        <section className="admin-card overflow-x-auto rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Current Team Access Map</h2>
            <span className="text-xs text-[var(--color-text-secondary)]">{users.length} configured users</span>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Portal Role</th>
                <th className="px-3 py-2">CRM Role</th>
                <th className="px-3 py-2">Assigned Scope</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.username} className="border-b border-[var(--color-border)]/60">
                  <td className="px-3 py-2 font-semibold text-[var(--color-text-primary)]">{user.displayName}</td>
                  <td className="px-3 py-2 text-[var(--color-text-secondary)]">{user.username}</td>
                  <td className="px-3 py-2 text-[var(--color-text-primary)]">{user.role}</td>
                  <td className="px-3 py-2 text-[var(--color-text-primary)]">{user.crmRole}</td>
                  <td className="px-3 py-2 text-[var(--color-text-secondary)]">{user.assignee ?? "All leads"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </Container>
    </div>
  );
}
