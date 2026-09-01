import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  PYODIDE_BASE_URL,
  PYODIDE_LOAD_TIMEOUT_MS,
  PYODIDE_MODULE_URL,
  PYODIDE_VERSION,
  validatePyodideRuntimeUrl,
} from "../src/config/pyodide.ts";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const baseLayout = read("src/layouts/BaseLayout.astro");
const globalTools = read("src/components/ui/GlobalClientTools.astro");
const a11yBootstrap = read("src/components/accessibility/A11yHeadBootstrap.astro");
const pyodideWorker = read("src/scripts/pyodide-worker.ts");
const pyodideLab = read("src/components/pedagogie/PyodideLab.tsx");
const designSystem = read("src/styles/design-system.css");
const tokens = read("src/styles/tokens-v3.css");
const distAuditConfig = JSON.parse(read("tests/fixtures/dist-audit.config.json"));

test("C16 BaseLayout no longer hydrates the four global React islands at load", () => {
  assert.match(baseLayout, /A11yHeadBootstrap\.astro/);
  assert.match(baseLayout, /GlobalClientTools\.astro/);
  assert.match(baseLayout, /<A11yHeadBootstrap\s*\/>/);
  assert.match(baseLayout, /<GlobalClientTools\s*\/>/);
  assert.doesNotMatch(baseLayout, /DailyLoginTracker/);
  assert.doesNotMatch(baseLayout, /ReadingGuide\.tsx/);
  assert.doesNotMatch(baseLayout, /ScrollToTop\.tsx/);
  assert.doesNotMatch(baseLayout, /AccessibilityPanel\.tsx/);
  assert.doesNotMatch(baseLayout, /client:load/);
});

test("C16 simple global behaviours are native and the accessibility React panel is interaction-only", () => {
  assert.match(globalTools, /data-native-reading-guide/);
  assert.match(globalTools, /data-native-scroll-top/);
  assert.match(globalTools, /dailyLogin\(\)/);
  assert.match(globalTools, /import\("\.\.\/accessibility\/AccessibilityPanel\.tsx"\)/);
  assert.match(globalTools, /import\("react"\)/);
  assert.match(globalTools, /import\("react-dom\/client"\)/);
  assert.match(globalTools, /launcher\?\.addEventListener\("click"/);
  assert.doesNotMatch(globalTools, /^import\s+React/m);
  assert.doesNotMatch(globalTools, /client:(?:load|idle|visible|only)/);
});

test("C16 persisted accessibility preferences are applied before paint with whitelisted values", () => {
  assert.match(a11yBootstrap, /localStorage\.getItem\("a11y_preferences"\)/);
  assert.match(a11yBootstrap, /new Set\(\["light", "gray-light", "gray", "dark", "sepia", "blue-light", "auto"\]\)/);
  assert.match(a11yBootstrap, /a11y-theme-/);
  assert.match(a11yBootstrap, /a11y-font-/);
  assert.match(a11yBootstrap, /a11y-reduced-motion/);
  assert.match(a11yBootstrap, /prefers-reduced-motion/);
  assert.match(a11yBootstrap, /<script is:inline>/);
});

test("C16 Pyodide runtime is pinned, validated and timeout-protected", () => {
  assert.equal(PYODIDE_VERSION, "314.0.2");
  assert.equal(PYODIDE_LOAD_TIMEOUT_MS, 20_000);
  assert.equal(PYODIDE_BASE_URL, "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/");
  assert.equal(PYODIDE_MODULE_URL, "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.mjs");
  assert.equal(validatePyodideRuntimeUrl(), true);
  assert.equal(validatePyodideRuntimeUrl("http://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.mjs"), false);
  assert.equal(validatePyodideRuntimeUrl("https://example.com/pyodide.mjs"), false);

  assert.match(pyodideWorker, /PYODIDE_LOAD_TIMEOUT_MS/);
  assert.match(pyodideWorker, /withTimeout/);
  assert.match(pyodideWorker, /Impossible de charger Python depuis le CDN/);
  assert.match(pyodideWorker, /pyodideReadyPromise = null/);
  assert.doesNotMatch(pyodideWorker, /const PYODIDE_VERSION\s*=/);
});

test("C16 keeps Pyodide out of unrelated pages and creates its worker lazily", () => {
  assert.doesNotMatch(baseLayout, /Pyodide|pyodide/i);
  assert.match(pyodideLab, /new Worker\(new URL\("\.\.\/\.\.\/scripts\/pyodide-worker\.ts", import\.meta\.url\)/);
  assert.match(pyodideLab, /function ensureWorker/);
  assert.match(pyodideLab, /workerRef\.current = createWorker\(\)/);
  assert.match(pyodideLab, /configureWorker\(workerRef\.current\)/);
  assert.doesNotMatch(pyodideLab, /client:load/);
});

test("C16 global styles do not restore remote font imports", () => {
  const styles = `${designSystem}\n${tokens}`;
  assert.doesNotMatch(styles, /fonts\.googleapis\.com/i);
  assert.doesNotMatch(styles, /fonts\.gstatic\.com/i);
  assert.doesNotMatch(styles, /@import\s+url\([^)]*jsdelivr/i);
  assert.doesNotMatch(styles, /@font-face\s*\{[^}]*https?:\/\//is);
});

test("C16 locks representative route budgets after the hydration comparison", () => {
  const overrides = distAuditConfig.budgets.routeOverrides;
  const representatives = [
    "/",
    "/mathematiques",
    "/physique-chimie",
    "/physique-chimie/college/4eme/chimie/atomes-molecules",
    "/outils-methodes/python-lab",
  ];

  for (const route of representatives) {
    assert.ok(overrides[route], `Budget C16 manquant pour ${route}`);
    assert.ok(overrides[route].jsBytes <= 15_000, `Budget JS C16 trop large pour ${route}`);
    assert.ok(
      overrides[route].totalBytes < distAuditConfig.budgets.defaultRoute.totalBytes,
      `Budget total C16 non resserré pour ${route}`,
    );
  }
});
