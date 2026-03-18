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

  return (
    store.chapters[chapterKey] ?? {
      chapterKey,
      quizScore: 0,
      quizTotal: 0,
      flashcardsFlipped: 0,
      flashcardsTotal: 0,
      flashcardsCompleted: false,
      xp: 0,
      lastVisitedAt: new Date().toISOString()
    }
  );
}

export function updateChapterProgress(
  chapterKey: string,
  patch: Partial<ChapterProgress>
) {
  const store = readProgressStore();

  const current = getChapterProgress(chapterKey);

  const next: ChapterProgress = {
    ...current,
    ...patch,
    chapterKey,
    lastVisitedAt: new Date().toISOString()
  };

  store.chapters[chapterKey] = next;

  store.totalXp = Object.values(store.chapters).reduce(
    (sum, chapter) => sum + (chapter.xp ?? 0),
    0
  );

  writeProgressStore(store);

  return {
    store,
    chapter: next
  };
}