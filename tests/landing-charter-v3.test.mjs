import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

const heroSource = read("src/pages/index.astro");
const charterSource = read("src/ui-v5/index.css");
const layoutSource = read("src/layouts/BaseLayout.astro");

const fullWidthLandingPages = [
  "src/pages/mathematiques/index.astro",
  "src/pages/mathematiques/college/index.astro",
  "src/pages/mathematiques/lycee/index.astro",
  "src/pages/college/index.astro",
  "src/pages/lycee/index.astro",
  "src/pages/memorisation/index.astro",
  "src/pages/laboratoire.astro",
  "src/pages/outils-methodes.astro",
];

const containedLandingPages = [
  "src/pages/college/[niveau]/index.astro",
  "src/pages/lycee/[niveau]/index.astro",
  "src/pages/mathematiques/college/[niveau]/index.astro",
  "src/pages/mathematiques/lycee/[niveau]/index.astro",
  "src/pages/outils-methodes/kit-scientifique.astro",
  "src/components/outils/OutilsMethodesListing.astro",
];

test("the public entry pages share the V5 page header and shell", () => {
  for (const pagePath of [...fullWidthLandingPages, ...containedLandingPages]) {
    const page = read(pagePath);
    assert.match(page, /ui5-page-header/, pagePath);
    assert.doesNotMatch(page, /V3LandingHero|<style/, pagePath);
  }
  for (const pagePath of fullWidthLandingPages) assert.match(read(pagePath), /ui5-page/, pagePath);
});
test("the home keeps one accessible heading and text statistics", () => {
  assert.equal((heroSource.match(/<h1\b/g) ?? []).length, 1);
  assert.match(heroSource, /ui5-home-hero/);
  assert.match(heroSource, /<dl class="ui5-home-hero__stats"/);
  assert.match(heroSource, /aria-labelledby="subjects-title"/);
});
test("discipline identities use visible names and common theme tokens", () => {
  for (const id of ["mathematiques", "physique-chimie"]) assert.match(charterSource, new RegExp(`data-subject="${id}"`));
  const combined = fullWidthLandingPages.map(read).join("\n");
  assert.match(combined, /Mathématiques/);
  assert.match(combined, /Physique-Chimie/);
  assert.match(read("src/pages/lycee/index.astro"), /data-track=\{level\.trackId\}/);
});
test("the charter is responsive and loaded through a single stylesheet", () => {
  assert.match(layoutSource, /ui-v5\/index\.css/);
  assert.doesNotMatch(layoutSource, /styles\/(?:design-system|landing-v3|learning-workspace)\.css/);
  assert.match(charterSource, /@media \(max-width:/);
  assert.match(charterSource, /prefers-reduced-motion/);
  assert.match(charterSource, /--ui5-radius-sm: 8px/);
});

test("landing refactors preserve the main learning entry points", () => {
  const memory = read("src/pages/memorisation/index.astro");
  const laboratory = read("src/pages/laboratoire.astro");
  const toolkit = read("src/pages/outils-methodes/kit-scientifique.astro");

  for (const href of [
    "/memorisation/revision-du-jour",
    "/memorisation/mega-quiz",
    "/memorisation/mega-flashcards",
  ]) {
    assert.ok(memory.includes(href), `missing memory route ${href}`);
  }

  assert.match(laboratory, /labApps\.map/);
  assert.match(laboratory, /data-lab-filter/);
  assert.match(toolkit, /data-tool-panel/);
  assert.match(toolkit, /kitMethodCards\.map/);
  assert.match(toolkit, /kitMiniQuiz\.map/);
});
