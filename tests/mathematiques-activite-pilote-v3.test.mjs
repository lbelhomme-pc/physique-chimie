import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("affine pilot activity computes values and validates conjectures", async () => {
  const {
    affineVariationKind,
    buildAffineTable,
    evaluateAffine,
    formatMathNumber,
    validateAffineConjecture,
  } = await import("../src/utils/mathematicsAffineActivity.ts");

  assert.equal(evaluateAffine(2, -3, 4), 5);
  assert.deepEqual(buildAffineTable(-1, 2, [-2, 0, 2]), [
    { x: -2, y: 4 },
    { x: 0, y: 2 },
    { x: 2, y: 0 },
  ]);
  assert.equal(affineVariationKind(3), "increasing");
  assert.equal(affineVariationKind(-0.5), "decreasing");
  assert.equal(affineVariationKind(0), "constant");
  assert.equal(validateAffineConjecture(-2, "decreasing"), true);
  assert.equal(validateAffineConjecture(-2, "increasing"), false);
  assert.equal(formatMathNumber(1.5), "1,5");
});

test("mathematics pilot activity is isolated to fonctions-generalites", async () => {
  const { affineFunctionPilotActivity, getMathematicsPilotActivity } = await import("../src/data/mathematiques/activities.ts");

  assert.equal(affineFunctionPilotActivity.chapterSlug, "fonctions-generalites");
  assert.equal(getMathematicsPilotActivity("fonctions-generalites")?.id, "maths-2nde-fonctions-affines-pilote");
  assert.equal(getMathematicsPilotActivity("droites-plan"), null);
});

test("chapter shell and tabs expose an optional interactive activity section", () => {
  const shell = read("src/components/pedagogie/ChapterPageShell.astro");
  const tabs = read("src/components/pedagogie/ChapterTabs.astro");
  const mathPage = read("src/pages/mathematiques/lycee/[niveau]/[chapitre].astro");

  assert.match(shell, /ActivityContent\?: any/);
  assert.match(shell, /hasActivite/);
  assert.match(shell, /id: "activite"/);
  assert.match(shell, /Manipuler, observer, conjecturer puis valider/);
  assert.match(tabs, /chapter-tab-activite/);
  assert.match(tabs, /chapter-panel-activite/);
  assert.match(tabs, /<slot name="activite" \/>/);
  assert.match(mathPage, /getMathematicsPilotActivity\(chapitre!\)/);
  assert.match(mathPage, /ActivityContent=\{pilotActivity \? AffineFunctionExplorer : undefined\}/);
});

test("affine explorer provides parameters, observation, conjecture, validation and non visual table", () => {
  const component = read("src/components/mathematiques/AffineFunctionExplorer.astro");

  assert.match(component, /data-affine-param="a"/);
  assert.match(component, /data-affine-param="b"/);
  assert.match(component, /data-affine-param="x"/);
  assert.match(component, /data-affine-observation/);
  assert.match(component, /data-affine-conjecture/);
  assert.match(component, /validateAffineConjecture/);
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /<caption>Valeurs calculees pour comparer les images<\/caption>/);
  assert.match(component, /<th scope="row">f\(x\)<\/th>/);
  assert.doesNotMatch(component, /new Function|eval\s*\(/);
});
