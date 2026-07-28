export type DisciplineId = "physique-chimie" | "mathematiques" | "laboratoire";
export type CycleId = "college" | "lycee";

export type ResourceKind =
  | "chapter"
  | "course"
  | "exercise"
  | "quiz"
  | "quiz-question"
  | "flashcard"
  | "flashcard-deck"
  | "tool"
  | "simulation";

export type PhysicalScienceSubjectId = "physique" | "chimie" | (string & {});
export type MemorizationResourceKind =
  | "mega-quiz"
  | "mega-flashcards"
  | "revision-du-jour"
  | (string & {});

export interface PhysicalScienceChapterContentIdOptions {
  discipline: "physique-chimie";
  cycle: CycleId;
  niveau: string;
  matiere: PhysicalScienceSubjectId;
  chapitre: string;
}

export interface MathematicsChapterContentIdOptions {
  discipline: "mathematiques";
  cycle: CycleId;
  niveau: string;
  chapitre: string;
}

export type ChapterContentIdOptions =
  | PhysicalScienceChapterContentIdOptions
  | MathematicsChapterContentIdOptions;

export type ChapterContentIdInput = string | ChapterContentIdOptions;

export interface ChapterResourceContentIdOptions {
  chapter: ChapterContentIdInput;
}

export interface ExerciseContentIdOptions extends ChapterResourceContentIdOptions {
  exerciseId: string;
}

export interface QuizQuestionContentIdOptions extends ChapterResourceContentIdOptions {
  questionId: string;
}

export interface FlashcardContentIdOptions extends ChapterResourceContentIdOptions {
  flashcardId: string;
}

export interface LaboratoryContentIdOptions {
  slug: string;
  kind?: Extract<ResourceKind, "tool" | "simulation">;
  resourceId?: string;
}

export interface MemorizationContentIdOptions {
  kind: MemorizationResourceKind;
  sourceId?: string;
}

export type ContentIdAliases = Readonly<Record<string, readonly string[]>>;
export type LegacyIdRisk = "FAIBLE" | "MODERE" | "ELEVE" | "CRITIQUE";
export type ProgressStorageKeyPrefix =
  | "quiz_reward_"
  | "exo_rewarded_"
  | "exo_all_rewarded_"
  | "chapter_complete_";
export type LegacyIdKind =
  | "chapter"
  | "course"
  | "quiz"
  | "flashcard-deck"
  | "srs-flashcard"
  | "quiz-reward-key"
  | "exercise-reward-key"
  | "exercise-all-reward-key"
  | "chapter-complete-key"
  | "progress-entry";

export interface LegacyContentIdAliasRule {
  kind: LegacyIdKind;
  scope: DisciplineId;
  legacyFormat: string;
  canonicalFormat: string;
  risk: LegacyIdRisk;
  comment?: string;
}

const SEPARATOR = ":";
const SPLIT_SEPARATORS = /[/:\\]+/;
const DUPLICATE_DASHES = /-+/g;
const DIACRITICS = /[\u0300-\u036f]/g;
const DISALLOWED_ID_CHARS = /[^a-z0-9.-]+/g;
const CANONICAL_ID_PART = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const PHYSICAL_SCIENCE_DISCIPLINE = "physique-chimie" as const;
export const CONTENT_PROGRESS_MIGRATION_VERSION = 1;
export const CONTENT_PROGRESS_MIGRATION_KEY = `content_progress_migration_v${CONTENT_PROGRESS_MIGRATION_VERSION}`;
const CANONICAL_ID_NAMESPACES = new Set([
  "physique-chimie",
  "mathematiques",
  "laboratoire",
  "memorisation",
]);

// Internal ids use ":" separators. Public URLs keep "/" and must not be derived
// from display labels. Future localStorage migrations should resolve old ids via
// aliases instead of deleting or rewriting existing keys abruptly.
export function normalizeIdPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(SPLIT_SEPARATORS, "-")
    .replace(DISALLOWED_ID_CHARS, "-")
    .replace(DUPLICATE_DASHES, "-")
    .replace(/^-|-$/g, "");
}

