import { test, expect } from "@playwright/test";

const quotePayload = {
  brand: "Microsoft",
  category: "Microsoft 365",
  plan: "Business Standard",
  deployment: "Cloud",
  usersSeats: 25,
  city: "Chandigarh",
  timeline: "This Week",
  contactName: "Playwright Quote",
  company: "Conjoin QA",
  email: "sales@conjoinnetwork.com",
  phone: "9876543210",
  sourcePage: "/request-quote",
  source: "playwright",
  pagePath: "/request-quote",
  referrer: "http://127.0.0.1:4310/request-quote",
  addons: []
};

const leadPayload = {
  name: "Playwright Contact",
  company: "Conjoin QA",
  email: "support@conjoinnetwork.com",
  phone: "9876543211",
  requirement: "General procurement support",
  users: 10,
  city: "Chandigarh",
  timeline: "This Month",
  source: "playwright",
  pagePath: "/contact",
  referrer: "http://127.0.0.1:4310/contact",
  message: "Playwright API lead"
};

test("home loads with core trust markers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Partner-led IT service lines", { timeout: 15_000 });
  await expect(page.getByLabel("Chat on WhatsApp")).toBeVisible();
  await expect(page.getByText("All product names, logos, and brands are trademarks of their respective owners.")).toBeVisible();
});

test("brands and solutions pages expose canonical tags", async ({ page }) => {
  await page.goto("/brands");
  const brandsCanonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(brandsCanonical).toContain("https://conjoinnetwork.com/brands");

  await page.goto("/solutions/workspace");
  const solutionCanonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(solutionCanonical).toContain("https://conjoinnetwork.com/solutions/workspace");
});

test("contact, search, and quote pages load", async ({ page, request }) => {
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: "Request Quote" }).first()).toBeVisible();

  const searchResponse = await request.get("/search");
  expect(searchResponse.status()).toBe(200);

  const quotePage = await request.get("/request-quote");
  expect(quotePage.status()).toBe(200);
});

test("api quote and lead endpoints return ok payload", async ({ request }) => {
  const quoteResponse = await request.post("/api/quote", {
    data: quotePayload
  });
  expect(quoteResponse.status()).toBe(200);
  const quoteJson = await quoteResponse.json();
  expect(quoteJson.ok).toBeTruthy();
  expect(typeof quoteJson.leadId).toBe("string");

  const leadResponse = await request.post("/api/lead", {
    data: leadPayload
  });
  expect(leadResponse.status()).toBe(200);
  const leadJson = await leadResponse.json();
  expect(leadJson.ok).toBeTruthy();
  expect(typeof leadJson.leadId).toBe("string");
});

test("sitemap includes core routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  expect(xml).toContain("/brands");
  expect(xml).toContain("/solutions/workspace");
});
