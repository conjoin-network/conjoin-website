import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Container from "@/app/components/Container";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import { getPortalSessionFromCookies } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "Lead operations management console.",
  robots: {
    index: false,
    follow: false
  }
};

const links = [
  {
    href: "/admin/leads",
    title: "Leads",
    description: "Manage assignments, status, notes, and follow-up actions."
  },
  {
    href: "/admin/agents",
    title: "Agents",
    description: "View per-agent counters for assignments and touchpoints."
  },
  {
    href: "/admin/scoreboard",
    title: "Scoreboard",
    description: "Track daily lead volume, SLA and source performance."
  },
  {
    href: "/admin/messages",
    title: "Messages",
    description: "Review queued messaging intents for email and WhatsApp."
  }
];

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-5">
        <header className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Admin Console</h1>
            <AdminLogoutButton />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">Management visibility for live lead operations and campaign-driven RFQs.</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Signed in as {session.displayName} ({session.role})
          </p>
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Data is confidential. Access is logged. Do not share externally.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]/35 hover:shadow-[0_14px_28px_-20px_rgba(0,113,227,0.35)]"
            >
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{link.title}</h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{link.description}</p>
            </Link>
          ))}
        </section>
      </Container>
    </div>
  );
}
