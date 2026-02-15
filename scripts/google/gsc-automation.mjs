#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs", "google-setup");
const verifyFile = path.join(docsDir, "search-console-verify.txt");
const statusFile = path.join(docsDir, "gsc-status.json");

const siteUrlRaw = process.env.GSC_SITE_URL || "https://conjoinnetwork.com";
const accessToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || "";
const dnsVerified = String(process.env.GSC_DNS_VERIFIED || "false").toLowerCase() === "true";

function normalizeSiteUrl(input) {
  const url = new URL(input);
  return `${url.origin}/`;
}

const siteUrl = normalizeSiteUrl(siteUrlRaw);
const sitemapUrl = `${siteUrl}sitemap.xml`;

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function googleRequest(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
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
  mkdirSync(docsDir, { recursive: true });

  if (!accessToken) {
    writeFileSync(
      verifyFile,
      [
        "Search Console verification token: PENDING",
        "",
        "Set GOOGLE_OAUTH_ACCESS_TOKEN and rerun:",
        "node scripts/google/gsc-automation.mjs",
        "",
        "Expected DNS record format:",
        "Type: TXT",
        "Host: @",
        "Value: google-site-verification=<token-from-api>"
      ].join("\n"),
      "utf8"
    );

    writeJson(statusFile, {
      ok: false,
      status: "blocked",
      reason: "missing_google_oauth_access_token",
      siteUrl,
      sitemapUrl,
      next: "Set GOOGLE_OAUTH_ACCESS_TOKEN and rerun scripts/google/gsc-automation.mjs"
    });

    console.log(`Blocked: missing GOOGLE_OAUTH_ACCESS_TOKEN. Wrote ${verifyFile} and ${statusFile}`);
    return;
  }

  const tokenResult = await googleRequest(
    "https://www.googleapis.com/siteVerification/v1/token",
    "POST",
    {
      site: {
        type: "SITE",
        identifier: siteUrl.replace(/\/$/, "")
      },
      verificationMethod: "DNS_TXT"
    }
  );

  const token = tokenResult.payload?.token || "";

  writeFileSync(
    verifyFile,
    [
      "Google Search Console DNS verification record",
      `Property: ${siteUrl.replace(/\/$/, "")}`,
      "",
      "Type: TXT",
      "Host: @",
      `Value: ${token || "google-site-verification=<token-not-returned>"}`,
      "",
      "After adding this TXT record, rerun with:",
      "GSC_DNS_VERIFIED=true node scripts/google/gsc-automation.mjs"
    ].join("\n"),
    "utf8"
  );

  const encodedSite = encodeURIComponent(siteUrl);
  const encodedSitemap = encodeURIComponent(sitemapUrl);

  const siteAdd = await googleRequest(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}`,
    "PUT"
  );

  let verificationResult = { skipped: true, reason: "dns_not_confirmed" };
  let sitemapSubmit = { skipped: true, reason: "verification_pending" };

  if (dnsVerified) {
    verificationResult = await googleRequest(
      "https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=DNS_TXT",
      "POST",
      {
        site: {
          type: "SITE",
          identifier: siteUrl.replace(/\/$/, "")
        }
      }
    );

    sitemapSubmit = await googleRequest(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedSitemap}`,
      "PUT"
    );
  }

  const finalStatus = {
    ok: tokenResult.ok && siteAdd.ok && (dnsVerified ? verificationResult.ok && sitemapSubmit.ok : true),
    siteUrl,
    sitemapUrl,
    tokenGenerated: Boolean(token),
    dnsRecordFile: verifyFile,
    api: {
      token: {
        ok: tokenResult.ok,
        status: tokenResult.status,
        payload: tokenResult.payload
      },
      siteAdd: {
        ok: siteAdd.ok,
        status: siteAdd.status,
        payload: siteAdd.payload
      },
      verification: verificationResult,
      sitemapSubmit
    }
  };

  writeJson(statusFile, finalStatus);
  console.log(`Wrote ${verifyFile}`);
  console.log(`Wrote ${statusFile}`);
}

main().catch((error) => {
  mkdirSync(docsDir, { recursive: true });
  writeJson(statusFile, {
    ok: false,
    status: "error",
    message: error instanceof Error ? error.message : String(error)
  });
  console.error("GSC automation failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
