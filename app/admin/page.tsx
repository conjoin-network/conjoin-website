import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Container from "@/app/components/Container";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import { getPortalSessionFromCookies } from "@/lib/admin-session";
import { listCrmLeads } from "@/lib/crm";
import { listAuditEvents } from "@/lib/event-log";

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
    href: "/admin/pipeline",
    title: "Pipeline",
    description: "Track execution status across P0-P3 with now/next/later visibility."
  },
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
  },
  {
    href: "/admin/events",
    title: "Events",
    description: "Audit timeline of lead creation, assignment, status and messaging events."
  }
];

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (!session) {
    redirect("/admin/login");
  }

  let leadsToday = 0;
  let leads7d = 0;
  let callClicks7d = 0;
  let whatsappClicks7d = 0;
  let topSources: Array<{ key: string; count: number }> = [];
  let topCampaigns: Array<{ key: string; count: number }> = [];
  let landingBreakdown: Array<{ key: string; count: number }> = [];

  try {
    const leads = await listCrmLeads({ take: 1000 });
    const now = Date.now();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();
    const sevenDayMs = now - 7 * 24 * 60 * 60 * 1000;

    const sourceCounter = new Map<string, number>();
    const campaignCounter = new Map<string, number>();
    const landingCounter = new Map<string, number>();

    for (const lead of leads) {
      const createdAt = new Date(lead.createdAt).getTime();
      if (Number.isFinite(createdAt) && createdAt >= dayStartMs) {
        leadsToday += 1;
      }
      if (!Number.isFinite(createdAt) || createdAt < sevenDayMs) {
        continue;
      }
      leads7d += 1;

      const sourceKey = (lead.utmSource || lead.source || "direct").trim() || "direct";
      sourceCounter.set(sourceKey, (sourceCounter.get(sourceKey) ?? 0) + 1);

      const campaignKey = (lead.utmCampaign || lead.campaign || "not_set").trim() || "not_set";
      campaignCounter.set(campaignKey, (campaignCounter.get(campaignKey) ?? 0) + 1);

      const landingKey = (lead.pagePath || lead.sourcePage || "/contact").trim() || "/contact";
      landingCounter.set(landingKey, (landingCounter.get(landingKey) ?? 0) + 1);
    }

    topSources = Array.from(sourceCounter.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    topCampaigns = Array.from(campaignCounter.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    landingBreakdown = Array.from(landingCounter.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  } catch {
    // Keep dashboard available even if data source is temporarily unavailable.
  }

  try {
    const events = await listAuditEvents({ dateRange: "7", limit: 500 });
    callClicks7d = events.filter((event) => event.type === "call_click").length;
    whatsappClicks7d = events.filter((event) => event.type === "whatsapp_click").length;
  } catch {
    // Ignore event source failures for dashboard resilience.
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
          <p className="rounded-lg border border-amber-300/45 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
            Data is confidential. Access is logged. Do not share externally.
          </p>
        </header>

        <section className="admin-card grid gap-4 rounded-2xl p-5 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Acquisition (7 days)</p>
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">{leads7d}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Leads today: {leadsToday}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Call clicks: {callClicks7d} • WhatsApp clicks: {whatsappClicks7d}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Top Sources</p>
            {topSources.length ? (
              <ul className="space-y-1 text-sm text-[var(--color-text-primary)]">
                {topSources.map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-3">
                    <span className="truncate">{item.key}</span>
                    <span className="font-semibold">{item.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--color-text-secondary)]">No source data yet.</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Top Campaigns</p>
            {topCampaigns.length ? (
              <ul className="space-y-1 text-sm text-[var(--color-text-primary)]">
                {topCampaigns.map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-3">
                    <span className="truncate">{item.key}</span>
                    <span className="font-semibold">{item.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--color-text-secondary)]">No campaign data yet.</p>
            )}
          </div>

          <div className="space-y-2 lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Landing Page Conversion Signals</p>
            {landingBreakdown.length ? (
              <ul className="grid gap-1 text-sm text-[var(--color-text-primary)] md:grid-cols-2">
                {landingBreakdown.map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2">
                    <span className="truncate">{item.key}</span>
                    <span className="font-semibold">{item.count} leads</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--color-text-secondary)]">No landing page lead data yet.</p>
            )}
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Conversion rates use lead-side signals. Visit baseline is not configured in this dashboard.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="admin-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]/35 hover:shadow-[0_14px_28px_-20px_rgba(59,130,246,0.45)]"
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
