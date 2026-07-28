import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import QuizPlayer, { mergeQuizProgress } from "../src/components/pedagogie/QuizPlayer.tsx";
import FlashcardsPlayer from "../src/components/pedagogie/FlashcardsPlayer.tsx";
import MegaQuizPlayer from "../src/components/pedagogie/MegaQuizPlayer.tsx";
import MegaFlashcardsPlayer from "../src/components/pedagogie/MegaFlashcardsPlayer.tsx";
import { SRSEngine } from "../src/data/gamification/srs.ts";

const root = process.cwd();
const sources = {
  quiz: readFileSync(path.join(root, "src/components/pedagogie/QuizPlayer.tsx"), "utf8"),
  flashcards: readFileSync(path.join(root, "src/components/pedagogie/FlashcardsPlayer.tsx"), "utf8"),
  megaQuiz: readFileSync(path.join(root, "src/components/pedagogie/MegaQuizPlayer.tsx"), "utf8"),
  megaFlashcards: readFileSync(path.join(root, "src/components/pedagogie/MegaFlashcardsPlayer.tsx"), "utf8"),
  megaQuizPage: readFileSync(path.join(root, "src/pages/memorisation/mega-quiz.astro"), "utf8"),
  megaFlashcardsPage: readFileSync(path.join(root, "src/pages/memorisation/mega-flashcards.astro"), "utf8"),
  megaQuizData: readFileSync(path.join(root, "src/pages/memorisation/mega-quiz-data.json.ts"), "utf8"),
  megaFlashcardsData: readFileSync(path.join(root, "src/pages/memorisation/mega-flashcards-data.json.ts"), "utf8"),
  srs: readFileSync(path.join(root, "src/data/gamification/srs.ts"), "utf8"),
};

function installStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  const calls = { removeItem: 0, setItem: 0 };
  globalThis.window = {
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => { calls.setItem++; store.set(key, String(value)); },
      removeItem: (key) => { calls.removeItem++; store.delete(key); },
    },
  };
  globalThis.localStorage = globalThis.window.localStorage;
  return { store, calls };
}

describe("memorisation V3", () => {
  it("preserves legacy quiz progress and never lowers the best score", () => {
    const legacy = { date: "2026-07-27", score: 8, total: 10 };
    const lowerAttempt = mergeQuizProgress(legacy, { date: "2026-07-27", score: 4, total: 10, updatedAt: "test" });
    const betterAttempt = mergeQuizProgress(lowerAttempt, { date: "2026-07-28", score: 9, total: 10, updatedAt: "test" });

    assert.equal(lowerAttempt.score, 8);
    assert.equal(lowerAttempt.bestScore, 8);
    assert.equal(lowerAttempt.bestTotal, 10);
    assert.equal(lowerAttempt.lastScore, 4);
    assert.equal(betterAttempt.bestScore, 9);
    assert.equal(betterAttempt.bestTotal, 10);
  });

  it("keeps SRS data in the existing localStorage key when reset", () => {
    const { store, calls } = installStorage({
      srs_cards: JSON.stringify([{ cardId: "c1", chapterId: "chapitre", ease: 2.5, interval: 1, repetitions: 1, nextReview: "2026-07-27", lastReview: "2026-07-26", lapses: 0 }]),
    });

    const srs = new SRSEngine();
    srs.review("chapitre", "c1", "good");
    srs.resetAll();

    assert.equal(calls.removeItem, 0);
    assert.equal(store.get("srs_cards"), "[]");
  });

  it("renders V3 markers for chapter quiz and flashcards", () => {
    const quizHtml = renderToStaticMarkup(React.createElement(QuizPlayer, {
      data: [{ id: "q1", question: "Quelle phrase est correcte ?", choices: ["A", "B"], answer: 0, explanation: "A est correcte." }],
    }));
    const flashcardsHtml = renderToStaticMarkup(React.createElement(FlashcardsPlayer, {
      data: [{ id: "f1", front: "Grandeur ?", back: "Tension", difficulty: 1 }],
    }));

    assert.match(quizHtml, /data-quiz-player-v3/);
    assert.match(flashcardsHtml, /data-flashcards-player-v3/);
  });

  it("keeps retry and accessibility affordances in the memorisation players", () => {
    assert.match(sources.quiz, /Reprendre les erreurs/);
    assert.match(sources.quiz, /scoreFromAnswers/);
    assert.match(sources.flashcards, /data-flashcards-result-v3/);
    assert.match(sources.megaQuiz, /retryQuestions/);
    assert.match(sources.megaQuiz, /Reprendre les erreurs/);
    assert.match(sources.megaFlashcards, /role="button"/);
    assert.match(sources.megaFlashcards, /onKeyDown/);
    assert.doesNotMatch(sources.srs, /removeItem\(STORAGE_KEY\)/);
  });

  it("renders mega players with their V3 wrappers", () => {
    const question = { id: "mq1", question: "2+2 ?", choices: ["3", "4"], answer: 1, explanation: "2+2=4.", chapterTitle: "Calcul", matiere: "physique", niveau: "5eme" };
    const card = { id: "mf1", front: "Symbole de la tension ?", back: "U", difficulty: 1, chapterTitle: "Electricite", matiere: "physique", niveau: "5eme" };

    assert.match(renderToStaticMarkup(React.createElement(MegaQuizPlayer, { allQuestions: [question] })), /data-mega-quiz-player-v3/);
    assert.match(renderToStaticMarkup(React.createElement(MegaFlashcardsPlayer, { allCards: [card] })), /data-mega-flashcards-player-v3/);
  });

  it("loads mega memorisation banks outside the initial HTML", () => {
    assert.match(sources.megaQuizPage, /client:idle/);
    assert.match(sources.megaQuizPage, /dataUrl=\{dataUrl\}/);
    assert.doesNotMatch(sources.megaQuizPage, /allQuestions=\{allQuestions\}/);
    assert.match(sources.megaFlashcardsPage, /client:idle/);
    assert.match(sources.megaFlashcardsPage, /dataUrl=\{dataUrl\}/);
    assert.doesNotMatch(sources.megaFlashcardsPage, /allCards=\{allCards\}/);
    assert.match(sources.megaQuizData, /collectMegaQuestions/);
    assert.match(sources.megaFlashcardsData, /collectMegaFlashcards/);
    assert.match(sources.megaQuiz, /role="status"/);
    assert.match(sources.megaFlashcards, /role="status"/);
  });
});
