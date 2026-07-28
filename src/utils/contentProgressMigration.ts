import {
  CONTENT_PROGRESS_MIGRATION_KEY,
  CONTENT_PROGRESS_MIGRATION_VERSION,
  PROGRESS_STORAGE_KEY_PREFIXES,
  buildFlashcardContentId,
  resolveChapterContentId,
  resolveProgressStorageKeyAlias,
  type ProgressStorageKeyPrefix,
} from "./contentIds";

export interface ContentProgressStorage {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ContentProgressMigrationConflict {
  storageKey: string;
  reason: string;
}

export interface ContentProgressSyncCandidate {
  storageKey: string;
  canonicalId: string;
  kind: "chapter-progress" | "reward-key" | "srs-card";
}

export interface ContentProgressMigrationResult {
  version: number;
  changed: boolean;
  migratedKeys: number;
  mergedProgressEntries: number;
  mergedSrsCards: number;
  syncCandidates: ContentProgressSyncCandidate[];
  conflicts: ContentProgressMigrationConflict[];
}

type UnknownRecord = Record<string, unknown>;

interface ProgressEntry extends UnknownRecord {
  cours?: boolean;
  quiz?: boolean;
  flashcards?: boolean;
  exercices?: boolean;
  bestQuizScore?: number;
  bestQuizTotal?: number;
  flashKnownRatio?: number;
}

interface SrsCardState extends UnknownRecord {
  cardId: string;
  chapterId: string;
  ease?: number;
  interval?: number;
  repetitions?: number;
  nextReview?: string;
  lastReview?: string;
  lapses?: number;
}

const GAMIFICATION_STORAGE_KEY = "gamification_state";
const SRS_STORAGE_KEY = "srs_cards";
const LEGACY_PEDAGOGIE_PROGRESS_STORAGE_KEYS = [
  "pc-platform-progress-v1",
  "pc-platform-progress-v2",
] as const;

export function migrateBrowserContentProgressStorage(): ContentProgressMigrationResult {
  if (typeof window === "undefined") {
    return emptyResult();
  }
  return migrateContentProgressStorage(window.localStorage);
}

export function migrateContentProgressStorage(storage: ContentProgressStorage): ContentProgressMigrationResult {
  const result = emptyResult();

  migrateGamificationState(storage, result);
  migrateLegacyPedagogieProgressStores(storage, result);
  migrateRewardStorageKeys(storage, result);
  migrateSrsCards(storage, result);

  try {
    storage.setItem(CONTENT_PROGRESS_MIGRATION_KEY, JSON.stringify({
      version: CONTENT_PROGRESS_MIGRATION_VERSION,
      status: "completed",
    }));
  } catch {
    result.conflicts.push({
      storageKey: CONTENT_PROGRESS_MIGRATION_KEY,
      reason: "Impossible d'ecrire le marqueur de migration.",
    });
  }

  result.changed = result.migratedKeys > 0 || result.mergedProgressEntries > 0 || result.mergedSrsCards > 0;
  return result;
}

function emptyResult(): ContentProgressMigrationResult {
  return {
    version: CONTENT_PROGRESS_MIGRATION_VERSION,
    changed: false,
    migratedKeys: 0,
    mergedProgressEntries: 0,
    mergedSrsCards: 0,
    syncCandidates: [],
    conflicts: [],
  };
}

function migrateGamificationState(storage: ContentProgressStorage, result: ContentProgressMigrationResult): void {
  const raw = storage.getItem(GAMIFICATION_STORAGE_KEY);
  if (!raw) return;

  const parsed = parseJson(raw, GAMIFICATION_STORAGE_KEY, result);
  if (!isRecord(parsed)) return;

  const progress = isRecord(parsed.progress) ? parsed.progress : {};
  const migratedProgress: Record<string, ProgressEntry> = {};
  let changed = false;

  for (const [chapterId, rawEntry] of Object.entries(progress)) {
    if (!isRecord(rawEntry)) {
      result.conflicts.push({
        storageKey: GAMIFICATION_STORAGE_KEY,
        reason: `Progression ignoree car invalide pour ${chapterId}.`,
      });
      continue;
    }

    const canonicalChapterId = resolveChapterContentId(chapterId);
    const current = migratedProgress[canonicalChapterId];
    const incoming = normalizeProgressEntry(rawEntry);

    if (current) {
      migratedProgress[canonicalChapterId] = mergeProgressEntries(current, incoming);
      result.mergedProgressEntries += 1;
      changed = true;
    } else {
      migratedProgress[canonicalChapterId] = incoming;
    }

    if (canonicalChapterId !== chapterId) {
      addSyncCandidate(result, GAMIFICATION_STORAGE_KEY, canonicalChapterId, "chapter-progress");
      changed = true;
    }
  }

  if (!changed) return;

  const migrated = {
    ...parsed,
    progress: migratedProgress,
  };
  writeJson(storage, GAMIFICATION_STORAGE_KEY, migrated, result);
}

function migrateLegacyPedagogieProgressStores(
  storage: ContentProgressStorage,
  result: ContentProgressMigrationResult,
): void {
  for (const storageKey of LEGACY_PEDAGOGIE_PROGRESS_STORAGE_KEYS) {
    const raw = storage.getItem(storageKey);
    if (!raw) continue;

    const parsed = parseJson(raw, storageKey, result);
    if (!isRecord(parsed)) continue;

    if (!isRecord(parsed.chapters)) {
      result.conflicts.push({
        storageKey,
        reason: "Le stockage de progression legacy ne contient pas de chapitres exploitables.",
      });
      continue;
    }

    const gamification = readGamificationStateForMerge(storage, result);
    if (!gamification) continue;

    const progress = isRecord(gamification.progress) ? gamification.progress : {};
    const migratedProgress: Record<string, ProgressEntry> = { ...progress } as Record<string, ProgressEntry>;
    let changed = false;

    for (const [chapterId, rawEntry] of Object.entries(parsed.chapters)) {
      if (!isRecord(rawEntry)) {
        result.conflicts.push({
          storageKey,
          reason: `Progression legacy ignoree car invalide pour ${chapterId}.`,
        });
        continue;
      }

      const canonicalChapterId = resolveChapterContentId(chapterId);
      const current = isRecord(migratedProgress[canonicalChapterId])
        ? normalizeProgressEntry(migratedProgress[canonicalChapterId])
        : undefined;
      const incoming = normalizeLegacyPedagogieProgressEntry(rawEntry);
      const next = current ? mergeProgressEntries(current, incoming) : incoming;

      if (!current || JSON.stringify(current) !== JSON.stringify(next)) {
        migratedProgress[canonicalChapterId] = next;
        addSyncCandidate(result, storageKey, canonicalChapterId, "chapter-progress");
        changed = true;
      }

      if (current) {
        result.mergedProgressEntries += 1;
      }
    }

    const legacyTotalXp = asNumber(parsed.totalXp);
    if (legacyTotalXp > asNumber(gamification.xp)) {
      gamification.xp = legacyTotalXp;
      changed = true;
    }

    if (changed) {
      writeJson(storage, GAMIFICATION_STORAGE_KEY, {
        ...gamification,
        progress: migratedProgress,
      }, result);
    }
  }
}

function migrateRewardStorageKeys(storage: ContentProgressStorage, result: ContentProgressMigrationResult): void {
  for (const key of listStorageKeys(storage)) {
    const prefix = PROGRESS_STORAGE_KEY_PREFIXES.find((candidate) => key.startsWith(candidate));
    if (!prefix) continue;

    const canonicalKey = resolveProgressStorageKeyAlias(key);
    if (canonicalKey === key) continue;

    const legacyValue = storage.getItem(key);
    if (legacyValue === null) continue;

    const currentValue = storage.getItem(canonicalKey);
    const mergedValue = mergeStorageValue(prefix, legacyValue, currentValue, key, result);
    if (mergedValue === null) continue;

    try {
      storage.setItem(canonicalKey, mergedValue);
      addSyncCandidate(result, key, canonicalKey, "reward-key");
      result.migratedKeys += 1;
    } catch {
      result.conflicts.push({
        storageKey: canonicalKey,
        reason: "Impossible d'ecrire la cle de progression canonique.",
      });
    }
  }
}

function migrateSrsCards(storage: ContentProgressStorage, result: ContentProgressMigrationResult): void {
  const raw = storage.getItem(SRS_STORAGE_KEY);
  if (!raw) return;

  const parsed = parseJson(raw, SRS_STORAGE_KEY, result);
  if (!Array.isArray(parsed)) {
    result.conflicts.push({
      storageKey: SRS_STORAGE_KEY,
      reason: "Le stockage SRS n'est pas un tableau.",
    });
    return;
  }

  const migrated = new Map<string, SrsCardState>();
  let changed = false;

  for (const item of parsed) {
    if (!isRecord(item) || typeof item.chapterId !== "string" || typeof item.cardId !== "string") {
      result.conflicts.push({
        storageKey: SRS_STORAGE_KEY,
        reason: "Carte SRS ignoree car invalide.",
      });
      continue;
    }

    const canonicalChapterId = resolveChapterContentId(item.chapterId);
    const canonicalCardId = buildFlashcardContentId({
      chapter: canonicalChapterId,
      flashcardId: item.cardId,
    });
    const normalizedCard = normalizeSrsCard(item, canonicalChapterId);
    const current = migrated.get(canonicalCardId);

    if (current) {
      migrated.set(canonicalCardId, mergeSrsCards(current, normalizedCard));
      result.mergedSrsCards += 1;
      changed = true;
    } else {
      migrated.set(canonicalCardId, normalizedCard);
    }

    if (canonicalChapterId !== item.chapterId) {
      addSyncCandidate(result, SRS_STORAGE_KEY, canonicalCardId, "srs-card");
      changed = true;
    }
  }

  if (!changed) return;

  const stableCards = [...migrated.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, card]) => card);
  writeJson(storage, SRS_STORAGE_KEY, stableCards, result);
}

