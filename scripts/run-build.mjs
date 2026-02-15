import { spawnSync } from "node:child_process";

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

const auditExitCode = run("npm", ["run", "audit:forbidden"]);
if (auditExitCode !== 0) {
  process.exit(auditExitCode);
}

const buildExitCode = run("next", ["build"]);
process.exit(buildExitCode);
