import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://localhost:4310";
const outDir = path.join(process.cwd(), "docs", "screenshots", "rfq-revenue-pass");
const reportJsonPath = path.join(process.cwd(), "docs", "qa-rfq-revenue-pass.json");
const reportMdPath = path.join(process.cwd(), "docs", "qa-rfq-revenue-pass.md");

function readEnvFile() {
  try {
    return fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  } catch {
    return "";
  }
}

function getEnvValue(raw, key) {
  const match = raw.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) {
    return "";
  }
  return match[1].trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
}

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const contentType = response.headers.get("content-type") || "";
  let payload = null;
  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    payload = { message: await response.text() };
  }
  return { response, payload };
}

function summaryLine(ok) {
  return ok ? "PASS" : "FAIL";
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });

  const envRaw = readEnvFile();
  const ownerUser =
    process.env.OWNER_USER || getEnvValue(envRaw, "OWNER_USER") || process.env.ADMIN_USER || getEnvValue(envRaw, "ADMIN_USER") || "admin";
  const ownerPass =
    process.env.OWNER_PASS || getEnvValue(envRaw, "OWNER_PASS") || process.env.ADMIN_PASSWORD || getEnvValue(envRaw, "ADMIN_PASSWORD") || "change-me";

  const scenarios = [
    {
      id: "S1",
      name: "Microsoft 365 - Chandigarh - This Week",
      payload: {
        brand: "Microsoft",
        category: "Microsoft 365",
        plan: "Business Premium",
        deployment: "Cloud",
        usersSeats: 50,
        city: "Chandigarh",
        timeline: "This Week",
        source: "/request-quote",
        sourcePage: "/request-quote",
        contactName: "Dummy Client S1",
        company: "Dummy Co",
        email: "dummy.s1@example.com",
        phone: "9876501101",
        notes: "Scenario 1 - Google Ads quality lead."
      }
    },
    {
      id: "S2",
      name: "Seqrite endpoint - Mohali - This Month",
      payload: {
        brand: "Seqrite",
        category: "Endpoint Protection",
        plan: "Endpoint Security",
        deployment: "Cloud",
        endpoints: 100,
        servers: 2,
        city: "Mohali",
        timeline: "This Month",
        source: "/request-quote",
        sourcePage: "/request-quote",
        contactName: "Dummy Client S2",
        company: "Dummy Co",
        email: "dummy.s2@example.com",
        phone: "9876501102",
        notes: "Scenario 2 - Seqrite endpoint expansion."
      }
    },
    {
      id: "S3",
      name: "CCTV / Surveillance - Panchkula - Urgent",
      payload: {
        brand: "Other",
        otherBrand: "Surveillance",
        category: "General OEM Requirement",
        plan: "Surveillance & CCTV",
        deployment: "On-Prem",
        ciscoUsers: 120,
        ciscoSites: 4,
        city: "Panchkula",
        timeline: "Today",
        source: "/request-quote",
        sourcePage: "/request-quote",
        contactName: "Dummy Client S3",
        company: "Dummy Co",
        email: "dummy.s3@example.com",
        phone: "9876501103",
        notes: "Scenario 3 - Urgent surveillance multi-site deployment."
      }
    },
    {
      id: "S4",
      name: "Optional fields empty (notes blank) should submit",
      payload: {
        brand: "Microsoft",
        category: "Microsoft 365",
        plan: "Business Standard",
        deployment: "Cloud",
        usersSeats: 22,
        city: "Chandigarh",
        timeline: "Planned Window",
        source: "/request-quote",
        sourcePage: "/request-quote",
        contactName: "Dummy Client S4",
        company: "Dummy Co",
        email: "dummy.s4@example.com",
        phone: "9876501104",
        notes: ""
      }
    },
    {
      id: "S6",
      name: "Large notes text (500+ chars) should submit",
      payload: {
        brand: "Seqrite",
        category: "Extended Detection",
        plan: "EDR",
        deployment: "Hybrid",
        endpoints: 350,
        servers: 7,
        city: "Mohali",
        timeline: "This Month",
        source: "/request-quote",
        sourcePage: "/request-quote",
        contactName: "Dummy Client S6",
        company: "Dummy Co",
        email: "dummy.s6@example.com",
        phone: "9876501106",
        notes: "Large note ".repeat(65)
      }
    }
  ];

  const report = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    scenarios: [],
    validationScenario: null,
    adminVerification: null,
    adminWorkflow: null,
    screenshots: []
  };

  const leadIds = [];

  for (const scenario of scenarios) {
    const { response, payload } = await requestJson(`${baseUrl}/api/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scenario.payload)
    });

    const pass = response.status === 200 && payload?.ok === true && typeof payload?.leadId === "string";
    if (pass) {
      leadIds.push(payload.leadId);
    }
    report.scenarios.push({
      id: scenario.id,
      name: scenario.name,
      status: response.status,
      ok: pass,
      leadId: payload?.leadId ?? null,
      message: payload?.message ?? null
    });
  }

  const login = await requestJson(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ownerUser, password: ownerPass })
  });

  const adminCookie = login.response.headers.get("set-cookie") || "";
  const adminLeads = await requestJson(`${baseUrl}/api/admin/leads?brand=all&status=all&city=all&dateRange=30&agent=all`, {
    headers: { cookie: adminCookie }
  });

  const allLeads = Array.isArray(adminLeads.payload?.leads) ? adminLeads.payload.leads : [];
  const foundIds = leadIds.filter((leadId) => allLeads.some((lead) => lead.leadId === leadId));

  report.adminVerification = {
    loginStatus: login.response.status,
    listStatus: adminLeads.response.status,
    expectedLeadCount: leadIds.length,
    foundLeadCount: foundIds.length,
    foundLeadIds: foundIds
  };

  let adminWorkflow = {
    ok: false,
    leadId: foundIds[0] ?? null,
    assignStatus: 0,
    quoteStatus: 0,
    persistedStatus: "",
    persistedAgent: "",
    note: ""
  };

  if (foundIds.length > 0) {
    const targetLeadId = foundIds[0];
    const assignResult = await requestJson(`${baseUrl}/api/admin/leads/${targetLeadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: adminCookie },
      body: JSON.stringify({
        status: "IN_PROGRESS",
        assignedTo: "Nidhi",
        note: "QA auto-check: contacted"
      })
    });

    const quoteResult = await requestJson(`${baseUrl}/api/admin/leads/${targetLeadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: adminCookie },
      body: JSON.stringify({
        status: "QUOTED",
        assignedTo: "Nidhi",
        note: "QA auto-check: quote shared"
      })
    });

    const verifyResult = await requestJson(
      `${baseUrl}/api/admin/leads?brand=all&status=all&city=all&dateRange=30&agent=all&q=${encodeURIComponent(targetLeadId)}`,
      {
        headers: { cookie: adminCookie }
      }
    );

    const verifiedLead = Array.isArray(verifyResult.payload?.leads)
      ? verifyResult.payload.leads.find((lead) => lead.leadId === targetLeadId)
      : null;

    adminWorkflow = {
      ok: assignResult.response.status === 200 && quoteResult.response.status === 200 && verifiedLead?.status === "QUOTED",
      leadId: targetLeadId,
      assignStatus: assignResult.response.status,
      quoteStatus: quoteResult.response.status,
      persistedStatus: verifiedLead?.status ?? "",
      persistedAgent: verifiedLead?.assignedTo ?? "",
      note: verifiedLead?.activityNotes?.[0]?.text ?? ""
    };
  }

  report.adminWorkflow = adminWorkflow;

  // Scenario 5: frontend validation should block submit with missing email/phone and no API call
  let validationScenario = {
    ok: false,
    reason: "playwright unavailable",
    apiQuoteCalls: -1,
    notice: ""
  };

  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    let apiQuoteCalls = 0;
    page.on("request", (request) => {
      if (request.method() === "POST" && request.url().includes("/api/quote")) {
        apiQuoteCalls += 1;
      }
    });

    await page.goto(`${baseUrl}/request-quote`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^Microsoft$/ }).first().click();
    await page.getByTestId("wizard-next").click();
    await page.getByRole("button", { name: /Business Basic|Business Standard|Business Premium/ }).first().click();
    await page.getByTestId("wizard-next").click();
    await page.locator("input[type='number']").first().fill("10");
    await page.getByTestId("wizard-next").click();
    await page.getByRole("button", { name: /^Cloud$/ }).first().click();
    await page.getByTestId("wizard-next").click();
    await page.getByLabel("Name").fill("Validation Client");
    await page.getByLabel("Company").fill("Validation Co");
    await page.getByLabel("City").selectOption("Chandigarh");
    await page.getByRole("button", { name: /Submit RFQ/i }).click();
    await page.waitForTimeout(450);

    const notice = (await page.locator("p[role='alert']").first().textContent()) || "";
    const validationShot = path.join(outDir, "scenario-5-validation-block-mobile.png");
    await page.screenshot({ path: validationShot, fullPage: false });
    report.screenshots.push(validationShot);

    validationScenario = {
      ok: apiQuoteCalls === 0 && /complete|required|email|phone/i.test(notice),
      reason: apiQuoteCalls === 0 ? "Client-side block triggered" : "API call was triggered unexpectedly",
      apiQuoteCalls,
      notice
    };

    await browser.close();
  } catch (error) {
    validationScenario = {
      ok: false,
      reason: error instanceof Error ? error.message : "Playwright execution failed",
      apiQuoteCalls: -1,
      notice: ""
    };
  }

  report.validationScenario = validationScenario;

  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), "utf8");

  const scenarioLines = report.scenarios
    .map((row) => `| ${row.id} | ${row.name} | ${summaryLine(row.ok)} | ${row.status} | ${row.leadId ?? "-"} | ${row.message ?? "-"} |`)
    .join("\n");

  const markdownLines = [
    "# RFQ Revenue Dummy QA Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Base URL: ${baseUrl}`,
    "",
    "## API Scenarios",
    "",
    "| Scenario | Description | Result | HTTP | RFQ ID | Message |",
    "| --- | --- | --- | --- | --- | --- |",
    scenarioLines,
    "",
    "## Scenario 5 (Client validation, no API call)",
    "",
    `- Result: **${summaryLine(report.validationScenario?.ok)}**`,
    `- API quote calls: ${report.validationScenario?.apiQuoteCalls}`,
    `- Notice: ${report.validationScenario?.notice || "-"}`,
    "",
    "## Admin verification",
    "",
    `- Admin login status: ${report.adminVerification?.loginStatus}`,
    `- Leads list status: ${report.adminVerification?.listStatus}`,
    `- Found ${report.adminVerification?.foundLeadCount}/${report.adminVerification?.expectedLeadCount} new RFQ IDs in CRM list`,
    `- RFQ IDs: ${(report.adminVerification?.foundLeadIds || []).join(", ")}`,
    "",
    "## Admin assignment + status workflow",
    "",
    `- Result: **${summaryLine(report.adminWorkflow?.ok)}**`,
    `- Lead ID: ${report.adminWorkflow?.leadId || "-"}`,
    `- Assign PATCH status: ${report.adminWorkflow?.assignStatus || "-"}`,
    `- Quoted PATCH status: ${report.adminWorkflow?.quoteStatus || "-"}`,
    `- Persisted status: ${report.adminWorkflow?.persistedStatus || "-"}`,
    `- Persisted assignee: ${report.adminWorkflow?.persistedAgent || "-"}`,
    "",
    "## Persistence after restart",
    "",
    "- Pending (run `node scripts/qa-rfq-persistence-check.mjs` after restart)",
    ""
  ];
  const markdown = markdownLines.join("\n");

  fs.writeFileSync(reportMdPath, markdown, "utf8");
  console.log(JSON.stringify({ ok: true, reportJsonPath, reportMdPath, leadIds }, null, 2));
}

run().catch((error) => {
  console.error("qa-rfq-revenue-pass failed", error);
  process.exit(1);
});
