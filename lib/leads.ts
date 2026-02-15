import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { LeadBrand, LeadPriority, LeadStatus } from "@/lib/quote-catalog";
import { LEAD_PRIORITIES, LEAD_STATUSES } from "@/lib/quote-catalog";

const dataDir = path.join(process.cwd(), "data");
const dbPath = process.env.LEAD_DB_PATH?.trim() || path.join(dataDir, "crm-leads.sqlite");

let dbInstance: DatabaseSync | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();

export type LeadActivityNote = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
};

export type LeadAiSummary = {
  summary: string;
  nextStep: string;
  priority: LeadPriority;
  generatedAt: string;
  source: "ai" | "fallback";
};

export type LeadRecord = {
  leadId: string;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
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
  utmContent?: string;
  utmTerm?: string;
  pagePath?: string;
  referrer?: string;
  timeline?: string;
  notes: string;
  activityNotes: LeadActivityNote[];
  aiSummary?: LeadAiSummary | null;
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
  scoreBand?: string;
  city?: string;
  agent?: string;
  q?: string;
  dateRange?: "all" | "7" | "30";
};

type NewLeadInput = Omit<
  LeadRecord,
  | "leadId"
  | "status"
  | "assignedTo"
  | "lastContactedAt"
  | "firstContactAt"
  | "firstContactBy"
  | "nextFollowUpAt"
  | "activityNotes"
  | "createdAt"
  | "updatedAt"
> & {
  priority?: LeadPriority;
  score?: number;
  assignedTo?: string | null;
};

