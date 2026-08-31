import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();
const files = {
  shell: path.join(root, "src/components/pedagogie/ChapterPageShell.astro"),
  tabs: path.join(root, "src/components/pedagogie/ChapterTabs.astro"),
  explicitPcChapter: path.join(root, "src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro"),
  mathCollegeChapter: path.join(root, "src/pages/mathematiques/college/[niveau]/[chapitre].astro"),
  mathLyceeChapter: path.join(root, "src/pages/mathematiques/lycee/[niveau]/[chapitre].astro"),
};

function source(name) {
  return readFileSync(files[name], "utf8");
}

describe("chapter shell V3", () => {
  it("renders the overview, summary and recommended path before activities", () => {
    const shell = source("shell");

    assert.match(shell, /Vue d'ensemble/);
    assert.match(shell, /Avant de commencer/);
    assert.match(shell, /Sommaire/);
    assert.match(shell, /Parcours recommandé/);
    assert.match(shell, /Objectif/);
    assert.match(shell, /Prérequis/);
    assert.match(shell, /Compétences/);
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
