import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolveCurriculumVersion } from "../src/data/curriculumVersions.ts";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";

const root = process.cwd();
const niveau = "terminale-specialite-mathematiques";
const chapterRoot = path.join(root, "src/data/mathematiques/chapters/lycee", niveau);
const programmeDir = path.join(root, "src/data/mathematiques/programmes");
const currentMapping = JSON.parse(readFileSync(path.join(programmeDir, "terminale-specialite-2019.part-a.mapping.json"), "utf8"));
const futureMapping = JSON.parse(readFileSync(path.join(programmeDir, "terminale-specialite-2026.future.mapping.json"), "utf8"));

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

describe("C26 — Terminale spécialité mathématiques, partie A", () => {
  it("résout le programme 2019 en 2026-2027 pour le slug public", () => {
    const current = resolveCurriculumVersion({
      discipline: "mathematiques",
      cycle: "lycee",
      niveau,
      schoolYear: "2026-2027",
      sourceId: "bo-2019-mathematiques-terminale-specialite",
    });
    assert.ok(current);
    assert.equal(current.id, "mathematiques-terminale-specialite-2019");
    assert.equal(current.appliesUntil, "2026-2027");

    const premature = resolveCurriculumVersion({
      discipline: "mathematiques",
      cycle: "lycee",
      niveau,
      schoolYear: "2026-2027",
      sourceId: "bo-2026-mathematiques-terminale-specialite",
    });
    assert.equal(premature, null);

    const future = resolveCurriculumVersion({
      discipline: "mathematiques",
      cycle: "lycee",
      niveau,
      schoolYear: "2027-2028",
      sourceId: "bo-2026-mathematiques-terminale-specialite",
    });
    assert.ok(future);
    assert.equal(future.id, "mathematiques-terminale-specialite-2026");
  });

  it("conserve terminale-spe comme alias réglementaire équivalent", () => {
    for (const schoolYear of ["2026-2027", "2027-2028"]) {
      const sourceId = schoolYear === "2026-2027"
        ? "bo-2019-mathematiques-terminale-specialite"
        : "bo-2026-mathematiques-terminale-specialite";
      const a = resolveCurriculumVersion({ discipline:"mathematiques", cycle:"lycee", niveau:"terminale-spe", schoolYear, sourceId });
      const b = resolveCurriculumVersion({ discipline:"mathematiques", cycle:"lycee", niveau, schoolYear, sourceId });
      assert.equal(a?.id, b?.id);
      assert.equal(a?.appliesFrom, b?.appliesFrom);
      assert.equal(a?.appliesUntil, b?.appliesUntil);
    }
  });

  it("enregistre le programme 2026 comme futur sans route active", () => {
    assert.equal(futureMapping.status, "future");
    assert.equal(futureMapping.publication.published, false);
    assert.deepEqual(futureMapping.publication.publicRoutes, []);
    assert.deepEqual(futureMapping.publication.activeChapters, []);
    assert.equal(futureMapping.guardrails.firstApplicableSchoolYear, "2027-2028");
  });

  it("publie exactement huit chapitres dans la partie A", () => {
    assert.equal(currentMapping.editorialSplit.part, "A");
    assert.equal(currentMapping.chapters.length, 8);
    assert.deepEqual(currentMapping.chapters, [
      "combinatoire-denombrement",
      "vecteurs-droites-plans-espace",
      "orthogonalite-distances-espace",
      "representations-parametriques-equations-cartesiennes",
      "suites-limites-recurrence",
      "limites-fonctions-asymptotes",
      "derivation-convexite",
      "continuite-tvi-dichotomie",
    ]);
  });

  it("fournit huit paquets pédagogiques complets rattachés au BO 2019", () => {
    for (const slug of currentMapping.chapters) {
      const dir = path.join(chapterRoot, slug);
      for (const file of ["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]) {
        assert.equal(existsSync(path.join(dir, file)), true, `${slug}/${file}`);
      }

      const meta = readJson(path.join(dir, "meta.json"));
      const exercicesPayload = readJson(path.join(dir, "exercices.json"));
      const quizPayload = readJson(path.join(dir, "quiz.json"));
      const flashcardsPayload = readJson(path.join(dir, "flashcards.json"));
      const exercices = exercicesPayload.exercices;

      assert.equal(meta.niveau, niveau);
      assert.equal(meta.officialSource, "bo-2019-mathematiques-terminale-specialite");
      assert.equal(meta.programmeVersion, "mathematiques-terminale-specialite-2019");
      assert.equal(meta.seo.noindex, false);
      assert.equal(exercices.length, 6);
      assert.deepEqual(
        Object.fromEntries(["N1","N2","N3"].map(level => [level, exercices.filter(item => item.level === level).length])),
        { N1:2, N2:2, N3:2 },
      );
      assert.equal(quizPayload.questions.length, 5);
      assert.equal(flashcardsPayload.cards.length, 6);
      assert.ok(exercices.every(item => Array.isArray(item.correction) && item.correction.length > 0));

      const result = normalizeChapterPackage({
        sourcePath: path.relative(root, path.join(dir, "meta.json")).replaceAll("\\", "/"),
        discipline: "mathematiques",
        cycle: "lycee",
        niveau,
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
      assert.equal(result.package?.chapter.programmeVersion.versionId, "mathematiques-terminale-specialite-2019");
      assert.equal(result.package?.chapter.seo.canonical, `/mathematiques/lycee/${niveau}/${slug}`);
    }
  });

  it("réserve explicitement la seconde moitié à C27", () => {
    assert.deepEqual(currentMapping.deferredToC27, [
      "fonction logarithme",
      "fonctions sinus et cosinus",
      "primitives et équations différentielles",
      "calcul intégral",
      "probabilités",
      "algorithmique et programmation transversales",
      "préparation à l'épreuve du baccalauréat",
    ]);
  });
});
