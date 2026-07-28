import {
  getLegacyContentIdCandidates,
  resolveChapterContentId,
} from "../../utils/contentIds";

export type ChapterProgress = {
  chapterKey: string;
  quizScore: number;
  quizTotal: number;
  flashcardsFlipped: number;
  flashcardsTotal: number;
  flashcardsCompleted: boolean;
  xp: number;
  lastVisitedAt: string;
};

const STORAGE_KEY = "pc-platform-progress-v1";

type ProgressStore = {
  totalXp: number;
  chapters: Record<string, ChapterProgress>;
};

function getDefaultStore(): ProgressStore {
  return {
    totalXp: 0,
    chapters: {}
  };
}

function getDefaultChapterProgress(chapterKey: string): ChapterProgress {
  return {
    chapterKey,
    quizScore: 0,
    quizTotal: 0,
    flashcardsFlipped: 0,
    flashcardsTotal: 0,
    flashcardsCompleted: false,
    xp: 0,
    lastVisitedAt: new Date().toISOString()
  };
}

export function readProgressStore(): ProgressStore {
  if (typeof window === "undefined") return getDefaultStore();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStore();

    const parsed = JSON.parse(raw) as ProgressStore;

    return {
      totalXp: parsed.totalXp ?? 0,
      chapters: parsed.chapters ?? {}
    };
  } catch {
    return getDefaultStore();
  }
}

export function writeProgressStore(store: ProgressStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getChapterProgress(chapterKey: string): ChapterProgress {
  const store = readProgressStore();
  const canonicalChapterKey = resolveChapterContentId(chapterKey);
  const candidateKeys = unique([
    canonicalChapterKey,
    chapterKey,
    ...getLegacyContentIdCandidates(canonicalChapterKey),
  ]);
  const storedProgress = candidateKeys
    .map((candidateKey) => store.chapters[candidateKey])
    .filter((chapter): chapter is ChapterProgress => Boolean(chapter));

  if (storedProgress.length === 0) {
    return getDefaultChapterProgress(canonicalChapterKey);
  }

  return storedProgress.reduce(
    (merged, chapter) => mergeChapterProgress(merged, chapter, canonicalChapterKey),
    getDefaultChapterProgress(canonicalChapterKey)
  );
}

export function updateChapterProgress(
  chapterKey: string,
  patch: Partial<ChapterProgress>
) {
  const store = readProgressStore();
  const canonicalChapterKey = resolveChapterContentId(chapterKey);

  const current = getChapterProgress(canonicalChapterKey);

  const next: ChapterProgress = {
    ...current,
    ...patch,
    chapterKey: canonicalChapterKey,
    lastVisitedAt: new Date().toISOString()
  };

  store.chapters[canonicalChapterKey] = next;

  store.totalXp = computeTotalXp(store);

  writeProgressStore(store);

  return {
    store,
    chapter: next
  };
}

function mergeChapterProgress(
  a: ChapterProgress,
  b: ChapterProgress,
  chapterKey: string,
): ChapterProgress {
  return {
    ...a,
    ...b,
    chapterKey,
    quizScore: Math.max(a.quizScore ?? 0, b.quizScore ?? 0),
    quizTotal: Math.max(a.quizTotal ?? 0, b.quizTotal ?? 0),
    flashcardsFlipped: Math.max(a.flashcardsFlipped ?? 0, b.flashcardsFlipped ?? 0),
    flashcardsTotal: Math.max(a.flashcardsTotal ?? 0, b.flashcardsTotal ?? 0),
    flashcardsCompleted: Boolean(a.flashcardsCompleted || b.flashcardsCompleted),
    xp: Math.max(a.xp ?? 0, b.xp ?? 0),
    lastVisitedAt: maxString(a.lastVisitedAt, b.lastVisitedAt),
  };
}

function computeTotalXp(store: ProgressStore): number {
  const xpByCanonicalChapter = new Map<string, number>();

  for (const chapter of Object.values(store.chapters)) {
    const canonicalChapterKey = resolveChapterContentId(chapter.chapterKey);
    xpByCanonicalChapter.set(
      canonicalChapterKey,
      Math.max(xpByCanonicalChapter.get(canonicalChapterKey) ?? 0, chapter.xp ?? 0),
    );
  }

  return [...xpByCanonicalChapter.values()].reduce((sum, xp) => sum + xp, 0);
}

function maxString(a: string, b: string): string {
  return a > b ? a : b;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}
