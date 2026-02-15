import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const rumFilePath = path.join(dataDir, "rum-events.json");
const maxEvents = 5000;
const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

type RumMetricName = "CLS" | "INP" | "LCP" | "FCP" | "TTFB";

export type RumEvent = {
  id: string;
  name: RumMetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor" | "unknown";
  path: string;
  navigationType: string;
  userAgent: string;
  createdAt: string;
};

export type RumSummary = {
  name: RumMetricName;
  count: number;
  p75: number;
  p95: number;
  latest: number;
};

let writeQueue: Promise<unknown> = Promise.resolve();

function normalizeEvent(input: RumEvent): RumEvent {
  return {
    id: input.id,
    name: input.name,
    value: Number.isFinite(input.value) ? Number(input.value.toFixed(3)) : 0,
    rating: input.rating,
    path: input.path || "/",
    navigationType: input.navigationType || "navigate",
    userAgent: input.userAgent || "unknown",
    createdAt: input.createdAt
  };
}

async function ensureRumFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(rumFilePath);
  } catch {
    await fs.writeFile(rumFilePath, "[]", "utf8");
  }
}

async function readEvents(): Promise<RumEvent[]> {
  await ensureRumFile();
  let raw = "[]";

  try {
    raw = await fs.readFile(rumFilePath, "utf8");
  } catch {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is RumEvent => Boolean(item && typeof item === "object"))
      .map((item) => normalizeEvent(item));
  } catch {
    return [];
  }
}

function rotateEvents(events: RumEvent[]) {
  const cutoff = Date.now() - maxAgeMs;
  const fresh = events.filter((event) => {
    const timestamp = Date.parse(event.createdAt);
    return Number.isFinite(timestamp) && timestamp >= cutoff;
  });

  if (fresh.length <= maxEvents) {
    return fresh;
  }

  return fresh.slice(-maxEvents);
}

async function writeEvents(events: RumEvent[]) {
  await ensureRumFile();
  const rotated = rotateEvents(events);
  const tempPath = `${rumFilePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(rotated, null, 2), "utf8");
  await fs.rename(tempPath, rumFilePath);
}

export async function appendRumEvent(event: RumEvent) {
  writeQueue = writeQueue.then(async () => {
    const events = await readEvents();
    events.push(normalizeEvent(event));
    await writeEvents(events);
  });

  await writeQueue;
}

function percentile(values: number[], fraction: number) {
  if (values.length === 0) {
    return 0;
  }

  const index = Math.min(values.length - 1, Math.ceil(values.length * fraction) - 1);
  return Number(values[index].toFixed(3));
}

export async function getRumSummary() {
  const events = rotateEvents(await readEvents());
  const byMetric = new Map<RumMetricName, number[]>();

  for (const event of events) {
    const list = byMetric.get(event.name) ?? [];
    list.push(event.value);
    byMetric.set(event.name, list);
  }

  const summaries: RumSummary[] = (Array.from(byMetric.entries()) as [RumMetricName, number[]][]) 
    .map(([name, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return {
        name,
        count: sorted.length,
        p75: percentile(sorted, 0.75),
        p95: percentile(sorted, 0.95),
        latest: Number(sorted[sorted.length - 1]?.toFixed(3) ?? 0)
      } satisfies RumSummary;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    count: events.length,
    windowDays: 7,
    metrics: summaries,
    updatedAt: new Date().toISOString(),
    storagePath: rumFilePath
  };
}

export async function getRecentRumEvents(limit = 50) {
  const events = rotateEvents(await readEvents());
  return events.slice(-Math.max(1, limit)).reverse();
}
