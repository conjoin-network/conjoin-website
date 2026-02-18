import { AGENT_OPTIONS } from "@/lib/agents";
import { classifyLeadSource, type LeadRecord } from "@/lib/leads";

function isToday(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function diffMinutes(a: string, b: string) {
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, (end - start) / (1000 * 60));
}

export function buildAgentSummary(leads: LeadRecord[]) {
  return AGENT_OPTIONS.map((agent) => {
    const assigned = leads.filter((lead) => lead.assignedTo === agent.name);
    const touchedTodaySet = new Set<string>();

    assigned.forEach((lead) => {
      if (isToday(lead.updatedAt)) {
        touchedTodaySet.add(lead.leadId);
      }
      if (lead.firstContactBy === agent.name && isToday(lead.firstContactAt)) {
        touchedTodaySet.add(lead.leadId);
      }
      (lead.activityNotes ?? []).forEach((note) => {
        if (note.author === agent.name && isToday(note.createdAt)) {
          touchedTodaySet.add(lead.leadId);
        }
      });
    });

    return {
      ...agent,
      newCount: assigned.filter((lead) => lead.status === "NEW").length,
      inProgressCount: assigned.filter((lead) => lead.status === "IN_PROGRESS").length,
      wonCount: assigned.filter((lead) => lead.status === "WON").length,
      totalAssigned: assigned.length,
      touchedToday: touchedTodaySet.size
    };
  });
}

export function buildScoreboard(leads: LeadRecord[]) {
  const leadsToday = leads.filter((lead) => isToday(lead.createdAt));
  const leadsWithFirstContactToday = leadsToday.filter((lead) => Boolean(lead.firstContactAt));
  const slaMetCount = leadsWithFirstContactToday.filter((lead) => {
    return lead.firstContactAt ? diffMinutes(lead.createdAt, lead.firstContactAt) <= 15 : false;
  }).length;

  const slaMetPercent =
    leadsToday.length === 0 ? 0 : Number(((slaMetCount / leadsToday.length) * 100).toFixed(1));

  const byBrand = Object.entries(
    leads.reduce<Record<string, number>>((acc, lead) => {
      const key = String(lead.brand || "Other");
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([brand, count]) => ({ brand, count }));

  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((acc, lead) => {
      const key = classifyLeadSource(lead);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([source, count]) => ({ source, count }));

  const byAgent = buildAgentSummary(leads).map((agent) => ({
    name: agent.name,
    role: agent.role,
    total: agent.totalAssigned,
    won: agent.wonCount,
    inProgress: agent.inProgressCount
  }));

  return {
    leadsToday: leadsToday.length,
    slaMetPercent,
    byBrand,
    bySource,
    byAgent
  };
}
