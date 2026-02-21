import prisma from "./prisma";
import { parseAttributionFromNotes } from "./lead-attribution";

type SortDirection = "asc" | "desc";

type CrmLeadDbRow = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  source?: string | null;
  campaign?: string | null;
  city?: string | null;
  status?: string | null;
  assignedTo?: string | null;
  assignedAgent?: string | null;
  notes?: string | null;
  requirement?: string | null;
  usersDevices?: number | null;
  pageUrl?: string | null;
  referrer?: string | null;
  score?: number | string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CrmLeadNote = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
};

export type CrmLeadView = {
  leadId: string;
  contactName: string;
  phone: string;
  email: string | null;
  company: string | null;
  source: string | null;
  campaign: string | null;
  city: string | null;
  status: string;
  assignedTo: string | null;
  assignedAgent: string | null;
  notes: string | null;
  requirement: string | null;
  usersDevices: number | null;
  qty: number;
  usersSeats: number | null;
  endpoints: number | null;
  servers: number | null;
  brand: string | null;
  category: string | null;
  tier: string | null;
  timeline: string | null;
  pagePath: string | null;
  sourcePage: string | null;
  referrer: string | null;
  score: number;
  priority: "HOT" | "WARM" | "COLD";
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  ip: string | null;
  userAgent: string | null;
  lastContactedAt: string | null;
  firstContactAt: string | null;
  firstContactBy: string | null;
  nextFollowUpAt: string | null;
  activityNotes: CrmLeadNote[];
  aiSummary: null;
  aiEmailDraft: null;
  createdAt: string;
  updatedAt: string;
};

export type NewCrmLead = {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  source?: string;
  campaign?: string;
  city?: string;
  notes?: string;
  requirement?: string;
  usersDevices?: number;
  pageUrl?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  ip?: string;
  userAgent?: string;
  score?: number;
  assignedTo?: string | null;
  assignedAgent?: string | null;
};

export type ListCrmLeadsOptions = {
  where?: Record<string, unknown>;
  orderBy?: Record<string, SortDirection> | Array<Record<string, SortDirection>>;
  take?: number;
  skip?: number;
};

export type UpdateCrmLeadInput = Partial<{
  status: string;
  assignedTo: string | null;
  assignedAgent: string | null;
  notes: string;
  score: number;
}>;

function mapStatus(dbStatus: string | null | undefined) {
  if (!dbStatus) return "NEW";
  const s = String(dbStatus).toUpperCase();
  if (s === "NEW") return "NEW";
  if (s === "CONTACTED") return "IN_PROGRESS";
  if (s === "QUALIFIED") return "QUOTED";
  if (s === "CLOSED") return "WON";
  if (s === "LOST") return "LOST";
  return s;
}

function mapPriorityFromScore(score: number): "HOT" | "WARM" | "COLD" {
  if (score >= 80) return "HOT";
  if (score >= 45) return "WARM";
  return "COLD";
}

