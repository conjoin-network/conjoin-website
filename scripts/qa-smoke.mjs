#!/usr/bin/env node

const baseUrl = (process.env.QA_BASE_URL || "http://127.0.0.1:4310").replace(/\/$/, "");

const routes = [
  "/",
  "/brands",
  "/knowledge",
  "/search",
  "/request-quote",
  "/thank-you",
  "/microsoft",
  "/seqrite",
  "/cisco",
  "/locations/chandigarh",
  "/sitemap.xml",
  "/robots.txt"
];

async function checkRoute(pathname) {
  const url = `${baseUrl}${pathname}`;
  const response = await fetch(url, { redirect: "manual" });
  const ok = response.status === 200;
  console.log(`${ok ? "PASS" : "FAIL"} ${pathname} -> ${response.status}`);
  return ok;
}

async function run() {
  let failed = false;

  for (const route of routes) {
    try {
      const ok = await checkRoute(route);
      if (!ok) {
        failed = true;
      }
    } catch (error) {
      failed = true;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.log(`FAIL ${route} -> ${message}`);
    }
  }

  if (failed) {
    process.exitCode = 1;
    return;
  }

  console.log("Smoke checks passed.");
}

run();
