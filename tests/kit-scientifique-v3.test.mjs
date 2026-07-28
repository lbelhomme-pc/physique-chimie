import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { kitChapterLinks, kitMethodCards, kitMiniQuiz, kitUnitFamilies } from "../src/data/kitScientifique.ts";
import {
  convertUnitValue,
  dilutionVolumeMl,
  dissolutionMassGrams,
  linearModelThroughOrigin,
  parseMeasurementPairs,
} from "../src/utils/kitScientifique.ts";
import { evaluateScientificExpression } from "../src/utils/scientificExpression.ts";

const root = process.cwd();
const pageSource = readFileSync(path.join(root, "src/pages/outils-methodes/kit-scientifique.astro"), "utf8");

describe("kit scientifique V3", () => {
  it("calcule les conversions, solutions et graphiques attendus", () => {
    assert.equal(convertUnitValue(250, "volume", "mL", "L"), 0.25);
    assert.ok(Math.abs(convertUnitValue(1, "speed", "m/s", "km/h") - 3.6) < 1e-12);
    assert.equal(dissolutionMassGrams(5, 100), 0.5);
    assert.equal(dilutionVolumeMl(0.5, 0.1, 100), 20);
    assert.equal(evaluateScientificExpression("2,5*10^3"), 2500);

    const points = parseMeasurementPairs("0;0\n0.02;2\n0.04;4");
    const model = linearModelThroughOrigin(points);
    assert.equal(model.slope, 100);
    assert.equal(model.rmsError, 0);
  });

  it("structure le kit autour des grandeurs, mesures, securite et mini-quiz", () => {
    assert.match(pageSource, /data-tool-tab="measure"/);
    assert.match(pageSource, /data-tool-tab="safety"/);
    assert.match(pageSource, /Methodes pas a pas/);
    assert.match(pageSource, /data-kit-quiz/);
    assert.match(pageSource, /aria-live="polite"/);
    assert.match(pageSource, /kit-table/);

    assert.ok(kitMethodCards.some((card) => card.toolId === "safety"));
    assert.ok(kitMiniQuiz.length >= 3);
    assert.ok(kitUnitFamilies.some((family) => family.id === "volume"));
  });

  it("conserve les liens de travail vers des chapitres existants", () => {
    const hrefs = kitChapterLinks.map((link) => link.href);
    assert.ok(hrefs.includes("/college/5eme/chimie/proprietes-matiere/"));
    assert.ok(hrefs.includes("/college/5eme/physique/circuits-electriques/"));
    assert.ok(hrefs.includes("/lycee/2nde/chimie/solutions-concentrations/"));
    assert.equal(new Set(hrefs).size, hrefs.length);

    for (const href of hrefs) {
      assert.match(pageSource, /kitChapterLinks/);
      assert.match(href, /^\/(college|lycee)\//);
    }
  });

  it("garde le parseur scientifique limite et reutilise les helpers communs dans la page", () => {
    assert.match(pageSource, /evaluateScientificExpression/);
    assert.match(pageSource, /convertUnitValue/);
    assert.match(pageSource, /dissolutionMassGrams/);
    assert.match(pageSource, /dilutionVolumeMl/);
    assert.match(pageSource, /linearModelThroughOrigin/);
    assert.throws(() => convertUnitValue(1, "volume", "mL", "kg"));
    assert.throws(() => dilutionVolumeMl(0, 0.1, 100));
  });
});
