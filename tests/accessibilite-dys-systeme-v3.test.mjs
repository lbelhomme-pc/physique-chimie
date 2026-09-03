import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const panelSource = readFileSync(join(root, "src/components/accessibility/AccessibilityPanel.tsx"), "utf8");
const guideSource = readFileSync(join(root, "src/components/accessibility/ReadingGuide.tsx"), "utf8");
const engineSource = readFileSync(join(root, "src/data/accessibility/a11y-engine.ts"), "utf8");
const designSystemSource = [
  "design-system.css",
  "tokens-v3.css",
  "theme.css",
  "core.css",
  "components.css",
  "course-content.css",
  "utilities.css",
  "reference-v3.css",
]
  .map((file) => readFileSync(join(root, "src/styles", file), "utf8"))
  .join("\n");

describe("Accessibilite et DYS systeme V3", () => {
  it("preserve la cle locale et les classes existantes des preferences", () => {
    assert.match(engineSource, /const STORAGE_KEY = "a11y_preferences"/);
    for (const className of [
      "a11y-theme-",
      "a11y-font-",
      "a11y-fontsize-",
      "a11y-lineheight-",
      "a11y-letterspacing-",
      "a11y-wordspacing-",
      "a11y-reading-guide",
      "a11y-reduced-motion",
      "a11y-focus-mode",
    ]) {
      assert.match(engineSource, new RegExp(className));
    }
  });

  it("integre le panneau aux tokens V3 sans styles inline dominants", () => {
    assert.match(panelSource, /className="a11y-panel-toggle"/);
    assert.match(panelSource, /--v3-color-surface-raised/);
    assert.match(panelSource, /--v3-shadow-focus/);
    assert.doesNotMatch(panelSource, /style=\{\{[^}]+position:\s*"fixed"/);
  });

  it("expose une navigation clavier et lecteur ecran pour le panneau", () => {
    assert.match(panelSource, /aria-expanded=\{isOpen\}/);
    assert.match(panelSource, /aria-controls="a11y-panel-v3"/);
    assert.match(panelSource, /role="tablist"/);
    assert.match(panelSource, /role="tab"/);
    assert.match(panelSource, /role="switch"/);
    assert.match(panelSource, /aria-checked=\{checked\}/);
    assert.match(panelSource, /event\.key === "Escape"/);
  });

  it("couvre police, taille, interligne, contraste, mouvement et focus", () => {
    for (const token of [
      "fontFamily",
      "fontSize",
      "lineHeight",
      "letterSpacing",
      "wordSpacing",
      "theme",
      "reducedMotion",
      "focusMode",
      "cursorSize",
    ]) {
      assert.match(panelSource, new RegExp(token));
    }
  });

  it("rend la regle de lecture compatible souris, focus et clavier", () => {
    assert.match(guideSource, /mousemove/);
    assert.match(guideSource, /focusin/);
    assert.match(guideSource, /keydown/);
    assert.match(guideSource, /ArrowDown/);
    assert.match(guideSource, /ArrowUp/);
    assert.match(guideSource, /aria-hidden="true"/);
  });

  it("ne requiert pas de CDN de police pour les profils DYS", () => {
    assert.doesNotMatch(designSystemSource, /fonts\.googleapis|cdn\.jsdelivr|@font-face/);
    assert.match(designSystemSource, /\.a11y-font-opendyslexic\s*\{\s*--font-family:\s*var\(--v3-font-family-dys/);
    assert.match(designSystemSource, /\.a11y-letterspacing-normal\s*\{\s*--letter-spacing-base:\s*0\s*;/);
  });
});
