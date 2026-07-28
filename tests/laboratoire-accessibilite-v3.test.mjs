import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("laboratory V3 exposes an accessible exploitation guide on every lab route", async () => {
  const { labApps } = await import("../src/data/laboratoire/apps.ts");
  const { getLabAccessibilityGuide } = await import("../src/data/laboratoire/accessibilityGuides.ts");
  const layout = read("src/components/laboratoire/LabAppLayout.astro");

  assert.match(layout, /data-lab-access-guide/);
  assert.match(layout, /Hypothese/);
  assert.match(layout, /Mesures a relever/);
  assert.match(layout, /Conclusion attendue/);
  assert.match(layout, /Questions de verification/);

  for (const app of labApps) {
    const guide = getLabAccessibilityGuide(app.slug);
    assert.equal(guide.slug, app.slug);
    assert.ok(guide.hypothesis.length > 40, `${app.slug} must expose a usable hypothesis`);
    assert.ok(guide.measurements.length >= 3, `${app.slug} must expose measurements`);
    assert.ok(guide.nonVisualSummary.includes("text") || guide.nonVisualSummary.includes("valeur"));
    assert.ok(guide.questions.length >= 3, `${app.slug} must expose questions`);
  }
});

test("two pilot labs have specific accessible scientific exploitation guides", async () => {
  const { labAccessibilityGuides } = await import("../src/data/laboratoire/accessibilityGuides.ts");

  assert.match(labAccessibilityGuides["circuit-rc"].hypothesis, /tau = R x C/);
  assert.match(labAccessibilityGuides["circuit-rc"].measurements.join(" "), /uC|uR|energie/);
  assert.match(labAccessibilityGuides["diffusion-temperature"].hypothesis, /coefficient de diffusion/);
  assert.match(labAccessibilityGuides["diffusion-temperature"].measurements.join(" "), /RMS|brassage|D/);
});

test("generic laboratory renderer no longer leaves canvas as the only information carrier", () => {
  const generic = read("src/components/laboratoire/GenericLabSimulator.astro");

  assert.match(generic, /data-generic-accessible-record/);
  assert.match(generic, /class="lab-access-table"/);
  assert.match(generic, /<caption>Parametres et observations exploitables sans lecture du canvas<\/caption>/);
  assert.match(generic, /<th scope="col">Grandeur<\/th>/);
  assert.match(generic, /<th scope="row">Parametre A<\/th>/);
  assert.match(generic, /Hypothese rapide/);
  assert.match(generic, /Conclusion/);
});

test("legacy laboratory routes stay wired through the same layout", () => {
  const explicitPages = [
    "src/pages/laboratoire/circuit-rc.astro",
    "src/pages/laboratoire/diffusion-temperature.astro",
    "src/pages/laboratoire/gaz-parfaits.astro",
    "src/pages/laboratoire/lois-kepler.astro",
    "src/pages/laboratoire/[slug].astro",
  ];

  for (const pagePath of explicitPages) {
    const source = read(pagePath);
    assert.match(source, /<LabAppLayout/);
    assert.match(source, /slug=\{app\.slug\}/, `${pagePath} must pass the app slug to the accessible layout`);
    assert.match(source, /legacyPath=\{app\.legacyPath\}/);
  }
});
