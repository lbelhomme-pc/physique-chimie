import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";
import { auditContentContracts } from "../src/data/contentContractAudit.ts";

const root = process.cwd();
const chapterKeys = [
  "5eme/chimie/melanges-dissolution",
  "5eme/chimie/proprietes-matiere",
  "5eme/chimie/transformations-matiere",
  "5eme/physique/circuits-electriques",
  "5eme/physique/energie-stocks-transferts",
  "5eme/physique/lumiere-ombres",
  "5eme/physique/signaux-sonores",
  "5eme/physique/temps-mouvements",
  "6eme/chimie/etats-proprietes-matiere",
  "6eme/chimie/masse-volume-longueur",
  "6eme/chimie/melanges-solutions",
  "6eme/physique/astronomie",
  "6eme/physique/electricite",
  "6eme/physique/mouvements",
  "6eme/physique/signaux",
  "6eme/physique/sources-formes-energie",
];

const CYCLE_4_SOURCE_ID = "bo-cycle4-physique-chimie-2020";
const SIXIEME_SCIENCES_TECHNOLOGIE_SOURCE_ID = "bo-cycle3-sciences-technologie-2023";

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

function sourceIdForMeta(key) {
  return key.startsWith("6eme/")
    ? SIXIEME_SCIENCES_TECHNOLOGIE_SOURCE_ID
    : CYCLE_4_SOURCE_ID;
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

describe("migration contenus college 5e-6e V3", () => {
  it("conserve les routes, ids canoniques et fichiers du lot", () => {
    assert.equal(chapterKeys.length, 16);

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

  it("ajoute les champs V3 attendus aux meta.json 5e-6e", () => {
    for (const key of chapterKeys) {
      const meta = readJson(path.join(chapterDir(key), "meta.json"));
      const expectedSourceId = sourceIdForMeta(key);
      assert.equal(meta.access?.tier, "free", key);
      assert.equal(meta.access?.requiresAccount, false, key);
      assert.ok(meta.sources.some((item) => item.id === expectedSourceId && item.kind === "official"), key);
      assert.ok(meta.objectives.length >= 3, key);
      assert.ok(meta.prerequisites.length >= 2, key);
      assert.ok(meta.competencies.length >= 3, key);
      assert.ok(meta.competences.length >= 3, key);
      assert.ok(meta.lessons.length >= 3, key);
      assert.ok(meta.links.some((item) => ["laboratory", "tool"].includes(item.kind) && item.href.startsWith("/")), key);

      for (const lesson of meta.lessons) {
        assert.ok(lesson.id && lesson.title && lesson.summary, `${key}/${lesson.id}`);
        assert.ok(lesson.blocks.length >= 1, `${key}/${lesson.id}`);
        for (const block of lesson.blocks) {
          assert.notEqual(block.type, "html", `${key}/${lesson.id}/${block.id}`);
          assert.ok(block.sourceIds.includes(expectedSourceId), `${key}/${lesson.id}/${block.id}`);
        }
      }
    }
  });

  it("normalise exercices, quiz et flashcards sans changer les ids ni les corrections", () => {
    for (const key of chapterKeys) {
      const dir = chapterDir(key);
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
          if (kind === "exercices") {
            assert.ok(item.correction?.length > 0 || item.correctionAvailable !== false, `${key}/${item.id}`);
          }
        }
      }
    }
  });

  it("conserve des schemas SVG accessibles et sans HTML dangereux", () => {
    const dangerous = /<script|on[a-z]+\\s*=|javascript:|<iframe|<object/i;

    for (const key of chapterKeys) {
      const exercises = resourceItems(readJson(path.join(chapterDir(key), "exercices.json")));
      for (const item of exercises.filter((exercise) => exercise.schemaSvg)) {
        assert.doesNotMatch(item.schemaSvg, dangerous, `${key}/${item.id}`);
        assert.match(item.schemaSvg, /<title>[^<]+<\/title>/, `${key}/${item.id}`);
        assert.match(item.schemaSvg, /<desc>[^<]+<\/desc>/, `${key}/${item.id}`);
        assert.ok(item.accessibility?.altText || item.schemaAlt, `${key}/${item.id}`);
      }
    }
  });

  it("retire les champs editoriaux manquants du lot dans l audit de contrat", () => {
    const audit = auditContentContracts(root);
    const lot = audit.chapters.filter((chapter) => chapter.file.includes("src/data/chapters/college/5eme/") || chapter.file.includes("src/data/chapters/college/6eme/"));
    assert.equal(lot.length, 16);
    assert.equal(lot.filter((chapter) => chapter.errors.length > 0).length, 0);
    assert.equal(lot.filter((chapter) => chapter.missingEditorialFields.length > 0).length, 0);
  });
});
