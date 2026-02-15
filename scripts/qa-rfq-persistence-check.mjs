import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://localhost:4310";
const reportJsonPath = path.join(process.cwd(), "docs", "qa-rfq-revenue-pass.json");

function readEnvFile() {
  try {
    return fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  } catch {
    return "";
  }
}

function getEnvValue(raw, key) {
  const match = raw.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) {
    return "";
  }
  return match[1].trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
}

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : { message: await response.text() };
  return { response, payload };
}

async function run() {
  if (!fs.existsSync(reportJsonPath)) {
    throw new Error("Run scripts/qa-rfq-revenue-pass.mjs first (missing docs/qa-rfq-revenue-pass.json).");
  }

  const report = JSON.parse(fs.readFileSync(reportJsonPath, "utf8"));
  const expectedIds = (report?.scenarios || []).map((row) => row?.leadId).filter(Boolean);
  if (expectedIds.length === 0) {
    throw new Error("No RFQ IDs found in report.");
  }

  const envRaw = readEnvFile();
  const ownerUser =
    process.env.OWNER_USER || getEnvValue(envRaw, "OWNER_USER") || process.env.ADMIN_USER || getEnvValue(envRaw, "ADMIN_USER") || "admin";
  const ownerPass =
    process.env.OWNER_PASS || getEnvValue(envRaw, "OWNER_PASS") || process.env.ADMIN_PASSWORD || getEnvValue(envRaw, "ADMIN_PASSWORD") || "change-me";

  const login = await requestJson(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ownerUser, password: ownerPass })
  });
  const cookie = login.response.headers.get("set-cookie") || "";
  const leadsList = await requestJson(`${baseUrl}/api/admin/leads?brand=all&status=all&city=all&dateRange=30&agent=all`, {
    headers: { cookie }
  });

  const leads = Array.isArray(leadsList.payload?.leads) ? leadsList.payload.leads : [];
  const found = expectedIds.filter((leadId) => leads.some((lead) => lead.leadId === leadId));

  const result = {
    expected: expectedIds.length,
    found: found.length,
    foundIds: found
  };

  console.log(JSON.stringify(result, null, 2));
  if (found.length !== expectedIds.length) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error("qa-rfq-persistence-check failed", error);
  process.exit(1);
});
