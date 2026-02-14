"use client";

import { useEffect, useMemo, useState } from "react";
import { AGENT_OPTIONS } from "@/lib/agents";
import { buildQuoteMessage, getLeadWhatsAppLink } from "@/lib/whatsapp";
import { LEAD_PRIORITIES, LEAD_STATUSES, type LeadPriority, type LeadStatus } from "@/lib/quote-catalog";

type LeadActivityNote = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
};

type LeadItem = {
  leadId: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo: string | null;
  lastContactedAt: string | null;
  firstContactAt: string | null;
  firstContactBy: string | null;
  nextFollowUpAt: string | null;
  brand: string;
  category: string;
  tier: string;
  qty: number;
  usersSeats?: number | null;
  endpoints?: number | null;
  servers?: number | null;
  city: string;
  timeline?: string;
  source: string;
  sourcePage: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmContent?: string;
  utmTerm?: string;
  pagePath?: string;
  referrer?: string;
  notes: string;
  activityNotes: LeadActivityNote[];
  contactName: string;
  company: string;
  email: string;
  phone: string;
};

type ApiResponse = {
  ok: boolean;
  leads: LeadItem[];
  meta: {
    total: number;
    statuses: string[];
    brands: string[];
    cities: string[];
    agents: typeof AGENT_OPTIONS;
    permissions: {
      role: "OWNER" | "MANAGER" | "AGENT" | "SUPPORT";
      displayName: string;
      assignee: string | null;
      canExport: boolean;
      canAssign: boolean;
      isManagement: boolean;
    };
  };
};

type FilterState = {
  brand: string;
  status: string;
  city: string;
  dateRange: "all" | "7" | "30";
  agent: string;
};

type DraftMap = Record<
  string,
  {
    status: LeadStatus;
    priority: LeadPriority;
    assignedTo: string;
    nextFollowUpAt: string;
    note: string;
  }
>;

const defaultFilters: FilterState = {
  brand: "all",
  status: "all",
  city: "all",
  dateRange: "30",
  agent: "all"
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "Contacted",
  QUOTED: "Quoted",
  WON: "Won",
  LOST: "Lost"
};

const PRIORITY_LABELS: Record<LeadPriority, string> = {
  HOT: "Hot",
  WARM: "Warm",
  COLD: "Cold"
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function statusClass(status: LeadStatus) {
  if (status === "WON") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "LOST") {
    return "bg-rose-50 text-rose-700";
  }
  if (status === "QUOTED") {
    return "bg-indigo-50 text-indigo-700";
  }
  if (status === "IN_PROGRESS") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-slate-100 text-slate-700";
}

function priorityClass(priority: LeadPriority) {
  if (priority === "HOT") {
    return "bg-rose-50 text-rose-700";
  }
  if (priority === "WARM") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-slate-100 text-slate-700";
}

function buildLeadSummary(lead: LeadItem) {
  return [
    `Lead ID: ${lead.leadId}`,
    `Brand: ${lead.brand}`,
    `Category: ${lead.category}`,
    `Tier: ${lead.tier}`,
    `Qty: ${lead.qty}`,
    `Company: ${lead.company}`,
    `Email: ${lead.email}`,
    `Users/Seats: ${lead.usersSeats ?? "-"}`,
    `Endpoints: ${lead.endpoints ?? "-"}`,
    `Servers: ${lead.servers ?? "-"}`,
    `City: ${lead.city}`,
    `Timeline: ${lead.timeline ?? "-"}`,
    `Contact: ${lead.contactName} (${lead.phone})`,
    `Source: ${lead.source}`
  ].join("\n");
}