function toIsoString(value: Date | string) {
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function normalize(lead: CrmLeadDbRow): CrmLeadView {
  const score = typeof lead.score === "number" ? lead.score : Number(lead.score ?? 0);
  const attribution = parseAttributionFromNotes(lead.notes ?? null);
  const normalizedNotes = attribution.notes;
  const normalizedReferrer = lead.referrer ?? attribution.meta.referrer ?? null;
  const normalizedPagePath = lead.pageUrl ?? attribution.meta.landing_page ?? null;
  const normalizedGclid = lead.gclid ?? attribution.meta.gclid ?? null;

  return {
    leadId: lead.id,
    contactName: lead.name,
    phone: lead.phone,
    email: lead.email ?? null,
    company: lead.company ?? null,
    source: lead.source ?? null,
    campaign: lead.campaign ?? null,
    city: lead.city ?? null,
    status: mapStatus(lead.status),
    assignedTo: lead.assignedTo ?? null,
    assignedAgent: lead.assignedAgent ?? null,
    notes: normalizedNotes,
    requirement: lead.requirement ?? null,
    usersDevices: lead.usersDevices ?? null,
    qty: lead.usersDevices ?? 0,
    usersSeats: lead.usersDevices ?? null,
    endpoints: null,
    servers: null,
    brand: null,
    category: null,
    tier: null,
    timeline: null,
    pagePath: normalizedPagePath,
    sourcePage: normalizedPagePath,
    referrer: normalizedReferrer,
    score,
    priority: mapPriorityFromScore(score),
    utmSource: lead.utm_source ?? null,
    utmMedium: lead.utm_medium ?? null,
    utmCampaign: lead.utm_campaign ?? null,
    utmTerm: lead.utm_term ?? null,
    utmContent: lead.utm_content ?? null,
    gclid: normalizedGclid,
    gbraid: lead.gbraid ?? attribution.meta.gbraid ?? null,
    wbraid: lead.wbraid ?? attribution.meta.wbraid ?? null,
    ip: lead.ip ?? null,
    userAgent: lead.userAgent ?? null,
    lastContactedAt: null,
    firstContactAt: null,
    firstContactBy: null,
    nextFollowUpAt: null,
    activityNotes: [],
    aiSummary: null,
    aiEmailDraft: null,
    createdAt: toIsoString(lead.createdAt),
    updatedAt: toIsoString(lead.updatedAt)
  };
}

export async function createCrmLead(input: NewCrmLead): Promise<CrmLeadView> {
  try {
    console.info(
      "CRM_CREATE_ATTEMPT",
      JSON.stringify({
        hasName: Boolean(input.name?.trim()),
        hasEmail: Boolean(input.email?.trim()),
        hasPhone: Boolean(input.phone?.trim()),
        city: input.city ?? null,
        source: input.source ?? null
      })
    );
  } catch {
    // noop
  }

  const lead = await prisma.crmLead.create({
    data: input as unknown as Parameters<typeof prisma.crmLead.create>[0]["data"]
  });
  const normalized = normalize(lead as unknown as CrmLeadDbRow);

  try {
    console.info(
      "CRM_CREATED",
      JSON.stringify({
        leadId: normalized.leadId,
        createdAt: normalized.createdAt,
        city: normalized.city,
        source: normalized.source
      })
    );
  } catch {
    // noop
  }

  return normalized;
}

export async function listCrmLeads(opts?: ListCrmLeadsOptions): Promise<CrmLeadView[]> {
  const query: ListCrmLeadsOptions = { orderBy: { createdAt: "desc" } };
  if (opts?.where) query.where = opts.where;
  if (opts?.orderBy) query.orderBy = opts.orderBy;
  if (opts?.take) query.take = opts.take;
  if (opts?.skip) query.skip = opts.skip;

  try {
    const rows = await prisma.crmLead.findMany(
      query as unknown as Parameters<typeof prisma.crmLead.findMany>[0]
    );
    return rows.map((row) => normalize(row as unknown as CrmLeadDbRow));
  } catch (error) {
    const fallbackTake = Math.min(Math.max(Number(opts?.take ?? 500), 1), 2000);
    const fallbackSkip = Math.max(Number(opts?.skip ?? 0), 0);

    console.error(
      "CRM_LIST_FINDMANY_FAILED",
      JSON.stringify({
        reason: error instanceof Error ? `${error.name}: ${error.message}` : "Unknown error",
        take: fallbackTake,
        skip: fallbackSkip
      })
    );

    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT
        "id",
        "name",
        "phone",
        "email",
        "company",
        "source",
        "campaign",
        "city",
        "status"::text AS "status",
        "assignedTo",
        "assignedAgent",
        "notes",
        "requirement",
        "usersDevices",
        "pageUrl",
        "score",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "ip",
        "userAgent",
        "createdAt",
        "updatedAt"
      FROM "CrmLead"
      ORDER BY "createdAt" DESC
      LIMIT ${fallbackTake}
      OFFSET ${fallbackSkip}
      `
    );

    const fallbackRows = (Array.isArray(rows) ? rows : []) as CrmLeadDbRow[];
    return fallbackRows.map((row) =>
      normalize({
        ...row,
        status: mapStatus(row.status)
      })
    );
  }
}

export async function getCrmLead(id: string): Promise<CrmLeadView | null> {
  const lead = await prisma.crmLead.findUnique({ where: { id } });
  return lead ? normalize(lead as unknown as CrmLeadDbRow) : null;
}

export async function updateCrmLead(id: string, data: UpdateCrmLeadInput): Promise<CrmLeadView> {
  const payload: UpdateCrmLeadInput = { ...data };
  if (payload.status) payload.status = String(payload.status).toUpperCase();

  const updated = await prisma.crmLead.update({
    where: { id },
    data: payload as unknown as Parameters<typeof prisma.crmLead.update>[0]["data"]
  });

  return normalize(updated as unknown as CrmLeadDbRow);
}
