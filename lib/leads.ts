import { promises as fs } from "node:fs";
import path from "node:path";
import type { LeadBrand, LeadPriority, LeadStatus } from "@/lib/quote-catalog";
import { LEAD_PRIORITIES, LEAD_STATUSES } from "@/lib/quote-catalog";

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "leads.json");

export type LeadActivityNote = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
};

export type LeadRecord = {
  leadId: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo: string | null;
  lastContactedAt: string | null;
  firstContactAt: string | null;
  firstContactBy: string | null;
  nextFollowUpAt: string | null;
  brand: LeadBrand | string;
  category: string;
  tier: string;
  qty: number;
  delivery?: string;
  plan?: string;
  usersSeats?: number | null;
  endpoints?: number | null;
  servers?: number | null;
  ciscoUsers?: number | null;
  ciscoSites?: number | null;
  budgetRange?: string;
  addons?: string[];
  otherBrand?: string;
  city: string;
  source: string;
  sourcePage: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  pagePath?: string;
  referrer?: string;
  timeline?: string;
  notes: string;
  activityNotes: LeadActivityNote[];
  contactName: string;
  company: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadPatchInput = {
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedTo?: string | null;
  note?: string;
  actor?: string;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;
  markContacted?: boolean;
};

export type LeadFilters = {
  brand?: string;
  status?: string;
  city?: string;
  agent?: string;
  dateRange?: "all" | "7" | "30";
};

type NewLeadInput = Omit<
  LeadRecord,
  | "leadId"
  | "status"
  | "priority"
  | "assignedTo"
  | "lastContactedAt"
  | "firstContactAt"
  | "firstContactBy"
  | "nextFollowUpAt"
  | "activityNotes"
  | "createdAt"
  | "updatedAt"
>;

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, "[]", "utf8");
  }
}

function toString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeStatus(value: unknown): LeadStatus {
  const next = toString(value).trim().toUpperCase();
  if (next === "CONTACTED" || next === "QUALIFIED" || next === "IN_PROGRESS") {
    return "IN_PROGRESS";
  }

  if (LEAD_STATUSES.includes(next as LeadStatus)) {
    return next as LeadStatus;
  }

  return "NEW";
}

function normalizePriority(value: unknown): LeadPriority {
  const next = toString(value).trim().toUpperCase();
  if (LEAD_PRIORITIES.includes(next as LeadPriority)) {
    return next as LeadPriority;
  }
  return "WARM";
}

function normalizeActivityNotes(value: unknown): LeadActivityNote[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Partial<LeadActivityNote>;
      const text = toString(record.text).trim();
      if (!text) {
        return null;
      }

      return {
        id: toString(record.id) || `NOTE-${Math.random().toString(36).slice(2, 8)}`,
        text,
        createdAt: toString(record.createdAt) || new Date().toISOString(),
        author: toString(record.author) || "Team"
      } satisfies LeadActivityNote;
    })
    .filter((item): item is LeadActivityNote => Boolean(item));
}

function normalizeLead(raw: unknown): LeadRecord | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<LeadRecord>;
  const leadId = toString(candidate.leadId).trim();
  if (!leadId) {
    return null;
  }

  const createdAt = toString(candidate.createdAt) || new Date().toISOString();
  const updatedAt = toString(candidate.updatedAt) || createdAt;
  const notes = toString(candidate.notes);
  const activityNotes = normalizeActivityNotes(candidate.activityNotes);

  return {
    leadId,
    status: normalizeStatus(candidate.status),
    priority: normalizePriority(candidate.priority),
    assignedTo: toString(candidate.assignedTo).trim() || null,
    lastContactedAt: toString(candidate.lastContactedAt).trim() || null,
    firstContactAt: toString(candidate.firstContactAt).trim() || null,
    firstContactBy: toString(candidate.firstContactBy).trim() || null,
    nextFollowUpAt: toString(candidate.nextFollowUpAt).trim() || null,
    brand: toString(candidate.brand) || "Other",
    category: toString(candidate.category),
    tier: toString(candidate.tier),
    qty: Number.isFinite(Number(candidate.qty)) ? Number(candidate.qty) : 0,
    delivery: candidate.delivery,
    plan: candidate.plan,
    usersSeats: candidate.usersSeats ?? null,
    endpoints: candidate.endpoints ?? null,
    servers: candidate.servers ?? null,
    ciscoUsers: candidate.ciscoUsers ?? null,
    ciscoSites: candidate.ciscoSites ?? null,
    budgetRange: candidate.budgetRange,
    addons: Array.isArray(candidate.addons) ? candidate.addons : [],
    otherBrand: candidate.otherBrand,
    city: toString(candidate.city),
    source: toString(candidate.source) || toString(candidate.sourcePage) || "website",
    sourcePage: toString(candidate.sourcePage),
    utmSource: candidate.utmSource,
    utmCampaign: candidate.utmCampaign,
    utmMedium: candidate.utmMedium,
    pagePath: candidate.pagePath,
    referrer: candidate.referrer,
    timeline: candidate.timeline,
    notes,
    activityNotes,
    contactName: toString(candidate.contactName),
    company: toString(candidate.company),
    email: toString(candidate.email),
    phone: toString(candidate.phone),
    createdAt,
    updatedAt
  };
}

export async function readLeads(): Promise<LeadRecord[]> {
  await ensureDataFile();
  const raw = await fs.readFile(dataFilePath, "utf8");
  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => normalizeLead(item)).filter((item): item is LeadRecord => Boolean(item));
  } catch {
    return [];
  }
}

