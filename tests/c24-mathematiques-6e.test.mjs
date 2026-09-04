import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolveCurriculumVersion } from "../src/data/curriculumVersions.ts";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";

const root = process.cwd();
const level = "6eme";
const levelDir = path.join(root, "src/data/mathematiques/chapters/college", level);
const mapping = JSON.parse(
  readFileSync(path.join(root, "src/data/mathematiques/programmes/cycle3-6e-2025.mapping.json"), "utf8"),
);

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

describe("C24 — mathématiques 6e programme 2025", () => {
  it("résout le programme 2025 pour la 6e en 2026-2027", () => {
    const version = resolveCurriculumVersion({
      discipline: "mathematiques",
      cycle: "college",
      niveau: level,
      schoolYear: "2026-2027",
      sourceId: "bo-cycle3-mathematiques-2025",
    });
    assert.ok(version);
    assert.equal(version.id, "mathematiques-cycle3-2025");
    assert.equal(version.appliesFrom, "2025-2026");
  });

  it("couvre les treize chapitres éditoriaux déclarés", () => {
    assert.equal(mapping.chapters.length, 13);
    assert.deepEqual(mapping.chapters, [
      "nombres-entiers-decimaux",
      "fractions-quotients-pourcentages",
      "algebre-programmes-calcul",
      "longueurs-perimetres",
      "aires-volumes",
      "temps-durees",
      "configurations-planes",
      "angles-triangles-symetrie",
      "vision-espace-solides",
      "donnees-tableaux-graphiques",
      "probabilites",
      "proportionnalite-echelles",
      "pensee-informatique",
    ]);
  });

  it("fournit un paquet complet et publiable pour chaque chapitre", () => {
    for (const slug of mapping.chapters) {
      const dir = path.join(levelDir, slug);
      for (const file of ["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]) {
        assert.equal(existsSync(path.join(dir, file)), true, `${slug}/${file}`);
      }

      const meta = readJson(path.join(dir, "meta.json"));
      const exercicesPayload = readJson(path.join(dir, "exercices.json"));
      const quizPayload = readJson(path.join(dir, "quiz.json"));
      const flashcardsPayload = readJson(path.join(dir, "flashcards.json"));
      const exercices = exercicesPayload.exercices;
      const questions = quizPayload.questions;
      const cards = flashcardsPayload.cards;

      assert.equal(meta.niveau, level);
      assert.equal(meta.programmeVersion, "mathematiques-cycle3-2025");
      assert.equal(meta.applicableFrom, "2025-2026");
      assert.equal(meta.seo.noindex, false);
      assert.equal(exercices.length, 6);
      assert.deepEqual([...new Set(exercices.map((item) => item.level))].sort(), ["N1", "N2", "N3"]);
      assert.equal(questions.length, 5);
      assert.equal(cards.length, 6);
      assert.ok(exercices.every((item) => Array.isArray(item.correction) && item.correction.length > 0));

      const result = normalizeChapterPackage({
        sourcePath: path.relative(root, path.join(dir, "meta.json")).replaceAll("\\", "/"),
        discipline: "mathematiques",
        cycle: "college",
        niveau: level,
        slug,
        meta,
        coursePath: path.relative(root, path.join(dir, "cours.mdx")).replaceAll("\\", "/"),
        coursePresent: true,
        courseFormat: "mdx",
        exercices: exercicesPayload,
        quiz: quizPayload,
        flashcards: flashcardsPayload,
      });
      assert.deepEqual(result.errors, [], `${slug}: ${JSON.stringify(result.errors)}`);
      assert.ok(result.package, slug);
      assert.equal(result.package.chapter.programmeVersion.versionId, "mathematiques-cycle3-2025");
      assert.equal(result.package.chapter.seo.canonical, `/mathematiques/college/6eme/${slug}`);
    }
  });

  it("respecte la borne explicite de proportionnalité en 6e", () => {
    const course = readFileSync(path.join(levelDir, "proportionnalite-echelles/cours.mdx"), "utf8");
    assert.match(course, /produit en croix n'est pas enseigné en 6e/i);
  });
});
