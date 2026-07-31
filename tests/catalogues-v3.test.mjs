import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const files = {
  catalogueList: path.join(root, "src/components/catalogue/CatalogueChapterList.astro"),
  catalogueTypes: path.join(root, "src/components/catalogue/types.ts"),
  collegeLevel: path.join(root, "src/pages/college/[niveau]/index.astro"),
  collegeSubject: path.join(root, "src/pages/college/[niveau]/[matiere]/index.astro"),
  lyceeLevel: path.join(root, "src/pages/lycee/[niveau]/index.astro"),
  lyceeSubject: path.join(root, "src/pages/lycee/[niveau]/[matiere]/index.astro"),
  mathCollege: path.join(root, "src/pages/mathematiques/college/index.astro"),
  mathLycee: path.join(root, "src/pages/mathematiques/lycee/index.astro"),
  mathCollegeLevel: path.join(root, "src/pages/mathematiques/college/[niveau]/index.astro"),
  mathLyceeLevel: path.join(root, "src/pages/mathematiques/lycee/[niveau]/index.astro"),
  mathLevelCard: path.join(root, "src/components/mathematiques/MathLevelCard.astro"),
};

function source(name) {
  return readFileSync(files[name], "utf8");
}

test("catalogue pages keep all current chapter route patterns", () => {
  assert.match(source("collegeLevel"), /href:\s*`\/college\/\$\{niveau\}\/\$\{matiere\}\/\$\{slug\}`/);
  assert.match(source("collegeSubject"), /href:\s*`\/college\/\$\{niveau\}\/\$\{matiere\}\/\$\{slug\}`/);
  assert.match(source("lyceeLevel"), /href:\s*`\/lycee\/\$\{niveau\}\/\$\{matiere\}\/\$\{slug\}`/);
  assert.match(source("lyceeSubject"), /href:\s*`\/lycee\/\$\{niveau\}\/\$\{matiere\}\/\$\{slug\}`/);
  assert.match(source("mathCollegeLevel"), /href:\s*chapter\.path/);
  assert.match(source("mathLyceeLevel"), /href:\s*chapter\.path/);
});

test("catalogues are ordered by programme metadata and do not cap chapter counts", () => {
  for (const name of ["collegeLevel", "collegeSubject", "lyceeLevel", "lyceeSubject"]) {
    const page = source(name);
    assert.match(page, /order:\s*data\.order \?\? 99/);
    assert.doesNotMatch(page, /\.slice\s*\(/);
    assert.doesNotMatch(page, /\.splice\s*\(/);
  }

  assert.match(source("catalogueList"), /sort\(\(a, b\) => \(a\.order \?\? 99\) - \(b\.order \?\? 99\)/);
});

test("catalogues expose filters, focus states and empty states without client search", () => {
  for (const name of ["collegeLevel", "lyceeLevel"]) {
    const page = source(name);
    assert.match(page, /catalogue-filters/);
    assert.match(page, /#catalogue-chimie/);
    assert.match(page, /#catalogue-physique/);
    assert.match(page, /catalogue-empty-large/);
  }

  const component = source("catalogueList");
  assert.match(component, /:focus-visible/);
  assert.match(component, /aria-live="polite"/);
  assert.doesNotMatch(component, /<script/);
});

test("mathematics cycle catalogues show planned levels without creating planned routes", () => {
  for (const name of ["mathCollege", "mathLycee"]) {
    const page = source(name);
    assert.match(page, /getMathematicsLevelsByCycle/);
    assert.match(page, /MathLevelCard/);
    assert.match(page, /V3LandingHero/);
    assert.match(page, /stats=\{\[/);
    assert.doesNotMatch(page, /getPublishedMathematicsLevels/);
  }

  const card = source("mathLevelCard");
  assert.match(card, /const isAvailable = chapterCount > 0 && level\.status === "available"/);
  assert.match(card, /href=\{isAvailable \? level\.path : undefined\}/);
  assert.match(card, /aria-disabled/);
});

test("shared catalogue component keeps semantic chapter lists", () => {
  assert.match(source("catalogueTypes"), /CatalogueChapterItem/);
  assert.match(source("catalogueList"), /<ol class="catalogue-list">/);
  assert.match(source("catalogueList"), /<h2 id=\{`\$\{id\}-title`\}/);
  assert.match(source("catalogueList"), /Ouvrir/);
});