async function writeLeads(leads: LeadRecord[]) {
  await ensureDataFile();
  await fs.writeFile(dataFilePath, JSON.stringify(leads, null, 2), "utf8");
}

function buildLeadId(existing: Set<string>) {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  let nextId = "";
  do {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    nextId = `LD-${datePart}-${randomPart}`;
  } while (existing.has(nextId));
  return nextId;
}

function appendNote(lead: LeadRecord, note: string, author: string) {
  const text = note.trim();
  if (!text) {
    return;
  }

  const entry: LeadActivityNote = {
    id: `NOTE-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    text,
    createdAt: new Date().toISOString(),
    author
  };

  lead.activityNotes = [entry, ...lead.activityNotes];
}

export async function createLead(input: NewLeadInput): Promise<LeadRecord> {
  const leads = await readLeads();
  const existingIds = new Set(leads.map((lead) => lead.leadId));
  const now = new Date().toISOString();

  const lead: LeadRecord = {
    leadId: buildLeadId(existingIds),
    status: "NEW",
    priority: "WARM",
    assignedTo: null,
    lastContactedAt: null,
    firstContactAt: null,
    firstContactBy: null,
    nextFollowUpAt: null,
    activityNotes: [],
    createdAt: now,
    updatedAt: now,
    ...input
  };

  leads.unshift(lead);
  await writeLeads(leads);
  return lead;
}

export async function getLeadById(leadId: string): Promise<LeadRecord | null> {
  const leads = await readLeads();
  return leads.find((lead) => lead.leadId === leadId) ?? null;
}

export async function patchLead(leadId: string, input: LeadPatchInput): Promise<LeadRecord | null> {
  const leads = await readLeads();
  const target = leads.find((lead) => lead.leadId === leadId);
  if (!target) {
    return null;
  }

  const now = new Date().toISOString();

  if (input.status && LEAD_STATUSES.includes(input.status)) {
    target.status = input.status;
    if (["IN_PROGRESS", "QUOTED", "WON", "LOST"].includes(input.status)) {
      target.lastContactedAt = now;
      if (!target.firstContactAt) {
        target.firstContactAt = now;
        target.firstContactBy = target.assignedTo || input.actor?.trim() || "Team";
      }
    }
  }

  if (input.priority && LEAD_PRIORITIES.includes(input.priority)) {
    target.priority = input.priority;
  }

  if (input.assignedTo !== undefined) {
    target.assignedTo = input.assignedTo && input.assignedTo.trim() ? input.assignedTo.trim() : null;
  }

  if (input.lastContactedAt !== undefined) {
    target.lastContactedAt = input.lastContactedAt;
  }

  if (input.nextFollowUpAt !== undefined) {
    target.nextFollowUpAt = input.nextFollowUpAt;
  }

  if (input.markContacted) {
    target.status = target.status === "NEW" ? "IN_PROGRESS" : target.status;
    target.lastContactedAt = now;
    if (!target.firstContactAt) {
      target.firstContactAt = now;
      target.firstContactBy = target.assignedTo || input.actor?.trim() || "Team";
    }
  }

  if (input.note) {
    appendNote(target, input.note, input.actor?.trim() || "Team");
    target.lastContactedAt = now;
  }

  target.updatedAt = now;
  await writeLeads(leads);
  return target;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  return patchLead(leadId, { status });
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
    const brandOk = !filters.brand || lead.brand === filters.brand;
    const cityOk = !filters.city || lead.city.toLowerCase().includes(filters.city.toLowerCase());
    const dateOk = !filters.date || lead.createdAt.startsWith(filters.date);
    return brandOk && cityOk && dateOk;
  });
}

export function listLeads(leads: LeadRecord[], filters: LeadFilters) {
  const now = Date.now();
  const lookbackDays = filters.dateRange === "7" ? 7 : filters.dateRange === "30" ? 30 : 0;
  const cutoff = lookbackDays > 0 ? now - lookbackDays * 24 * 60 * 60 * 1000 : 0;

  return leads
    .filter((lead) => {
      const brandOk = !filters.brand || filters.brand === "all" || lead.brand === filters.brand;
      const statusOk = !filters.status || filters.status === "all" || lead.status === filters.status;
      const cityOk =
        !filters.city ||
        filters.city === "all" ||
        lead.city.toLowerCase().includes(filters.city.toLowerCase().trim());
      const agentOk =
        !filters.agent ||
        filters.agent === "all" ||
        (filters.agent === "Unassigned" ? !lead.assignedTo : lead.assignedTo === filters.agent);
      const dateOk = cutoff === 0 || new Date(lead.createdAt).getTime() >= cutoff;
      return brandOk && statusOk && cityOk && agentOk && dateOk;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function classifyLeadSource(
  lead: Pick<LeadRecord, "source" | "sourcePage" | "utmSource" | "utmMedium" | "utmCampaign">
) {
  const source = `${lead.source ?? ""} ${lead.sourcePage} ${lead.utmSource ?? ""} ${lead.utmMedium ?? ""} ${lead.utmCampaign ?? ""}`.toLowerCase();
  if (source.includes("bark")) {
    return "Bark";
  }
  if (
    source.includes("google") ||
    source.includes("gads") ||
    source.includes("adwords") ||
    source.includes("campaign")
  ) {
    return "Google Ads";
  }
  return "Organic";
}

export function humanizeStatus(status: LeadStatus) {
  if (status === "NEW") {
    return "New";
  }
  if (status === "IN_PROGRESS") {
    return "In-Progress";
  }
  if (status === "QUOTED") {
    return "Quoted";
  }
  if (status === "WON") {
    return "Won";
  }
  if (status === "LOST") {
    return "Lost";
  }
  return status;
}
