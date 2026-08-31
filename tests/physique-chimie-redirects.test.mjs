import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  V3_ROUTE_STRATEGY,
  getPhysicalScienceRouteContext,
} from "../src/data/contentRoutes.ts";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

const expectedRedirects = [
  ["/college/:niveau/physique/:chapitre", "/physique-chimie/college/:niveau/physique/:chapitre"],
  ["/college/:niveau/chimie/:chapitre", "/physique-chimie/college/:niveau/chimie/:chapitre"],
  ["/lycee/:niveau/physique/:chapitre", "/physique-chimie/lycee/:niveau/physique/:chapitre"],
  ["/lycee/:niveau/chimie/:chapitre", "/physique-chimie/lycee/:niveau/chimie/:chapitre"],
];

test("C12 exposes four direct permanent redirects from legacy PC chapters to canonical routes", () => {
  const vercel = JSON.parse(read("vercel.json"));
  const redirects = vercel.redirects ?? [];
  assert.equal(redirects.length, 4);

  assert.deepEqual(
    redirects.map((rule) => [rule.source, rule.destination]).sort(),
    expectedRedirects.sort(),
  );

  const sources = new Set(redirects.map((rule) => rule.source));
  for (const rule of redirects) {
    assert.equal(rule.statusCode, 301, rule.source);
    assert.match(rule.source, /^\/(college|lycee)\/:niveau\/(physique|chimie)\/:chapitre$/);
    assert.match(rule.destination, /^\/physique-chimie\/(college|lycee)\/:niveau\/(physique|chimie)\/:chapitre$/);
    assert.notEqual(rule.source, rule.destination);
    assert.equal(sources.has(rule.destination), false, `redirect chain detected at ${rule.destination}`);
  }
});

test("C12 route strategy makes explicit PC chapter URLs canonical and legacy URLs redirect-only", () => {
  assert.equal(V3_ROUTE_STRATEGY.physicalScienceCanonicalMode, "explicit");
  assert.equal(V3_ROUTE_STRATEGY.physicalScienceLegacyStatus, "redirect-only");
  assert.equal(V3_ROUTE_STRATEGY.physicalScienceRedirectPhase, "active");
  assert.equal(V3_ROUTE_STRATEGY.physicalScienceRedirectStatus, 301);
  assert.equal(V3_ROUTE_STRATEGY.preserveLegacyPhysicalScienceContent, false);

  const route = getPhysicalScienceRouteContext("college", "4eme", "chimie", "atomes-molecules");
  assert.equal(route.legacyPath, "/college/4eme/chimie/atomes-molecules");
  assert.equal(route.explicitPath, "/physique-chimie/college/4eme/chimie/atomes-molecules");
  assert.equal(route.canonical, route.explicitPath);
});

test("C12 generates one canonical PC renderer and no legacy chapter renderer", () => {
  const canonical = "src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro";
  const legacyCollege = "src/pages/college/[niveau]/[matiere]/[chapitre].astro";
  const legacyLycee = "src/pages/lycee/[niveau]/[matiere]/[chapitre].astro";

  assert.equal(existsSync(path.join(root, canonical)), true);
  assert.equal(existsSync(path.join(root, legacyCollege)), false);
  assert.equal(existsSync(path.join(root, legacyLycee)), false);

  const renderer = read(canonical);
  assert.match(renderer, /canonical=\{context\.canonical\}/);
  assert.match(renderer, /getPhysicalScienceExplicitChapterPath/);
  assert.match(renderer, /getPhysiqueChimieTrackFromLevelSlug/);
  assert.match(renderer, /isTeachingScience/);
  assert.match(renderer, /badges=\{isTeachingScience/);
  assert.match(renderer, /subjectDisplayLabel/);
});

test("C12 catalogues link directly to canonical PC chapters instead of consuming their own redirects", () => {
  const catalogues = [
    "src/pages/college/[niveau]/index.astro",
    "src/pages/college/[niveau]/[matiere]/index.astro",
    "src/pages/lycee/[niveau]/index.astro",
    "src/pages/lycee/[niveau]/[matiere]/index.astro",
  ];

  for (const catalogue of catalogues) {
    const source = read(catalogue);
    assert.match(source, /getPhysicalScienceExplicitChapterPath/, catalogue);
    assert.doesNotMatch(
      source,
      /href:\s*`\/(?:college|lycee)\/\$\{niveau\}\/\$\{matiere\}\/\$\{slug\}`/,
      catalogue,
    );
  }
});
