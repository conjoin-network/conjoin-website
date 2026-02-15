import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://localhost:4310";
const outDir = path.join(process.cwd(), "docs", "screenshots", "phase2-upgrade");

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

async function createProofLead() {
  const payload = {
    brand: "Microsoft",
    category: "Microsoft 365",
    plan: "Business Premium",
    deployment: "Cloud",
    usersSeats: 30,
    city: "Chandigarh",
    timeline: "This Week",
    source: "/request-quote",
    sourcePage: "/request-quote",
    pagePath: "/request-quote",
    referrer: `${baseUrl}/request-quote`,
    contactName: "Phase2 QA",
    company: "Conjoin QA",
    email: "phase2.qa@example.com",
    phone: "9876599988",
    notes: "Phase-2 screenshot proof lead."
  };

  const response = await fetch(`${baseUrl}/api/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !(json?.leadId || json?.rfqId)) {
    throw new Error(`Unable to create proof lead (${response.status}): ${json?.message ?? "Unknown error"}`);
  }

  return {
    leadId: json.leadId ?? json.rfqId,
    brand: payload.brand,
    city: payload.city,
    qty: payload.usersSeats,
    plan: payload.plan,
    timeline: payload.timeline
  };
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

  const proofLead = await createProofLead();

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktop.newPage();

  await desktopPage.goto(`${baseUrl}/brands`, { waitUntil: "networkidle" });
  await desktopPage.screenshot({ path: path.join(outDir, "brands-desktop-after.png"), fullPage: true });

  await desktopPage.goto(`${baseUrl}/brands/microsoft`, { waitUntil: "networkidle" });
  await desktopPage.screenshot({ path: path.join(outDir, "brand-microsoft-desktop-after.png"), fullPage: true });

  await desktopPage.goto(`${baseUrl}/products/endpoint-security`, { waitUntil: "networkidle" });
  await desktopPage.screenshot({ path: path.join(outDir, "product-endpoint-desktop-after.png"), fullPage: true });

  await desktopPage.goto(`${baseUrl}/knowledge`, { waitUntil: "networkidle" });
  await desktopPage.screenshot({ path: path.join(outDir, "knowledge-hub-desktop-after.png"), fullPage: true });

  await desktopPage.goto(`${baseUrl}/knowledge/microsoft-licensing-basics`, { waitUntil: "networkidle" });
  await desktopPage.screenshot({ path: path.join(outDir, "knowledge-article-desktop-after.png"), fullPage: true });

  await desktopPage.goto(`${baseUrl}/thank-you?leadId=${encodeURIComponent(proofLead.leadId)}&brand=${encodeURIComponent(proofLead.brand)}&city=${encodeURIComponent(proofLead.city)}&qty=${encodeURIComponent(String(proofLead.qty))}&plan=${encodeURIComponent(proofLead.plan)}&timeline=${encodeURIComponent(proofLead.timeline)}`, {
    waitUntil: "networkidle"
  });
  await desktopPage.screenshot({ path: path.join(outDir, "rfq-success-desktop-after.png"), fullPage: true });

  await desktopPage.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await desktopPage.getByLabel("Username").fill(ownerUser);
  await desktopPage.getByLabel("Password").fill(ownerPass);
  await desktopPage.getByRole("button", { name: /sign in/i }).click();
  await desktopPage.waitForURL("**/admin/leads**", { timeout: 15000 });
  await desktopPage.waitForTimeout(400);
  await desktopPage.screenshot({ path: path.join(outDir, "admin-leads-list-desktop-after.png"), fullPage: true });

  const firstRow = desktopPage.locator("table tbody tr").first();
  const rowSelects = firstRow.locator("select");
  if ((await rowSelects.count()) >= 3) {
    await rowSelects.nth(2).selectOption("Nidhi");
    await firstRow.getByRole("button", { name: /^Save$/ }).click();
    await desktopPage.waitForTimeout(350);
    await desktopPage.screenshot({ path: path.join(outDir, "admin-assignment-desktop-after.png"), fullPage: true });
  }

  const detailButton = firstRow.getByRole("button", { name: /view detail/i });
  if ((await detailButton.count()) > 0) {
    await detailButton.click();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(outDir, "admin-lead-detail-desktop-after.png"), fullPage: true });
  }

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();

  await mobilePage.goto(`${baseUrl}/request-quote`, { waitUntil: "networkidle" });
  await mobilePage.screenshot({ path: path.join(outDir, "rfq-step-1-mobile-after.png"), fullPage: true });

  await mobilePage.getByRole("button", { name: /^Microsoft$/ }).first().click();
  await mobilePage.getByTestId("wizard-next").click();
  await mobilePage.waitForSelector("button:has-text('Business Premium')");
  await mobilePage.locator("button:has-text('Business Premium')").first().click({ force: true });
  await mobilePage.getByTestId("wizard-next").click();
  await mobilePage.waitForTimeout(250);
  await mobilePage.screenshot({ path: path.join(outDir, "rfq-step-3-mobile-after.png"), fullPage: true });

  await mobilePage.goto(`${baseUrl}/thank-you?leadId=${encodeURIComponent(proofLead.leadId)}&brand=${encodeURIComponent(proofLead.brand)}&city=${encodeURIComponent(proofLead.city)}&qty=${encodeURIComponent(String(proofLead.qty))}&plan=${encodeURIComponent(proofLead.plan)}&timeline=${encodeURIComponent(proofLead.timeline)}`, {
    waitUntil: "networkidle"
  });
  await mobilePage.screenshot({ path: path.join(outDir, "rfq-success-mobile-after.png"), fullPage: true });

  await desktop.close();
  await mobile.close();
  await browser.close();

  const files = fs.readdirSync(outDir).sort();
  console.log(
    JSON.stringify(
      {
        ok: true,
        outDir,
        proofLeadId: proofLead.leadId,
        screenshots: files
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error("capture-phase2-screenshots failed", error);
  process.exit(1);
});
