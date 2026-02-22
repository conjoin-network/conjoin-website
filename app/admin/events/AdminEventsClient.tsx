"use client";

import { useEffect, useMemo, useState } from "react";

type AuditEvent = {
  id: number;
  type: string;
  leadId: string | null;
  actor: string;
  details: Record<string, unknown>;
  createdAt: string;
};

type Filters = {
  type: string;
  q: string;
  dateRange: "all" | "7" | "30";
};

const EVENT_TYPES = [
  "all",
  "lead_created",
  "lead_assigned",
  "status_changed",
  "note_added",
  "email_sent",
  "whatsapp_sent",
  "form_start",
  "form_submit_success",
  "call_click",
  "whatsapp_click",
  "request_quote_click"
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default function AdminEventsClient() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>({ type: "all", q: "", dateRange: "30" });

  const query = useMemo(() => {
    const params = new URLSearchParams({
      type: filters.type,
      q: filters.q,
      dateRange: filters.dateRange
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/events?${query}`, {
          credentials: "same-origin",
          cache: "no-store"
        });
        const payload = (await response.json()) as { ok?: boolean; events?: AuditEvent[]; message?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "Unable to load events.");
        }
        if (mounted) {
          setEvents(Array.isArray(payload.events) ? payload.events : []);
        }
      } catch (err) {
        if (mounted) {
          setEvents([]);
          setError(err instanceof Error ? err.message : "Unable to load events.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <div className="space-y-4">
      <section className="admin-card grid gap-3 rounded-2xl p-4 md:grid-cols-[220px_minmax(0,1fr)_180px]">
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
          Event Type
          <select
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)]"
          >
            {EVENT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
          Search
          <input
            type="text"
            value={filters.q}
            placeholder="lead id, actor, details"
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)]"
          />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
          Date Range
          <select
            value={filters.dateRange}
            onChange={(event) => setFilters((current) => ({ ...current, dateRange: event.target.value as "all" | "7" | "30" }))}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)]"
          >
            <option value="all">All</option>
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
          </select>
        </label>
      </section>

      {error ? (
        <p className="rounded-xl border border-rose-300/45 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</p>
      ) : null}

      <section className="admin-card overflow-auto rounded-2xl">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-page-bg)] text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-[var(--color-text-secondary)]" colSpan={5}>
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-[var(--color-text-secondary)]" colSpan={5}>
                  No events found for selected filters.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-b border-[var(--color-border)] align-top odd:bg-transparent even:bg-[var(--color-alt-bg)]/40 last:border-b-0">
                  <td className="px-4 py-3 text-xs">{formatDate(event.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-[var(--color-alt-bg)] px-2 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                      {event.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-[var(--color-text-primary)]">{event.leadId || "-"}</td>
                  <td className="px-4 py-3 text-xs">{event.actor}</td>
                  <td className="px-4 py-3">
                    <pre className="max-w-xl whitespace-pre-wrap break-words rounded-lg bg-[var(--color-page-bg)] p-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                      {JSON.stringify(event.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
