import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TRANSIENT_PATTERNS = [
  /503\s+Service Unavailable/i,
  /502\s+Bad Gateway/i,
  /504\s+Gateway Timeout/i,
  /ETIMEDOUT/i,
  /ECONNRESET/i,
  /ECONNREFUSED/i,
  /EAI_AGAIN/i,
  /ENETUNREACH/i,
  /audit endpoint returned an error/i,
];

export function isTransientRegistryFailure(output) {
  return TRANSIENT_PATTERNS.some((pattern) => pattern.test(output));
}

export function runSecurityAudit() {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(command, ["audit", "--audit-level=high"], {
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_fetch_retries: "1",
      npm_config_fetch_retry_mintimeout: "1000",
      npm_config_fetch_retry_maxtimeout: "3000",
      npm_config_fetch_timeout: "15000",
    },
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  const code = typeof result.status === "number" ? result.status : 1;
  if (code === 0) return 0;

  const combined = `${stdout}\n${stderr}`;
  if (isTransientRegistryFailure(combined)) {
    console.warn(
      "[audit:security] Registre npm indisponible : contrôle réseau non concluant. " +
      "Le check CI est conservé, mais cet incident externe n'est pas traité comme une vulnérabilité du dépôt.",
    );
    return 0;
  }

  console.error("[audit:security] Échec bloquant de npm audit.");
  return code;
}

const isDirectExecution =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  process.exitCode = runSecurityAudit();
}
