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
  learningStyles: path.join(root, "src/styles/learning-workspace.css"),
  explicitPcChapter: path.join(root, "src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro"),
  mathCollegeChapter: path.join(root, "src/pages/mathematiques/college/[niveau]/[chapitre].astro"),
  mathLyceeChapter: path.join(root, "src/pages/mathematiques/lycee/[niveau]/[chapitre].astro"),
};

function source(name) {
  return readFileSync(files[name], "utf8");
}

describe("chapter shell V3", () => {
  it("renders the overview and summary without a duplicate recommended path", () => {
    const shell = source("shell");

    assert.match(shell, /Vue d'ensemble/);
    assert.match(shell, /Avant de commencer/);
    assert.match(shell, /Sommaire/);
    assert.doesNotMatch(shell, /Parcours recommandé/);
    assert.doesNotMatch(shell, /chapter-recommended/);
    assert.match(shell, /Objectif/);
    assert.match(shell, /Prérequis/);
    assert.match(shell, /Compétences/);
  });

  it("keeps the course area aligned with the 1120px chapter hero width", () => {
    const tabs = source("tabs");
    const reader = source("courseReader");
    const latex = source("latexCourse");

    assert.match(tabs, /max-width: var\(--chapter-shell-max, 1120px\)/);
    assert.match(reader, /max-width: var\(--chapter-shell-max, 1120px\)/);
    assert.match(latex, /max-width: var\(--chapter-shell-max, 1120px\)/);
    assert.doesNotMatch(tabs, /max-width: 900px;/);
    assert.doesNotMatch(reader, /max-width: 1040px;/);
    assert.doesNotMatch(latex, /width: min\(100%, 920px\);/);
  });

  it("uses one shared visual workspace for course, exercises, quiz and flashcards", () => {
    const shell = source("shell");
    const exercises = source("exercises");
    const quiz = source("quiz");
    const flashcards = source("flashcards");
    const styles = source("learningStyles");

    assert.match(shell, /--chapter-shell-max: 1120px/);
    assert.match(styles, /--learning-max: 1120px/);
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

  it("uses keyboard-friendly summary links with aria-current", () => {
    const shell = source("shell");
    const tabs = source("tabs");

    assert.match(shell, /data-chapter-summary-link=\{section\.id\}/);
    assert.match(shell, /aria-current=\{section\.id === activeActivityId \? "step" : undefined\}/);
    assert.match(tabs, /syncChapterSummary/);
    assert.match(tabs, /setAttribute\("aria-current", "step"\)/);
    assert.match(tabs, /removeAttribute\("aria-current"\)/);
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
