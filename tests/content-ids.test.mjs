import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildChapterContentId,
  buildContentId,
  buildCourseContentId,
  buildExerciseContentId,
  buildFlashcardDeckContentId,
  buildFlashcardContentId,
  buildLaboratoryContentId,
  buildQuizContentId,
  buildQuizQuestionContentId,
  getContentIdAliases,
  getProgressStorageKeyAliases,
  isCanonicalContentId,
  isCanonicalIdPart,
  resolveProgressStorageKeyAlias,
  normalizeIdPart,
  resolveContentIdAlias,
} from "../src/utils/contentIds.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function findMetaFiles(root) {
  if (!existsSync(root)) {
    return [];
  }

  const entries = readdirSync(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...findMetaFiles(fullPath));
    } else if (entry.name === "meta.json") {
      files.push(fullPath);
    }
  }

  return files;
}

function readResourceArray(chapterDirectory, fileName) {
  const filePath = path.join(chapterDirectory, fileName);
  const data = existsSync(filePath) ? readJson(filePath) : [];

  if (Array.isArray(data)) {
    return data;
  }

  for (const key of ["exercices", "exercises", "questions", "flashcards", "cards", "items"]) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  return [];
}

function collectChapterResourceIds(chapter, chapterDirectory) {
  return [
    buildChapterContentId(chapter),
    buildCourseContentId({ chapter }),
    buildQuizContentId({ chapter }),
    buildFlashcardDeckContentId({ chapter }),
    ...readResourceArray(chapterDirectory, "exercices.json").map((exercise) =>
      buildExerciseContentId({ chapter, exerciseId: exercise.id }),
    ),
    ...readResourceArray(chapterDirectory, "quiz.json").map((question) =>
      buildQuizQuestionContentId({ chapter, questionId: question.id }),
    ),
    ...readResourceArray(chapterDirectory, "flashcards.json").map((flashcard) =>
      buildFlashcardContentId({ chapter, flashcardId: flashcard.id }),
    ),
  ];
}

test("content ids are normalized, slash-free and namespace-aware", () => {
  assert.equal(normalizeIdPart("  Atomes / Molecules  "), "atomes-molecules");
  assert.equal(buildContentId(["physique-chimie", "college", "4eme", "chimie", "atomes-molecules"]), "physique-chimie:college:4eme:chimie:atomes-molecules");

  const mathId = buildChapterContentId({
    discipline: "mathematiques",
    cycle: "lycee",
    niveau: "2nde",
    chapitre: "fonctions-generalites",
  });

  assert.equal(mathId, "mathematiques:lycee:2nde:fonctions-generalites");
  assert.equal(mathId.includes("/"), false);
});

test("resource ids keep stable suffixes for quiz and flashcards", () => {
  const chapter = buildChapterContentId({
    discipline: "physique-chimie",
    cycle: "college",
    niveau: "4eme",
    matiere: "chimie",
    chapitre: "atomes-molecules",
  });

  assert.equal(chapter, "physique-chimie:college:4eme:chimie:atomes-molecules");
  assert.equal(
    buildQuizQuestionContentId({ chapter, questionId: "q1" }),
    "physique-chimie:college:4eme:chimie:atomes-molecules:quiz:q1",
  );
  assert.equal(
    buildFlashcardContentId({ chapter, flashcardId: "f1" }),
    "physique-chimie:college:4eme:chimie:atomes-molecules:flashcard:f1",
  );
  assert.equal(buildLaboratoryContentId({ slug: "titrage-ph-metrique", kind: "simulation" }), "laboratoire:titrage-ph-metrique:simulation");
});

