import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const entry = read("src/styles/design-system.css");
const moduleNames = [
  "theme.css",
  "core.css",
  "components.css",
  "course-content.css",
  "utilities.css",
  "reference-v3.css",
];

function moduleSources() {
  return Object.fromEntries(moduleNames.map((name) => [name, read(`src/styles/${name}`)]));
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

test("C17 design-system entrypoint is modular and preserves explicit cascade order", () => {
  const modules = moduleSources();
  const expected = [
    '@import "./tokens-v3.css";',
    '@import "./theme.css";',
    '@import "./core.css";',
    '@import "./components.css";',
    '@import "./course-content.css";',
    '@import "./utilities.css";',
    '@import "./reference-v3.css";',
  ];

  let cursor = -1;
  for (const statement of expected) {
    const index = entry.indexOf(statement);
    assert.ok(index > cursor, `missing or misordered import: ${statement}`);
    cursor = index;
  }

  assert.doesNotMatch(entry.replace(/\/\*[\s\S]*?\*\//g, ""), /\{/);
  assert.ok(Buffer.byteLength(entry) < 1000, "design-system.css must remain an import-only entrypoint");

  for (const name of moduleNames) {
    const bytes = Buffer.byteLength(modules[name]);
    assert.ok(bytes > 200, `${name} unexpectedly empty`);
    assert.ok(bytes < 35_000, `${name} still monolithic: ${bytes} bytes`);
  }
});

test("C17 keeps representative legacy and V3 selectors after the split", () => {
  const modules = moduleSources();
  const all = moduleNames.map((name) => modules[name]).join("\n");
  for (const selector of [
    ".main-nav",
    ".breadcrumb-bar",
    ".card-chapitre",
    ".tabs-bar",
    ".cours-content",
    ".formule-box",
    ".retenir-box",
    ".om-entry-card",
    ".chapter-hero-v3",
    ".student-dashboard-card",
  ]) {
    assert.match(all, new RegExp(selector.replace(".", "\\.")));
  }
  assert.match(modules["reference-v3.css"], /Reference UI V3/);
});

test("C17 all accessibility themes keep primary secondary and muted text at WCAG AA", () => {
  const { "theme.css": theme } = moduleSources();
  for (const [name, vars] of Object.entries(resolvedThemes(theme))) {
    for (const textVar of ["--text-primary", "--text-secondary", "--text-muted"]) {
      assertAA(`${name} ${textVar} on card`, vars[textVar], vars["--bg-card"]);
      assertAA(`${name} ${textVar} on body`, vars[textVar], vars["--bg-body"]);
    }
    assertAA(`${name} primary action/link text on card`, vars["--accent-primary"], vars["--bg-card"]);
  }
});

test("C17 semantic accent text keeps WCAG AA contrast on its semantic surface", () => {
  const { "theme.css": theme } = moduleSources();
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

test("C17 reference UI V3 core color pairs meet WCAG AA", () => {
  const reference = moduleSources()["reference-v3.css"];
  assertAA("reference muted", "#53627d", "#ffffff");
  assertAA("reference cyan badge", "#066684", "#eff7ff");
  assertAA("reference primary button", "#ffffff", "#1457ee");
  assert.match(reference, /--ref-muted:\s*#53627d/);
  assert.match(reference, /color:\s*#066684/);
  assert.match(reference, /color:\s*#ffffff/);
});

test("C17 known low-contrast legacy text roles are removed", () => {
  const modules = moduleSources();
  const all = `${modules["theme.css"]}\n${modules["components.css"]}`;
  assert.doesNotMatch(all, /--text-muted:\s*#8896a6/i);
  assert.doesNotMatch(all, /--text-muted:\s*#9ca3af/i);
  assert.doesNotMatch(all, /--text-muted:\s*#8b7355/i);
  assert.doesNotMatch(all, /--text-muted:\s*#a08060/i);
  assert.doesNotMatch(all, /color:\s*#b8860b/i);
  assert.match(modules["components.css"], /\.rang-pill[\s\S]*color:\s*var\(--accent-rank\)/);
  assert.match(modules["components.css"], /\.box-regle-or h3[\s\S]*color:\s*var\(--accent-danger\)/);
});