export function buildContentId(parts: string[]): string {
  return parts
    .flatMap((part) => part.split(SPLIT_SEPARATORS))
    .map(normalizeIdPart)
    .filter(Boolean)
    .join(SEPARATOR);
}

export function isCanonicalIdPart(value: string): boolean {
  return CANONICAL_ID_PART.test(value);
}

function hasValidChapterResourceSuffix(parts: string[]): boolean {
  if (parts.length === 0) {
    return true;
  }

  const [kind, resourceId] = parts;

  if (kind === "course" || kind === "flashcards") {
    return parts.length === 1;
  }

  if (kind === "quiz") {
    return parts.length === 1 || (parts.length === 2 && isCanonicalIdPart(resourceId));
  }

  if (kind === "exercise" || kind === "flashcard") {
    return parts.length === 2 && isCanonicalIdPart(resourceId);
  }

  return false;
}

function hasCanonicalContentIdShape(parts: string[]): boolean {
  const [namespace] = parts;

  if (namespace === "physique-chimie") {
    const [, cycle, level, subject, chapter, ...resourceSuffix] = parts;

    return (
      parts.length >= 5 &&
      (cycle === "college" || cycle === "lycee") &&
      Boolean(level && subject && chapter) &&
      hasValidChapterResourceSuffix(resourceSuffix)
    );
  }

  if (namespace === "mathematiques") {
    const [, cycle, level, chapter, ...resourceSuffix] = parts;

    return (
      parts.length >= 4 &&
      (cycle === "college" || cycle === "lycee") &&
      Boolean(level && chapter) &&
      hasValidChapterResourceSuffix(resourceSuffix)
    );
  }

  if (namespace === "laboratoire") {
    const [, slug, kind, resourceId] = parts;

    return (
      Boolean(slug) &&
      (parts.length === 2 ||
        ((kind === "tool" || kind === "simulation") &&
          (parts.length === 3 || (parts.length === 4 && Boolean(resourceId)))))
    );
  }

  if (namespace === "memorisation") {
    return parts.length >= 2 && parts.length <= 3;
  }

  return false;
}

export function buildChapterContentId(options: ChapterContentIdOptions): string {
  if (options.discipline === "mathematiques") {
    return buildContentId([
      options.discipline,
      options.cycle,
      options.niveau,
      options.chapitre,
    ]);
  }

  return buildContentId([
    options.discipline,
    options.cycle,
    options.niveau,
    options.matiere,
    options.chapitre,
  ]);
}

export function buildCourseContentId(options: ChapterResourceContentIdOptions): string {
  return buildContentId([getChapterContentId(options.chapter), "course"]);
}

export function buildExerciseContentId(options: ExerciseContentIdOptions): string {
  return buildContentId([getChapterContentId(options.chapter), "exercise", options.exerciseId]);
}

export function buildQuizContentId(options: ChapterResourceContentIdOptions): string {
  return buildContentId([getChapterContentId(options.chapter), "quiz"]);
}

export function buildQuizQuestionContentId(options: QuizQuestionContentIdOptions): string {
  return buildContentId([getChapterContentId(options.chapter), "quiz", options.questionId]);
}

export function buildFlashcardDeckContentId(options: ChapterResourceContentIdOptions): string {
  return buildContentId([getChapterContentId(options.chapter), "flashcards"]);
}

export function buildFlashcardContentId(options: FlashcardContentIdOptions): string {
  return buildContentId([getChapterContentId(options.chapter), "flashcard", options.flashcardId]);
}

export function buildLaboratoryContentId(options: LaboratoryContentIdOptions): string {
  return buildContentId([
    "laboratoire",
    options.slug,
    options.kind ?? "",
    options.resourceId ?? "",
  ]);
}

export function buildMemorizationContentId(options: MemorizationContentIdOptions): string {
  return buildContentId(["memorisation", options.kind, options.sourceId ?? ""]);
}

