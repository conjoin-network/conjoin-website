import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const queueFilePath = path.join(dataDir, "message-queue.json");
const isServerlessRuntime = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NOW_REGION
);
const requestedStorageMode = (process.env.LEAD_STORAGE_MODE ?? "").trim().toLowerCase();
let queueStorageMode: "file" | "memory" =
  requestedStorageMode === "memory" || requestedStorageMode === "file"
    ? requestedStorageMode
    : isServerlessRuntime
      ? "memory"
      : "file";
let queueWarningShown = false;
let memoryQueue: MessageIntent[] = [];

export type MessageChannel = "whatsapp" | "email";
export type MessageIntentStatus = "PENDING" | "SENT" | "FAILED";

export type MessageIntent = {
  id: string;
  leadId: string;
  channel: MessageChannel;
  to: string;
  payload: string;
  status: MessageIntentStatus;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

async function ensureQueueFile() {
  if (queueStorageMode !== "file") {
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(queueFilePath);
  } catch {
    await fs.writeFile(queueFilePath, "[]", "utf8");
  }
}

function warnQueueStorage(message: string) {
  if (queueWarningShown) {
    return;
  }
  queueWarningShown = true;
  console.warn("MESSAGE_QUEUE_WARNING", message);
}

function normalizeIntent(value: unknown): MessageIntent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<MessageIntent>;
  if (!candidate.id || !candidate.leadId || !candidate.channel) {
    return null;
  }

  const status =
    candidate.status === "SENT" || candidate.status === "FAILED" || candidate.status === "PENDING"
      ? candidate.status
      : "PENDING";

  return {
    id: candidate.id,
    leadId: candidate.leadId,
    channel: candidate.channel,
    to: candidate.to ?? "",
    payload: candidate.payload ?? "",
    status,
    error: candidate.error ?? null,
    createdAt: candidate.createdAt ?? new Date().toISOString(),
    updatedAt: candidate.updatedAt ?? candidate.createdAt ?? new Date().toISOString()
  };
}

export async function readMessageQueue(): Promise<MessageIntent[]> {
  if (queueStorageMode === "memory") {
    return [...memoryQueue].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  await ensureQueueFile();
  let raw = "[]";
  try {
    raw = await fs.readFile(queueFilePath, "utf8");
  } catch (error) {
    queueStorageMode = "memory";
    warnQueueStorage(
      `Queue file read failed, switching to in-memory mode. ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
    return [...memoryQueue];
  }
  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => normalizeIntent(item))
      .filter((item): item is MessageIntent => Boolean(item))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

async function writeMessageQueue(intents: MessageIntent[]) {
  if (queueStorageMode === "memory") {
    memoryQueue = intents;
    return;
  }

  await ensureQueueFile();
  const tempPath = `${queueFilePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(tempPath, JSON.stringify(intents, null, 2), "utf8");
    await fs.rename(tempPath, queueFilePath);
  } catch (error) {
    queueStorageMode = "memory";
    memoryQueue = intents;
    warnQueueStorage(
      `Queue file write failed, switching to in-memory mode. ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }
}

function buildIntentId(channel: MessageChannel) {
  const randomPart = Math.random().toString(36).slice(2, 9).toUpperCase();
  return `MSG-${channel.toUpperCase()}-${Date.now()}-${randomPart}`;
}

export async function enqueueMessageIntent(input: {
  leadId: string;
  channel: MessageChannel;
  to: string;
  payload: string;
}): Promise<MessageIntent> {
  const intents = await readMessageQueue();
  const now = new Date().toISOString();
  const nextIntent: MessageIntent = {
    id: buildIntentId(input.channel),
    leadId: input.leadId,
    channel: input.channel,
    to: input.to,
    payload: input.payload,
    status: "PENDING",
    error: null,
    createdAt: now,
    updatedAt: now
  };

  intents.unshift(nextIntent);
  await writeMessageQueue(intents);
  return nextIntent;
}

export async function updateMessageIntentStatus(
  id: string,
  status: MessageIntentStatus,
  error?: string | null
): Promise<MessageIntent | null> {
  const intents = await readMessageQueue();
  const target = intents.find((intent) => intent.id === id);
  if (!target) {
    return null;
  }

  target.status = status;
  target.error = error ?? null;
  target.updatedAt = new Date().toISOString();
  await writeMessageQueue(intents);
  return target;
}
