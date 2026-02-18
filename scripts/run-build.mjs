import { spawnSync } from "node:child_process";
import path from "node:path";

const env = { ...process.env };
const ciLike = Boolean(env.CI || env.VERCEL || env.GITHUB_ACTIONS);

if (ciLike) {
  const flag = "--no-warnings";
  if (!env.NODE_OPTIONS?.includes(flag)) {
    env.NODE_OPTIONS = `${env.NODE_OPTIONS ? `${env.NODE_OPTIONS} ` : ""}${flag}`.trim();
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32"
  });

  if (result.error) {
    console.error(result.error);
    return 1;
  }

  return result.status ?? 1;
}

const auditScript = path.join(process.cwd(), "scripts", "audit-forbidden-strings.mjs");
const auditExitCode = run("node", [auditScript]);
if (auditExitCode !== 0) {
  process.exit(auditExitCode);
}

const prismaGenerateExitCode = run("prisma", ["generate"]);
if (prismaGenerateExitCode !== 0) {
  process.exit(prismaGenerateExitCode);
}

const buildExitCode = run("next", ["build"]);
process.exit(buildExitCode);
