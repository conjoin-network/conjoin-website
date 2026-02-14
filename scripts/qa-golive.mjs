#!/usr/bin/env node

const baseUrl = (process.env.QA_BASE_URL || "http://127.0.0.1:4310").replace(/\/$/, "");

const routes = [
  "/",
  "/search",
  "/brands",
  "/microsoft",
  "/seqrite",
  "/cisco",
  "/locations/chandigarh",
  "/request-quote",
  "/thank-you",
  "/contact",
  "/robots.txt",
  "/sitemap.xml"
];

const userAgents = [
  {
    name: "desktop",
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  },
  {
    name: "mobile",
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  }
];

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function hasUnexpectedRuntimeError(body) {
  const checks = [
    "Application error:",
    "Hydration failed",
    "Unhandled Runtime Error",
    "NEXT_HTTP_ERROR_FALLBACK"
  ];
  return checks.some((check) => body.includes(check));
}

async function run() {
  for (const ua of userAgents) {
    for (const route of routes) {
      const response = await fetch(`${baseUrl}${route}`, {
        headers: {
          "user-agent": ua.value
        },
        redirect: "manual"
      });
      const body = await response.text();
      const ok = response.status === 200;
      console.log(`${ok ? "PASS" : "FAIL"} [${ua.name}] ${route} -> ${response.status}`);

      if (!ok) {
        fail(`[${ua.name}] ${route} returned ${response.status}`);
        continue;
      }

      if (hasUnexpectedRuntimeError(body)) {
        fail(`[${ua.name}] ${route} contains runtime error marker`);
      }
    }
  }

  const wizardResponse = await fetch(`${baseUrl}/request-quote`);
  const wizardHtml = await wizardResponse.text();
  if (!wizardHtml.includes("Request a Quote")) {
    fail("/request-quote missing heading");
  }
  if (!wizardHtml.includes("Five-step procurement flow")) {
    fail("/request-quote missing wizard guidance copy");
  }

  if (process.exitCode === 1) {
    return;
  }
  console.log("Go-live QA checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
