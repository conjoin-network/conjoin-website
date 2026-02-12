import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/app/components/Container";
import AdminLeadsClient from "@/app/admin/leads/AdminLeadsClient";

export const metadata: Metadata = {
  title: "CRM Lite | Leads",
  description: "Management lead inbox for quote operations and assignments.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLeadsPage() {
  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Internal Use Only</p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--color-primary)]">
            <Link href="/admin" className="hover:underline">
              Console Home
            </Link>
            <Link href="/admin/agents" className="hover:underline">
              Agents
            </Link>
            <Link href="/admin/scoreboard" className="hover:underline">
              Scoreboard
            </Link>
            <Link href="/admin/messages" className="hover:underline">
              Message Queue
            </Link>
          </div>
        </div>
        <AdminLeadsClient />
      </Container>
    </div>
  );
}
