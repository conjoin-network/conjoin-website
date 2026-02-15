#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs", "google-setup");
const monitorFile = path.join(docsDir, "gsc-monitor-status.json");

const accessToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || "";
const siteUrlRaw = process.env.GSC_SITE_URL || "https://conjoinnetwork.com";
const siteUrl = `${new URL(siteUrlRaw).origin}/`;
const sitemapUrl = `${siteUrl}sitemap.xml`;

function writeJson(data) {
  mkdirSync(docsDir, { recursive: true });
  writeFileSync(monitorFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function request(url, method = "GET") {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text();

  return {
    ok: response.ok,
    status: response.status,
    payload
  };
}

async function main() {
  if (!accessToken) {
    writeJson({
      ok: false,
      status: "blocked",
      reason: "missing_google_oauth_access_token",
      siteUrl,
      sitemapUrl,
      next: "Set GOOGLE_OAUTH_ACCESS_TOKEN before running gsc-monitor"
    });
    console.log(`Blocked: missing token. Wrote ${monitorFile}`);
    return;
  }

  const encodedSite = encodeURIComponent(siteUrl);
  const encodedSitemap = encodeURIComponent(sitemapUrl);

  const sitemapResubmit = await request(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedSitemap}`,
    "PUT"
  );

  const sitemapStatus = await request(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`
  );

  writeJson({
    ok: sitemapResubmit.ok && sitemapStatus.ok,
    checkedAt: new Date().toISOString(),
    siteUrl,
    sitemapUrl,
    sitemapResubmit,
    sitemapStatus
  });

  console.log(`Wrote ${monitorFile}`);
}

main().catch((error) => {
  writeJson({
    ok: false,
    status: "error",
    message: error instanceof Error ? error.message : String(error)
  });
  console.error("GSC monitor failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
