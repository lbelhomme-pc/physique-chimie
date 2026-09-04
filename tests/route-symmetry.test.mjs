import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  MEMORIZATION_CANONICAL_ROUTES,
  MEMORIZATION_LEGACY_REDIRECTS,
  V3_ROUTE_STRATEGY,
  getChapterNavigation,
  getMathematicsRouteContext,
  getPhysicalScienceRoutePairs,
  getPhysicalScienceRouteContext,
  getPublishedMathematicsLevels,
} from "../src/data/contentRoutes.ts";
import { getMathematicsLevelsByCycle } from "../src/data/mathematiques/levels.ts";
import { chapterEntryFromGlob } from "../src/data/mathematiques/content.ts";
import { labApps } from "../src/data/laboratoire/apps.ts";
import {
  activeRedirectRules,
  buildPhysicalScienceRedirectRules,
  findRedirectTargetIssues,
  getPhysicalScienceKnownRoutes,
  normalizeRoutePath,
} from "../src/config/redirects.ts";

const root = process.cwd();

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function walkMeta(rootDir) {
  const start = path.join(root, rootDir);
  const files = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === "meta.json") files.push(path.relative(root, full).replaceAll(path.sep, "/"));
    }
  }
  return files.sort();
}

function physicalScienceChapters() {
  return walkMeta("src/data/chapters").map((file) => {
    const [cycle, niveau, matiere, chapitre] = file.replace("src/data/chapters/", "").replace("/meta.json", "").split("/");
    const meta = readJson(file);
    return { cycle, niveau, matiere, chapitre, title: meta.title, order: meta.order ?? 99 };
  });
}

function mathematicsChapters() {
  return walkMeta("src/data/mathematiques/chapters").map((file) =>
    chapterEntryFromGlob(`/${file}`, { default: readJson(file) })
  );
}

function availableRoutes() {
  const pcChapters = physicalScienceChapters();
  return new Set([
    "/",
    "/404",
    "/college",
    "/lycee",
    "/mathematiques",
    "/mathematiques/college",
    "/mathematiques/lycee",
    "/laboratoire",
    "/outils-methodes",
    "/memorisation",
    ...Object.values(MEMORIZATION_CANONICAL_ROUTES),
    ...getPhysicalScienceKnownRoutes(pcChapters),
    ...mathematicsChapters().map((chapter) => chapter.path),
    ...labApps.map((app) => app.route),
  ].map(normalizeRoutePath));
}

test("physical-science legacy and explicit routes resolve from the same context", () => {
  const context = getPhysicalScienceRouteContext("college", "4eme", "chimie", "atomes-molecules");
  assert.equal(context.legacyPath, "/college/4eme/chimie/atomes-molecules");
  assert.equal(context.explicitPath, "/physique-chimie/college/4eme/chimie/atomes-molecules");
  assert.equal(context.canonical, context.explicitPath);

  const explicitCanonical = getPhysicalScienceRouteContext("college", "4eme", "chimie", "atomes-molecules", {
    canonicalMode: "explicit",
  });
  assert.equal(explicitCanonical.canonical, explicitCanonical.explicitPath);
});

test("mathematics route context remains explicit and canonical", () => {
  const context = getMathematicsRouteContext("lycee", "2nde", "fonctions-generalites");
  assert.equal(context.explicitPath, "/mathematiques/lycee/2nde/fonctions-generalites");
  assert.equal(context.canonical, context.explicitPath);
});

test("memorization root duplicates are represented as permanent redirects", () => {
  assert.equal(MEMORIZATION_CANONICAL_ROUTES.megaQuiz, "/memorisation/mega-quiz");
  assert.equal(MEMORIZATION_CANONICAL_ROUTES.megaFlashcards, "/memorisation/mega-flashcards");
  assert.equal(MEMORIZATION_LEGACY_REDIRECTS["/mega-quiz"], "/memorisation/mega-quiz");
  assert.equal(MEMORIZATION_LEGACY_REDIRECTS["/mega-flashcards"], "/memorisation/mega-flashcards");
  assert.deepEqual(
    activeRedirectRules.map((rule) => [rule.from, rule.to, rule.status, rule.phase]).sort(),
    [
      ["/mega-flashcards", "/memorisation/mega-flashcards", 301, "active"],
      ["/mega-quiz", "/memorisation/mega-quiz", 301, "active"],
    ],
  );
});

test("active physical-science redirects point legacy URLs directly to explicit canonicals", () => {
  const chapters = physicalScienceChapters();
  const rules = buildPhysicalScienceRedirectRules(chapters);
  assert.ok(rules.length >= 100);
  const target = rules.find((rule) => rule.from === "/college/4eme/chimie/atomes-molecules");
  assert.ok(target);
  assert.equal(target.to, "/physique-chimie/college/4eme/chimie/atomes-molecules");
  assert.equal(target.status, 301);
  assert.equal(target.phase, "active");
});

