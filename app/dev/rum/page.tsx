import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecentRumEvents, getRumSummary } from "@/lib/rum-store";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";

export const metadata: Metadata = {
  title: "RUM Metrics | Dev",
  description: "Real-user metrics summary for local validation.",
  robots: {
    index: false,
    follow: false
  },
  alternates: {
    canonical: "/dev/rum"
  }
};

export default async function RumDashboardPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const [summary, recentEvents] = await Promise.all([getRumSummary(), getRecentRumEvents(50)]);

  return (
    <Section className="py-10 md:py-14">
      <div className="space-y-5">
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">RUM Metrics Summary</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Rolling {summary.windowDays}-day view. Stored events: {summary.count}.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summary.metrics.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-[var(--color-text-secondary)]">No RUM metrics captured yet.</p>
            </Card>
          ) : (
            summary.metrics.map((metric) => (
              <Card key={metric.name} className="space-y-2 p-5">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{metric.name}</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">Samples: {metric.count}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">p75: {metric.p75}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">p95: {metric.p95}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Latest: {metric.latest}</p>
              </Card>
            ))
          )}
        </div>

        <p className="text-xs text-[var(--color-text-secondary)]">Updated: {summary.updatedAt}</p>

        <Card className="space-y-3 p-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Last 50 events</h2>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">No events captured yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs text-[var(--color-text-secondary)]">
                <thead className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-primary)]">
                  <tr>
                    <th className="px-2 py-1">Time</th>
                    <th className="px-2 py-1">Metric</th>
                    <th className="px-2 py-1">Value</th>
                    <th className="px-2 py-1">Rating</th>
                    <th className="px-2 py-1">Path</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="border-t border-[var(--color-border)]">
                      <td className="px-2 py-1.5">{new Date(event.createdAt).toLocaleString()}</td>
                      <td className="px-2 py-1.5">{event.name}</td>
                      <td className="px-2 py-1.5">{event.value}</td>
                      <td className="px-2 py-1.5">{event.rating}</td>
                      <td className="px-2 py-1.5">{event.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Section>
  );
}
