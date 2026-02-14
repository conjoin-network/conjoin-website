#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", ".next"]);
const ignoredFiles = new Set(["scripts/audit-forbidden-strings.mjs"]);

const canonicalDomain = "conjoinnetwork.com";
const canonicalEmails = new Set([
  `sales@${canonicalDomain}`,
  `support@${canonicalDomain}`,
  `leads@${canonicalDomain}`,
  `manod@${canonicalDomain}`
]);
const domainPattern = /\bconjoin[a-z0-9-]*\.(?:com|con)\b/gi;
const emailPattern = /\b[a-z0-9._%+-]+@conjoin[a-z0-9-]*\.(?:com|con)\b/gi;

function isTextFile(content) {
  return !content.includes("\u0000");
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(rootDir, fullPath).replaceAll(path.sep, "/");

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        yield* walk(fullPath);
      }
      continue;
    }

    if (ignoredFiles.has(relativePath)) {
      continue;
    }

    yield { fullPath, relativePath };
  }
}

async function run() {
  const findings = [];

  for await (const file of walk(rootDir)) {
    let content;
    try {
      content = await fs.readFile(file.fullPath, "utf8");
    } catch {
      continue;
    }

    if (!isTextFile(content)) {
      continue;
    }

    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const domains = line.match(domainPattern) ?? [];
      const emails = line.match(emailPattern) ?? [];

      for (const domain of domains) {
        if (domain.toLowerCase() !== canonicalDomain) {
          findings.push({
            forbidden: domain,
            file: file.relativePath,
            line: index + 1,
            text: line.trim()
          });
        }
      }

      for (const email of emails) {
        if (!canonicalEmails.has(email.toLowerCase())) {
          findings.push({
            forbidden: email,
            file: file.relativePath,
            line: index + 1,
            text: line.trim()
          });
        }
      }
    }
  }

  if (findings.length > 0) {
    console.error("Forbidden string audit failed. Found typo domains/emails:");
    for (const finding of findings) {
      console.error(`- ${finding.file}:${finding.line} -> "${finding.forbidden}"`);
      if (finding.text) {
        console.error(`  ${finding.text}`);
      }
    }
    process.exit(1);
  }

  console.log("Forbidden string audit passed.");
}

run().catch((error) => {
  console.error("Forbidden string audit crashed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
