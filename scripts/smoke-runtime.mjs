#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4310";
const PORT = process.env.PORT || "4310";

const pageChecks = ["/", "/brands", "/solutions/workspace", "/contact"];
const markerChecks = [
  'aria-label="Chat on WhatsApp"',
  "All product names, logos, and brands are trademarks of their respective owners."
];
const structuredDataChecks = [
  {
    route: "/",
    markers: ['"@type":"Organization"']
  },
  {
    route: "/solutions/workspace",
    markers: ['"@type":"Service"']
  }
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with status ${result.status}`);
  }
}

function waitForExit(child, timeoutMs = 3_000) {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    child.once("exit", done);
    setTimeout(done, timeoutMs);
  });
}

function freePort() {
  run("bash", ["-lc", `(lsof -ti :${PORT} | xargs kill -9 2>/dev/null || true)`]);
}

async function waitForServer(url, timeoutMs = 20_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Server did not become ready at ${url} within ${timeoutMs}ms`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function checkPages() {
  const htmlMap = new Map();

  for (const route of pageChecks) {
    const response = await fetch(`${BASE_URL}${route}`);
    assert(response.ok, `Expected ${route} to return 200, got ${response.status}`);
    const html = await response.text();
    htmlMap.set(route, html);
    for (const marker of markerChecks) {
      assert(html.includes(marker), `Expected marker "${marker}" on ${route}`);
    }
    console.log(`PASS page markers ${route}`);
  }

  return htmlMap;
}

async function checkQuoteApi() {
  const payload = {
    brand: "Microsoft",
    category: "Microsoft 365",
    plan: "Business Standard",
    deployment: "Cloud",
    usersSeats: 15,
    city: "Chandigarh",
    timeline: "This Week",
    contactName: "Smoke User",
    company: "Smoke Corp",
    email: "sales@conjoinnetwork.com",
    phone: "9876543210",
    sourcePage: "/request-quote",
    source: "runtime-smoke",
    pagePath: "/request-quote",
    referrer: `${BASE_URL}/request-quote`,
    addons: []
  };

  const response = await fetch(`${BASE_URL}/api/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  assert(response.status === 200, `Expected /api/quote 200, got ${response.status}`);
  const json = await response.json();
  assert(json && typeof json === "object", "Expected /api/quote JSON object");
  assert(json.ok === true, "Expected /api/quote response ok=true");
  assert(typeof json.leadId === "string" && json.leadId.length > 0, "Expected /api/quote leadId string");
  console.log(`PASS /api/quote leadId=${json.leadId}`);
}

async function checkLeadApi() {
  const payload = {
    name: "Smoke Contact",
    company: "Smoke Corp",
    email: "support@conjoinnetwork.com",
    phone: "9876543211",
    requirement: "General procurement support",
    users: 10,
    city: "Chandigarh",
    timeline: "This Month",
    source: "runtime-smoke",
    pagePath: "/contact",
    referrer: `${BASE_URL}/contact`,
    message: "Smoke test lead payload"
  };

  const response = await fetch(`${BASE_URL}/api/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  assert(response.status === 200, `Expected /api/lead 200, got ${response.status}`);
  const json = await response.json();
  assert(json && typeof json === "object", "Expected /api/lead JSON object");
  assert(json.ok === true, "Expected /api/lead response ok=true");
  assert(typeof json.leadId === "string" && json.leadId.length > 0, "Expected /api/lead leadId string");
  console.log(`PASS /api/lead leadId=${json.leadId}`);
}

async function checkSitemap() {
  const response = await fetch(`${BASE_URL}/sitemap.xml`);
  assert(response.ok, `Expected /sitemap.xml 200, got ${response.status}`);
  const cacheControl = response.headers.get("cache-control") || "";
  assert(cacheControl.includes("s-maxage=3600"), "Expected /sitemap.xml cache-control with s-maxage=3600");
  const xml = await response.text();
  assert(xml.includes("/brands"), "Expected /sitemap.xml to include /brands");
  assert(xml.includes("/solutions"), "Expected /sitemap.xml to include /solutions");
  console.log("PASS /sitemap.xml includes /brands and /solutions");
}

async function checkRobots() {
  const response = await fetch(`${BASE_URL}/robots.txt`);
  assert(response.ok, `Expected /robots.txt 200, got ${response.status}`);
  const cacheControl = response.headers.get("cache-control") || "";
  assert(cacheControl.includes("s-maxage=86400"), "Expected /robots.txt cache-control with s-maxage=86400");
  const body = await response.text();
  assert(body.includes("Sitemap:"), "Expected robots.txt to include sitemap reference");
  console.log("PASS /robots.txt caching and sitemap reference");
}

async function checkHealth() {
  const response = await fetch(`${BASE_URL}/health`);
  assert(response.ok, `Expected /health 200, got ${response.status}`);
  const json = await response.json();
  assert(json.ok === true, "Expected /health response ok=true");
  console.log("PASS /health endpoint");
}

async function checkStructuredData(htmlMap) {
  for (const item of structuredDataChecks) {
    const html = htmlMap.get(item.route) || "";
    assert(html.includes("application/ld+json"), `Expected JSON-LD script on ${item.route}`);
    for (const marker of item.markers) {
      assert(html.includes(marker), `Expected JSON-LD marker ${marker} on ${item.route}`);
    }
    console.log(`PASS structured data ${item.route}`);
  }
}

async function checkCacheHeaders(htmlMap) {
  const homeResponse = await fetch(`${BASE_URL}/`);
  assert(homeResponse.ok, "Expected / response when validating cache headers");
  const homeCacheControl = homeResponse.headers.get("cache-control") || "";
  assert(homeCacheControl.includes("s-maxage=3600"), "Expected / cache-control with s-maxage=3600");

  const homeHtml = htmlMap.get("/") || (await homeResponse.text());
  const assetMatch = homeHtml.match(/\/_next\/static\/[^"']+/);
  assert(assetMatch, "Expected to find a /_next/static asset in home HTML");
  const assetPath = assetMatch[0];
  const assetResponse = await fetch(`${BASE_URL}${assetPath}`);
  assert(assetResponse.ok, `Expected ${assetPath} 200, got ${assetResponse.status}`);
  const assetCacheControl = assetResponse.headers.get("cache-control") || "";
  assert(
    assetCacheControl.includes("immutable"),
    `Expected immutable cache-control for static asset ${assetPath}, got "${assetCacheControl}"`
  );
  console.log("PASS cache-control headers for / and /_next/static asset");
}

function runSeoChecks() {
  run("pnpm", ["seo:check"]);
  run("pnpm", ["seo:check", "--", "--base", BASE_URL]);
}

async function main() {
  freePort();

  const server = spawn("pnpm", ["start"], {
    env: { ...process.env, PORT },
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  try {
    await waitForServer(`${BASE_URL}/`);
    const htmlMap = await checkPages();
    await checkCacheHeaders(htmlMap);
    await checkStructuredData(htmlMap);
    await checkHealth();
    await checkQuoteApi();
    await checkLeadApi();
    await checkSitemap();
    await checkRobots();
    runSeoChecks();
    console.log("Runtime smoke checks passed.");
  } finally {
    if (!server.killed) {
      server.kill("SIGTERM");
    }
    await waitForExit(server);
  }
}

main().catch((error) => {
  console.error("Runtime smoke failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
