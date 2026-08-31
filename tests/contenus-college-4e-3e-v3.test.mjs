import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";
import { auditContentContracts } from "../src/data/contentContractAudit.ts";

const root = process.cwd();
const chapterKeys = [
  "4eme/chimie/atomes-molecules",
  "4eme/chimie/echelles-microscopiques",
  "4eme/chimie/reactifs-produits-conservation",
  "4eme/chimie/solubilite",
  "4eme/physique/interactions-forces-aimants",
  "4eme/physique/mouvement-vitesse",
  "4eme/physique/ondes-signaux",
  "4eme/physique/puissance-electrique",
  "4eme/physique/puissance-transferts-energie",
  "3eme/chimie/atome",
  "3eme/chimie/ions",
  "3eme/chimie/masse-volumique",
  "3eme/chimie/molecules",
  "3eme/chimie/ph",
  "3eme/chimie/transformations-chimiques",
  "3eme/physique/energie-mecanique",
  "3eme/physique/loi-ohm",
  "3eme/physique/mouvements",
  "3eme/physique/puissance-energie",
  "3eme/physique/signaux",
  "3eme/physique/sources-energies",
];

function chapterDir(key) {
  return path.join(root, "src/data/chapters/college", key);
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function resourceItems(raw) {
  if (Array.isArray(raw)) return raw;
  return raw.exercices ?? raw.exercises ?? raw.questions ?? raw.quiz ?? raw.cards ?? raw.flashcards ?? [];
}

function packageFor(key) {
  const [niveau, matiere, slug] = key.split("/");
  const dir = chapterDir(key);
  return normalizeChapterPackage({
    sourcePath: `src/data/chapters/college/${key}/meta.json`,
    discipline: "physique-chimie",
    cycle: "college",
    niveau,
    matiere,
    slug,
    meta: readJson(path.join(dir, "meta.json")),
    coursePath: `src/data/chapters/college/${key}/cours.mdx`,
    coursePresent: existsSync(path.join(dir, "cours.mdx")),
    courseFormat: "mdx",
    exercices: readJson(path.join(dir, "exercices.json")),
    quiz: readJson(path.join(dir, "quiz.json")),
    flashcards: readJson(path.join(dir, "flashcards.json")),
  });
}

describe("migration contenus college 4e-3e V3", () => {
  it("conserve les routes, ids canoniques et fichiers du lot", () => {
    assert.equal(chapterKeys.length, 21);

    for (const key of chapterKeys) {
      const [niveau, matiere, slug] = key.split("/");
      const dir = chapterDir(key);
      for (const file of ["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]) {
        assert.equal(existsSync(path.join(dir, file)), true, `${key}/${file}`);
      }

      const result = packageFor(key);
      assert.equal(result.errors.length, 0, key);
      assert.ok(result.package, key);
      assert.equal(result.package.chapter.slug, slug);
      assert.equal(result.package.chapter.niveau, niveau);
      assert.equal(result.package.chapter.matiere, matiere);
      assert.equal(result.package.chapter.seo.canonical, `/college/${niveau}/${matiere}/${slug}`);
      assert.match(result.package.chapter.canonicalId, new RegExp(`^physique-chimie:college:${niveau}:${matiere}:${slug}$`));
    }
  });

  it("ajoute les champs V3 attendus aux meta.json 4e-3e", () => {
    for (const key of chapterKeys) {
      const meta = readJson(path.join(chapterDir(key), "meta.json"));
      const isTroisieme = key.startsWith("3eme/");
      assert.equal(meta.access?.tier, "free", key);
      assert.equal(meta.access?.requiresAccount, false, key);
      assert.ok(meta.sources.some((item) => item.id === "bo-cycle4-physique-chimie-2020" && item.kind === "official"), key);
      assert.ok(meta.objectives.length >= 3, key);
      assert.ok(meta.prerequisites.length >= 2, key);
      assert.ok(meta.competencies.length >= 3, key);
      assert.ok(meta.competences.length >= 3, key);
      assert.ok(meta.lessons.length >= (isTroisieme ? 4 : 3), key);
      assert.ok(meta.links.some((item) => ["laboratory", "tool"].includes(item.kind) && item.href.startsWith("/")), key);
      assert.ok(meta.tags.includes("cycle 4"), key);
      if (isTroisieme) assert.ok(meta.tags.includes("brevet"), key);

      for (const lesson of meta.lessons) {
        assert.ok(lesson.id && lesson.title && lesson.summary, `${key}/${lesson.id}`);
        assert.ok(lesson.blocks.length >= 1, `${key}/${lesson.id}`);
        for (const block of lesson.blocks) {
          assert.notEqual(block.type, "html", `${key}/${lesson.id}/${block.id}`);
          assert.ok(block.sourceIds.includes("bo-cycle4-physique-chimie-2020"), `${key}/${lesson.id}/${block.id}`);
          if (block.type === "formula") {
            assert.ok(block.accessibility?.formulaText, `${key}/${lesson.id}/${block.id}`);
          }
        }
      }
    }
  });

  it("normalise exercices, quiz et flashcards avec preparation brevet en 3e", () => {
    for (const key of chapterKeys) {
      const dir = chapterDir(key);
      const isTroisieme = key.startsWith("3eme/");
      const resources = [
        ["exercices", resourceItems(readJson(path.join(dir, "exercices.json")))],
        ["quiz", resourceItems(readJson(path.join(dir, "quiz.json")))],
        ["flashcards", resourceItems(readJson(path.join(dir, "flashcards.json")))],
      ];

      for (const [kind, items] of resources) {
        assert.ok(items.length >= 5, `${key}/${kind}`);
        assert.equal(new Set(items.map((item) => item.id)).size, items.length, `${key}/${kind}`);
        for (const item of items) {
          assert.equal(item.access?.tier, "free", `${key}/${kind}/${item.id}`);
          assert.ok(item.sources.some((source) => source.kind === "official"), `${key}/${kind}/${item.id}`);
          assert.ok(item.competences.length >= 3, `${key}/${kind}/${item.id}`);
          assert.ok(item.links.some((link) => link.href.startsWith("/")), `${key}/${kind}/${item.id}`);
          if (isTroisieme) assert.ok(item.tags.includes("brevet"), `${key}/${kind}/${item.id}`);
          if (kind === "exercices") {
            assert.ok(item.correction?.length > 0 || item.correctionAvailable !== false, `${key}/${item.id}`);
          }
        }
      }
    }
  });

  it("conserve des schemas SVG accessibles et sans HTML dangereux", () => {
    const dangerous = /<script|on[a-z]+\s*=|javascript:|<iframe|<object/i;
    const staticSvg = readFileSync(path.join(chapterDir("3eme/chimie/atome"), "atome-structure.svg"), "utf8");

    assert.doesNotMatch(staticSvg, dangerous, "3eme/chimie/atome/atome-structure.svg");
    assert.match(staticSvg, /role="img"/, "3eme/chimie/atome/atome-structure.svg");
    assert.match(staticSvg, /<title id="atome-structure-title">[^<]+<\/title>/, "3eme/chimie/atome/atome-structure.svg");
    assert.match(staticSvg, /<desc id="atome-structure-desc">[^<]+<\/desc>/, "3eme/chimie/atome/atome-structure.svg");
    assert.doesNotMatch(staticSvg, /aria-hidden="true"|â/i, "3eme/chimie/atome/atome-structure.svg");

    for (const key of chapterKeys) {
      const exercises = resourceItems(readJson(path.join(chapterDir(key), "exercices.json")));
      for (const item of exercises.filter((exercise) => exercise.schemaSvg)) {
        assert.doesNotMatch(item.schemaSvg, dangerous, `${key}/${item.id}`);
        assert.doesNotMatch(item.schemaSvg, /aria-hidden="true"/, `${key}/${item.id}`);
        assert.match(item.schemaSvg, /<title>[^<]+<\/title>/, `${key}/${item.id}`);
        assert.match(item.schemaSvg, /<desc>[^<]+<\/desc>/, `${key}/${item.id}`);
        assert.ok(item.accessibility?.altText || item.schemaAlt, `${key}/${item.id}`);
      }
    }
  });

  it("retire les champs editoriaux manquants du lot dans l audit de contrat", () => {
    const audit = auditContentContracts(root);
    const lot = audit.chapters.filter((chapter) => chapter.file.includes("src/data/chapters/college/4eme/") || chapter.file.includes("src/data/chapters/college/3eme/"));
    assert.equal(lot.length, 21);
    assert.equal(lot.filter((chapter) => chapter.errors.length > 0).length, 0);
    assert.equal(lot.filter((chapter) => chapter.missingEditorialFields.length > 0).length, 0);
  });
});
