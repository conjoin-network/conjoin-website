import type { NewCrmLead } from "./crm";
import { createCrmLead, getCrmLead, listCrmLeads, updateCrmLead } from "./crm";

export type LeadActivityNote = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
};

export type LeadAiSummary = {
  summary: string;
  nextStep: string;
  priority: string;
  generatedAt: string;
  source: "ai" | "fallback";
};

// Adapter: keep the old lib/leads API surface but delegate to Prisma-backed lib/crm.
export type LeadRecord = {
  leadId: string;
  status: string;
  priority: string;
  score: number;
  assignedTo: string | null;
  lastContactedAt?: string | null;
  firstContactAt?: string | null;
  firstContactBy?: string | null;
  nextFollowUpAt?: string | null;
  brand?: string | null;
  category?: string | null;
  tier?: string | null;
  qty?: number;
  delivery?: string | null;
  plan?: string | null;
  usersSeats?: number | null;
  endpoints?: number | null;
  servers?: number | null;
  ciscoUsers?: number | null;
  ciscoSites?: number | null;
  budgetRange?: string | null;
  addons?: string[];
  otherBrand?: string | null;
  city?: string | null;
  source?: string | null;
  sourcePage?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  utmMedium?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  pagePath?: string | null;
  referrer?: string | null;
  timeline?: string | null;
  notes?: string | null;
  activityNotes?: LeadActivityNote[];
  aiSummary?: LeadAiSummary | null;
  contactName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

export type LeadPatchInput = Partial<{
  status: string;
  priority: string;
  assignedTo: string | null;
  note: string;
  actor: string;
  score: number;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  markContacted: boolean;
}>;

export type LeadFilters = {
  brand?: string;
  source?: string;
  status?: string;
  scoreBand?: string;
  city?: string;
  agent?: string;
  q?: string;
  dateRange?: "all" | "7" | "30";
};

export type NewLeadInput = Partial<NewCrmLead> & {
  score?: number;
  priority?: string;
  assignedTo?: string | null;
  // legacy keys used by existing routes
  contactName?: string;
  name?: string;
  requirement?: string;
  qty?: number;
  usersSeats?: number;
  sourcePage?: string;
  pagePath?: string;
  referrer?: string;
  timeline?: string;
  [key: string]: unknown;
};

export async function readLeads(): Promise<LeadRecord[]> {
  const rows = await listCrmLeads();
  return (rows || []) as LeadRecord[];
}

export async function createLead(input: NewLeadInput): Promise<LeadRecord> {
  const payload: NewCrmLead = {
    name: String(input.contactName ?? input.name ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    email: input.email ?? undefined,
    company: input.company ?? undefined,
    source: input.source ?? input.pagePath ?? undefined,
    campaign: input.utm_campaign ?? input.gclid ?? undefined,
    city: input.city ?? undefined,
    notes: input.notes ?? input.requirement ?? undefined,
    requirement: input.requirement ?? undefined,
    usersDevices: typeof input.usersSeats === "number" ? input.usersSeats : input.qty ?? undefined,
    pageUrl: input.pagePath ?? input.sourcePage ?? undefined,
    utm_source: input.utm_source ?? undefined,
    utm_medium: input.utm_medium ?? undefined,
    utm_campaign: input.utm_campaign ?? undefined,
    utm_term: input.utm_term ?? undefined,
    utm_content: input.utm_content ?? undefined,
    gclid: input.gclid ?? undefined,
    ip: input.ip ?? undefined,
    userAgent: input.userAgent ?? undefined
  };

  const created = await createCrmLead(payload);
  return created as LeadRecord;
}

export async function getLeadById(leadId: string): Promise<LeadRecord | null> {
  const lead = await getCrmLead(leadId);
  return (lead as LeadRecord) ?? null;
}

export async function patchLead(leadId: string, input: LeadPatchInput): Promise<LeadRecord | null> {
  const payload: Record<string, unknown> = {};
  if (input.status) payload.status = input.status;
  if (input.priority) payload.priority = input.priority;
  if (input.assignedTo !== undefined) payload.assignedTo = input.assignedTo;
  if (input.score !== undefined) payload.score = input.score;
  if (input.note) payload.notes = `${input.note}`;
  if (input.nextFollowUpAt !== undefined) payload.nextFollowUpAt = input.nextFollowUpAt;
  if (input.lastContactedAt !== undefined) payload.lastContactedAt = input.lastContactedAt;

  const updated = await updateCrmLead(leadId, payload);
  return (updated as LeadRecord) ?? null;
}

export async function updateLeadStatus(leadId: string, status: string) {
  return patchLead(leadId, { status });
}

export async function setLeadAiSummary(
  _leadId?: string,
  _summaryInput?: {
    summary: string;
    nextStep: string;
    priority: string;
    source: "ai" | "fallback";
  },
  _actor = "AI Assistant"
): Promise<LeadRecord | null> {
  // AI summary persistence is optional for CRM adapter. Keep API-compatible no-op.
  return null;
}

export function filterLeads(
  leads: LeadRecord[],
  filters: {
    brand?: string;
    city?: string;
    date?: string;
  }
) {
  return leads.filter((lead) => {
    const brandOk = !filters.brand || String(lead.brand ?? "") === filters.brand;
    const cityOk = !filters.city || String(lead.city ?? "").toLowerCase().includes(filters.city.toLowerCase());
    const dateOk = !filters.date || String(lead.createdAt ?? "").startsWith(filters.date);
    return brandOk && cityOk && dateOk;
  });
}

export function listLeads(leads: LeadRecord[], _filters: LeadFilters) {
  return [...leads].sort(
    (a, b) => new Date((b.createdAt as string) || 0).getTime() - new Date((a.createdAt as string) || 0).getTime()
  );
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function classifyLeadSource(_: {
  source?: string | null;
  sourcePage?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}) {
  return "Organic";
}

export function humanizeStatus(status: string) {
  const normalized = String(status || "").toUpperCase();
  if (!normalized) {
    return "New";
  }
  if (normalized === "NEW") {
    return "New";
  }
  if (normalized === "IN_PROGRESS" || normalized === "CONTACTED") {
    return "In-Progress";
  }
  if (normalized === "QUOTED" || normalized === "QUALIFIED") {
    return "Quoted";
  }
  if (normalized === "WON" || normalized === "CLOSED") {
    return "Won";
  }
  if (normalized === "LOST") {
    return "Lost";
  }
  return normalized;
}
