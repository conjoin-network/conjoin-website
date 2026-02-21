"use client";

import { useEffect, useMemo, useState } from "react";
import { AGENT_OPTIONS } from "@/lib/agents";
import { SALES_PHONE_DISPLAY } from "@/lib/contact";
import { buildQuoteMessage, getLeadWhatsAppLink, getWhatsAppLink } from "@/lib/whatsapp";
import { LEAD_PRIORITIES, LEAD_STATUSES, type LeadPriority, type LeadStatus } from "@/lib/quote-catalog";
import { Modal } from "@/src/components/ui/Modal";

type LeadActivityNote = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
};

type LeadAiSummary = {
  summary: string;
  nextStep: string;
  priority: LeadPriority;
  generatedAt: string;
  source: "ai" | "fallback";
};

type LeadAiEmailDraft = {
  subject: string;
  body: string;
  source: "ai" | "fallback";
  generatedAt: string;
};

type LeadAiObjectionReply = {
  objection: string;
  shortReply: string;
  longReply: string;
  source: "ai" | "fallback";
  generatedAt: string;
};

type LeadItem = {
  leadId: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
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
  aiSummary?: LeadAiSummary | null;
  whatsappStatus?: "PENDING" | "SENT" | "FAILED" | null;
  whatsappLastNotifiedAt?: string | null;
  whatsappError?: string | null;
  contactName: string;
  company: string;
  email: string;
  phone: string;
};

type ApiResponse = {
  ok: boolean;
  requestId?: string;
  warning?: string | null;
  backendReachable?: boolean;
  storage_not_configured?: boolean;
  leads: LeadItem[];
  meta: {
    total: number;
    statuses: string[];
    brands: string[];
    cities: string[];
    sources: string[];
    agents: typeof AGENT_OPTIONS;
    permissions: {
      role: "OWNER" | "MANAGER" | "AGENT" | "SUPPORT";
      crmRole: "SUPER_ADMIN" | "ADMIN" | "SALES" | "DEALER" | "ENTERPRISE" | "LOCAL_OPS";
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
  source: string;
  status: string;
  scoreBand: "all" | "hot" | "warm" | "cold";
  city: string;
  dateRange: "all" | "7" | "30";
  agent: string;
  query: string;
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
  source: "all",
  status: "all",
  scoreBand: "all",
  city: "all",
  dateRange: "30",
  agent: "all",
  query: ""
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "Contacted",
  QUOTED: "Negotiation",
  WON: "Won",
  LOST: "Lost"
};

const PRIORITY_LABELS: Record<LeadPriority, string> = {
  HOT: "Hot",
  WARM: "Warm",
  COLD: "Cold"
};

const OBJECTION_CHIPS = ["Too expensive", "Need comparison", "Just exploring"] as const;

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
    return "bg-emerald-400/15 text-emerald-200"; // green
  }
  if (status === "LOST") {
    return "bg-rose-400/15 text-rose-200"; // red
  }
  if (status === "QUOTED") {
    return "bg-violet-400/15 text-violet-200"; // purple (Qualified)
  }
  if (status === "IN_PROGRESS") {
    return "bg-amber-400/15 text-amber-200"; // orange (Contacted)
  }
  return "bg-sky-400/15 text-sky-200"; // blue (New)
}

function priorityClass(priority: LeadPriority) {
  if (priority === "HOT") {
    return "bg-rose-400/15 text-rose-200";
  }
  if (priority === "WARM") {
    return "bg-amber-400/15 text-amber-200";
  }
  return "bg-slate-200/15 text-slate-200";
}

