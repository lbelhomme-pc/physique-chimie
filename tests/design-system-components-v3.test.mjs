import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentFiles = [
  "V3Button.astro",
  "V3Badge.astro",
  "V3Card.astro",
  "V3Field.astro",
  "V3PedagogyBlock.astro",
  "V3State.astro",
  "V3Tabs.astro",
  "V3TabPanel.astro",
  "V3ComponentShowcase.astro",
];

const componentUrl = (file) => new URL(`../src/components/design-system/${file}`, import.meta.url);
const prototypeUrl = new URL("../docs/refonte-v3/prototypes/design-system-composants-base-v3.html", import.meta.url);

test("V3 base component files are isolated in the design-system folder", async () => {
  for (const file of componentFiles) {
    const source = await readFile(componentUrl(file), "utf8");
    assert.ok(source.length > 0, `${file} should not be empty`);
    assert.doesNotMatch(source, /from\s+["'](?:react|@astrojs|lucide-react)/, `${file} should not add UI dependencies`);
  }
});

test("V3 components use V3 tokens and radius-md as the default card/control radius", async () => {
  const files = ["V3Button.astro", "V3Card.astro", "V3Field.astro", "V3PedagogyBlock.astro", "V3State.astro", "V3Tabs.astro"];

  for (const file of files) {
    const source = await readFile(componentUrl(file), "utf8");
    assert.match(source, /--v3-/, `${file} should consume V3 tokens`);
    assert.match(source, /var\(--v3-radius-md\)/, `${file} should use the 8px default radius`);
  }
});

test("V3 components cover required interaction and accessibility states", async () => {
  const button = await readFile(componentUrl("V3Button.astro"), "utf8");
  const field = await readFile(componentUrl("V3Field.astro"), "utf8");
  const tabs = await readFile(componentUrl("V3Tabs.astro"), "utf8");
  const state = await readFile(componentUrl("V3State.astro"), "utf8");

  assert.match(button, /disabled/);
  assert.match(button, /:focus-visible/);
  assert.match(field, /aria-invalid/);
  assert.match(field, /aria-describedby/);
  assert.match(tabs, /role="tablist"/);
  assert.match(tabs, /ArrowRight|ArrowLeft|Home|End/);
  assert.match(state, /empty.*loading.*error.*offline.*success/s);
});

test("V3 pedagogy block exposes the expected teaching variants", async () => {
  const source = await readFile(componentUrl("V3PedagogyBlock.astro"), "utf8");

  for (const kind of ["notion", "definition", "method", "law", "example", "warning"]) {
    assert.match(source, new RegExp(kind), `missing ${kind} pedagogy variant`);
  }
});

test("V3 prototype references the token file and avoids nested cards", async () => {
  const source = await readFile(prototypeUrl, "utf8");

  assert.match(source, /tokens-v3\.css/);
  assert.doesNotMatch(source, /<article class="card"[\s\S]*<article class="card"/);
  assert.doesNotMatch(source, /https?:\/\//);
});