test("V3 route strategy serves explicit canonicals and redirects legacy chapter URLs", () => {
  assert.equal(V3_ROUTE_STRATEGY.physicalScienceCanonicalMode, "explicit");
  assert.equal(V3_ROUTE_STRATEGY.physicalScienceLegacyStatus, "redirect-only");
  assert.equal(V3_ROUTE_STRATEGY.physicalScienceRedirectPhase, "active");
  assert.equal(V3_ROUTE_STRATEGY.physicalScienceRedirectStatus, 301);
  assert.equal(V3_ROUTE_STRATEGY.preserveLegacyPhysicalScienceContent, false);
  assert.equal(V3_ROUTE_STRATEGY.notFoundRoute, "/404");

  const pair = getPhysicalScienceRoutePairs([
    { cycle: "college", niveau: "4eme", matiere: "chimie", chapitre: "atomes-molecules" },
  ])[0];
  assert.equal(pair.legacyPath, "/college/4eme/chimie/atomes-molecules");
  assert.equal(pair.explicitPath, "/physique-chimie/college/4eme/chimie/atomes-molecules");
  assert.equal(pair.canonicalPath, pair.explicitPath);
  assert.equal(pair.legacyStatus, "redirect-only");
  assert.equal(pair.redirectPhase, "active");
  assert.equal(pair.redirectStatus, 301);
});

test("every active redirect has an existing canonical target", () => {
  const chapters = physicalScienceChapters();
  const rules = [
    ...activeRedirectRules,
    ...buildPhysicalScienceRedirectRules(chapters),
  ];
  const routes = availableRoutes();
  const issues = findRedirectTargetIssues(rules, routes);

  assert.equal(rules.length, chapters.length + Object.keys(MEMORIZATION_LEGACY_REDIRECTS).length);
  assert.deepEqual(issues, []);
  for (const rule of buildPhysicalScienceRedirectRules(chapters)) {
    assert.ok(routes.has(normalizeRoutePath(rule.to)), `${rule.to} must be a generated canonical target`);
  }
});

test("404 route exists and is excluded from canonical publication strategy", () => {
  assert.equal(fs.existsSync(path.join(root, "src/pages/404.astro")), true);
  assert.equal(availableRoutes().has("/404"), true);
  assert.equal(Object.values(MEMORIZATION_LEGACY_REDIRECTS).includes("/404"), false);
});

test("college physical-science navigation is order-based like lycee navigation", () => {
  const chapters = physicalScienceChapters()
    .filter((chapter) => chapter.cycle === "college" && chapter.niveau === "4eme" && chapter.matiere === "chimie")
    .map((chapter) => ({ slug: chapter.chapitre, title: chapter.title, order: chapter.order }));

  const nav = getChapterNavigation(chapters, "atomes-molecules", (slug) => `/physique-chimie/college/4eme/chimie/${slug}`);
  assert.equal(nav.previousChapter?.href, "/physique-chimie/college/4eme/chimie/solubilite");
  assert.equal(nav.nextChapter?.href, "/physique-chimie/college/4eme/chimie/reactifs-produits-conservation");
});

test("only mathematics levels with published content are exposed as level pages", () => {
  const chapters = mathematicsChapters();
  const collegeLevels = getPublishedMathematicsLevels(getMathematicsLevelsByCycle("college"), chapters);
  const lyceeLevels = getPublishedMathematicsLevels(getMathematicsLevelsByCycle("lycee"), chapters);
  assert.deepEqual(collegeLevels.map((level) => level.slug), ["6eme", "5eme", "4eme", "3eme"]);
  assert.deepEqual(lyceeLevels.map((level) => level.slug), ["2nde", "1ere-ens-scientifique", "1ere-specialite-mathematiques"]);
  assert.ok(!lyceeLevels.some((level) => ["1ere-generale", "1ere-technologique", "terminale-generale", "terminale-technologique", "terminale-specialite-mathematiques", "terminale-mathematiques-complementaires", "terminale-mathematiques-expertes"].includes(level.slug)));
});

test("laboratory renderers replace manual reserved slug lists", () => {
  const routes = labApps.map((app) => app.route);
  assert.equal(new Set(routes).size, routes.length);
  assert.ok(labApps.some((app) => app.slug === "circuit-rc" && app.renderer === "explicit-page"));
  assert.ok(labApps.some((app) => app.slug === "titrage-ph-metrique" && app.renderer === "dedicated-component"));
  assert.ok(labApps.some((app) => app.slug === "loi-ohm" && !app.renderer));
});
