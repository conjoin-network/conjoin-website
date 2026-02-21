import type { CrmLeadScope } from "@/lib/crm-access";

const WORKFLOW_MARKER = "[[workflow]]";

export type LeadWorkflowMeta = {
  firstContactAt?: string | null;
  firstContactBy?: string | null;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;
  scope?: CrmLeadScope | null;
  service?: string | null;
};

function toTrimmed(value: string | null | undefined, limit: number) {
  if (!value) {
    return "";
  }
  return value.trim().slice(0, limit);
}

function toIsoOrEmpty(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
}

export function normalizeWorkflowMeta(input: LeadWorkflowMeta): LeadWorkflowMeta {
  const firstContactAt = toIsoOrEmpty(input.firstContactAt ?? "");
  const lastContactedAt = toIsoOrEmpty(input.lastContactedAt ?? "");
  const nextFollowUpAt = toIsoOrEmpty(input.nextFollowUpAt ?? "");
  const firstContactBy = toTrimmed(input.firstContactBy, 80);
  const scope = toTrimmed(input.scope ?? "", 24) as CrmLeadScope;
  const service = toTrimmed(input.service ?? "", 160);

  return {
    ...(firstContactAt ? { firstContactAt } : {}),
    ...(firstContactBy ? { firstContactBy } : {}),
    ...(lastContactedAt ? { lastContactedAt } : {}),
    ...(nextFollowUpAt ? { nextFollowUpAt } : {}),
    ...(scope ? { scope } : {}),
    ...(service ? { service } : {})
  };
}

export function parseWorkflowMetaFromNotes(notes: string | null | undefined) {
  const source = (notes ?? "").trim();
  if (!source) {
    return { notes: null as string | null, meta: {} as LeadWorkflowMeta };
  }

  const lines = source.split("\n");
  const kept: string[] = [];
  let meta: LeadWorkflowMeta = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(WORKFLOW_MARKER)) {
      kept.push(line);
      continue;
    }

    const raw = trimmed.slice(WORKFLOW_MARKER.length);
    try {
      meta = normalizeWorkflowMeta(JSON.parse(raw) as LeadWorkflowMeta);
    } catch {
      kept.push(line);
    }
  }

  const cleaned = kept.join("\n").trim();
  return {
    notes: cleaned || null,
    meta
  };
}

export function upsertWorkflowMetaInNotes(notes: string | null | undefined, patch: LeadWorkflowMeta) {
  const parsed = parseWorkflowMetaFromNotes(notes);
  const merged = normalizeWorkflowMeta({
    ...parsed.meta,
    ...patch
  });
  const cleanNotes = (parsed.notes ?? "").trim();
  if (Object.keys(merged).length === 0) {
    return cleanNotes || undefined;
  }

  const encoded = `${WORKFLOW_MARKER}${JSON.stringify(merged)}`;
  if (!cleanNotes) {
    return encoded;
  }
  return `${cleanNotes}\n${encoded}`;
}

