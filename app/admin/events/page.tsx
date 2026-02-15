import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/app/components/Container";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminEventsClient from "@/app/admin/events/AdminEventsClient";
import { getPortalSessionFromCookies } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Admin Events",
  description: "Audit and event trail for lead lifecycle actions.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminEventsPage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-5">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Audit Events</h1>
            <AdminLogoutButton />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Event stream for lead creation, assignment, status updates, notes and messaging actions.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--color-primary)]">
            <Link href="/admin" className="hover:underline">
              Console Home
            </Link>
            <Link href="/admin/leads" className="hover:underline">
              Leads
            </Link>
            <Link href="/admin/pipeline" className="hover:underline">
              Pipeline
            </Link>
          </div>
        </header>

        <AdminEventsClient />
      </Container>
    </div>
  );
}
