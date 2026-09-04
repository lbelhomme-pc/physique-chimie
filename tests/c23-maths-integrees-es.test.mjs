import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolveCurriculumVersion } from "../src/data/curriculumVersions.ts";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";

const root = process.cwd();
const level = "1ere-ens-scientifique";
const levelDir = path.join(root, "src/data/mathematiques/chapters/lycee", level);
const mappingPath = path.join(root, "src/data/mathematiques/programmes/premiere-maths-integrees-es-2026.mapping.json");
const mapping = JSON.parse(readFileSync(mappingPath, "utf8"));

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

describe("C23 — maths intégrées à l'enseignement scientifique en Première", () => {
  it("résout le bon programme pour 2026-2027", () => {
    const version = resolveCurriculumVersion({
      discipline: "mathematiques",
      cycle: "lycee",
      niveau: level,
      schoolYear: "2026-2027",
      sourceId: "bo-2026-mathematiques-integrees-es-premiere",
    });
    assert.ok(version);
    assert.equal(version.id, "mathematiques-integrees-es-premiere-2026");
    assert.equal(version.appliesFrom, "2026-2027");
  });

  it("couvre les cinq blocs éditoriaux et conserve les automatismes transversaux", () => {
    assert.deepEqual(mapping.chapters, [
      "information-chiffree-statistiques-bivariees",
      "probabilites-conditionnelles-independance",
      "variation-lineaire-suites-affines",
      "modelisation-quadratique",
      "variation-exponentielle",
    ]);
    assert.equal(mapping.transversal.integratedIntoAllChapters, true);
  });

  it("fournit cinq paquets pédagogiques complets et publiables", () => {
    for (const slug of mapping.chapters) {
      const dir = path.join(levelDir, slug);
      for (const file of ["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]) {
        assert.equal(existsSync(path.join(dir, file)), true, `${slug}/${file}`);
      }

      const meta = readJson(path.join(dir, "meta.json"));
      const exercices = readJson(path.join(dir, "exercices.json")).exercices;
      const questions = readJson(path.join(dir, "quiz.json")).questions;
      const cards = readJson(path.join(dir, "flashcards.json")).cards;

      assert.equal(meta.niveau, level);
      assert.equal(meta.programmeVersion, "mathematiques-integrees-es-premiere-2026");
      assert.equal(meta.applicableFrom, "2026-2027");
      assert.equal(meta.seo.noindex, false);
      assert.equal(exercices.length, 6);
      assert.deepEqual([...new Set(exercices.map((item) => item.level))].sort(), ["N1", "N2", "N3"]);
      assert.equal(questions.length, 5);
      assert.equal(cards.length, 6);
      assert.ok(exercices.every((item) => Array.isArray(item.correction) && item.correction.length > 0));

      const result = normalizeChapterPackage({
        sourcePath: path.relative(root, path.join(dir, "meta.json")).replaceAll("\\", "/"),
        discipline: "mathematiques",
        cycle: "lycee",
        niveau: level,
        slug,
        meta,
        coursePath: path.relative(root, path.join(dir, "cours.mdx")).replaceAll("\\", "/"),
        coursePresent: true,
        courseFormat: "mdx",
        exercices: { exercices },
        quiz: { questions },
        flashcards: { cards },
      });
      assert.deepEqual(result.errors, [], `${slug}: ${JSON.stringify(result.errors)}`);
      assert.ok(result.package, slug);
      assert.equal(result.package.chapter.programmeVersion.versionId, "mathematiques-integrees-es-premiere-2026");
      assert.equal(result.package.chapter.seo.canonical, `/mathematiques/lycee/${level}/${slug}`);
    }
  });

  it("respecte les bornes pédagogiques explicites du programme", () => {
    const probabilityCourse = readFileSync(path.join(levelDir, "probabilites-conditionnelles-independance/cours.mdx"), "utf8");
    const quadraticCourse = readFileSync(path.join(levelDir, "modelisation-quadratique/cours.mdx"), "utf8");
    assert.match(probabilityCourse, /n\\le4/);
    assert.match(quadraticCourse, /discriminant n'est pas au programme/);
  });
});
