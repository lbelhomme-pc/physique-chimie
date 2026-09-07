import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolveCurriculumVersion } from "../src/data/curriculumVersions.ts";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";

const root = process.cwd();
const programmeDir = path.join(root, "src/data/mathematiques/programmes");
const chapterRoot = path.join(root, "src/data/mathematiques/chapters/college");

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

const mappings = {
  current4: readJson(path.join(programmeDir, "cycle4-4e-2020.mapping.json")),
  current3: readJson(path.join(programmeDir, "cycle4-3e-2020.mapping.json")),
  future4: readJson(path.join(programmeDir, "cycle4-4e-2026.future.mapping.json")),
  future3: readJson(path.join(programmeDir, "cycle4-3e-2026.future.mapping.json")),
};

describe("C25 — mathématiques 4e/3e versionnées", () => {
  it("garde le programme 2020 actif en 2026-2027 et bloque le 2026 prématuré", () => {
    assert.equal(
      resolveCurriculumVersion({
        discipline: "mathematiques", cycle: "college", niveau: "4eme",
        schoolYear: "2026-2027", sourceId: "bo-cycle4-mathematiques-2020",
      })?.id,
      "mathematiques-cycle4-2020",
    );
    assert.equal(
      resolveCurriculumVersion({
        discipline: "mathematiques", cycle: "college", niveau: "4eme",
        schoolYear: "2026-2027", sourceId: "bo-cycle4-mathematiques-2026",
      }),
      null,
    );
    assert.equal(
      resolveCurriculumVersion({
        discipline: "mathematiques", cycle: "college", niveau: "3eme",
        schoolYear: "2026-2027", sourceId: "bo-cycle4-mathematiques-2020",
      })?.id,
      "mathematiques-cycle4-2020",
    );
    assert.equal(
      resolveCurriculumVersion({
        discipline: "mathematiques", cycle: "college", niveau: "3eme",
        schoolYear: "2026-2027", sourceId: "bo-cycle4-mathematiques-2026",
      }),
      null,
    );
  });

  it("bascule uniquement aux rentrées officielles futures", () => {
    assert.equal(
      resolveCurriculumVersion({
        discipline: "mathematiques", cycle: "college", niveau: "4eme",
        schoolYear: "2027-2028", sourceId: "bo-cycle4-mathematiques-2026",
      })?.id,
      "mathematiques-cycle4-2026",
    );
    assert.equal(
      resolveCurriculumVersion({
        discipline: "mathematiques", cycle: "college", niveau: "3eme",
        schoolYear: "2027-2028", sourceId: "bo-cycle4-mathematiques-2020",
      })?.id,
      "mathematiques-cycle4-2020",
    );
    assert.equal(
      resolveCurriculumVersion({
        discipline: "mathematiques", cycle: "college", niveau: "3eme",
        schoolYear: "2028-2029", sourceId: "bo-cycle4-mathematiques-2026",
      })?.id,
      "mathematiques-cycle4-2026",
    );
  });

  it("enregistre le futur sans route ni contenu actif", () => {
    for (const mapping of [mappings.future4, mappings.future3]) {
      assert.equal(mapping.status, "future");
      assert.equal(mapping.publication.published, false);
      assert.deepEqual(mapping.publication.publicRoutes, []);
      assert.deepEqual(mapping.publication.activeChapters, []);
    }
  });

  it("publie la couverture annuelle V3 complète de 4e et conserve le premier lot 3e", () => {
    const slugs4 = mappings.current4.coverage.order;
    const slugs3 = mappings.current3.lotA.chapters;

    assert.equal(mappings.current4.coverage.status, "complete-4e-v3-2026-2027");
    assert.equal(slugs4.length, 13);
    assert.equal(slugs3.length, 4);

    for (const slug of slugs4) {
      const dir = path.join(chapterRoot, "4eme", slug);
      for (const file of ["meta.json", "cours.tex", "exercices.json", "quiz.json", "flashcards.json"]) {
        assert.equal(existsSync(path.join(dir, file)), true, `4eme/${slug}/${file}`);
      }

      const meta = readJson(path.join(dir, "meta.json"));
      const exercicesPayload = readJson(path.join(dir, "exercices.json"));
      const quizPayload = readJson(path.join(dir, "quiz.json"));
      const flashPayload = readJson(path.join(dir, "flashcards.json"));
      const exercices = exercicesPayload.exercices;

      assert.equal(meta.officialSource, "bo-cycle4-mathematiques-2020");
      assert.equal(meta.programmeVersion, "mathematiques-cycle4-2020");
      assert.equal(meta.courseFormat, "latex");
      assert.equal(meta.courseSource, "cours.tex");
      assert.equal(meta.courseFormatVersion, 3);
      assert.equal(meta.courseQualityVersion, 3);
      assert.equal(meta.contentQualityVersion, 3);
      assert.equal(meta.seo.noindex, false);

      assert.equal(exercices.length, 12);
      assert.deepEqual(
        Object.fromEntries(["N1","N2","N3"].map(level => [level, exercices.filter(item => item.level === level).length])),
        { N1: 4, N2: 4, N3: 4 },
      );
      assert.ok(quizPayload.questions.length >= 10);
      assert.ok(flashPayload.cards.length >= 12);

      const result = normalizeChapterPackage({
        sourcePath: path.relative(root, path.join(dir, "meta.json")).replaceAll("\\", "/"),
        discipline: "mathematiques",
        cycle: "college",
        niveau: "4eme",
        slug,
        meta,
        coursePath: path.relative(root, path.join(dir, "cours.tex")).replaceAll("\\", "/"),
        coursePresent: true,
        courseFormat: "latex",
        exercices: exercicesPayload,
        quiz: quizPayload,
        flashcards: flashPayload,
      });
      assert.deepEqual(result.errors, [], `4eme/${slug}: ${JSON.stringify(result.errors)}`);
      assert.equal(result.package?.chapter.programmeVersion.versionId, "mathematiques-cycle4-2020");
      assert.equal(result.package?.course.format, "latex");
    }

    for (const slug of slugs3) {
      const dir = path.join(chapterRoot, "3eme", slug);
      for (const file of ["meta.json", "cours.tex", "exercices.json", "quiz.json", "flashcards.json"]) {
        assert.equal(existsSync(path.join(dir, file)), true, `3eme/${slug}/${file}`);
      }

      const meta = readJson(path.join(dir, "meta.json"));
      const exercicesPayload = readJson(path.join(dir, "exercices.json"));
      const quizPayload = readJson(path.join(dir, "quiz.json"));
      const flashPayload = readJson(path.join(dir, "flashcards.json"));

      assert.equal(meta.officialSource, "bo-cycle4-mathematiques-2020");
      assert.equal(meta.programmeVersion, "mathematiques-cycle4-2020");
      assert.equal(exercicesPayload.exercices.length, 6);
      assert.equal(quizPayload.questions.length, 5);
      assert.equal(flashPayload.cards.length, 6);

      const result = normalizeChapterPackage({
        sourcePath: path.relative(root, path.join(dir, "meta.json")).replaceAll("\\", "/"),
        discipline: "mathematiques",
        cycle: "college",
        niveau: "3eme",
        slug,
        meta,
        coursePath: path.relative(root, path.join(dir, "cours.tex")).replaceAll("\\", "/"),
        coursePresent: true,
        courseFormat: "latex",
        exercices: exercicesPayload,
        quiz: quizPayload,
        flashcards: flashPayload,
      });
      assert.deepEqual(result.errors, [], `3eme/${slug}: ${JSON.stringify(result.errors)}`);
      assert.equal(result.package?.course.format, "latex");
    }
  });

  it("ne publie aucun chapitre 4e/3e étiqueté programme 2026", () => {
    const levels = [
      ["4eme", mappings.current4.coverage.order],
      ["3eme", mappings.current3.lotA.chapters],
    ];

    for (const [niveau, slugs] of levels) {
      for (const slug of slugs) {
        const meta = readJson(path.join(chapterRoot, niveau, slug, "meta.json"));
        assert.notEqual(meta.officialSource, "bo-cycle4-mathematiques-2026");
        assert.notEqual(meta.programmeVersion, "mathematiques-cycle4-2026");
      }
    }
  });
});
