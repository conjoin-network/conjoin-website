import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4310";
const widths = [360, 375, 390, 414, 768, 1024, 1440];
const routes = ["/", "/search", "/request-quote"];
const outputPath = path.join(process.cwd(), "docs", "qa-mobile-layout.json");

async function run() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const report = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    checks: []
  };

  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: Math.max(780, Math.round(width * 2)) }
    });
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      const noOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth + 1;
      });
      const status = await page.request.get(`${baseUrl}${route}`);

      report.checks.push({
        width,
        route,
        status: status.status(),
        noOverflow
      });
    }

    if (width <= 414) {
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      const menuButton = page.getByRole("button", { name: /toggle navigation menu/i });
      await menuButton.click();
      const menuVisible = await page.locator("#mobile-nav-drawer").isVisible();
      if (menuVisible) {
        await page.getByRole("link", { name: /brands/i }).first().click();
        await page.waitForURL("**/brands");
      }
      const menuClosedAfterRouteChange = !(await page.locator("#mobile-nav-drawer").isVisible().catch(() => false));
      report.checks.push({
        width,
        route: "/ (mobile menu)",
        status: 200,
        noOverflow: true,
        menuVisible,
        menuClosedAfterRouteChange
      });
    }

    await context.close();
  }

  await browser.close();
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
  const failed = report.checks.filter((item) => item.status !== 200 || !item.noOverflow || item.menuVisible === false || item.menuClosedAfterRouteChange === false);
  if (failed.length > 0) {
    console.error(JSON.stringify({ ok: false, failed, outputPath }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, outputPath, checks: report.checks.length }, null, 2));
}

run().catch((error) => {
  console.error("qa-mobile-layout failed", error);
  process.exit(1);
});
