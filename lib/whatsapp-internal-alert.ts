import { getCrmLead, updateCrmLead } from "@/lib/crm";
import { logAuditEvent } from "@/lib/event-log";
import {
  enqueueMessageIntent,
  readMessageQueue,
  type MessageIntentStatus,
  updateMessageIntentStatus
} from "@/lib/message-queue";
import { sendWhatsApp } from "@/lib/messaging";
import { upsertWorkflowMetaInNotes } from "@/lib/lead-workflow-meta";
import { getPrimaryWhatsAppNumber } from "@/lib/whatsapp";

type InternalLeadAlertInput = {
  leadId: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  city?: string | null;
  requirement?: string | null;
  qty?: number | null;
  usersSeats?: number | null;
  pagePath?: string | null;
  sourcePage?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  gclid?: string | null;
  assignedTo?: string | null;
  ip?: string | null;
};

type AlertResult = {
  status: MessageIntentStatus;
  deduped: boolean;
  reason?: string;
};

const ipRateMap = new Map<string, { ts: number; count: number }>();
const targetRateMap = new Map<string, { ts: number; count: number }>();
const dedupeMap = new Map<string, number>();

function parseLimit(name: string, fallbackValue: number) {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallbackValue;
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    return fallbackValue;
  }
  return value;
}

function checkRateLimit(map: Map<string, { ts: number; count: number }>, key: string, limit: number, windowMs: number) {
  if (!key) {
    return true;
  }
  const now = Date.now();
  const current = map.get(key);
  if (!current || now - current.ts > windowMs) {
    map.set(key, { ts: now, count: 1 });
    return true;
  }
  if (current.count >= limit) {
    return false;
  }
  current.count += 1;
  return true;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim();
}

function resolveTargetNumber() {
  const configured =
    normalize(process.env.WHATSAPP_BIZ_NUMBER) ||
    normalize(process.env.AGENT_WHATSAPP_ZEENA) ||
    getPrimaryWhatsAppNumber();
  return configured.replace(/[^\d]/g, "");
}

function isCloudProviderConfigured() {
  const provider = normalize(process.env.WHATSAPP_PROVIDER).toLowerCase();
  const token = normalize(process.env.WHATSAPP_TOKEN) || normalize(process.env.WHATSAPP_ACCESS_TOKEN);
  const phoneNumberId = normalize(process.env.WHATSAPP_PHONE_NUMBER_ID);
  return ["cloud", "enabled", "meta"].includes(provider) && Boolean(token && phoneNumberId);
}

export function buildInternalLeadAlertMessage(input: InternalLeadAlertInput) {
  const qty = input.qty ?? input.usersSeats ?? 0;
  return [
    `🔥 New Lead: ${input.leadId}`,
    `Name: ${input.name || "-"}`,
    `Company: ${input.company || "-"}`,
    `Phone: ${input.phone || "-"}`,
    `City: ${input.city || "-"}`,
    `Need: ${input.requirement || "-"}`,
    `Qty/Users: ${qty > 0 ? String(qty) : "-"}`,
    `Page: ${input.pagePath || input.sourcePage || "-"}`,
    `UTM: ${input.utmSource || "-"}/${input.utmCampaign || "-"}`,
    `GCLID: ${input.gclid || "-"}`,
    `Assigned: ${input.assignedTo || "-"}`,
    `Open CRM: https://conjoinnetwork.com/admin/leads?focus=${encodeURIComponent(input.leadId)}`
  ].join("\n");
}