function buildLeadSummary(lead: LeadItem) {
  return [
    `Lead ID: ${lead.leadId}`,
    `Brand: ${lead.brand}`,
    `Category: ${lead.category}`,
    `Tier: ${lead.tier}`,
    `Qty: ${lead.qty}`,
    `Score: ${lead.score}`,
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

function formatLeadAge(createdAt: string) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return "-";
  }

  const diffMs = Date.now() - created.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ${diffHours % 24}h`;
}

function followUpState(nextFollowUpAt: string | null | undefined) {
  if (!nextFollowUpAt) {
    return { label: "Follow-up not set", tone: "text-amber-200" };
  }
  const date = new Date(nextFollowUpAt);
  if (Number.isNaN(date.getTime())) {
    return { label: "Invalid follow-up", tone: "text-rose-200" };
  }
  const diff = date.getTime() - Date.now();
  if (diff < 0) {
    return { label: "Overdue", tone: "text-rose-200" };
  }
  if (diff <= 24 * 60 * 60 * 1000) {
    return { label: "Due within 24h", tone: "text-amber-200" };
  }
  return { label: "Upcoming", tone: "text-emerald-200" };
}

function getWhatsAppDeliveryChip(status: LeadItem["whatsappStatus"]) {
  if (status === "SENT") {
    return { label: "WhatsApp: Sent", tone: "text-emerald-200" };
  }
  if (status === "FAILED") {
    return { label: "WhatsApp: Failed", tone: "text-rose-200" };
  }
  return { label: "WhatsApp: Pending", tone: "text-amber-200" };
}

function buildInternalAlertPreview(lead: LeadItem) {
  return [
    `🔥 New Lead: ${lead.leadId}`,
    `Name: ${lead.contactName}`,
    `Company: ${lead.company || "-"}`,
    `Phone: ${lead.phone || "-"}`,
    `City: ${lead.city || "-"}`,
    `Need: ${lead.brand || "-"} ${lead.category || "-"} ${lead.tier || "-"}`.trim(),
    `Qty/Users: ${String(lead.qty || lead.usersSeats || "-")}`,
    `Page: ${lead.pagePath || lead.sourcePage || "-"}`,
    `UTM: ${lead.utmSource || "-"}/${lead.utmCampaign || "-"}`,
    `GCLID: -`,
    `Open CRM: https://conjoinnetwork.com/admin/leads?focus=${encodeURIComponent(lead.leadId)}`
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
    sources: [],
    agents: AGENT_OPTIONS,
    permissions: {
      role: "OWNER",
      crmRole: "SUPER_ADMIN",
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
  const [backendWarning, setBackendWarning] = useState("");
  const [backendHealth, setBackendHealth] = useState<"checking" | "ok" | "missing">("checking");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    city: "",
    source: "website",
    campaign: "",
    requirement: "",
    notes: "",
    assignedAgent: ""
  });
  const [busyLeadId, setBusyLeadId] = useState<string | null>(null);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [emailDrafts, setEmailDrafts] = useState<Record<string, LeadAiEmailDraft>>({});
  const [objectionReplies, setObjectionReplies] = useState<Record<string, LeadAiObjectionReply>>({});

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("brand", filters.brand);
    params.set("source", filters.source);
    params.set("status", filters.status);
    params.set("scoreBand", filters.scoreBand);
    params.set("city", filters.city);
    params.set("dateRange", filters.dateRange);
    params.set("agent", filters.agent);
    params.set("q", filters.query.trim());
    return params.toString();
  }, [filters]);

  const exportHref = useMemo(() => `/api/admin/leads/export?${query}`, [query]);
  const permissions = meta.permissions;
  const activeLead = useMemo(() => leads.find((lead) => lead.leadId === activeLeadId) ?? null, [activeLeadId, leads]);
  const activeLeadEmailDraft = activeLead ? emailDrafts[activeLead.leadId] ?? null : null;
  const activeLeadObjectionReply = activeLead ? objectionReplies[activeLead.leadId] ?? null : null;

  function getAdminPass() {
    try {
      return sessionStorage.getItem("crm_admin_pass") || "";
    } catch {
      return "";
    }
  }

  async function checkBackendHealth() {
    try {
      const response = await fetch("/api/health", { credentials: "same-origin" });
      if (!response.ok) {
        setBackendHealth("missing");
        return;
      }

      const payload = (await response.json()) as { storage?: string };
      setBackendHealth(payload.storage === "ok" ? "ok" : "missing");
    } catch {
      setBackendHealth("missing");
    }
  }

  async function loadLeads(silent = false) {
    if (!silent) setLoading(true);
    if (!silent) setError("");
    try {
      const headers: Record<string, string> = {};
      const adminPass = getAdminPass();
      if (adminPass) headers["x-admin-pass"] = adminPass;

      const response = await fetch(`/api/admin/leads?${query}`, { credentials: "same-origin", headers });
      const payload = (await response.json().catch(() => ({}))) as ApiResponse;
      if (!response.ok) {
        throw new Error((payload as { message?: string }).message ?? `Unable to load leads (${response.status})`);
      }

      const leadsData = Array.isArray(payload.leads) ? payload.leads : [];
      setLeads(leadsData);
      if (payload.meta) setMeta(payload.meta);
      const storageWarning =
        payload.warning === "storage_not_configured" || payload.storage_not_configured || payload.backendReachable === false;
      if (storageWarning) {
        setBackendWarning("Backend not configured. Showing an empty list until storage is available.");
        setBackendHealth("missing");
      } else {
        setBackendWarning("");
        setBackendHealth("ok");
      }
      setDrafts((current) => {
        const next: DraftMap = {};
        leadsData.forEach((lead) => {
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
      if (!silent) setError(loadError instanceof Error ? loadError.message : "Unable to load leads.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function handleAddLead() {
    setError("");
    setNotice("");
    try {
      const body = {
        name: addForm.name,
        phone: addForm.phone,
        email: addForm.email,
        company: addForm.company,
        city: addForm.city,
        source: addForm.source,
        campaign: addForm.campaign,
        requirement: addForm.requirement,
        notes: addForm.notes,
        assignedAgent: addForm.assignedAgent
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const ap = getAdminPass();
      if (ap) headers['x-admin-pass'] = ap;

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'same-origin'
      });

      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        throw new Error(payload?.error || payload?.message || `Create failed (${res.status})`);
      }
      if (payload?.ok === false) {
        throw new Error(payload?.error || payload?.message || "Create failed");
      }

      setNotice('Lead created. Refreshing list...');
      setShowAdd(false);
      setAddForm({ name: '', phone: '', email: '', company: '', city: '', source: 'website', campaign: '', requirement: '', notes: '', assignedAgent: '' });
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create lead');
    }
  }

  useEffect(() => {
    checkBackendHealth();
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // lightweight polling every 15s without resetting filters or causing UI flicker
  useEffect(() => {
    const id = setInterval(() => {
      loadLeads(true).catch(() => {});
    }, 15000);
    return () => clearInterval(id);
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
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const ap = getAdminPass();
    if (ap) headers["x-admin-pass"] = ap;

    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers,
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

  async function generateAiSummary(leadId: string) {
    setBusyLeadId(leadId);
    setError("");
    setNotice("");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const ap = getAdminPass();
      if (ap) headers["x-admin-pass"] = ap;

      const response = await fetch("/api/ai/lead-summary", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({ leadId })
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Unable to generate AI summary.");
      }
      setNotice("AI summary generated.");
      await loadLeads();
    } catch (summaryError) {
      setError(summaryError instanceof Error ? summaryError.message : "Unable to generate AI summary.");
    } finally {
      setBusyLeadId(null);
    }
  }

  async function generateAiEmailDraft(leadId: string) {
    setBusyLeadId(leadId);
    setError("");
    setNotice("");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const ap = getAdminPass();
      if (ap) headers["x-admin-pass"] = ap;

      const response = await fetch("/api/ai/email-draft", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({ leadId })
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        draft?: LeadAiEmailDraft;
      };
      if (!response.ok || !payload.ok || !payload.draft) {
        throw new Error(payload.message ?? "Unable to generate AI email draft.");
      }
      setEmailDrafts((current) => ({ ...current, [leadId]: payload.draft as LeadAiEmailDraft }));
      setNotice("AI email draft generated.");
      await loadLeads();
    } catch (draftError) {
      setError(draftError instanceof Error ? draftError.message : "Unable to generate AI email draft.");
    } finally {
      setBusyLeadId(null);
    }
  }

  async function generateAiObjectionReply(leadId: string, objection: (typeof OBJECTION_CHIPS)[number]) {
    setBusyLeadId(leadId);
    setError("");
    setNotice("");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const ap = getAdminPass();
      if (ap) headers["x-admin-pass"] = ap;

      const response = await fetch("/api/ai/objection-reply", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({ leadId, objection })
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        reply?: LeadAiObjectionReply;
      };
      if (!response.ok || !payload.ok || !payload.reply) {
        throw new Error(payload.message ?? "Unable to generate objection reply.");
      }
      setObjectionReplies((current) => ({ ...current, [leadId]: payload.reply as LeadAiObjectionReply }));
      setNotice("AI objection reply generated.");
      await loadLeads();
    } catch (replyError) {
      setError(replyError instanceof Error ? replyError.message : "Unable to generate objection reply.");
    } finally {
      setBusyLeadId(null);
    }
  }

  async function copyTextToClipboard(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(successMessage);
      setError("");
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
        <p className="rounded-lg border border-amber-300/45 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
          Data is confidential. Access is logged. Do not share externally.
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">Primary contact: {SALES_PHONE_DISPLAY}</p>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-[var(--color-text-secondary)]">
              Signed in as {permissions.displayName} ({permissions.crmRole})
              {!permissions.isManagement && permissions.assignee ? ` • Assigned scope: ${permissions.assignee}` : ""}
            </p>
            <p className={`text-xs ${backendHealth === "ok" ? "text-emerald-300" : "text-amber-200"}`}>
              Leads backend: {backendHealth === "ok" ? "Reachable" : backendHealth === "checking" ? "Checking..." : "Not configured"}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                checkBackendHealth();
                setFilters((f) => ({ ...f }));
              }}
              className="mr-2 inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-sm"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowAdd((s) => !s)}
              className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1 text-sm text-white"
            >
              + Add Lead
            </button>
          </div>
        </div>
      </header>

      <section className="admin-card rounded-2xl p-4">
        {showAdd ? (
          <div className="mb-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Add Lead</h3>
            <div className="grid gap-2 md:grid-cols-2">
              <input placeholder="Name" value={addForm.name} onChange={(e) => setAddForm((c) => ({ ...c, name: e.target.value }))} className="mt-2" />
              <input placeholder="Phone" value={addForm.phone} onChange={(e) => setAddForm((c) => ({ ...c, phone: e.target.value }))} className="mt-2" />
              <input placeholder="Email" value={addForm.email} onChange={(e) => setAddForm((c) => ({ ...c, email: e.target.value }))} className="mt-2" />
              <input placeholder="Company" value={addForm.company} onChange={(e) => setAddForm((c) => ({ ...c, company: e.target.value }))} className="mt-2" />
              <input placeholder="City" value={addForm.city} onChange={(e) => setAddForm((c) => ({ ...c, city: e.target.value }))} className="mt-2" />
              <select value={addForm.source} onChange={(e) => setAddForm((c) => ({ ...c, source: e.target.value }))} className="mt-2">
                <option value="website">website</option>
                <option value="google_ads">google_ads</option>
                <option value="direct_call">direct_call</option>
                <option value="reference">reference</option>
                <option value="walk_in">walk_in</option>
              </select>
              <input placeholder="Campaign" value={addForm.campaign} onChange={(e) => setAddForm((c) => ({ ...c, campaign: e.target.value }))} className="mt-2" />
              <input placeholder="Requirement" value={addForm.requirement} onChange={(e) => setAddForm((c) => ({ ...c, requirement: e.target.value }))} className="mt-2" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={handleAddLead} className="rounded-md bg-emerald-600 px-3 py-1 text-white">Create</button>
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-md bg-slate-100 px-3 py-1">Cancel</button>
            </div>
          </div>
        ) : null}
        <div className={`grid gap-3 ${permissions.isManagement ? "md:grid-cols-9" : "md:grid-cols-8"}`}>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Search
            <input
              type="text"
              value={filters.query}
              onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
              placeholder="RFQ ID, phone, email, name"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            />
          </label>

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
            Source
            <select
              value={filters.source}
              onChange={(event) => setFilters((current) => ({ ...current, source: event.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="google_ads">Google Ads</option>
              <option value="organic">Organic</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="call">Call</option>
              {meta.sources
                .filter((source) => !["google_ads", "organic", "whatsapp", "call"].includes(source))
                .map((source) => (
                  <option key={source} value={source}>
                    {source.replaceAll("_", " ")}
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
            Score
            <select
              value={filters.scoreBand}
              onChange={(event) =>
                setFilters((current) => ({ ...current, scoreBand: event.target.value as FilterState["scoreBand"] }))
              }
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="hot">Hot (80+)</option>
              <option value="warm">Warm (45-79)</option>
              <option value="cold">Cold (&lt;45)</option>
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

      {error ? <p className="rounded-lg border border-rose-300/45 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">{error}</p> : null}
      {backendWarning ? (
        <p className="rounded-lg border border-amber-300/45 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">{backendWarning}</p>
      ) : null}
      {notice ? (
        <p className="rounded-lg border border-emerald-300/45 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">{notice}</p>
      ) : null}
      {loading ? <p className="text-sm text-[var(--color-text-secondary)]">Loading leads...</p> : null}

      <section className="admin-card overflow-x-auto rounded-2xl">
        <table className="min-w-[2600px] divide-y divide-[var(--color-border)] text-sm">
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
              <th className="px-4 py-3">Score</th>
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
                const internalAlertHref = getWhatsAppLink(buildInternalAlertPreview(lead));
                const deliveryChip = getWhatsAppDeliveryChip(lead.whatsappStatus);

                return (
                  <tr key={lead.leadId} className="align-top odd:bg-transparent even:bg-[var(--color-alt-bg)]/40">
                    <td className="px-4 py-4 text-xs text-[var(--color-text-secondary)]">
                      <p>{formatDate(lead.createdAt)}</p>
                      <p>{lead.leadId}</p>
                      <p>Age: {formatLeadAge(lead.createdAt)}</p>
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
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                          lead.score >= 80
                            ? "bg-rose-400/15 text-rose-200"
                            : lead.score >= 45
                              ? "bg-amber-400/15 text-amber-200"
                              : "bg-slate-200/15 text-slate-200"
                        }`}
                      >
                        {lead.score}
                      </span>
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
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-xs"
                      />
                      <p className={`mt-1 text-xs ${followUpState(draft.nextFollowUpAt).tone}`}>
                        {followUpState(draft.nextFollowUpAt).label}
                      </p>
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
                        {lead.whatsappStatus !== "SENT" ? (
                          <a
                            href={internalAlertHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs font-semibold text-[var(--color-text-primary)]"
                          >
                            Send internal WhatsApp
                          </a>
                        ) : null}
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
                        <button
                          type="button"
                          onClick={() => setActiveLeadId(lead.leadId)}
                          className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs font-semibold text-[var(--color-text-primary)]"
                        >
                          View detail
                        </button>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">
                          For compliance, please use official quotes only.
                        </p>
                        <p className={`text-[11px] ${deliveryChip.tone}`}>
                          {deliveryChip.label}
                          {lead.whatsappLastNotifiedAt ? ` • ${formatDate(lead.whatsappLastNotifiedAt)}` : ""}
                        </p>
                        {lead.whatsappStatus === "FAILED" && lead.whatsappError ? (
                          <p className="text-[11px] text-rose-200">Reason: {lead.whatsappError}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <textarea
                          value={draft.note}
                          onChange={(event) => updateDraft(lead.leadId, "note", event.target.value)}
                          rows={2}
                          placeholder="Add note"
                          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-xs"
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

      <Modal open={Boolean(activeLead)} onClose={() => setActiveLeadId(null)} title={activeLead ? `Lead ${activeLead.leadId}` : "Lead detail"}>
        {activeLead ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">AI assistant</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => generateAiSummary(activeLead.leadId)}
                  disabled={busyLeadId === activeLead.leadId}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text-primary)] disabled:opacity-60"
                >
                  {busyLeadId === activeLead.leadId ? "Generating..." : "Generate AI Summary"}
                </button>
                <button
                  type="button"
                  onClick={() => generateAiEmailDraft(activeLead.leadId)}
                  disabled={busyLeadId === activeLead.leadId}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text-primary)] disabled:opacity-60"
                >
                  {busyLeadId === activeLead.leadId ? "Generating..." : "Draft Email"}
                </button>
              </div>
            </div>
            {activeLead.aiSummary ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-alt-bg)] p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Summary</p>
                <p className="mt-1 text-sm text-[var(--color-text-primary)]">{activeLead.aiSummary.summary}</p>
                <p className="mt-2 text-xs">
                  <span className="font-semibold text-[var(--color-text-primary)]">Next step:</span> {activeLead.aiSummary.nextStep}
                </p>
                <p className="mt-1 text-xs">
                  <span className="font-semibold text-[var(--color-text-primary)]">Priority:</span> {activeLead.aiSummary.priority} •{" "}
                  {formatDate(activeLead.aiSummary.generatedAt)}
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                No AI summary generated yet.
              </p>
            )}

            {activeLeadEmailDraft ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Draft email</p>
                  <button
                    type="button"
                    onClick={() =>
                      copyTextToClipboard(
                        `Subject: ${activeLeadEmailDraft.subject}\n\n${activeLeadEmailDraft.body}`,
                        "AI email draft copied."
                      )
                    }
                    className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[var(--color-border)] px-2 text-xs font-semibold text-[var(--color-text-primary)]"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{activeLeadEmailDraft.subject}</p>
                <p className="mt-2 whitespace-pre-line text-xs text-[var(--color-text-primary)]">{activeLeadEmailDraft.body}</p>
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  Source: {activeLeadEmailDraft.source} • {formatDate(activeLeadEmailDraft.generatedAt)}
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Objection replies</p>
              <div className="flex flex-wrap gap-2">
                {OBJECTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => generateAiObjectionReply(activeLead.leadId, chip)}
                    disabled={busyLeadId === activeLead.leadId}
                    className="inline-flex min-h-8 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text-primary)] disabled:opacity-60"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              {activeLeadObjectionReply ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-alt-bg)] p-3">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">{activeLeadObjectionReply.objection}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-primary)]">{activeLeadObjectionReply.shortReply}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{activeLeadObjectionReply.longReply}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Source: {activeLeadObjectionReply.source} • {formatDate(activeLeadObjectionReply.generatedAt)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyTextToClipboard(
                          `${activeLeadObjectionReply.shortReply}\n\n${activeLeadObjectionReply.longReply}`,
                          "AI objection reply copied."
                        )
                      }
                      className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[var(--color-border)] px-2 text-xs font-semibold text-[var(--color-text-primary)]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                  Choose an objection chip to generate response options.
                </p>
              )}
            </div>

            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Contact</dt>
                <dd className="font-medium text-[var(--color-text-primary)]">
                  {activeLead.contactName} ({activeLead.company})
                </dd>
                <dd>{activeLead.phone}</dd>
                <dd>{activeLead.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Scope</dt>
                <dd>{activeLead.brand}</dd>
                <dd>{activeLead.category}</dd>
                <dd>{activeLead.tier}</dd>
                <dd>Score: {activeLead.score}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Timeline</dt>
                <dd>{activeLead.timeline || "-"}</dd>
                <dd>City: {activeLead.city}</dd>
                <dd>Qty: {activeLead.qty}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Attribution</dt>
                <dd>{activeLead.source || "-"}</dd>
                <dd>{activeLead.pagePath || "-"}</dd>
              </div>
            </dl>

            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Notes timeline</p>
              <ul className="mt-2 space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-page-bg)] p-3">
                {activeLead.activityNotes.length === 0 ? (
                  <li className="text-xs text-[var(--color-text-secondary)]">No notes captured yet.</li>
                ) : (
                  activeLead.activityNotes.map((note) => (
                    <li key={note.id} className="text-xs">
                      <span className="font-medium text-[var(--color-text-primary)]">{formatDate(note.createdAt)}</span> {note.author}: {note.text}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