function mergeStorageValue(
  prefix: ProgressStorageKeyPrefix,
  legacyValue: string,
  currentValue: string | null,
  key: string,
  result: ContentProgressMigrationResult,
): string | null {
  if (prefix === "quiz_reward_") {
    const legacy = parseJson(legacyValue, key, result);
    const current = currentValue ? parseJson(currentValue, resolveProgressStorageKeyAlias(key), result) : null;
    if (!isRecord(legacy)) return currentValue ?? legacyValue;
    if (!isRecord(current)) return JSON.stringify(legacy);
    return JSON.stringify({
      ...current,
      ...legacy,
      date: maxString(asString(current.date), asString(legacy.date)),
      score: Math.max(asNumber(current.score), asNumber(legacy.score)),
      total: Math.max(asNumber(current.total), asNumber(legacy.total)),
    });
  }

  if (prefix === "exo_rewarded_") {
    const legacy = parseJson(legacyValue, key, result);
    const current = currentValue ? parseJson(currentValue, resolveProgressStorageKeyAlias(key), result) : [];
    const ids = new Set<string>([
      ...stringArray(current),
      ...stringArray(legacy),
    ]);
    return JSON.stringify([...ids].sort());
  }

  if (currentValue === "true" || legacyValue === "true") return "true";
  return currentValue ?? legacyValue;
}

