import prisma from './prisma';

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
  if (!dbStatus) return 'NEW';
  const s = String(dbStatus).toUpperCase();
  if (s === 'NEW') return 'NEW';
  if (s === 'CONTACTED') return 'IN_PROGRESS';
  if (s === 'QUALIFIED') return 'QUOTED';
  if (s === 'CLOSED') return 'WON';
  if (s === 'LOST') return 'LOST';
  return s;
}

function normalize(lead: any) {
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
    pagePath: lead.pageUrl ?? null,
    score: lead.score ?? 0,
    utmSource: lead.utm_source ?? null,
    utmMedium: lead.utm_medium ?? null,
    utmCampaign: lead.utm_campaign ?? null,
    utmTerm: lead.utm_term ?? null,
    utmContent: lead.utm_content ?? null,
    gclid: lead.gclid ?? null,
    ip: lead.ip ?? null,
    userAgent: lead.userAgent ?? null,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt
  };
}

export async function createCrmLead(input: NewCrmLead) {
  try {
    console.info('CRM_CREATE_ATTEMPT', JSON.stringify({ name: input.name ?? null, email: input.email ?? null, phone: input.phone ?? null, city: input.city ?? null }));
  } catch {}
  const lead = await prisma.crmLead.create({ data: input as any });
  const normalized = normalize(lead);
  try {
    console.info('CRM_CREATED', JSON.stringify({ leadId: normalized.leadId, name: normalized.contactName, city: normalized.city }));
  } catch {}
  return normalized;
}

export async function listCrmLeads() {
  const rows = await prisma.crmLead.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(normalize);
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
