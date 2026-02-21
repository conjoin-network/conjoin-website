import type { PortalSession } from "@/lib/admin-session";

export type CrmLeadScope = "SALES" | "DEALER" | "ENTERPRISE" | "LOCAL_OPS" | "UNSCOPED";

type LeadLike = {
  assignedTo?: string | null;
  assignedAgent?: string | null;
  source?: string | null;
  campaign?: string | null;
  requirement?: string | null;
  notes?: string | null;
};

const LOCAL_OPS_ASSIGNEES = new Set(["Bharat", "Pardeep"]);

function normalize(value: string | null | undefined) {
  return (value ?? "").trim();
}

function leadText(lead: LeadLike) {
  return `${lead.source ?? ""} ${lead.campaign ?? ""} ${lead.requirement ?? ""} ${lead.notes ?? ""}`.toLowerCase();
}

function hasAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

export function inferLeadScope(lead: LeadLike): CrmLeadScope {
  const assignedTo = normalize(lead.assignedTo) || normalize(lead.assignedAgent);
  if (assignedTo === "Rimpy") {
    return "DEALER";
  }
  if (assignedTo === "Zeena") {
    return "ENTERPRISE";
  }
  if (LOCAL_OPS_ASSIGNEES.has(assignedTo)) {
    return "LOCAL_OPS";
  }
  if (assignedTo === "Nidhi" || assignedTo === "Girish" || assignedTo === "Kiran") {
    return "SALES";
  }

  const text = leadText(lead);
  if (hasAny(text, ["dealer", "reseller", "channel partner", "partner program"])) {
    return "DEALER";
  }
  if (hasAny(text, ["enterprise", "datacenter", "siem", "soc", "xdr", "edr", "zero trust"])) {
    return "ENTERPRISE";
  }
  if (hasAny(text, ["install", "installation", "onsite", "on-site", "field support", "local deployment"])) {
    return "LOCAL_OPS";
  }
  if (text) {
    return "SALES";
  }

  return "UNSCOPED";
}

export function canSessionAccessLead(session: PortalSession, lead: LeadLike) {
  if (session.isManagement || session.crmRole === "SUPER_ADMIN" || session.crmRole === "ADMIN") {
    return true;
  }

  const assignedTo = normalize(lead.assignedTo) || normalize(lead.assignedAgent);
  const scope = inferLeadScope(lead);

  if (session.crmRole === "SALES") {
    return Boolean(session.assignee) && assignedTo === session.assignee;
  }

  if (session.crmRole === "DEALER") {
    return scope === "DEALER" || assignedTo === "Rimpy";
  }

  if (session.crmRole === "ENTERPRISE") {
    return scope === "ENTERPRISE" || assignedTo === "Zeena";
  }

  if (session.crmRole === "LOCAL_OPS") {
    return scope === "LOCAL_OPS" || LOCAL_OPS_ASSIGNEES.has(assignedTo);
  }

  return Boolean(session.assignee) && assignedTo === session.assignee;
}

export function suggestAssigneeForService(input: { service: string; source?: string }) {
  const value = `${input.service} ${input.source ?? ""}`.toLowerCase();

  if (hasAny(value, ["dealer", "reseller", "channel"])) {
    return { assignee: "Rimpy", scope: "DEALER" as const };
  }

  if (hasAny(value, ["enterprise", "e5", "siem", "soc", "xdr", "edr"])) {
    return { assignee: "Zeena", scope: "ENTERPRISE" as const };
  }

  if (hasAny(value, ["install", "installation", "onsite", "on-site", "local deployment"])) {
    const pick = Date.now() % 2 === 0 ? "Bharat" : "Pardeep";
    return { assignee: pick, scope: "LOCAL_OPS" as const };
  }

  return { assignee: "Nidhi", scope: "SALES" as const };
}