test("canonical id grammar rejects malformed or personal-looking values", () => {
  const chapter = buildChapterContentId({
    discipline: "physique-chimie",
    cycle: "college",
    niveau: "4eme",
    matiere: "chimie",
    chapitre: "atomes-molecules",
  });

  assert.equal(isCanonicalIdPart("atomes-molecules"), true);
  assert.equal(isCanonicalIdPart("Atomes"), false);
  assert.equal(isCanonicalIdPart("prenom.nom@example.com"), false);
  assert.equal(isCanonicalContentId(chapter), true);
  assert.equal(isCanonicalContentId(`${chapter}:course`), true);
  assert.equal(isCanonicalContentId(`${chapter}:quiz:atom-mol-q1`), true);
  assert.equal(isCanonicalContentId("laboratoire:titrage-ph-metrique:simulation"), true);
  assert.equal(isCanonicalContentId("memorisation:quiz:revisions-4eme"), true);

  assert.equal(isCanonicalContentId("physique-chimie"), false);
  assert.equal(isCanonicalContentId("physique-chimie:college:4eme:chimie"), false);
  assert.equal(isCanonicalContentId("PHYSIQUE-CHIMIE:college:4eme:chimie:atomes-molecules"), false);
  assert.equal(isCanonicalContentId("physique-chimie:college:4eme:chimie:atomes/molecules"), false);
  assert.equal(isCanonicalContentId("physique-chimie:college:4eme:chimie:camille.martin@example.com"), false);
  assert.equal(isCanonicalContentId(`${chapter}:unknown`), false);
  assert.equal(isCanonicalContentId(` ${chapter}`), false);
});

test("progress aliases stay idempotent while legacy keys remain readable", () => {
  const legacy = "college/4eme/chimie/atomes-molecules";
  const canonical = "physique-chimie:college:4eme:chimie:atomes-molecules";
  const legacyKey = `quiz_reward_${legacy}`;
  const canonicalKey = `quiz_reward_${canonical}`;

  assert.equal(resolveContentIdAlias(legacy), canonical);
  assert.equal(resolveContentIdAlias(canonical), canonical);
  assert.equal(resolveProgressStorageKeyAlias(legacyKey), canonicalKey);
  assert.equal(resolveProgressStorageKeyAlias(canonicalKey), canonicalKey);
  assert.deepEqual(getProgressStorageKeyAliases("quiz_reward_", canonical), [legacyKey]);
});

test("published canonical resource ids are globally unique", async () => {
  const ids = [];
  const physicalScienceRoot = path.join(repoRoot, "src", "data", "chapters");
  const mathematicsRoot = path.join(repoRoot, "src", "data", "mathematiques", "chapters");

  for (const metaFile of findMetaFiles(physicalScienceRoot)) {
    const chapterDirectory = path.dirname(metaFile);
    const [cycle, niveau, matiere, chapitre] = path.relative(physicalScienceRoot, chapterDirectory).split(path.sep);

    ids.push(
      ...collectChapterResourceIds(
        {
          discipline: "physique-chimie",
          cycle,
          niveau,
          matiere,
          chapitre,
        },
        chapterDirectory,
      ),
    );
  }

  for (const metaFile of findMetaFiles(mathematicsRoot)) {
    const chapterDirectory = path.dirname(metaFile);
    const [cycle, niveau, chapitre] = path.relative(mathematicsRoot, chapterDirectory).split(path.sep);

    ids.push(
      ...collectChapterResourceIds(
        {
          discipline: "mathematiques",
          cycle,
          niveau,
          chapitre,
        },
        chapterDirectory,
      ),
    );
  }

  const { labApps } = await import("../src/data/laboratoire/apps.ts");
  ids.push(...labApps.map((app) => buildLaboratoryContentId({ slug: app.slug, kind: "simulation" })));

  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const malformed = ids.filter((id) => !isCanonicalContentId(id) || id.includes("/") || id.includes("@"));

  assert.equal(ids.length > 0, true);
  assert.deepEqual(duplicates, []);
  assert.deepEqual(malformed, []);
});

test("legacy aliases prepare a localStorage migration without mutating storage", () => {
  const canonical = "physique-chimie:college:4eme:chimie:atomes-molecules";
  assert.deepEqual(getContentIdAliases(canonical), ["college/4eme/chimie/atomes-molecules"]);
  assert.equal(resolveContentIdAlias("college/4eme/chimie/atomes-molecules"), canonical);
  assert.equal(
    resolveContentIdAlias("college/4eme/chimie/atomes-molecules::atom-mol-fc-1"),
    "physique-chimie:college:4eme:chimie:atomes-molecules:flashcard:atom-mol-fc-1",
  );
  assert.equal(resolveContentIdAlias("unknown-local-storage-key"), "unknown-local-storage-key");
  assert.equal(typeof globalThis.localStorage, "undefined");
});