export default function AdminLeadsClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [meta, setMeta] = useState<ApiResponse["meta"]>({
    total: 0,
    statuses: LEAD_STATUSES,
    brands: [],
    cities: [],
    agents: AGENT_OPTIONS,
    permissions: {
      role: "OWNER",
      displayName: "Owner",
      assignee: null,
      canExport: true,
      canAssign: true,
      isManagement: true
    }
  });
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyLeadId, setBusyLeadId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("brand", filters.brand);
    params.set("status", filters.status);
    params.set("city", filters.city);
    params.set("dateRange", filters.dateRange);
    params.set("agent", filters.agent);
    return params.toString();
  }, [filters]);

  const exportHref = useMemo(() => `/api/admin/leads/export?${query}`, [query]);
  const permissions = meta.permissions;

  async function loadLeads() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/leads?${query}`, { credentials: "same-origin" });
      if (!response.ok) {
        throw new Error(`Unable to load leads (${response.status})`);
      }

      const payload = (await response.json()) as ApiResponse;
      setLeads(payload.leads);
      setMeta(payload.meta);
      setDrafts((current) => {
        const next: DraftMap = {};
        payload.leads.forEach((lead) => {
          next[lead.leadId] = {
            status: (current[lead.leadId]?.status ?? lead.status) as LeadStatus,
            priority: (current[lead.leadId]?.priority ?? lead.priority ?? "WARM") as LeadPriority,
            assignedTo: current[lead.leadId]?.assignedTo ?? lead.assignedTo ?? "",
            nextFollowUpAt: current[lead.leadId]?.nextFollowUpAt ?? lead.nextFollowUpAt ?? "",
            note: current[lead.leadId]?.note ?? ""
          };
        });
        return next;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function updateDraft(leadId: string, key: keyof DraftMap[string], value: string) {
    setDrafts((current) => ({
      ...current,
      [leadId]: {
        status: current[leadId]?.status ?? "NEW",
        priority: current[leadId]?.priority ?? "WARM",
        assignedTo: current[leadId]?.assignedTo ?? "",
        nextFollowUpAt: current[leadId]?.nextFollowUpAt ?? "",
        note: current[leadId]?.note ?? "",
        [key]: value
      }
    }));
  }

  async function patchLead(leadId: string, body: Record<string, unknown>) {
    const response = await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ message: "Unable to update lead." }))) as {
        message?: string;
      };
      throw new Error(payload.message ?? `Unable to update (${response.status})`);
    }
  }

  async function saveLead(leadId: string, includeNote: boolean) {
    const draft = drafts[leadId];
    if (!draft) {
      return;
    }

    setBusyLeadId(leadId);
    setError("");
    setNotice("");

    try {
      await patchLead(leadId, {
        status: draft.status,
        priority: draft.priority,
        assignedTo: draft.assignedTo || null,
        nextFollowUpAt: draft.nextFollowUpAt || null,
        note: includeNote ? draft.note : ""
      });

      if (includeNote) {
        updateDraft(leadId, "note", "");
      }

      setNotice("Lead updated.");
      await loadLeads();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save lead.");
    } finally {
      setBusyLeadId(null);
    }
  }

  async function markContacted(leadId: string) {
    const draft = drafts[leadId];
    if (!draft) {
      return;
    }

    setBusyLeadId(leadId);
    setError("");
    setNotice("");

    try {
      await patchLead(leadId, {
        markContacted: true,
        status: draft.status === "NEW" ? "IN_PROGRESS" : draft.status,
        assignedTo: draft.assignedTo || null
      });
      setNotice("Lead marked as contacted.");
      await loadLeads();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to mark contacted.");
    } finally {
      setBusyLeadId(null);
    }
  }

  async function copySummary(lead: LeadItem) {
    const summary = buildLeadSummary(lead);
    try {
      await navigator.clipboard.writeText(summary);
      setNotice(`RFQ summary copied for ${lead.leadId}.`);
    } catch {
      setError("Clipboard access failed. Please copy manually.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Lead Inbox</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Assignment, status flow, WhatsApp follow-up and attribution for all incoming RFQs.
        </p>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Data is confidential. Access is logged. Do not share externally.
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Signed in as {permissions.displayName} ({permissions.role})
          {!permissions.isManagement && permissions.assignee ? ` • Assigned scope: ${permissions.assignee}` : ""}
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
        <div className={`grid gap-3 ${permissions.isManagement ? "md:grid-cols-6" : "md:grid-cols-5"}`}>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Brand
            <select
              value={filters.brand}
              onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              {meta.brands.map((brand, index) => (
                <option key={`${brand}-${index}`} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Status
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              {LEAD_STATUSES.map((status, index) => (
                <option key={`${status}-${index}`} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            City
            <select
              value={filters.city}
              onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              {meta.cities.map((city, index) => (
                <option key={`${city}-${index}`} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Date Range
            <select
              value={filters.dateRange}
              onChange={(event) =>
                setFilters((current) => ({ ...current, dateRange: event.target.value as FilterState["dateRange"] }))
              }
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </label>

          {permissions.isManagement ? (
            <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Agent
              <select
                value={filters.agent}
                onChange={(event) => setFilters((current) => ({ ...current, agent: event.target.value }))}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="Unassigned">Unassigned</option>
                {meta.agents.map((agent) => (
                  <option key={agent.name} value={agent.name}>
                    {agent.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {permissions.canExport ? (
            <div className="flex items-end justify-end gap-2">
              <a
                href={exportHref}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text-primary)]"
              >
                Export CSV
              </a>
            </div>
          ) : null}
        </div>
      </section>

      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {notice ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
      ) : null}
      {loading ? <p className="text-sm text-[var(--color-text-secondary)]">Loading leads...</p> : null}

      <section className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white">
        <table className="min-w-[2500px] divide-y divide-[var(--color-border)] text-sm">
          <thead className="bg-[var(--color-alt-bg)] text-left text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Brand / Category / Tier</th>
              <th className="px-4 py-3">Qty / Users / Endpoints / Servers</th>
              <th className="px-4 py-3">Timeline</th>
              <th className="px-4 py-3">Source / UTM</th>
              <th className="px-4 py-3">Path / Referrer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Assigned Agent</th>
              <th className="px-4 py-3">Next Follow-up</th>
              <th className="px-4 py-3">Actions</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={18} className="px-4 py-6 text-sm text-[var(--color-text-secondary)]">
                  No leads found for selected filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const draft = drafts[lead.leadId] ?? {
                  status: lead.status,
                  priority: lead.priority,
                  assignedTo: lead.assignedTo ?? "",
                  nextFollowUpAt: lead.nextFollowUpAt ?? "",
                  note: ""
                };
                const busy = busyLeadId === lead.leadId;
                const message = buildQuoteMessage({
                  brand: lead.brand,
                  city: lead.city,
                  requirement: `${lead.category} ${lead.tier}`.trim(),
                  qty: lead.qty,
                  timeline: lead.timeline ?? "This Week"
                });
                const whatsappHref = getLeadWhatsAppLink({ message, assignedTo: draft.assignedTo || null });

                return (
                  <tr key={lead.leadId} className="align-top">
                    <td className="px-4 py-4 text-xs text-[var(--color-text-secondary)]">
                      <p>{formatDate(lead.createdAt)}</p>
                      <p>{lead.leadId}</p>
                      <p>1st contact: {formatDate(lead.firstContactAt)}</p>
                      <p>By: {lead.firstContactBy || "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-[var(--color-text-primary)]">{lead.contactName}</td>
                    <td className="px-4 py-4 text-xs">{lead.company}</td>
                    <td className="px-4 py-4 text-xs">{lead.phone}</td>
                    <td className="px-4 py-4 text-xs">{lead.email}</td>
                    <td className="px-4 py-4 text-xs">{lead.city}</td>
                    <td className="px-4 py-4 text-xs">
                      <p className="font-semibold text-[var(--color-text-primary)]">{lead.brand}</p>
                      <p>{lead.category}</p>
                      <p>{lead.tier}</p>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <p>Qty: {lead.qty}</p>
                      <p>Users/Seats: {lead.usersSeats ?? "-"}</p>
                      <p>Endpoints: {lead.endpoints ?? "-"}</p>
                      <p>Servers: {lead.servers ?? "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-xs">{lead.timeline || "-"}</td>
                    <td className="px-4 py-4 text-xs">
                      <p>Source: {lead.source || "-"}</p>
                      <p>utm_source: {lead.utmSource || "-"}</p>
                      <p>utm_campaign: {lead.utmCampaign || "-"}</p>
                      <p>utm_medium: {lead.utmMedium || "-"}</p>
                      <p>utm_content: {lead.utmContent || "-"}</p>
                      <p>utm_term: {lead.utmTerm || "-"}</p>
                    </td>
                    <td className="max-w-sm px-4 py-4 text-xs">
                      <p>{lead.pagePath || "-"}</p>
                      <p className="truncate">{lead.referrer || "-"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass(draft.status)}`}>
                        {STATUS_LABELS[draft.status]}
                      </span>
                      <select
                        value={draft.status}
                        onChange={(event) => updateDraft(lead.leadId, "status", event.target.value)}
                        className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-2 py-2 text-xs"
                      >
                        {LEAD_STATUSES.map((status, index) => (
                          <option key={`${status}-${index}`} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${priorityClass(draft.priority)}`}>
                        {PRIORITY_LABELS[draft.priority]}
                      </span>
                      <select
                        value={draft.priority}
                        onChange={(event) => updateDraft(lead.leadId, "priority", event.target.value)}
                        className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-2 py-2 text-xs"
                      >
                        {LEAD_PRIORITIES.map((priority, index) => (
                          <option key={`${priority}-${index}`} value={priority}>
                            {PRIORITY_LABELS[priority]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      {permissions.canAssign ? (
                        <select
                          value={draft.assignedTo}
                          onChange={(event) => updateDraft(lead.leadId, "assignedTo", event.target.value)}
                          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-2 py-2 text-xs"
                        >
                          <option value="">Unassigned</option>
                          {meta.agents.map((agent) => (
                            <option key={agent.name} value={agent.name}>
                              {agent.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-2 py-2 text-xs">
                          {draft.assignedTo || "Unassigned"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="datetime-local"
                        value={draft.nextFollowUpAt}
                        onChange={(event) => updateDraft(lead.leadId, "nextFollowUpAt", event.target.value)}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-2 py-2 text-xs"
                      />
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Last contacted: {formatDate(lead.lastContactedAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => saveLead(lead.leadId, false)}
                          disabled={busy}
                          className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[var(--color-border)] px-2 text-xs font-semibold text-[var(--color-text-primary)]"
                        >
                          {busy ? "Saving..." : "Save"}
                        </button>
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-8 items-center justify-center rounded-lg bg-[var(--brand-whatsapp)] px-2 text-xs font-semibold text-white"
                        >
                          WhatsApp customer
                        </a>
                        <button
                          type="button"
                          onClick={() => copySummary(lead)}
                          className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[var(--color-border)] px-2 text-xs font-semibold text-[var(--color-text-primary)]"
                        >
                          Copy RFQ summary
                        </button>
                        <button
                          type="button"
                          onClick={() => markContacted(lead.leadId)}
                          disabled={busy}
                          className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-alt-bg)] px-2 text-xs font-semibold text-[var(--color-text-primary)]"
                        >
                          Mark as contacted
                        </button>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">
                          For compliance, please use official quotes only.
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <textarea
                          value={draft.note}
                          onChange={(event) => updateDraft(lead.leadId, "note", event.target.value)}
                          rows={2}
                          placeholder="Add note"
                          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-2 py-2 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => saveLead(lead.leadId, true)}
                          disabled={busy || !draft.note.trim()}
                          className="inline-flex min-h-8 w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-2 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {busy ? "Saving..." : "Add Note"}
                        </button>
                        <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                          {lead.activityNotes.length === 0 ? (
                            <li>-</li>
                          ) : (
                            lead.activityNotes.slice(0, 3).map((note) => (
                              <li key={note.id}>
                                <span className="font-medium">{formatDate(note.createdAt)}</span> {note.author}: {note.text}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