type LeadRow = {
  lead_id: string;
  status: string;
  priority: string;
  score: number | null;
  assigned_to: string | null;
  last_contacted_at: string | null;
  first_contact_at: string | null;
  first_contact_by: string | null;
  next_follow_up_at: string | null;
  brand: string;
  category: string;
  tier: string;
  qty: number;
  delivery: string | null;
  plan: string | null;
  users_seats: number | null;
  endpoints: number | null;
  servers: number | null;
  cisco_users: number | null;
  cisco_sites: number | null;
  budget_range: string | null;
  addons_json: string;
  other_brand: string | null;
  city: string;
  source: string;
  source_page: string;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_term: string | null;
  page_path: string | null;
  referrer: string | null;
  timeline: string | null;
  notes: string;
  activity_notes_json: string;
  ai_summary_json: string | null;
  contact_name: string;
  company: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const isServerlessRuntime = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const allowSQLiteInServerless = process.env.ALLOW_SQLITE_PRODUCTION === "true";
  if (process.env.NODE_ENV === "production" && isServerlessRuntime && !allowSQLiteInServerless) {
    throw new Error("LEAD_STORAGE_UNSAFE: durable storage is required in serverless runtime.");
  }

  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS leads (
      lead_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      assigned_to TEXT,
      last_contacted_at TEXT,
      first_contact_at TEXT,
      first_contact_by TEXT,
      next_follow_up_at TEXT,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      tier TEXT NOT NULL,
      qty INTEGER NOT NULL,
      delivery TEXT,
      plan TEXT,
      users_seats INTEGER,
      endpoints INTEGER,
      servers INTEGER,
      cisco_users INTEGER,
      cisco_sites INTEGER,
      budget_range TEXT,
      addons_json TEXT NOT NULL DEFAULT '[]',
      other_brand TEXT,
      city TEXT NOT NULL,
      source TEXT NOT NULL,
      source_page TEXT NOT NULL,
      utm_source TEXT,
      utm_campaign TEXT,
      utm_medium TEXT,
      utm_content TEXT,
      utm_term TEXT,
      page_path TEXT,
      referrer TEXT,
      timeline TEXT,
      notes TEXT NOT NULL,
      activity_notes_json TEXT NOT NULL DEFAULT '[]',
      ai_summary_json TEXT NOT NULL DEFAULT '{}',
      contact_name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_leads_brand ON leads(brand);
  `);

  try {
    db.exec("ALTER TABLE leads ADD COLUMN score INTEGER NOT NULL DEFAULT 0;");
  } catch {
    // Column already exists.
  }

  try {
    db.exec("ALTER TABLE leads ADD COLUMN ai_summary_json TEXT NOT NULL DEFAULT '{}';");
  } catch {
    // Column already exists.
  }

  try {
    db.exec("CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);");
  } catch {
    // Skip if score column migration has not completed for current runtime.
  }

  dbInstance = db;
  return db;
}

function toString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sanitizeText(value: string, maxLength = 2000) {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function parseJsonArray<T>(value: string | null, fallback: T[]): T[] {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function parseJsonObject(value: string | null): Record<string, unknown> | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
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

function normalizeScore(value: unknown) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(next)));
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

function normalizeAiSummary(value: unknown): LeadAiSummary | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Partial<LeadAiSummary>;
  const summary = toString(record.summary).trim();
  const nextStep = toString(record.nextStep).trim();
  const source = toString(record.source).trim().toLowerCase();
  const priority = normalizePriority(record.priority);
  if (!summary || !nextStep) {
    return null;
  }

  return {
    summary: sanitizeText(summary, 2000),
    nextStep: sanitizeText(nextStep, 500),
    priority,
    generatedAt: toString(record.generatedAt) || new Date().toISOString(),
    source: source === "ai" ? "ai" : "fallback"
  };
}

function rowToLead(row: LeadRow): LeadRecord {
  const addons = parseJsonArray<string>(row.addons_json, []).filter((item) => typeof item === "string");
  const activityNotes = normalizeActivityNotes(parseJsonArray<LeadActivityNote>(row.activity_notes_json, []));
  const aiSummary = normalizeAiSummary(parseJsonObject(row.ai_summary_json));

  return {
    leadId: row.lead_id,
    status: normalizeStatus(row.status),
    priority: normalizePriority(row.priority),
    score: normalizeScore(row.score),
    assignedTo: row.assigned_to,
    lastContactedAt: row.last_contacted_at,
    firstContactAt: row.first_contact_at,
    firstContactBy: row.first_contact_by,
    nextFollowUpAt: row.next_follow_up_at,
    brand: row.brand,
    category: row.category,
    tier: row.tier,
    qty: Number(row.qty) || 0,
    delivery: row.delivery ?? undefined,
    plan: row.plan ?? undefined,
    usersSeats: row.users_seats,
    endpoints: row.endpoints,
    servers: row.servers,
    ciscoUsers: row.cisco_users,
    ciscoSites: row.cisco_sites,
    budgetRange: row.budget_range ?? undefined,
    addons,
    otherBrand: row.other_brand ?? undefined,
    city: row.city,
    source: row.source,
    sourcePage: row.source_page,
    utmSource: row.utm_source ?? undefined,
    utmCampaign: row.utm_campaign ?? undefined,
    utmMedium: row.utm_medium ?? undefined,
    utmContent: row.utm_content ?? undefined,
    utmTerm: row.utm_term ?? undefined,
    pagePath: row.page_path ?? undefined,
    referrer: row.referrer ?? undefined,
    timeline: row.timeline ?? undefined,
    notes: row.notes,
    activityNotes,
    aiSummary,
    contactName: row.contact_name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function leadToParams(lead: LeadRecord) {
  return {
    lead_id: lead.leadId,
    status: normalizeStatus(lead.status),
    priority: normalizePriority(lead.priority),
    score: normalizeScore(lead.score),
    assigned_to: lead.assignedTo,
    last_contacted_at: lead.lastContactedAt,
    first_contact_at: lead.firstContactAt,
    first_contact_by: lead.firstContactBy,
    next_follow_up_at: lead.nextFollowUpAt,
    brand: String(lead.brand),
    category: lead.category,
    tier: lead.tier,
    qty: lead.qty,
    delivery: lead.delivery ?? null,
    plan: lead.plan ?? null,
    users_seats: lead.usersSeats ?? null,
    endpoints: lead.endpoints ?? null,
    servers: lead.servers ?? null,
    cisco_users: lead.ciscoUsers ?? null,
    cisco_sites: lead.ciscoSites ?? null,
    budget_range: lead.budgetRange ?? null,
    addons_json: JSON.stringify(Array.isArray(lead.addons) ? lead.addons : []),
    other_brand: lead.otherBrand ?? null,
    city: lead.city,
    source: lead.source || lead.sourcePage || "website",
    source_page: lead.sourcePage,
    utm_source: lead.utmSource ?? null,
    utm_campaign: lead.utmCampaign ?? null,
    utm_medium: lead.utmMedium ?? null,
    utm_content: lead.utmContent ?? null,
    utm_term: lead.utmTerm ?? null,
    page_path: lead.pagePath ?? null,
    referrer: lead.referrer ?? null,
    timeline: lead.timeline ?? null,
    notes: lead.notes,
    activity_notes_json: JSON.stringify(Array.isArray(lead.activityNotes) ? lead.activityNotes : []),
    ai_summary_json: JSON.stringify(lead.aiSummary ?? {}),
    contact_name: lead.contactName,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt
  };
}

function saveLead(lead: LeadRecord) {
  const db = getDb();
  const params = leadToParams(lead);
  db.prepare(`
    INSERT INTO leads (
      lead_id, status, priority, score, assigned_to, last_contacted_at, first_contact_at, first_contact_by, next_follow_up_at,
      brand, category, tier, qty, delivery, plan, users_seats, endpoints, servers, cisco_users, cisco_sites,
      budget_range, addons_json, other_brand, city, source, source_page, utm_source, utm_campaign, utm_medium,
      utm_content, utm_term, page_path, referrer, timeline, notes, activity_notes_json, contact_name, company,
      ai_summary_json, email, phone, created_at, updated_at
    ) VALUES (
      :lead_id, :status, :priority, :score, :assigned_to, :last_contacted_at, :first_contact_at, :first_contact_by, :next_follow_up_at,
      :brand, :category, :tier, :qty, :delivery, :plan, :users_seats, :endpoints, :servers, :cisco_users, :cisco_sites,
      :budget_range, :addons_json, :other_brand, :city, :source, :source_page, :utm_source, :utm_campaign, :utm_medium,
      :utm_content, :utm_term, :page_path, :referrer, :timeline, :notes, :activity_notes_json, :contact_name, :company,
      :ai_summary_json,
      :email, :phone, :created_at, :updated_at
    )
    ON CONFLICT(lead_id) DO UPDATE SET
      status=excluded.status,
      priority=excluded.priority,
      score=excluded.score,
      assigned_to=excluded.assigned_to,
      last_contacted_at=excluded.last_contacted_at,
      first_contact_at=excluded.first_contact_at,
      first_contact_by=excluded.first_contact_by,
      next_follow_up_at=excluded.next_follow_up_at,
      brand=excluded.brand,
      category=excluded.category,
      tier=excluded.tier,
      qty=excluded.qty,
      delivery=excluded.delivery,
      plan=excluded.plan,
      users_seats=excluded.users_seats,
      endpoints=excluded.endpoints,
      servers=excluded.servers,
      cisco_users=excluded.cisco_users,
      cisco_sites=excluded.cisco_sites,
      budget_range=excluded.budget_range,
      addons_json=excluded.addons_json,
      other_brand=excluded.other_brand,
      city=excluded.city,
      source=excluded.source,
      source_page=excluded.source_page,
      utm_source=excluded.utm_source,
      utm_campaign=excluded.utm_campaign,
      utm_medium=excluded.utm_medium,
      utm_content=excluded.utm_content,
      utm_term=excluded.utm_term,
      page_path=excluded.page_path,
      referrer=excluded.referrer,
      timeline=excluded.timeline,
      notes=excluded.notes,
      activity_notes_json=excluded.activity_notes_json,
      ai_summary_json=excluded.ai_summary_json,
      contact_name=excluded.contact_name,
      company=excluded.company,
      email=excluded.email,
      phone=excluded.phone,
      updated_at=excluded.updated_at
  `).run(params);
}

function withWriteLock<T>(job: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(job, job);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function buildLeadId() {
  const db = getDb();
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  let nextId = "";
  do {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    nextId = `LD-${datePart}-${randomPart}`;
  } while (db.prepare("SELECT 1 FROM leads WHERE lead_id = ? LIMIT 1").get(nextId));

  return nextId;
}

function appendNote(lead: LeadRecord, note: string, author: string) {
  const text = sanitizeText(note, 1200);
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

export async function readLeads(): Promise<LeadRecord[]> {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all() as LeadRow[];
  return rows.map((row) => rowToLead(row));
}

export async function createLead(input: NewLeadInput): Promise<LeadRecord> {
  return withWriteLock(async () => {
    const now = new Date().toISOString();

    const lead: LeadRecord = {
      ...input,
      leadId: buildLeadId(),
      status: "NEW",
      priority: input.priority && LEAD_PRIORITIES.includes(input.priority) ? input.priority : "WARM",
      score: normalizeScore(input.score),
      assignedTo: input.assignedTo && input.assignedTo.trim() ? input.assignedTo.trim() : null,
      lastContactedAt: null,
      firstContactAt: null,
      firstContactBy: null,
      nextFollowUpAt: null,
      activityNotes: [],
      aiSummary: null,
      createdAt: now,
      updatedAt: now
    };

    lead.notes = sanitizeText(lead.notes, 2000);
    lead.contactName = sanitizeText(lead.contactName, 120);
    lead.company = sanitizeText(lead.company, 160);

    saveLead(lead);
    return lead;
  });
}

export async function getLeadById(leadId: string): Promise<LeadRecord | null> {
  const db = getDb();
  const row = db.prepare("SELECT * FROM leads WHERE lead_id = ? LIMIT 1").get(leadId) as LeadRow | undefined;
  return row ? rowToLead(row) : null;
}

export async function patchLead(leadId: string, input: LeadPatchInput): Promise<LeadRecord | null> {
  return withWriteLock(async () => {
    const target = await getLeadById(leadId);
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
    saveLead(target);
    return target;
  });
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  return patchLead(leadId, { status });
}

export async function setLeadAiSummary(
  leadId: string,
  summaryInput: {
    summary: string;
    nextStep: string;
    priority: LeadPriority;
    source: "ai" | "fallback";
  },
  actor = "AI Assistant"
) {
  return withWriteLock(async () => {
    const target = await getLeadById(leadId);
    if (!target) {
      return null;
    }

    const nextSummary = normalizeAiSummary({
      summary: summaryInput.summary,
      nextStep: summaryInput.nextStep,
      priority: summaryInput.priority,
      source: summaryInput.source,
      generatedAt: new Date().toISOString()
    });
    if (!nextSummary) {
      return target;
    }

    target.aiSummary = nextSummary;
    appendNote(target, `AI summary generated: ${nextSummary.nextStep}`, actor);
    target.updatedAt = new Date().toISOString();
    saveLead(target);
    return target;
  });
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
  const query = (filters.q ?? "").trim().toLowerCase();
  const scoreBand = (filters.scoreBand ?? "all").toLowerCase();

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
      const scoreOk =
        scoreBand === "all" ||
        (scoreBand === "hot" && lead.score >= 80) ||
        (scoreBand === "warm" && lead.score >= 45 && lead.score < 80) ||
        (scoreBand === "cold" && lead.score < 45);
      const queryOk =
        !query ||
        [
          lead.leadId,
          lead.contactName,
          lead.company,
          lead.email,
          lead.phone,
          String(lead.brand),
          lead.category,
          lead.tier,
          lead.city,
          lead.score
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return brandOk && statusOk && cityOk && agentOk && dateOk && scoreOk && queryOk;
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
  lead: Pick<LeadRecord, "source" | "sourcePage" | "utmSource" | "utmMedium" | "utmCampaign" | "utmContent" | "utmTerm">
) {
  const source = `${lead.source ?? ""} ${lead.sourcePage} ${lead.utmSource ?? ""} ${lead.utmMedium ?? ""} ${lead.utmCampaign ?? ""} ${lead.utmContent ?? ""} ${lead.utmTerm ?? ""}`.toLowerCase();
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
