#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4310";
const PORT = process.env.PORT || "4310";
const outputDir = path.join(process.cwd(), "artifacts", "lhci");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with status ${result.status}`);
  }
}

function runCapture(command, args) {
  const result = spawnSync(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
    encoding: "utf8"
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(result.stderr || `${command} ${args.join(" ")} failed with status ${result.status}`);
  }

  return (result.stdout || "").trim();
}

function freePort() {
  run("bash", ["-lc", `(lsof -ti :${PORT} | xargs kill -9 2>/dev/null || true)`]);
}

function resolveChromiumPath() {
  const script = "const { chromium } = require('playwright'); process.stdout.write(chromium.executablePath());";
  return runCapture("node", ["-e", script]);
}

function ensureChromiumInstalled() {
  let chromiumPath = "";
  try {
    chromiumPath = resolveChromiumPath();
  } catch {
    chromiumPath = "";
  }

  if (!chromiumPath || !existsSync(chromiumPath)) {
    run("pnpm", ["exec", "playwright", "install", "chromium", "--with-deps"]);
    chromiumPath = resolveChromiumPath();
  }

  if (!chromiumPath || !existsSync(chromiumPath)) {
    throw new Error("Unable to resolve Chromium executable for Lighthouse.");
  }

  return chromiumPath;
}

function waitForExit(child, timeoutMs = 3_000) {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    child.once("exit", done);
    setTimeout(done, timeoutMs);
  });
}

async function waitForServer(url, timeoutMs = 20_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`Server did not become ready at ${url} within ${timeoutMs}ms`);
}

async function main() {
  freePort();
  rmSync(outputDir, { recursive: true, force: true });
  const chromePath = ensureChromiumInstalled();

  const server = spawn("pnpm", ["start"], {
    env: { ...process.env, PORT },
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  try {
    await waitForServer(`${BASE_URL}/health`);

    run("pnpm", [
      "exec",
      "lhci",
      "autorun",
      "--config=lighthouserc.json"
    ], {
      env: { ...process.env, CHROME_PATH: chromePath }
    });

    console.log("Lighthouse performance checks passed.");
  } finally {
    if (!server.killed) {
      server.kill("SIGTERM");
    }
    await waitForExit(server);
  }
}

main().catch((error) => {
  console.error("perf:check failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
