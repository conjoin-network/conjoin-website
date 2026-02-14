#!/usr/bin/env node

const baseUrl = (process.env.QA_BASE_URL || "http://127.0.0.1:4310").replace(/\/$/, "");

const routes = [
  "/",
  "/solutions",
  "/solutions/workspace",
  "/solutions/secure",
  "/solutions/vision",
  "/commercial",
  "/request-quote",
  "/robots.txt",
  "/sitemap.xml"
];

async function fetchRoute(pathname) {
  const url = `${baseUrl}${pathname}`;
  const response = await fetch(url, { redirect: "manual" });
  const body = await response.text();
  return { url, response, body };
}

function countOccurrences(input, pattern) {
  const matches = input.match(pattern);
  return matches ? matches.length : 0;
}

function assertContains(body, needle, message, failures) {
  if (!body.includes(needle)) {
    failures.push(message);
  }
}

function assertRegex(body, pattern, message, failures) {
  if (!pattern.test(body)) {
    failures.push(message);
  }
}

async function run() {
  let failed = false;
  const htmlByRoute = new Map();

  for (const route of routes) {
    try {
      const { response, body } = await fetchRoute(route);
      const ok = response.status === 200;
      console.log(`${ok ? "PASS" : "FAIL"} ${route} -> ${response.status}`);
      if (!ok) {
        failed = true;
      }
      htmlByRoute.set(route, body);
    } catch (error) {
      failed = true;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.log(`FAIL ${route} -> ${message}`);
    }
  }

  const homeHtml = htmlByRoute.get("/") || "";
  const homeFailures = [];

  if (countOccurrences(homeHtml, /data-service-card="true"/g) < 5) {
    homeFailures.push("Home missing expected 5 service cards.");
  }

  assertContains(homeHtml, 'aria-label="Pause autoplay"', "Carousel play/pause control missing.", homeFailures);
  assertContains(homeHtml, 'aria-label="Previous slide"', "Carousel previous control missing.", homeFailures);
  assertContains(homeHtml, 'aria-label="Next slide"', "Carousel next control missing.", homeFailures);

  const dotCount = countOccurrences(homeHtml, /aria-label="Go to slide [0-9]+"/g);
  if (dotCount < 3) {
    homeFailures.push("Carousel dots missing or incomplete.");
  }

  assertRegex(
    homeHtml,
    /data-card-badge="true"[\s\S]*?<h3 class="text-lg font-semibold text-\[var\(--color-text-primary\)\]">/,
    "Badge is not rendered before title in service card DOM order.",
    homeFailures
  );

  if (homeFailures.length > 0) {
    failed = true;
    homeFailures.forEach((line) => console.log(`FAIL / -> ${line}`));
  }

  ["/solutions/workspace", "/solutions/secure", "/solutions/vision"].forEach((route) => {
    const html = htmlByRoute.get(route) || "";
    const routeFailures = [];
    const key = route.split("/").at(-1);
    assertContains(html, `data-theme="${key}"`, `${route} missing data-theme marker.`, routeFailures);
    if (routeFailures.length > 0) {
      failed = true;
      routeFailures.forEach((line) => console.log(`FAIL ${route} -> ${line}`));
    }
  });

  if (failed) {
    process.exitCode = 1;
    return;
  }

  console.log("Smoke checks passed.");
}

run();
