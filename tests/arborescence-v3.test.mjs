import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function exists(relativePath) {
  return existsSync(path.join(root, relativePath));
}

test("arborescence V3 exposes the expected structural entrypoints", () => {
  for (const dir of [
    "src/content-model",
    "src/data/chapters",
    "src/data/mathematiques",
    "src/data/laboratoire",
    "src/components/design-system",
    "src/components/pedagogie",
    "src/components/laboratoire",
    "src/components/accessibility",
    "src/components/navigation",
    "src/pages",
    "src/styles",
    "src/utils",
    "tests",
  ]) {
    assert.ok(exists(dir), `${dir} should exist`);
  }
});

test("content-model facade keeps V3 imports separate from raw data folders", () => {
  const source = readFileSync(path.join(root, "src/content-model/index.ts"), "utf8");

  for (const moduleName of [
    "contentAdapters",
    "contentContract",
    "contentContractAudit",
    "contentRoutes",
  ]) {
    assert.match(source, new RegExp(`\\.\\./data/${moduleName}\\.ts`), `${moduleName} should be exported`);
  }
});

test("V3 style entrypoints are explicit and documented", () => {
  const tokens = statSync(path.join(root, "src/styles/tokens-v3.css"));
  const designSystem = readFileSync(path.join(root, "src/styles/design-system.css"), "utf8");

  assert.ok(tokens.size > 0, "tokens-v3.css should not be empty");
  assert.match(designSystem, /@import "\.\/tokens-v3\.css";/);
});