function normalizeProgressEntry(value: UnknownRecord): ProgressEntry {
  return {
    ...value,
    cours: Boolean(value.cours),
    quiz: Boolean(value.quiz),
    flashcards: Boolean(value.flashcards),
    exercices: Boolean(value.exercices),
    bestQuizScore: asNumber(value.bestQuizScore),
    bestQuizTotal: asNumber(value.bestQuizTotal),
    flashKnownRatio: asNumber(value.flashKnownRatio),
  };
}

function normalizeLegacyPedagogieProgressEntry(value: UnknownRecord): ProgressEntry {
  const quizScore = Math.max(asNumber(value.bestQuizScore), asNumber(value.quizScore));
  const quizTotal = Math.max(asNumber(value.bestQuizTotal), asNumber(value.quizTotal));
  const flashcardsFlipped = asNumber(value.flashcardsFlipped);
  const flashcardsTotal = asNumber(value.flashcardsTotal);
  const flashKnownRatio = flashcardsTotal > 0
    ? Math.min(1, flashcardsFlipped / flashcardsTotal)
    : 0;

  return {
    cours: Boolean(value.cours),
    quiz: Boolean(value.quiz) || asNumber(value.quizAttempts) > 0 || quizScore > 0 || quizTotal > 0,
    flashcards: Boolean(value.flashcards) || Boolean(value.flashcardsCompleted) || flashcardsFlipped > 0,
    exercices: Boolean(value.exercices),
    bestQuizScore: quizScore,
    bestQuizTotal: quizTotal,
    flashKnownRatio: Math.max(asNumber(value.flashKnownRatio), flashKnownRatio),
  };
}