async function persistWhatsAppStatus(leadId: string, status: MessageIntentStatus, reason?: string) {
  try {
    const lead = await getCrmLead(leadId);
    if (!lead) {
      return;
    }

    const nextNotes = upsertWorkflowMetaInNotes(lead.notes, {
      whatsappStatus: status,
      whatsappLastNotifiedAt: new Date().toISOString(),
      whatsappError: reason ?? ""
    });
    await updateCrmLead(leadId, { notes: nextNotes ?? "" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn("WHATSAPP_STATUS_PERSIST_FAILED", JSON.stringify({ leadId, status, reason: message }));
  }
}

async function findExistingIntent(leadId: string) {
  const intents = await readMessageQueue();
  return intents.find((intent) => intent.leadId === leadId && intent.channel === "whatsapp") ?? null;
}

export async function sendInternalLeadAlert(input: InternalLeadAlertInput): Promise<AlertResult> {
  const leadId = normalize(input.leadId);
  if (!leadId) {
    return { status: "FAILED", deduped: false, reason: "missing_lead_id" };
  }

  const existingIntent = await findExistingIntent(leadId);
  if (existingIntent && (existingIntent.status === "SENT" || existingIntent.status === "PENDING")) {
    await persistWhatsAppStatus(leadId, existingIntent.status, existingIntent.error ?? undefined);
    return {
      status: existingIntent.status,
      deduped: true,
      reason: existingIntent.error ?? (existingIntent.status === "SENT" ? "already_sent" : "already_pending")
    };
  }

  const lastNotifiedAt = dedupeMap.get(leadId) ?? 0;
  if (Date.now() - lastNotifiedAt < 15_000) {
    return { status: "PENDING", deduped: true, reason: "rapid_retry" };
  }
  dedupeMap.set(leadId, Date.now());

  const target = resolveTargetNumber();
  const message = buildInternalLeadAlertMessage(input);
  const intent = await enqueueMessageIntent({
    leadId,
    channel: "whatsapp",
    to: target,
    payload: message
  });

  const ipLimit = parseLimit("WHATSAPP_ALERT_RATE_LIMIT_PER_IP", 20);
  const targetLimit = parseLimit("WHATSAPP_ALERT_RATE_LIMIT_PER_PHONE", 90);
  const windowMs = parseLimit("WHATSAPP_ALERT_RATE_WINDOW_SECONDS", 600) * 1000;

  const ipAllowed = checkRateLimit(ipRateMap, normalize(input.ip) || "unknown", ipLimit, windowMs);
  const targetAllowed = checkRateLimit(targetRateMap, target, targetLimit, windowMs);
  if (!ipAllowed || !targetAllowed) {
    await updateMessageIntentStatus(intent.id, "FAILED", "rate_limited");
    await persistWhatsAppStatus(leadId, "FAILED", "rate_limited");
    await logAuditEvent({
      type: "whatsapp_sent",
      leadId,
      actor: "lead_alert",
      details: { ok: false, reason: "rate_limited", to: target }
    });
    return { status: "FAILED", deduped: false, reason: "rate_limited" };
  }

  if (!isCloudProviderConfigured()) {
    await persistWhatsAppStatus(leadId, "PENDING", "provider_not_configured");
    await logAuditEvent({
      type: "whatsapp_sent",
      leadId,
      actor: "lead_alert",
      details: { ok: false, reason: "provider_not_configured", to: target, pending: true }
    });
    return { status: "PENDING", deduped: false, reason: "provider_not_configured" };
  }

  const result = await sendWhatsApp({ to: target, message });
  if (result.ok) {
    await updateMessageIntentStatus(intent.id, "SENT");
    await persistWhatsAppStatus(leadId, "SENT");
    await logAuditEvent({
      type: "whatsapp_sent",
      leadId,
      actor: "lead_alert",
      details: { ok: true, to: target }
    });
    return { status: "SENT", deduped: false };
  }

  const failureReason = normalize(result.reason) || "send_failed";
  await updateMessageIntentStatus(intent.id, "FAILED", failureReason);
  await persistWhatsAppStatus(leadId, "FAILED", failureReason);
  await logAuditEvent({
    type: "whatsapp_sent",
    leadId,
    actor: "lead_alert",
    details: { ok: false, reason: failureReason, to: target }
  });
  return { status: "FAILED", deduped: false, reason: failureReason };
}

