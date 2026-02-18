import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const isServerlessRuntime = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.NOW_REGION);
const dataDir =
  isServerlessRuntime || process.env.NODE_ENV === "production"
    ? "/tmp/conjoinnetwork"
    : path.join(process.cwd(), "data");
const dbPath = process.env.LEAD_DB_PATH?.trim() || path.join(dataDir, "crm-leads.sqlite");

let dbInstance: DatabaseSync | null = null;
let dbInitFailed = false;
let memoryEvents: AuditEventRecord[] = [];

type StatementRunner = {
  run: (...params: unknown[]) => unknown;
};

export type AuditEventType =
  | "lead_created"
  | "lead_assigned"
  | "status_changed"
  | "note_added"
  | "email_sent"
  | "whatsapp_sent";

export type AuditEventRecord = {
  id: number;
  type: AuditEventType;
  leadId: string | null;
  actor: string;
  details: Record<string, unknown>;
  createdAt: string;
};

export type AuditEventFilters = {
  type?: string;
  leadId?: string;
  q?: string;
  dateRange?: "all" | "7" | "30";
  limit?: number;
};

function getDb() {
  if (dbInitFailed) {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  try {
    fs.mkdirSync(dataDir, { recursive: true });
    const db = new DatabaseSync(dbPath);
    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;

      CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        lead_id TEXT,
        actor TEXT NOT NULL,
        details_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_events_type ON audit_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_audit_events_lead_id ON audit_events(lead_id);
    `);

    dbInstance = db;
    return db;
  } catch (error) {
    dbInitFailed = true;
    const message = error instanceof Error ? error.message : String(error);
    console.warn("AUDIT_EVENT_DB_DISABLED", message);
    return null;
  }
}

function toJson(value: Record<string, unknown>) {
  try {
    return JSON.stringify(value);
  } catch {
    return "{}";
  }
}

function parseDetails(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

export async function logAuditEvent(input: {
  type: AuditEventType;
  leadId?: string | null;
  actor?: string;
  details?: Record<string, unknown>;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  if (!db) {
    const nextEvent: AuditEventRecord = {
      id: Date.now(),
      type: input.type,
      leadId: input.leadId ?? null,
      actor: (input.actor?.trim() || "system").slice(0, 80),
      details: input.details ?? {},
      createdAt: now
    };
    memoryEvents.unshift(nextEvent);
    if (memoryEvents.length > 500) {
      memoryEvents = memoryEvents.slice(0, 500);
    }
    return;
  }

  (db.prepare(
    `
        INSERT INTO audit_events (event_type, lead_id, actor, details_json, created_at)
        VALUES (?, ?, ?, ?, ?)
      `
  ) as unknown as StatementRunner).run(
      input.type,
      input.leadId ?? null,
      (input.actor?.trim() || "system").slice(0, 80),
      toJson(input.details ?? {}),
      now
    );
}

export async function listAuditEvents(filters: AuditEventFilters = {}): Promise<AuditEventRecord[]> {
  const db = getDb();
  if (!db) {
    let items = [...memoryEvents];
    if (filters.type && filters.type !== "all") {
      items = items.filter((event) => event.type === filters.type);
    }
    if (filters.leadId && filters.leadId.trim()) {
      const targetLeadId = filters.leadId.trim();
      items = items.filter((event) => event.leadId === targetLeadId);
    }
    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      items = items.filter((event) => {
        const detailsString = JSON.stringify(event.details).toLowerCase();
        return (
          event.actor.toLowerCase().includes(q) ||
          (event.leadId ?? "").toLowerCase().includes(q) ||
          event.type.toLowerCase().includes(q) ||
          detailsString.includes(q)
        );
      });
    }
    if (filters.dateRange === "7" || filters.dateRange === "30") {
      const since = Date.now() - Number(filters.dateRange) * 24 * 60 * 60 * 1000;
      items = items.filter((event) => new Date(event.createdAt).getTime() >= since);
    }
    const limit = Math.max(10, Math.min(500, filters.limit ?? 200));
    return items.slice(0, limit);
  }

  const params: unknown[] = [];
  const conditions: string[] = [];

  if (filters.type && filters.type !== "all") {
    conditions.push("event_type = ?");
    params.push(filters.type.trim());
  }

  if (filters.leadId && filters.leadId.trim()) {
    conditions.push("lead_id = ?");
    params.push(filters.leadId.trim());
  }

  if (filters.q && filters.q.trim()) {
    const q = `%${filters.q.trim().toLowerCase()}%`;
    conditions.push(
      "(lower(actor) LIKE ? OR lower(lead_id) LIKE ? OR lower(event_type) LIKE ? OR lower(details_json) LIKE ?)"
    );
    params.push(q, q, q, q);
  }

  if (filters.dateRange === "7" || filters.dateRange === "30") {
    conditions.push("created_at >= ?");
    const since = new Date(Date.now() - Number(filters.dateRange) * 24 * 60 * 60 * 1000).toISOString();
    params.push(since);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.max(10, Math.min(500, filters.limit ?? 200));
  const rows = db
    .prepare(
      `
        SELECT id, event_type, lead_id, actor, details_json, created_at
        FROM audit_events
        ${where}
        ORDER BY created_at DESC
        LIMIT ?
      `
    )
    .all(...params, limit) as Array<{
    id: number;
    event_type: AuditEventType;
    lead_id: string | null;
    actor: string;
    details_json: string;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    type: row.event_type,
    leadId: row.lead_id,
    actor: row.actor,
    details: parseDetails(row.details_json),
    createdAt: row.created_at
  }));
}
