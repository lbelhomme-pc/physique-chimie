import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { V3_TOKEN_TABLE } from "../src/data/accessibility/tokens-v3.ts";

const TOKENS_CSS = new URL("../src/styles/tokens-v3.css", import.meta.url);
const DESIGN_SYSTEM_CSS = new URL("../src/styles/design-system.css", import.meta.url);

test("V3 token table references tokens declared in CSS", async () => {
  const css = await readFile(TOKENS_CSS, "utf8");

  for (const token of V3_TOKEN_TABLE) {
    assert.match(css, new RegExp(`${token.name}\\s*:`), `${token.name} should be declared`);
  }
});

test("V3 tokens keep compatibility aliases for legacy variables", async () => {
  const css = await readFile(TOKENS_CSS, "utf8");
  const aliases = [
    "--bg-primary",
    "--bg-secondary",
    "--text-primary",
    "--border-color",
    "--accent-primary",
    "--accent-success",
    "--accent-warning",
    "--accent-danger",
    "--radius-md",
    "--letter-spacing-base",
  ];

  for (const alias of aliases) {
    assert.match(css, new RegExp(`${alias}\\s*:\\s*var\\(--v3-`), `${alias} should point to V3 tokens`);
  }
});

test("V3 accessibility target has neutral default letter spacing", async () => {
  const css = await readFile(TOKENS_CSS, "utf8");

  assert.match(css, /--v3-letter-spacing-body\s*:\s*0\s*;/);
  assert.match(css, /\.a11y-letterspacing-normal\s*\{[\s\S]*--v3-letter-spacing-body\s*:\s*0\s*;/);
});

test("V3 target tokens do not load external font files", async () => {
  const css = await readFile(TOKENS_CSS, "utf8");

  assert.doesNotMatch(css, /@import\s+url\(/i);
  assert.doesNotMatch(css, /https?:\/\//i);
  assert.doesNotMatch(css, /cdn\./i);
});

test("design system exposes V3 tokens before active declarations", async () => {
  const css = await readFile(DESIGN_SYSTEM_CSS, "utf8");
  const importIndex = css.indexOf('@import "./tokens-v3.css";');
  const rootIndex = css.indexOf(":root");

  assert.ok(importIndex >= 0, "design-system.css should import tokens-v3.css");
  assert.ok(importIndex < rootIndex, "V3 tokens should be imported before legacy root declarations");
});
