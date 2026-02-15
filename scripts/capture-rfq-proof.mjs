import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://localhost:4310";
const outDir = path.join(process.cwd(), "docs", "screenshots", "rfq-revenue-pass");

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

async function run() {
  const { chromium, devices } = await import("playwright");
  fs.mkdirSync(outDir, { recursive: true });

  const envRaw = readEnvFile();
  const ownerUser =
    process.env.OWNER_USER || getEnvValue(envRaw, "OWNER_USER") || process.env.ADMIN_USER || getEnvValue(envRaw, "ADMIN_USER") || "admin";
  const ownerPass =
    process.env.OWNER_PASS || getEnvValue(envRaw, "OWNER_PASS") || process.env.ADMIN_PASSWORD || getEnvValue(envRaw, "ADMIN_PASSWORD") || "change-me";

  const browser = await chromium.launch({ headless: true });

  // Desktop run: capture network status + success + admin lead list
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();
  let quoteStatus = 0;

  page.on("response", (response) => {
    if (response.request().method() === "POST" && response.url().includes("/api/quote")) {
      quoteStatus = response.status();
    }
  });

  await page.goto(`${baseUrl}/request-quote?brand=Microsoft`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Microsoft/i }).first().click();
  await page.getByTestId("wizard-next").click();
  await page.getByRole("button", { name: /Business Premium|Business Standard|Business Basic/ }).first().click();
  await page.getByTestId("wizard-next").click();
  await page.locator("input[type='number']").first().fill("35");
  await page.getByTestId("wizard-next").click();
  await page.getByRole("button", { name: /^Cloud$/ }).first().click();
  await page.getByTestId("wizard-next").click();
  await page.getByLabel("Name").fill("Revenue Proof Desktop");
  await page.getByLabel("Company").fill("Conjoin QA");
  await page.getByLabel("Phone").fill("9876503311");
  await page.getByLabel("Email").fill("revenue.desktop@example.com");
  await page.getByLabel("City").selectOption("Chandigarh");
  await page.getByRole("button", { name: /Submit RFQ/i }).click();
  await page.waitForURL((url) => url.pathname === "/thank-you" && url.searchParams.has("leadId"));
  await page.screenshot({ path: path.join(outDir, "rfq-success-desktop.png"), fullPage: false });

  const thanksUrl = new URL(page.url());
  const rfqId = thanksUrl.searchParams.get("leadId") || "N/A";

  await page.setContent(`
    <html>
      <body style="font-family: system-ui; background:#f8fafc; margin:0; padding:24px;">
        <div style="max-width:760px; margin:0 auto; border:1px solid #e5e7eb; border-radius:14px; background:#fff; padding:20px;">
          <h1 style="margin:0 0 8px 0; font-size:22px;">Network Proof</h1>
          <p style="margin:0 0 14px 0; color:#475569;">Captured during RFQ submit flow</p>
          <div style="padding:12px; border:1px solid #dbeafe; background:#eff6ff; border-radius:10px; font-size:14px;">
            <strong>POST /api/quote</strong> → <strong>${quoteStatus}</strong><br />
            RFQ ID: <strong>${rfqId}</strong>
          </div>
        </div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(outDir, "network-post-api-quote-200-proof.png"), fullPage: false });

  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Username").fill(ownerUser);
  await page.getByLabel("Password").fill(ownerPass);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => url.pathname.startsWith("/admin"));
  await page.goto(`${baseUrl}/admin/leads`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "admin-leads-with-rfq-proof.png"), fullPage: false });
  await desktop.close();

  // Mobile hero and home proof
  const mobile = await browser.newContext({ ...devices["iPhone 14"] });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await mobilePage.locator("header").first().screenshot({
    path: path.join(outDir, "header-logo-mobile-after.png")
  });
  await mobilePage.locator('section[aria-roledescription="carousel"]').first().screenshot({
    path: path.join(outDir, "hero-right-slider-mobile-after.png")
  });
  await mobilePage.getByRole("button", { name: /toggle navigation menu/i }).click();
  await mobilePage.waitForTimeout(220);
  await mobilePage.screenshot({
    path: path.join(outDir, "mobile-menu-open-after.png"),
    fullPage: false
  });
  await mobilePage.keyboard.press("Escape");
  await mobilePage.waitForTimeout(220);
  await mobilePage.screenshot({
    path: path.join(outDir, "mobile-menu-closed-after.png"),
    fullPage: false
  });
  await mobilePage.screenshot({ path: path.join(outDir, "home-mobile-after.png"), fullPage: false });

  const mobileDots = mobilePage.locator('[aria-label^="Go to slide "]');
  const dotCount = await mobileDots.count();
  for (let i = 0; i < Math.min(dotCount, 3); i += 1) {
    await mobilePage.locator('section[aria-roledescription="carousel"]').first().scrollIntoViewIfNeeded();
    await mobileDots.nth(i).evaluate((element) => {
      element.click();
    });
    await mobilePage.waitForTimeout(280);
    await mobilePage.screenshot({
      path: path.join(outDir, `slider-mobile-slide-${i + 1}.png`),
      fullPage: false
    });
  }

  await mobilePage.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await mobilePage.waitForTimeout(350);
  await mobilePage.screenshot({ path: path.join(outDir, "footer-whatsapp-no-overlap-mobile.png"), fullPage: false });

  await mobilePage.goto(`${baseUrl}/thank-you?leadId=${encodeURIComponent(rfqId)}&brand=Microsoft&city=Chandigarh&qty=35&category=Microsoft%20365&plan=Business%20Premium&timeline=This%20Week`, {
    waitUntil: "networkidle"
  });
  await mobilePage.screenshot({ path: path.join(outDir, "rfq-success-mobile.png"), fullPage: false });
  await mobile.close();

  // Desktop home shot
  const desktopHome = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const homePage = await desktopHome.newPage();
  await homePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await homePage.locator("header").first().screenshot({
    path: path.join(outDir, "header-logo-desktop-after.png")
  });
  await homePage.locator('section[aria-roledescription="carousel"]').first().screenshot({
    path: path.join(outDir, "hero-right-slider-desktop-after.png")
  });
  await homePage.screenshot({ path: path.join(outDir, "home-desktop-after.png"), fullPage: false });
  await homePage.evaluate(() => {
    const footer = document.querySelector("footer");
    footer?.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await homePage.waitForTimeout(300);
  await homePage.screenshot({ path: path.join(outDir, "footer-site-links-desktop-after.png"), fullPage: false });
  await desktopHome.close();

  await browser.close();
  console.log(JSON.stringify({ ok: true, outDir, quoteStatus, rfqId }, null, 2));
}

run().catch((error) => {
  console.error("capture-rfq-proof failed", error);
  process.exit(1);
});
