import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const entry = read("src/ui-v5/index.css");
const moduleNames = ["preferences.css", "reset.css", "compat-components.css", "compat-content.css", "compat-utilities.css", "learning.css", "reader.css"];
function moduleSources() {
  return Object.fromEntries(moduleNames.map((name) => [name, read(`src/ui-v5/${name}`)]));
}

function luminance(hex) {
  const clean = hex.replace("#", "");
  const rgb = [0, 2, 4].map((offset) => parseInt(clean.slice(offset, offset + 2), 16) / 255);
  const linear = rgb.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function varsFromBody(body) {
  return Object.fromEntries(
    [...body.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((match) => [
      match[1],
      match[2].toLowerCase(),
    ]),
  );
}

function blockVars(theme, selectorPattern) {
  const match = theme.match(new RegExp(`${selectorPattern}\\s*\\{([\\s\\S]*?)\\n\\}`, "i"));
  assert.ok(match, `theme block missing: ${selectorPattern}`);
  return varsFromBody(match[1]);
}

function resolvedThemes(theme) {
  const light = blockVars(theme, ":root,\\s*\\.a11y-theme-light");
  const overrides = {
    light: {},
    "gray-light": blockVars(theme, "\\.a11y-theme-gray-light"),
    gray: blockVars(theme, "\\.a11y-theme-gray"),
    dark: blockVars(theme, "\\.a11y-theme-dark"),
    sepia: blockVars(theme, "\\.a11y-theme-sepia"),
    "blue-light": blockVars(theme, "\\.a11y-theme-blue-light"),
  };
  return Object.fromEntries(Object.entries(overrides).map(([name, values]) => [name, { ...light, ...values }]));
}

function assertAA(label, foreground, background, threshold = 4.5) {
  const ratio = contrast(foreground, background);
  assert.ok(
    ratio >= threshold,
    `${label}: ${ratio.toFixed(2)} < ${threshold} (${foreground} / ${background})`,
  );
}

test("V5 exposes one explicit modular cascade", () => {
  const expected = ["tokens.css", "preferences.css", "reset.css", "compat-components.css", "compat-utilities.css", "learning.css", "reader.css", "react-utilities.css"];
  let cursor = -1;
  for (const name of expected) {
    const statement = `@import "./${name}";`;
    const index = entry.indexOf(statement);
    assert.ok(index > cursor, `missing or misordered import: ${statement}`);
    cursor = index;
    assert.ok(read(`src/ui-v5/${name}`).length > 100);
  }
});
test("V5 preserves pedagogical content and player compatibility selectors", () => {
  const all = Object.values(moduleSources()).join("\n");
  for (const selector of [".cours-content", ".formule-box", ".retenir-box", ".learning-choice", ".exercise-rail", ".flashcard-rating-button"]) assert.ok(all.includes(selector), selector);
});

test("C17 all accessibility themes keep primary secondary and muted text at WCAG AA", () => {
  const { "preferences.css": theme } = moduleSources();
  for (const [name, vars] of Object.entries(resolvedThemes(theme))) {
    for (const textVar of ["--text-primary", "--text-secondary", "--text-muted"]) {
      assertAA(`${name} ${textVar} on card`, vars[textVar], vars["--bg-card"]);
      assertAA(`${name} ${textVar} on body`, vars[textVar], vars["--bg-body"]);
    }
    assertAA(`${name} primary action/link text on card`, vars["--accent-primary"], vars["--bg-card"]);
  }
});

test("C17 semantic accent text keeps WCAG AA contrast on its semantic surface", () => {
  const { "preferences.css": theme } = moduleSources();
  for (const [name, vars] of Object.entries(resolvedThemes(theme))) {
    for (const [accent, surface] of [
      ["--accent-primary", "--accent-primary-light"],
      ["--accent-success", "--accent-success-light"],
      ["--accent-danger", "--accent-danger-light"],
      ["--accent-purple", "--accent-purple-light"],
    ]) {
      assertAA(`${name} ${accent}`, vars[accent], vars[surface]);
    }
    assertAA(`${name} rank`, vars["--accent-rank"], vars["--bg-card"]);
  }
});

test("V5 text and primary action colors meet WCAG AA", () => {
  const vars = varsFromBody(entry);
  for (const token of ["--ui5-text", "--ui5-text-2", "--ui5-text-3"]) assertAA(token, vars[token], vars["--ui5-surface"]);
  assertAA("V5 action", vars["--ui5-action"], vars["--ui5-surface"]);
});

test("C17 known low-contrast legacy text roles are removed", () => {
  const modules = moduleSources();
  const all = `${modules["preferences.css"]}\n${modules["compat-components.css"]}`;
  assert.doesNotMatch(all, /--text-muted:\s*#8896a6/i);
  assert.doesNotMatch(all, /--text-muted:\s*#9ca3af/i);
  assert.doesNotMatch(all, /--text-muted:\s*#8b7355/i);
  assert.doesNotMatch(all, /--text-muted:\s*#a08060/i);
  assert.doesNotMatch(all, /color:\s*#b8860b/i);

  assert.match(modules["compat-components.css"], /\.box-regle-or h3[\s\S]*color:\s*var\(--accent-danger\)/);
});