// Non-destructive alias layer for a future migration of persisted progress.
// It never reads or writes localStorage: old ids must remain readable through
// aliases and must not be deleted abruptly. Any application integration must be
// handled by a separate prompt.
export const PHYSIQUE_CHIMIE_LEGACY_ID_ALIAS_RULES = Object.freeze([
  {
    kind: "chapter",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "college/{niveau}/{matiere}/{chapitre}",
    canonicalFormat: "physique-chimie:college:{niveau}:{matiere}:{chapitre}",
    risk: "ELEVE",
    comment: "Legacy chapterId produced by college chapter routes and dashboard data.",
  },
  {
    kind: "chapter",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "lycee/{niveau}/{matiere}/{chapitre}",
    canonicalFormat: "physique-chimie:lycee:{niveau}:{matiere}:{chapitre}",
    risk: "ELEVE",
    comment: "Legacy chapterId produced by lycee chapter routes and dashboard data.",
  },
  {
    kind: "course",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "{cycle}/{niveau}/{matiere}/{chapitre}",
    canonicalFormat: "physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}:course",
    risk: "ELEVE",
    comment: "Course completion currently uses the chapterId as the persisted key.",
  },
  {
    kind: "quiz",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "{cycle}/{niveau}/{matiere}/{chapitre}",
    canonicalFormat: "physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}:quiz",
    risk: "ELEVE",
    comment: "Quiz progression currently aggregates scores by chapterId.",
  },
  {
    kind: "flashcard-deck",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "{cycle}/{niveau}/{matiere}/{chapitre}",
    canonicalFormat: "physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}:flashcards",
    risk: "ELEVE",
    comment: "Flashcard deck completion currently aggregates by chapterId.",
  },
  {
    kind: "srs-flashcard",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "{cycle}/{niveau}/{matiere}/{chapitre}::{flashcardId}",
    canonicalFormat: "physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}:flashcard:{flashcardId}",
    risk: "ELEVE",
    comment: "SRS card state currently composes chapterId and cardId with ::.",
  },
  {
    kind: "quiz-reward-key",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "quiz_reward_{cycle}/{niveau}/{matiere}/{chapitre}",
    canonicalFormat: "quiz_reward_physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}",
    risk: "ELEVE",
    comment: "Documented for future storage-key aliasing only; not resolved here.",
  },
  {
    kind: "exercise-reward-key",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "exo_rewarded_{cycle}/{niveau}/{matiere}/{chapitre}",
    canonicalFormat: "exo_rewarded_physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}",
    risk: "ELEVE",
    comment: "Documented for future storage-key aliasing only; not resolved here.",
  },
  {
    kind: "exercise-all-reward-key",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "exo_all_rewarded_{cycle}/{niveau}/{matiere}/{chapitre}",
    canonicalFormat: "exo_all_rewarded_physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}",
    risk: "ELEVE",
    comment: "Documented for future storage-key aliasing only; not resolved here.",
  },
  {
    kind: "chapter-complete-key",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: "chapter_complete_{cycle}/{niveau}/{matiere}/{chapitre}",
    canonicalFormat: "chapter_complete_physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}",
    risk: "ELEVE",
    comment: "Documented for future storage-key aliasing only; not resolved here.",
  },
  {
    kind: "progress-entry",
    scope: PHYSICAL_SCIENCE_DISCIPLINE,
    legacyFormat: 'progress["{cycle}/{niveau}/{matiere}/{chapitre}"]',
    canonicalFormat: 'progress["physique-chimie:{cycle}:{niveau}:{matiere}:{chapitre}"]',
    risk: "ELEVE",
    comment: "Documented for future gamification_state merging only; not resolved here.",
  },
] satisfies readonly LegacyContentIdAliasRule[]);

export const LEGACY_CONTENT_ID_ALIASES: ContentIdAliases = Object.freeze({});
export const PROGRESS_STORAGE_KEY_PREFIXES: readonly ProgressStorageKeyPrefix[] = Object.freeze([
  "quiz_reward_",
  "exo_rewarded_",
  "exo_all_rewarded_",
  "chapter_complete_",
]);

export function getContentIdAliases(contentId: string): readonly string[] {
  const normalized = buildContentId([contentId]);
  return unique([
    ...(LEGACY_CONTENT_ID_ALIASES[normalized] ?? []),
    ...getPhysicalScienceLegacyContentIdCandidates(normalized),
  ]);
}

