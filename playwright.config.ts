import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORT || 4310);
const baseURL = process.env.BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "artifacts/playwright-report", open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  webServer: {
    command: `bash -lc '(lsof -ti :${port} | xargs kill -9 2>/dev/null || true) && PORT=${port} pnpm start'`,
    url: `${baseURL}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
