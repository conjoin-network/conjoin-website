import fs from "node:fs";
import path from "node:path";
import { chromium, devices } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4310";
const outDir = path.join(process.cwd(), "docs", "screenshots", "phase3-pipeline");

async function captureDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.locator("header").first().screenshot({ path: path.join(outDir, "chunk1-header-desktop-after.png") });

  await page.evaluate(() => window.scrollTo(0, 220));
  await page.waitForTimeout(300);
  await page.locator("header").first().screenshot({ path: path.join(outDir, "chunk1-header-desktop-scrolled-after.png") });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);

  const cardsSection = page.locator("section#service-lines").first();
  if (await cardsSection.count()) {
    await cardsSection.screenshot({ path: path.join(outDir, "chunk1-buttons-contrast-desktop-after.png") });
  }

  const dots = page.locator('[aria-label^="Go to slide "]');
  const dotCount = await dots.count();
  for (let index = 0; index < Math.min(3, dotCount); index += 1) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(120);
    await page.locator('section[aria-roledescription="carousel"]').first().scrollIntoViewIfNeeded();
    await dots.nth(index).evaluate((element) => {
      element.click();
    });
    await page.waitForTimeout(280);
    await page
      .locator('section[aria-roledescription="carousel"]')
      .first()
      .screenshot({ path: path.join(outDir, `chunk1-hero-slide-${index + 1}-desktop-after.png`) });
  }

  await context.close();
}

async function captureMobile(browser) {
  const context = await browser.newContext({ ...devices["iPhone 14"] });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.locator("header").first().screenshot({ path: path.join(outDir, "chunk1-header-mobile-after.png") });

  const dots = page.locator('[aria-label^="Go to slide "]');
  const dotCount = await dots.count();
  for (let index = 0; index < Math.min(3, dotCount); index += 1) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(120);
    await page.locator('section[aria-roledescription="carousel"]').first().scrollIntoViewIfNeeded();
    await dots.nth(index).evaluate((element) => {
      element.click();
    });
    await page.waitForTimeout(280);
    await page
      .locator('section[aria-roledescription="carousel"]')
      .first()
      .screenshot({ path: path.join(outDir, `chunk1-hero-slide-${index + 1}-mobile-after.png`) });
  }

  await page
    .locator('section[aria-roledescription="carousel"]')
    .first()
    .screenshot({ path: path.join(outDir, "chunk1-mobile-hero-no-cut-after.png") });

  await page.getByRole("button", { name: /toggle navigation menu/i }).click();
  await page.waitForTimeout(220);
  await page.screenshot({ path: path.join(outDir, "chunk1-mobile-menu-open-after.png"), fullPage: false });

  await page.keyboard.press("Escape");
  await page.waitForTimeout(220);
  await page.screenshot({ path: path.join(outDir, "chunk1-mobile-menu-closed-after.png"), fullPage: false });

  await context.close();
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  await captureDesktop(browser);
  await captureMobile(browser);
  await browser.close();
  console.log(JSON.stringify({ ok: true, outDir }, null, 2));
}

run().catch((error) => {
  console.error("capture-chunk1-ui failed", error);
  process.exit(1);
});
