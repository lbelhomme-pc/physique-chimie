import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

const heroSource = read("src/components/home/V3LandingHero.astro");
const charterSource = read("src/styles/landing-v3.css");
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

test("the public entry pages share one V3 landing hero", () => {
  for (const pagePath of [...fullWidthLandingPages, ...containedLandingPages]) {
    const page = read(pagePath);
    assert.match(page, /V3LandingHero/, `${pagePath} must import the shared hero`);
    assert.match(page, /<V3LandingHero/, `${pagePath} must render the shared hero`);
  }

  for (const pagePath of fullWidthLandingPages) {
    assert.match(read(pagePath), /v3-landing-page/, `${pagePath} must use the full landing shell`);
  }
});

test("the shared hero keeps one accessible structure and a real visual asset", () => {
  assert.equal((heroSource.match(/<h1\b/g) ?? []).length, 1);
  assert.match(heroSource, /data-v3-landing-hero/);
  assert.match(heroSource, /<nav class="v3-landing-actions"/);
  assert.match(heroSource, /<dl class="v3-landing-stats"/);
  assert.match(heroSource, /alt=\{imageAlt\}/);
  assert.match(heroSource, /accueil-v3-hero-sciences-2026-07-27\.webp/);
  assert.match(heroSource, /markLabel/);
});

test("discipline identities are visible through text, marks and distinct tones", () => {
  const combinedPages = [...fullWidthLandingPages, ...containedLandingPages]
    .map((pagePath) => read(pagePath))
    .join("\n");

  for (const tone of ["maths", "pc", "science", "memory", "kit", "mixed"]) {
    assert.match(charterSource, new RegExp(`v3-landing-hero--${tone}`));
  }

  for (const tone of ["maths", "pc", "memory", "kit", "mixed"]) {
    assert.match(combinedPages, new RegExp(`tone="${tone}"`));
  }

  const lyceeLevel = read("src/pages/lycee/[niveau]/index.astro");
  assert.match(lyceeLevel, /isTeachingScience \? "science" : "pc"/);
  assert.match(lyceeLevel, /tone=\{landingTone\}/);
  assert.match(combinedPages, /mark=/);
  assert.match(combinedPages, /markLabel=/);
});

test("the charter is responsive, restrained and loaded globally", () => {
  assert.match(layoutSource, /styles\/landing-v3\.css/);
  assert.match(charterSource, /@media \(max-width: 760px\)/);
  assert.match(charterSource, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(charterSource, /\.v3-landing-card/);
  assert.match(charterSource, /border-radius: 8px/);
  assert.match(charterSource, /overflow: hidden/);
  assert.doesNotMatch(charterSource, /font-size:\s*[^;]*vw/);
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
