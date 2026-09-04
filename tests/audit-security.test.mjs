import test from "node:test";
import assert from "node:assert/strict";
import { isTransientRegistryFailure } from "../scripts/audit-security.mjs";

test("security audit recognises only transient registry/network failures", () => {
  for (const message of [
    "503 Service Unavailable - POST https://registry.npmjs.org/-/npm/v1/security/audits/quick",
    "npm error code ETIMEDOUT",
    "npm error code ECONNRESET",
    "npm error code EAI_AGAIN",
    "audit endpoint returned an error",
  ]) {
    assert.equal(isTransientRegistryFailure(message), true, message);
  }

  for (const message of [
    "5 high severity vulnerabilities",
    "1 critical severity vulnerability",
    "npm ERR! invalid package-lock",
    "permission denied",
  ]) {
    assert.equal(isTransientRegistryFailure(message), false, message);
  }
});
