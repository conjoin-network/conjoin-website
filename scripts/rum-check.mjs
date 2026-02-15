#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4310";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const payload = {
    id: `rum-${Date.now()}`,
    name: "INP",
    value: 180.42,
    rating: "good",
    path: "/request-quote",
    navigationType: "navigate"
  };

  const postResponse = await fetch(`${baseUrl}/api/rum`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  assert(postResponse.status === 200, `Expected /api/rum POST 200, got ${postResponse.status}`);
  const postJson = await postResponse.json();
  assert(postJson.ok === true, "Expected /api/rum POST ok=true");

  const getResponse = await fetch(`${baseUrl}/api/rum`);
  assert(getResponse.status === 200, `Expected /api/rum GET 200, got ${getResponse.status}`);
  const getJson = await getResponse.json();
  assert(getJson.ok === true, "Expected /api/rum GET ok=true");
  assert(getJson.summary && typeof getJson.summary === "object", "Expected /api/rum GET summary object");

  console.log("RUM check passed.");
}

main().catch((error) => {
  console.error("RUM check failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
