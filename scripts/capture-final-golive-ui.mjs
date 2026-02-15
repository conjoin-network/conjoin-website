import fs from "node:fs";
import path from "node:path";
import { chromium, firefox, webkit, devices } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4310";
const outDir = path.join(process.cwd(), "docs", "screenshots", "golive");

async function captureChromeDesktop() {
  const browser = await chromium.launch({ headless: true });
  const context1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page1440 = await context1440.newPage();

  await page1440.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page1440.screenshot({ path: path.join(outDir, "home-hero-desktop-chrome-after.png"), fullPage: false });

  const dots = page1440.locator('[aria-label^="Go to slide "]');
  const dotCount = await dots.count();
  for (let index = 0; index < Math.min(3, dotCount); index += 1) {
    await dots.nth(index).click();
    await page1440.waitForTimeout(300);
    await page1440
      .locator('section[aria-roledescription="carousel"]')
      .first()
      .screenshot({ path: path.join(outDir, `hero-slide-${index + 1}-desktop-chrome-after.png`) });
  }

  await page1440.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
  await page1440.screenshot({ path: path.join(outDir, "admin-1440-after.png"), fullPage: false });
  await page1440.goto(`${baseUrl}/admin/pipeline`, { waitUntil: "networkidle" });
  await page1440.screenshot({ path: path.join(outDir, "admin-pipeline-1440-after.png"), fullPage: false });
  await page1440.goto(`${baseUrl}/admin/leads`, { waitUntil: "networkidle" });
  await page1440.screenshot({ path: path.join(outDir, "admin-leads-1440-after.png"), fullPage: false });

  await context1440.close();

  const context1024 = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page1024 = await context1024.newPage();
  await page1024.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
  await page1024.screenshot({ path: path.join(outDir, "admin-1024-after.png"), fullPage: false });
  await page1024.goto(`${baseUrl}/admin/pipeline`, { waitUntil: "networkidle" });
  await page1024.screenshot({ path: path.join(outDir, "admin-pipeline-1024-after.png"), fullPage: false });
  await page1024.goto(`${baseUrl}/admin/leads`, { waitUntil: "networkidle" });
  await page1024.screenshot({ path: path.join(outDir, "admin-leads-1024-after.png"), fullPage: false });
  await context1024.close();

  await browser.close();
}

async function captureMobileChrome() {
  const browser = await chromium.launch({ headless: true });
  const widths = [360, 390, 414, 768];
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width < 700 ? 844 : 1024 },
      userAgent: devices["Pixel 7"].userAgent,
      isMobile: width < 700,
      hasTouch: width < 700
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(outDir, `home-hero-mobile-${width}-chrome-after.png`), fullPage: false });
    if (width === 390) {
      const dots = page.locator('[aria-label^="Go to slide "]');
      const dotCount = await dots.count();
      for (let index = 0; index < Math.min(3, dotCount); index += 1) {
        await dots.nth(index).click();
        await page.waitForTimeout(300);
        await page
          .locator('section[aria-roledescription="carousel"]')
          .first()
          .screenshot({ path: path.join(outDir, `hero-slide-${index + 1}-mobile-chrome-after.png`) });
      }
    }
    await context.close();
  }
  await browser.close();
}

async function captureSafari() {
  const browser = await webkit.launch({ headless: true });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await desktopPage.screenshot({ path: path.join(outDir, "home-hero-desktop-safari-after.png"), fullPage: false });
  await desktop.close();

  const mobile = await browser.newContext({ ...devices["iPhone 14"], viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await mobilePage.screenshot({ path: path.join(outDir, "home-hero-mobile-390-safari-after.png"), fullPage: false });
  const dots = mobilePage.locator('[aria-label^="Go to slide "]');
  const dotCount = await dots.count();
  for (let index = 0; index < Math.min(3, dotCount); index += 1) {
    await dots.nth(index).click();
    await mobilePage.waitForTimeout(300);
    await mobilePage
      .locator('section[aria-roledescription="carousel"]')
      .first()
      .screenshot({ path: path.join(outDir, `hero-slide-${index + 1}-mobile-safari-after.png`) });
  }
  await mobile.close();
  await browser.close();
}

async function smokeBrowser(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      const text = message.text();
      if (/content-security-policy|frame-ancestors|report-only/i.test(text)) {
        return;
      }
      consoleErrors.push(text);
    }
  });

  for (const route of ["/", "/solutions", "/brands", "/knowledge", "/contact", "/admin", "/admin/leads", "/admin/pipeline"]) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    if (!response || response.status() >= 400) {
      throw new Error(`${name} failed on ${route} (${response?.status() ?? "no response"})`);
    }
  }

  await context.close();
  await browser.close();
  return { name, consoleErrors };
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  await captureChromeDesktop();
  await captureMobileChrome();
  await captureSafari();
  const browserChecks = [];
  browserChecks.push(await smokeBrowser(chromium, "chrome"));
  browserChecks.push(await smokeBrowser(webkit, "safari"));
  browserChecks.push(await smokeBrowser(firefox, "firefox"));
  fs.writeFileSync(path.join(outDir, "final-ui-browser-checks.json"), JSON.stringify(browserChecks, null, 2), "utf8");
  console.log(JSON.stringify({ ok: true, outDir, browserChecks }, null, 2));
}

run().catch((error) => {
  console.error("capture-final-golive-ui failed", error);
  process.exit(1);
});
