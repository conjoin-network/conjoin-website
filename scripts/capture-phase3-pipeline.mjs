import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://localhost:4310";
const outDir = path.join(process.cwd(), "docs", "screenshots", "phase3-pipeline");

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

async function createLead() {
  const payload = {
    brand: "Microsoft",
    category: "Microsoft 365",
    plan: "Business Standard",
    deployment: "Cloud",
    usersSeats: 18,
    city: "Chandigarh",
    timeline: "This Week",
    source: "/request-quote",
    sourcePage: "/request-quote",
    pagePath: "/request-quote",
    referrer: `${baseUrl}/request-quote`,
    contactName: "Phase3 QA",
    company: "Conjoin QA",
    email: "phase3.qa@example.com",
    phone: "9876500018",
    notes: "Phase-3 pipeline proof lead."
  };

  const response = await fetch(`${baseUrl}/api/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !(data?.leadId || data?.rfqId)) {
    throw new Error(`Lead creation failed (${response.status})`);
  }
  return data.leadId ?? data.rfqId;
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const envRaw = readEnvFile();
  const ownerUser =
    process.env.OWNER_USER ||
    getEnvValue(envRaw, "OWNER_USER") ||
    process.env.ADMIN_USER ||
    getEnvValue(envRaw, "ADMIN_USER") ||
    "admin";
  const ownerPass =
    process.env.OWNER_PASS ||
    getEnvValue(envRaw, "OWNER_PASS") ||
    process.env.ADMIN_PASSWORD ||
    getEnvValue(envRaw, "ADMIN_PASSWORD") ||
    "change-me";

  const leadId = await createLead();

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Username").fill(ownerUser);
  await page.getByLabel("Password").fill(ownerPass);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/admin/**", { timeout: 15000 });

  await page.goto(`${baseUrl}/admin/pipeline`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "admin-pipeline-desktop.png"), fullPage: true });

  await page.goto(`${baseUrl}/admin/events`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, "admin-events-desktop.png"), fullPage: true });

  await page.goto(`${baseUrl}/admin/leads`, { waitUntil: "networkidle" });
  await page.locator("input[placeholder='RFQ ID, phone, email, name']").fill(leadId);
  await page.waitForTimeout(500);
  const row = page.locator("table tbody tr").first();
  await row.getByRole("button", { name: /view detail/i }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /generate ai summary/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, "admin-ai-summary-desktop.png"), fullPage: true });

  await page.getByRole("button", { name: /draft email/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, "admin-ai-email-draft-desktop.png"), fullPage: true });

  await page.getByRole("button", { name: "Too expensive" }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, "admin-ai-objection-desktop.png"), fullPage: true });

  await browser.close();

  console.log(
    JSON.stringify(
      {
        ok: true,
        leadId,
        outDir,
        files: fs.readdirSync(outDir).sort()
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error("capture-phase3-pipeline failed", error);
  process.exit(1);
});
