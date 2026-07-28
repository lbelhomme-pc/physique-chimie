import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFlashcardContentId,
  buildQuizQuestionContentId,
  getCanonicalProgressStorageKey,
  resolveChapterContentId,
} from "../src/utils/contentIds.ts";
import {
  migrateContentProgressStorage,
} from "../src/utils/contentProgressMigration.ts";
import {
  getChapterProgress as getLegacyProgress,
  updateChapterProgress as updateLegacyProgress,
} from "../src/components/pedagogie/progress.ts";

class MemoryStorage {
  constructor(entries = {}) {
    this.map = new Map(Object.entries(entries));
  }

  get length() {
    return this.map.size;
  }

  key(index) {
    return [...this.map.keys()][index] ?? null;
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(key, String(value));
  }

  snapshot() {
    return Object.fromEntries([...this.map.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }
}

test("old physical-science progress is migrated to canonical ids without deleting legacy keys", () => {
  const storage = new MemoryStorage({
    gamification_state: JSON.stringify({
      xp: 120,
      progress: {
        "college/4eme/chimie/atomes-molecules": {
          cours: true,
          quiz: false,
          flashcards: true,
          exercices: false,
          bestQuizScore: 2,
          bestQuizTotal: 5,
          flashKnownRatio: 0.4,
        },
        "physique-chimie:college:4eme:chimie:atomes-molecules": {
          cours: false,
          quiz: true,
          flashcards: false,
          exercices: true,
          bestQuizScore: 4,
          bestQuizTotal: 6,
          flashKnownRatio: 0.8,
        },
      },
    }),
    "quiz_reward_college/4eme/chimie/atomes-molecules": JSON.stringify({ date: "2026-01-01", score: 3, total: 5 }),
    "exo_rewarded_college/4eme/chimie/atomes-molecules": JSON.stringify(["ex1", "ex2"]),
  });

  const result = migrateContentProgressStorage(storage);
  const state = JSON.parse(storage.getItem("gamification_state"));
  const canonical = "physique-chimie:college:4eme:chimie:atomes-molecules";

  assert.equal(result.conflicts.length, 0);
  assert.equal(Object.hasOwn(state.progress, "college/4eme/chimie/atomes-molecules"), false);
  assert.deepEqual(state.progress[canonical], {
    cours: true,
    quiz: true,
    flashcards: true,
    exercices: true,
    bestQuizScore: 4,
    bestQuizTotal: 6,
    flashKnownRatio: 0.8,
  });
  assert.equal(storage.getItem("quiz_reward_college/4eme/chimie/atomes-molecules") !== null, true);
  assert.equal(
    storage.getItem(getCanonicalProgressStorageKey("quiz_reward_", canonical)),
    JSON.stringify({ date: "2026-01-01", score: 3, total: 5 }),
  );
  assert.equal(
    storage.getItem(getCanonicalProgressStorageKey("exo_rewarded_", canonical)),
    JSON.stringify(["ex1", "ex2"]),
  );
});

test("legacy pedagogical progress stores are merged into gamification without deleting sources", () => {
  const canonical = "physique-chimie:college:4eme:chimie:atomes-molecules";
  const legacyStore = {
    totalXp: 95,
    chapters: {
      "college/4eme/chimie/atomes-molecules": {
        chapterKey: "college/4eme/chimie/atomes-molecules",
        quizScore: 3,
        quizTotal: 5,
        flashcardsFlipped: 2,
        flashcardsTotal: 4,
        flashcardsCompleted: false,
        xp: 40,
        lastVisitedAt: "2026-01-01T00:00:00.000Z",
        privateDraftNote: "ne doit pas sortir comme candidat de synchro",
      },
    },
  };
  const storage = new MemoryStorage({
    gamification_state: JSON.stringify({
      xp: 10,
      progress: {
        [canonical]: {
          cours: true,
          quiz: false,
          flashcards: false,
          exercices: false,
          bestQuizScore: 4,
          bestQuizTotal: 6,
          flashKnownRatio: 0.25,
        },
      },
    }),
    "pc-platform-progress-v1": JSON.stringify(legacyStore),
  });

  const result = migrateContentProgressStorage(storage);
  const state = JSON.parse(storage.getItem("gamification_state"));

  assert.equal(storage.getItem("pc-platform-progress-v1"), JSON.stringify(legacyStore));
  assert.equal(state.xp, 95);
  assert.deepEqual(state.progress[canonical], {
    cours: true,
    quiz: true,
    flashcards: true,
    exercices: false,
    bestQuizScore: 4,
    bestQuizTotal: 6,
    flashKnownRatio: 0.5,
  });
  assert.equal(result.syncCandidates.some((candidate) => (
    candidate.storageKey === "pc-platform-progress-v1" &&
    candidate.canonicalId === canonical &&
    candidate.kind === "chapter-progress"
  )), true);
  assert.equal(
    result.syncCandidates.every((candidate) => (
      Object.keys(candidate).sort().join(",") === "canonicalId,kind,storageKey"
    )),
    true,
  );
  assert.doesNotMatch(JSON.stringify(result.syncCandidates), /privateDraftNote|quizScore|totalXp/);
});

test("migration is idempotent for partially migrated users", () => {
  const storage = new MemoryStorage({
    gamification_state: JSON.stringify({
      progress: {
        "lycee/2nde/physique/mouvements": {
          cours: true,
          quiz: true,
          flashcards: false,
          exercices: false,
          bestQuizScore: 6,
          bestQuizTotal: 8,
          flashKnownRatio: 0,
        },
      },
    }),
    "exo_all_rewarded_lycee/2nde/physique/mouvements": "true",
  });

  migrateContentProgressStorage(storage);
  const once = storage.snapshot();
  migrateContentProgressStorage(storage);
  const twice = storage.snapshot();

  assert.deepEqual(twice, once);
});

test("legacy progress utility resolves aliases and avoids duplicate xp totals", () => {
  const canonical = "physique-chimie:college:4eme:chimie:atomes-molecules";
  const legacy = "college/4eme/chimie/atomes-molecules";
  const storage = new MemoryStorage({
    "pc-platform-progress-v1": JSON.stringify({
      totalXp: 30,
      chapters: {
        [legacy]: {
          chapterKey: legacy,
          quizScore: 2,
          quizTotal: 5,
          flashcardsFlipped: 1,
          flashcardsTotal: 4,
          flashcardsCompleted: false,
          xp: 10,
          lastVisitedAt: "2026-01-01T00:00:00.000Z",
        },
        [canonical]: {
          chapterKey: canonical,
          quizScore: 4,
          quizTotal: 5,
          flashcardsFlipped: 4,
          flashcardsTotal: 4,
          flashcardsCompleted: true,
          xp: 20,
          lastVisitedAt: "2026-02-01T00:00:00.000Z",
        },
      },
    }),
  });

  globalThis.window = {};
  globalThis.localStorage = storage;

  try {
    const progress = getLegacyProgress(legacy);
    assert.equal(progress.chapterKey, canonical);
    assert.equal(progress.quizScore, 4);
    assert.equal(progress.flashcardsCompleted, true);
    assert.equal(progress.xp, 20);

    updateLegacyProgress(legacy, { quizScore: 5, xp: 35 });
    const store = JSON.parse(storage.getItem("pc-platform-progress-v1"));
    assert.equal(Object.hasOwn(store.chapters, legacy), true);
    assert.equal(Object.hasOwn(store.chapters, canonical), true);
    assert.equal(store.chapters[canonical].quizScore, 5);
    assert.equal(store.totalXp, 35);
  } finally {
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});

test("math canonical progress stays stable while same local ids in different chapters remain unique", () => {
  const storage = new MemoryStorage({
    gamification_state: JSON.stringify({
      progress: {
        "mathematiques:lycee:2nde:fonctions-generalites": {
          cours: true,
          quiz: false,
          flashcards: false,
          exercices: false,
          bestQuizScore: 0,
          bestQuizTotal: 0,
          flashKnownRatio: 0,
        },
      },
    }),
  });

  migrateContentProgressStorage(storage);
  const state = JSON.parse(storage.getItem("gamification_state"));
  assert.equal(Object.hasOwn(state.progress, "mathematiques:lycee:2nde:fonctions-generalites"), true);
  assert.notEqual(
    buildQuizQuestionContentId({ chapter: "physique-chimie:college:4eme:chimie:atomes-molecules", questionId: "q1" }),
    buildQuizQuestionContentId({ chapter: "mathematiques:lycee:2nde:fonctions-generalites", questionId: "q1" }),
  );
  assert.notEqual(
    resolveChapterContentId("college/4eme/chimie/mouvements"),
    resolveChapterContentId("college/3eme/physique/mouvements"),
  );
});

test("SRS migration merges legacy and canonical card states with best dates", () => {
  const storage = new MemoryStorage({
    srs_cards: JSON.stringify([
      {
        chapterId: "college/4eme/chimie/atomes-molecules",
        cardId: "f1",
        ease: 2.1,
        interval: 3,
        repetitions: 2,
        nextReview: "2026-02-01",
        lastReview: "2026-01-01",
        lapses: 2,
      },
      {
        chapterId: "physique-chimie:college:4eme:chimie:atomes-molecules",
        cardId: "f1",
        ease: 2.7,
        interval: 10,
        repetitions: 4,
        nextReview: "2026-03-01",
        lastReview: "2026-02-15",
        lapses: 1,
      },
    ]),
  });

  const result = migrateContentProgressStorage(storage);
  const cards = JSON.parse(storage.getItem("srs_cards"));
  assert.equal(result.mergedSrsCards, 1);
  assert.equal(cards.length, 1);
  assert.deepEqual(cards[0], {
    chapterId: "physique-chimie:college:4eme:chimie:atomes-molecules",
    cardId: "f1",
    ease: 2.7,
    interval: 10,
    repetitions: 4,
    nextReview: "2026-03-01",
    lastReview: "2026-02-15",
    lapses: 1,
  });
  assert.equal(
    buildFlashcardContentId({ chapter: cards[0].chapterId, flashcardId: cards[0].cardId }),
    "physique-chimie:college:4eme:chimie:atomes-molecules:flashcard:f1",
  );
});

test("corrupted local data is reported without exposing sensitive values", () => {
  const storage = new MemoryStorage({
    gamification_state: "{bad json",
    srs_cards: JSON.stringify({ not: "an array" }),
  });

  const result = migrateContentProgressStorage(storage);
  assert.equal(result.conflicts.length >= 2, true);
  assert.equal(result.conflicts.some((item) => item.storageKey === "gamification_state"), true);
  assert.equal(result.conflicts.some((item) => item.reason.includes("{bad json")), false);
});
