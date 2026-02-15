const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4310";

const checks = [
  {
    route: "/",
    h1Snippet: "Partner-led IT service lines",
    keyLinkSnippet: "/request-quote"
  },
  {
    route: "/brands",
    h1Snippet: "Brands Portfolio",
    keyLinkSnippet: "/request-quote"
  },
  {
    route: "/solutions/workspace",
    h1Snippet: "Workspace Solutions for Microsoft 365",
    keyLinkSnippet: "/request-quote"
  },
  {
    route: "/contact",
    h1Snippet: "Contact Conjoin Network",
    keyLinkSnippet: "mailto:sales@conjoinnetwork.com"
  }
];

function findCanonical(html) {
  const canonical = html.match(/<link[^>]+rel=\"canonical\"[^>]+href=\"([^\"]+)\"/i);
  return canonical?.[1] ?? null;
}

(async () => {
  let failed = false;

  for (const check of checks) {
    const url = `${baseUrl}${check.route}`;
    let response;
    try {
      response = await fetch(url, { redirect: "manual" });
    } catch (error) {
      failed = true;
      console.error(`FAIL ${check.route}: request error`, error);
      continue;
    }

    if (!response.ok) {
      failed = true;
      console.error(`FAIL ${check.route}: HTTP ${response.status}`);
      continue;
    }

    const html = await response.text();
    const h1Index = html.search(/<h1\b/i);
    const hiddenStreamIndex = html.indexOf('<div hidden id="S:');
    const hasLoaderMarkers = html.includes("animate-pulse") && html.includes("<!--$?-->") && html.includes('template id="B:0"');

    if (h1Index === -1) {
      failed = true;
      console.error(`FAIL ${check.route}: missing <h1> in initial HTML`);
      continue;
    }

    if (hiddenStreamIndex !== -1 && h1Index > hiddenStreamIndex) {
      failed = true;
      console.error(`FAIL ${check.route}: H1 only appears inside streamed hidden payload`);
      continue;
    }

    if (!html.includes(check.h1Snippet)) {
      failed = true;
      console.error(`FAIL ${check.route}: expected H1 snippet not found -> ${check.h1Snippet}`);
      continue;
    }

    if (!html.includes(check.keyLinkSnippet)) {
      failed = true;
      console.error(`FAIL ${check.route}: expected key link snippet missing -> ${check.keyLinkSnippet}`);
      continue;
    }

    if (hasLoaderMarkers && !html.includes(check.h1Snippet)) {
      failed = true;
      console.error(`FAIL ${check.route}: loader markers detected without meaningful primary content`);
      continue;
    }

    const canonical = findCanonical(html);
    if (!canonical || !canonical.startsWith("https://conjoinnetwork.com")) {
      failed = true;
      console.error(`FAIL ${check.route}: canonical missing/invalid -> ${canonical ?? "MISSING"}`);
      continue;
    }

    console.log(`PASS ${check.route}: h1 + key link + canonical present`);
  }

  if (failed) {
    process.exit(1);
  }

  console.log("SEO SSR checks passed.");
})();
