import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();
const files = {
  shell: path.join(root, "src/components/pedagogie/ChapterPageShell.astro"),
  tabs: path.join(root, "src/components/pedagogie/ChapterTabs.astro"),
  courseReader: path.join(root, "src/components/pedagogie/CourseReader.astro"),
  latexCourse: path.join(root, "src/components/mathematiques/LatexCourse.astro"),
  exercises: path.join(root, "src/components/pedagogie/ExercicesPlayer.tsx"),
  quiz: path.join(root, "src/components/pedagogie/QuizPlayer.tsx"),
  flashcards: path.join(root, "src/components/pedagogie/FlashcardsPlayer.tsx"),
  learningStyles: path.join(root, "src/ui-v5/learning.css"),
  explicitPcChapter: path.join(root, "src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro"),
  mathCollegeChapter: path.join(root, "src/pages/mathematiques/college/[niveau]/[chapitre].astro"),
  mathLyceeChapter: path.join(root, "src/pages/mathematiques/lycee/[niveau]/[chapitre].astro"),
};

function source(name) {
  return readFileSync(files[name], "utf8");
}

describe("chapter shell V4", () => {
  it("enters learning directly after a compact hero and one disclosure", () => {
    const shell = source("shell");

    assert.match(shell, /Avant de commencer/);
    assert.match(shell, /chapter-before/);
    assert.doesNotMatch(shell, /Vue d'ensemble/);
    assert.doesNotMatch(shell, /Sommaire/);
    assert.doesNotMatch(shell, /data-chapter-summary-link/);
    assert.doesNotMatch(shell, /Parcours recommandé/);
    assert.match(shell, /Objectifs/);
    assert.match(shell, /Prérequis/);
    assert.match(shell, /Compétences/);
  });

  it("keeps the course area aligned with the 1120px chapter hero width", () => {
    const tabs = readFileSync(path.join(root, "src/ui-v5/index.css"), "utf8");
    const reader = readFileSync(path.join(root, "src/ui-v5/reader.css"), "utf8");
    const latex = readFileSync(path.join(root, "src/ui-v5/tools/LatexCourse.css"), "utf8");

    assert.match(tabs, /var\(--ui5-content\)/);
    assert.match(reader, /var\(--ui5-content\)/);
    assert.match(latex, /var\(--ui5-reading(?:, 70ch)?\)/);
    assert.doesNotMatch(tabs, /max-width: 900px;/);
    assert.doesNotMatch(reader, /max-width: 1040px;/);
    assert.doesNotMatch(latex, /width: min\(100%, 920px\);/);
  });

  it("uses one shared visual workspace for course, exercises, quiz and flashcards", () => {
    const exercises = source("exercises");
    const quiz = source("quiz");
    const flashcards = source("flashcards");
    const styles = source("learningStyles");

    assert.match(readFileSync(path.join(root, "src/ui-v5/index.css"), "utf8"), /--ui5-content: 1120px/);
    assert.match(styles, /--learning-max: var\(--ui5-content\)/);
    assert.match(exercises, /learning-player--exercises/);
    assert.match(quiz, /learning-player--quiz/);
    assert.match(quiz, /learning-question-card/);
    assert.match(flashcards, /learning-player--flashcards/);
    assert.match(flashcards, /learning-session-grid/);
    assert.match(flashcards, /learning-flashcard-card/);
    assert.doesNotMatch(exercises, /maxWidth:\s*760/);
    assert.doesNotMatch(quiz, /maxWidth:\s*(600|700)/);
    assert.doesNotMatch(flashcards, /maxWidth:\s*(500|600)/);
  });

  it("keeps the same activity inputs and player slots", () => {
    const shell = source("shell");

    for (const prop of ["CoursContent", "exercices", "quizData", "flashData"]) {
      assert.match(shell, new RegExp(prop));
    }

    assert.match(shell, /<CoursTracker client:load/);
    assert.match(shell, /<ExercicesPlayer client:load/);
    assert.match(shell, /<QuizPlayer client:load/);
    assert.match(shell, /<FlashcardsPlayer client:load/);
  });

  it("keeps one keyboard-friendly resource selector without a duplicate summary", () => {
    const shell = source("shell");
    const tabs = source("tabs");

    assert.doesNotMatch(shell, /data-chapter-summary-link/);
    assert.match(tabs, /role="tablist"/);
    assert.match(tabs, /aria-selected/);
    assert.match(tabs, /ArrowRight/);
    assert.match(tabs, /ArrowLeft/);
    assert.match(tabs, /Home/);
    assert.match(tabs, /End/);
  });

  it("does not add new client hydration directives in the overview", () => {
    const shell = source("shell");
    const hydrationDirectives = shell.match(/client:/g) ?? [];

    assert.equal(hydrationDirectives.length, 4);
  });

  it("passes pedagogical metadata from every chapter route family", () => {
    for (const name of ["explicitPcChapter", "mathCollegeChapter", "mathLyceeChapter"]) {
      const route = source(name);

      assert.match(route, /chapterDescription=/);
      assert.match(route, /levelLabel=/);
      assert.match(route, /subjectLabel=/);
      assert.match(route, /objectives=/);
      assert.match(route, /prerequisites=/);
      assert.match(route, /competencies=/);
      assert.match(route, /estimatedDuration=/);
    }
  });
});