function mergeProgressEntries(a: ProgressEntry, b: ProgressEntry): ProgressEntry {
  return {
    ...a,
    ...b,
    cours: Boolean(a.cours || b.cours),
    quiz: Boolean(a.quiz || b.quiz),
    flashcards: Boolean(a.flashcards || b.flashcards),
    exercices: Boolean(a.exercices || b.exercices),
    bestQuizScore: Math.max(asNumber(a.bestQuizScore), asNumber(b.bestQuizScore)),
    bestQuizTotal: Math.max(asNumber(a.bestQuizTotal), asNumber(b.bestQuizTotal)),
    flashKnownRatio: Math.max(asNumber(a.flashKnownRatio), asNumber(b.flashKnownRatio)),
  };
}

function readGamificationStateForMerge(
  storage: ContentProgressStorage,
  result: ContentProgressMigrationResult,
): UnknownRecord | null {
  const raw = storage.getItem(GAMIFICATION_STORAGE_KEY);
  if (!raw) return { progress: {} };

  const parsed = parseJson(raw, GAMIFICATION_STORAGE_KEY, result);
  return isRecord(parsed) ? parsed : null;
}

function normalizeSrsCard(value: UnknownRecord, canonicalChapterId: string): SrsCardState {
  return {
    ...value,
    cardId: String(value.cardId),
    chapterId: canonicalChapterId,
    ease: asNumber(value.ease),
    interval: asNumber(value.interval),
    repetitions: asNumber(value.repetitions),
    nextReview: asString(value.nextReview),
    lastReview: asString(value.lastReview),
    lapses: asNumber(value.lapses),
  };
}

function mergeSrsCards(a: SrsCardState, b: SrsCardState): SrsCardState {
  return {
    ...a,
    ...b,
    chapterId: b.chapterId,
    cardId: b.cardId,
    ease: Math.max(asNumber(a.ease), asNumber(b.ease)),
    interval: Math.max(asNumber(a.interval), asNumber(b.interval)),
    repetitions: Math.max(asNumber(a.repetitions), asNumber(b.repetitions)),
    nextReview: maxString(asString(a.nextReview), asString(b.nextReview)),
    lastReview: maxString(asString(a.lastReview), asString(b.lastReview)),
    lapses: Math.min(asNumber(a.lapses), asNumber(b.lapses)),
  };
}

function listStorageKeys(storage: ContentProgressStorage): string[] {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key) keys.push(key);
  }
  return keys;
}

function parseJson(value: string, storageKey: string, result: ContentProgressMigrationResult): unknown {
  try {
    return JSON.parse(value);
  } catch {
    result.conflicts.push({
      storageKey,
      reason: "JSON illisible ignore pendant la migration.",
    });
    return null;
  }
}

function writeJson(
  storage: ContentProgressStorage,
  key: string,
  value: unknown,
  result: ContentProgressMigrationResult,
): void {
  try {
    storage.setItem(key, JSON.stringify(value));
    result.migratedKeys += 1;
  } catch {
    result.conflicts.push({
      storageKey: key,
      reason: "Impossible d'ecrire la donnee migree.",
    });
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function maxString(a: string, b: string): string {
  return a > b ? a : b;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function addSyncCandidate(
  result: ContentProgressMigrationResult,
  storageKey: string,
  canonicalId: string,
  kind: ContentProgressSyncCandidate["kind"],
): void {
  if (result.syncCandidates.some((candidate) => (
    candidate.storageKey === storageKey &&
    candidate.canonicalId === canonicalId &&
    candidate.kind === kind
  ))) {
    return;
  }

  result.syncCandidates.push({ storageKey, canonicalId, kind });
}
