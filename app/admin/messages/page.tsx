import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import Container from "@/app/components/Container";
import { getPortalSessionFromCookies } from "@/lib/admin-session";
import { formatDateTime } from "@/lib/leads";
import { readMessageQueue } from "@/lib/message-queue";

export const metadata: Metadata = {
  title: "Admin Messages Queue",
  description: "Read-only view of queued and delivered messaging intents.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminMessagesPage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (!session) {
    redirect("/admin/login");
  }
  if (!session.isManagement) {
    redirect("/admin/leads");
  }

  const messages = await readMessageQueue();

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-6">
        <header className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Message Queue</h1>
            <AdminLogoutButton />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">Read-only delivery intent log for email and WhatsApp channels.</p>
        </header>

        <section className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white">
          <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
            <thead className="bg-[var(--color-alt-bg)] text-left text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payload</th>
                <th className="px-4 py-3">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {messages.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-[var(--color-text-secondary)]" colSpan={7}>
                    No queued messages yet.
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr key={message.id} className="align-top">
                    <td className="px-4 py-4">{formatDateTime(message.createdAt)}</td>
                    <td className="px-4 py-4 font-medium text-[var(--color-text-primary)]">{message.leadId}</td>
                    <td className="px-4 py-4 uppercase">{message.channel}</td>
                    <td className="px-4 py-4">{message.to || "-"}</td>
                    <td className="px-4 py-4">{message.status}</td>
                    <td className="max-w-xl px-4 py-4 text-xs text-[var(--color-text-secondary)]">{message.payload}</td>
                    <td className="px-4 py-4 text-xs text-rose-600">{message.error ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </Container>
    </div>
  );
}