export function getLegacyContentIdCandidates(canonicalId: string): readonly string[] {
  return getContentIdAliases(canonicalId);
}

export function isCanonicalContentId(id: string): boolean {
  const trimmed = id.trim();

  if (!trimmed || trimmed !== id || trimmed.includes("/") || trimmed.includes("\\")) {
    return false;
  }

  const normalized = buildContentId([trimmed]);

  if (normalized !== id) {
    return false;
  }

  const parts = normalized.split(SEPARATOR);
  return (
    CANONICAL_ID_NAMESPACES.has(parts[0]) &&
    parts.every(isCanonicalIdPart) &&
    hasCanonicalContentIdShape(parts)
  );
}

export function resolveContentIdAlias(id: string): string {
  const normalized = buildContentId([id]);

  if (LEGACY_CONTENT_ID_ALIASES[normalized]) {
    return normalized;
  }

  for (const [contentId, aliases] of Object.entries(LEGACY_CONTENT_ID_ALIASES)) {
    if (aliases.map((alias) => buildContentId([alias])).includes(normalized)) {
      return contentId;
    }
  }

  return resolvePhysicalScienceLegacyContentId(id) ?? (isCanonicalContentId(id) ? normalized : id);
}

export function resolveChapterContentId(id: string): string {
  return resolveContentIdAlias(id);
}

export function getCanonicalProgressStorageKey(prefix: ProgressStorageKeyPrefix, chapterId: string): string {
  return `${prefix}${resolveChapterContentId(chapterId)}`;
}

export function resolveProgressStorageKeyAlias(key: string): string {
  const prefix = PROGRESS_STORAGE_KEY_PREFIXES.find((candidate) => key.startsWith(candidate));
  if (!prefix) return key;

  const legacyOrCanonicalId = key.slice(prefix.length);
  return getCanonicalProgressStorageKey(prefix, legacyOrCanonicalId);
}

export function getProgressStorageKeyAliases(prefix: ProgressStorageKeyPrefix, canonicalChapterId: string): readonly string[] {
  return getContentIdAliases(canonicalChapterId).map((alias) => `${prefix}${alias}`);
}

function getChapterContentId(chapter: ChapterContentIdInput): string {
  return typeof chapter === "string" ? buildContentId([chapter]) : buildChapterContentId(chapter);
}

function getPhysicalScienceLegacyContentIdCandidates(canonicalId: string): string[] {
  const parts = canonicalId.split(SEPARATOR);

  if (parts[0] !== PHYSICAL_SCIENCE_DISCIPLINE || parts.length < 5) {
    return [];
  }

  const [, cycle, niveau, matiere, chapitre, resourceKind, resourceId] = parts;

  if (!isCycleId(cycle)) {
    return [];
  }

  const legacyChapterId = [cycle, niveau, matiere, chapitre].join("/");

  if (!resourceKind) {
    return [legacyChapterId];
  }

  if (resourceKind === "course" || resourceKind === "quiz" || resourceKind === "flashcards") {
    return [legacyChapterId];
  }

  if (resourceKind === "flashcard" && resourceId) {
    return [`${legacyChapterId}::${resourceId}`];
  }

  return [];
}

function resolvePhysicalScienceLegacyContentId(id: string): string | undefined {
  const [legacyChapterId, flashcardId] = id.trim().split("::");
  const parts = legacyChapterId.split("/");

  if (parts.length !== 4) {
    return undefined;
  }

  const [cycle, niveau, matiere, chapitre] = parts;

  if (!isCycleId(cycle) || !niveau || !matiere || !chapitre) {
    return undefined;
  }

  const chapterId = buildChapterContentId({
    discipline: PHYSICAL_SCIENCE_DISCIPLINE,
    cycle,
    niveau,
    matiere,
    chapitre,
  });

  return flashcardId
    ? buildFlashcardContentId({ chapter: chapterId, flashcardId })
    : chapterId;
}

function isCycleId(value: string): value is CycleId {
  return value === "college" || value === "lycee";
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}
