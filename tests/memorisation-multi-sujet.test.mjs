import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { collectMegaFlashcards, collectMegaQuestions } from "../src/utils/megaMemorizationData.ts";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const quizEndpointSource = read("src/pages/memorisation/mega-quiz-data.json.ts");
const flashEndpointSource = read("src/pages/memorisation/mega-flashcards-data.json.ts");
const quizPageSource = read("src/pages/memorisation/mega-quiz.astro");
const flashPageSource = read("src/pages/memorisation/mega-flashcards.astro");
const quizPlayerSource = read("src/components/pedagogie/MegaQuizPlayer.tsx");
const flashPlayerSource = read("src/components/pedagogie/MegaFlashcardsPlayer.tsx");
const dashboardSource = read("src/components/pedagogie/Dashboard.tsx");
const homeSource = read("src/pages/index.astro");
const globalSearchCatalogueSource = read("src/data/globalSearchResources.ts");
const profilePageSource = read("src/pages/profil.astro");
const memorizationHubSource = read("src/pages/memorisation/index.astro");
const dailyReviewSource = read("src/pages/memorisation/revision-du-jour.astro");

function walkNamedFiles(start, filename) {
  const files = [];
  const stack = [path.join(root, start)];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === filename) files.push(full);
    }
  }
  return files.sort();
}

function sumWrappedItems(files, key) {
  return files.reduce((sum, file) => {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    return sum + (Array.isArray(value?.[key]) ? value[key].length : 0);
  }, 0);
}

test("C15 collectors accept PC arrays and mathematics wrappers without changing legacy defaults", () => {
  const pcMeta = {
    "../../data/chapters/college/4eme/chimie/atomes/meta.json": {
      title: "Atomes",
      matiere: "chimie",
      niveau: "4eme",
    },
  };
  const pcQuiz = {
    "../../data/chapters/college/4eme/chimie/atomes/quiz.json": [
      { id: "pc-q1", question: "PC ?", choices: ["A", "B"], answer: 1 },
    ],
  };
  const mathMeta = {
    "../../data/mathematiques/chapters/lycee/2nde/fonctions/meta.json": {
      title: "Fonctions",
      cycle: "lycee",
      niveau: "2nde",
    },
  };
  const mathQuiz = {
    "../../data/mathematiques/chapters/lycee/2nde/fonctions/quiz.json": {
      questions: [{ id: "m-q1", question: "Maths ?", choices: ["A", "B"], correctAnswer: 0 }],
    },
  };
  const mathFlash = {
    "../../data/mathematiques/chapters/lycee/2nde/fonctions/flashcards.json": {
      cards: [{ id: "m-f1", front: "Recto", back: "Verso" }],
    },
  };

  const pcQuestions = collectMegaQuestions(pcQuiz, pcMeta);
  const mathQuestions = collectMegaQuestions(mathQuiz, mathMeta, {
    discipline: "mathematiques",
    defaultMatiere: "mathematiques",
  });
  const mathCards = collectMegaFlashcards(mathFlash, mathMeta, {
    discipline: "mathematiques",
    defaultMatiere: "mathematiques",
  });

  assert.equal(pcQuestions[0].discipline, "physique-chimie");
  assert.equal(pcQuestions[0].matiere, "chimie");
  assert.equal(mathQuestions[0].discipline, "mathematiques");
  assert.equal(mathQuestions[0].matiere, "mathematiques");
  assert.equal(mathQuestions[0].cycle, "lycee");
  assert.equal(mathQuestions[0].answer, 0);
  assert.equal(mathCards[0].discipline, "mathematiques");
});

test("C15 Mega endpoints aggregate both disciplines but only available mathematics levels", () => {
  for (const source of [quizEndpointSource, flashEndpointSource, quizPageSource, flashPageSource]) {
    assert.match(source, /data\/chapters\/\*\*\//);
    assert.match(source, /data\/mathematiques\/chapters\/\*\*\//);
    assert.match(source, /discipline: "physique-chimie"/);
    assert.match(source, /discipline: "mathematiques"/);
    assert.match(source, /level\.status === "available"/);
    assert.doesNotMatch(source, /level\.status === "planned"/);
  }

  const mathQuizFiles = walkNamedFiles("src/data/mathematiques/chapters/lycee/2nde", "quiz.json");
  const mathFlashFiles = walkNamedFiles("src/data/mathematiques/chapters/lycee/2nde", "flashcards.json");
  assert.ok(sumWrappedItems(mathQuizFiles, "questions") >= 44, "le corpus Maths publié doit alimenter Mega Quiz");
  assert.ok(sumWrappedItems(mathFlashFiles, "cards") >= 44, "le corpus Maths publié doit alimenter Mega Flashcards");
});

test("C15 Mega players require an explicit choice before mixing disciplines", () => {
  for (const source of [quizPlayerSource, flashPlayerSource]) {
    assert.match(source, /useState<DisciplineFilter>\("physique-chimie"\)/);
    assert.match(source, /"mathematiques"/);
    assert.match(source, /"all"/);
    assert.match(source, /Toutes les disciplines/);
    assert.match(source, /Le mélange des disciplines n’est activé que si tu choisis/);
    assert.match(source, /aria-pressed/);
    assert.match(source, /discipline === fDiscipline/);
    assert.doesNotMatch(source, /m==="chimie"\?"🧪 Chimie":"⚡ Physique"/);
  }
  assert.match(quizPlayerSource, /data-discipline-filter="mega-quiz"/);
  assert.match(flashPlayerSource, /data-discipline-filter="mega-flashcards"/);
});

test("C15 search sends Physique-Chimie results directly to canonical C12 routes", () => {
  assert.match(homeSource, /getGlobalSearchCatalogue/);
  assert.match(globalSearchCatalogueSource, /getPhysicalScienceExplicitChapterPath/);
  assert.match(globalSearchCatalogueSource, /path: getPhysicalScienceExplicitChapterPath\(cycle, niveau, matiere as "physique" \| "chimie", slug\)/);
  assert.doesNotMatch(globalSearchCatalogueSource, /path: `\/\$\{cycle\}\/\$\{niveau\}\/\$\{matiere\}\/\$\{slug\}`/);
});

test("C15 dashboard and profile are discipline-aware without changing progress storage", () => {
  assert.match(dashboardSource, /DashboardSubjectFilter = "all" \| "mathematiques" \| "physique-chimie"/);
  assert.match(dashboardSource, /data-dashboard-subject-filter="true"/);
  assert.match(dashboardSource, /resource\.subject === subjectFilter/);
  assert.match(dashboardSource, /visibleResources/);
  assert.match(dashboardSource, /getGamificationEngine/);
  assert.match(dashboardSource, /getSRSEngine/);
  assert.doesNotMatch(dashboardSource, /href: "\/college"/);
  assert.doesNotMatch(dashboardSource, /aria-hidden="true">PC<\/span>/);

  assert.match(profilePageSource, /Mon profil — Mathématiques et Physique-Chimie/);
  assert.match(profilePageSource, /subject="transversal"/);
});

test("C15 memorization entry points describe both public disciplines", () => {
  assert.match(memorizationHubSource, /Mathématiques et Physique-Chimie/);
  assert.match(memorizationHubSource, /filtre de discipline/i);
  assert.match(dailyReviewSource, /Mathématiques et Physique-Chimie/);
  assert.match(dailyReviewSource, /subject="transversal"/);
  assert.match(quizPageSource, /Mathématiques et Physique-Chimie/);
  assert.match(flashPageSource, /Mathématiques et Physique-Chimie/);
});
