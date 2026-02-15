import type { Metadata } from "next";
import { getRumSummary } from "@/lib/rum-store";
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
  const summary = await getRumSummary();

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
      </div>
    </Section>
  );
}
