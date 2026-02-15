import fs from "node:fs";
import path from "node:path";
import { chromium, webkit, devices } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4310";
const outDir = path.join(process.cwd(), "docs", "screenshots", "golive");

async function captureAndroidChrome() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["Pixel 7"],
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "hero-android-chrome-after.png"), fullPage: false });
  await context.close();
  await browser.close();
}

async function captureIphoneSafari() {
  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["iPhone 14"],
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "hero-iphone-safari-after.png"), fullPage: false });
  await context.close();
  await browser.close();
}

async function captureDesktopSlides() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });

  const dots = page.locator('[aria-label^="Go to slide "]');
  const dotCount = await dots.count();
  for (let index = 0; index < Math.min(3, dotCount); index += 1) {
    await dots.nth(index).click();
    await page.waitForTimeout(260);
    await page
      .locator('section[aria-roledescription="carousel"]')
      .first()
      .screenshot({ path: path.join(outDir, `hero-desktop-chrome-slide-${index + 1}-after.png`) });
  }
  await context.close();
  await browser.close();

  const safariBrowser = await webkit.launch({ headless: true });
  const safariContext = await safariBrowser.newContext({ viewport: { width: 1440, height: 900 } });
  const safariPage = await safariContext.newPage();
  await safariPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await safariPage
    .locator('section[aria-roledescription="carousel"]')
    .first()
    .screenshot({ path: path.join(outDir, "hero-desktop-safari-slide-1-after.png") });
  await safariContext.close();
  await safariBrowser.close();
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  await captureAndroidChrome();
  await captureIphoneSafari();
  await captureDesktopSlides();
  console.log(JSON.stringify({ ok: true, outDir }, null, 2));
}

run().catch((error) => {
  console.error("capture-hero-fix-proof failed", error);
  process.exit(1);
});

