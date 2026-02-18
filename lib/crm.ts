import prisma from "./prisma";

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
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  ip?: string;
  userAgent?: string;
};

function mapStatus(dbStatus: string | null | undefined) {
  // Map Prisma/DB statuses to legacy admin statuses
  // DB: NEW, CONTACTED, QUALIFIED, CLOSED, LOST
  // Admin UI expects: NEW, IN_PROGRESS, QUOTED, WON, LOST
  if (!dbStatus) return "NEW";
  const s = String(dbStatus).toUpperCase();
  if (s === "NEW") return "NEW";
  if (s === "CONTACTED") return "IN_PROGRESS";
  if (s === "QUALIFIED") return "QUOTED";
  if (s === "CLOSED") return "WON";
  if (s === "LOST") return "LOST";
  return s;
}

function normalize(lead: any) {
  const score = typeof lead.score === "number" ? lead.score : Number(lead.score ?? 0);
  function mapPriorityFromScore(s: number) {
    if (s >= 80) return "HOT";
    if (s >= 45) return "WARM";
    return "COLD";
  }

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
    notes: lead.notes ?? null,
    requirement: lead.requirement ?? null,
    usersDevices: lead.usersDevices ?? null,
    // UI expects qty/usersSeats/endpoints/servers
    qty: lead.usersDevices ?? 0,
    usersSeats: lead.usersDevices ?? null,
    endpoints: null,
    servers: null,
    // branding/product fields - not present in CrmLead; keep null
    brand: null,
    category: null,
    tier: null,
    // timeline info
    timeline: null,
    // page/referrer
    pagePath: lead.pageUrl ?? null,
    sourcePage: lead.pageUrl ?? null,
    referrer: lead.referrer ?? null,
    score: score,
    priority: mapPriorityFromScore(score),
    utmSource: lead.utm_source ?? null,
    utmMedium: lead.utm_medium ?? null,
    utmCampaign: lead.utm_campaign ?? null,
    utmTerm: lead.utm_term ?? null,
    utmContent: lead.utm_content ?? null,
    gclid: lead.gclid ?? null,
    ip: lead.ip ?? null,
    userAgent: lead.userAgent ?? null,
    // contact timeline fields that the admin UI may reference
    lastContactedAt: null,
    firstContactAt: null,
    firstContactBy: null,
    nextFollowUpAt: null,
    activityNotes: [],
    aiSummary: null,
    aiEmailDraft: null,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt
  };
}

export async function createCrmLead(input: NewCrmLead) {
  try {
    console.info("CRM_CREATE_ATTEMPT", JSON.stringify({ name: input.name ?? null, email: input.email ?? null, phone: input.phone ?? null, city: input.city ?? null }));
  } catch {}
  const lead = await prisma.crmLead.create({ data: input as any });
  const normalized = normalize(lead);
  try {
    console.info("CRM_CREATED", JSON.stringify({ leadId: normalized.leadId, name: normalized.contactName, city: normalized.city }));
  } catch {}
  return normalized;
}

export async function listCrmLeads(opts?: { where?: any; orderBy?: any; take?: number; skip?: number }) {
  const q: any = { orderBy: { createdAt: 'desc' } };
  if (opts?.where) q.where = opts.where;
  if (opts?.orderBy) q.orderBy = opts.orderBy;
  if (opts?.take) q.take = opts.take;
  if (opts?.skip) q.skip = opts.skip;
  try {
    const rows = await prisma.crmLead.findMany(q);
    return rows.map(normalize);
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

    return ((rows as any[]) || []).map((row) =>
      normalize({
        ...row,
        status: mapStatus(row.status)
      })
    );
  }
}

export async function getCrmLead(id: string) {
  const lead = await prisma.crmLead.findUnique({ where: { id } });
  return lead ? normalize(lead) : null;
}

export async function updateCrmLead(id: string, data: Partial<{ status: string; assignedTo: string; assignedAgent?: string; notes?: string; score?: number }>) {
  const payload: any = { ...(data as any) };
  if (payload.status) payload.status = String(payload.status).toUpperCase();
  const updated = await prisma.crmLead.update({ where: { id }, data: payload });
  return normalize(updated);
}
