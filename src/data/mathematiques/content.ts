import type {
  MathematicsChapterListItem,
  MathematicsChapterMeta,
  MathematicsCycle,
  MathematicsDomain,
} from "./types";
import { getMathematicsChapterPath } from "./paths";

interface ChapterSegments {
  cycle: MathematicsCycle;
  niveau: string;
  slug: string;
}

function asObjectModule(mod: unknown): Record<string, any> {
  const value = (mod as any)?.default ?? mod;
  return value && typeof value === "object" ? value as Record<string, any> : {};
}

export function getArrayPayload(raw: any, ...keys: string[]) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(raw[key])) return raw[key];
  }
  return [];
}

export function getChapterSegmentsFromMetaPath(path: string): ChapterSegments | null {
  const segments = path
    .replace("/src/data/mathematiques/chapters/", "")
    .replace("/meta.json", "")
    .split("/");
  const [cycle, niveau, slug] = segments;
  if ((cycle !== "college" && cycle !== "lycee") || !niveau || !slug) return null;
  return { cycle, niveau, slug };
}

export function chapterEntryFromGlob(path: string, mod: unknown): MathematicsChapterListItem | null {
  const segments = getChapterSegmentsFromMetaPath(path);
  if (!segments) return null;
  const data = asObjectModule(mod);
  const meta: MathematicsChapterMeta = {
    title: typeof data.title === "string" ? data.title : segments.slug,
    description: typeof data.description === "string" ? data.description : "",
    objectives: Array.isArray(data.objectives) ? data.objectives : undefined,
    cycle: segments.cycle,
    niveau: segments.niveau,
    slug: segments.slug,
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 99,
    theme: typeof data.theme === "string" ? data.theme : undefined,
    domain: typeof data.domain === "string" ? data.domain as MathematicsDomain : undefined,
    duration: typeof data.duration === "string" ? data.duration : undefined,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : undefined,
    competencies: Array.isArray(data.competencies) ? data.competencies : undefined,
    tools: Array.isArray(data.tools) ? data.tools : undefined,
    relatedChapters: Array.isArray(data.relatedChapters) ? data.relatedChapters : undefined,
    officialSource: typeof data.officialSource === "string" ? data.officialSource : undefined,
    xp: data.xp && typeof data.xp === "object" ? data.xp : undefined,
    seo: data.seo && typeof data.seo === "object" ? data.seo : undefined,
  };

  return {
    ...meta,
    path: getMathematicsChapterPath(segments.cycle, segments.niveau, segments.slug),
  };
}

export function sortMathematicsChapters<T extends { order?: number; title: string }>(chapters: T[]) {
  return [...chapters].sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title));
}

export function normalizeMathematicsExercises(raw: any) {
  return getArrayPayload(raw, "exercices", "exercises").map((item: any) => {
    const hints = item.hints ?? item.aides ?? {};
    const correction = item.correction;
    return {
      id: String(item.id ?? cryptoSafeId(item.title ?? item.statement ?? item.consigne ?? "exercice")),
      title: item.title ?? item.titre,
      difficulty: item.difficulty ?? item.difficulte,
      difficultyLabel: item.difficultyLabel ?? item.niveau,
      consigne: item.consigne ?? item.statement ?? "",
      correction: Array.isArray(correction) ? correction : correction ? [String(correction)] : [],
      aides: {
        indice: hints.indice ?? hints.clue ?? item.aide,
        methode: hints.methode ?? hints.method,
        rappelCours: hints.rappelCours ?? hints.reminder,
        erreurFrequente: hints.erreurFrequente ?? hints.commonMistake,
      },
      schemaSvg: item.schemaSvg ?? item.figure?.svg ?? null,
      schemaCaption: item.schemaCaption ?? item.figure?.caption ?? null,
      schemaAlt: item.schemaAlt ?? item.figure?.alt ?? item.figure?.description ?? null,
    };
  });
}

export function normalizePlayableMathematicsQuiz(raw: any) {
  return getArrayPayload(raw, "questions", "quiz")
    .filter((item: any) => Array.isArray(item.choices) && typeof item.answer === "number")
    .map((item: any) => ({
      id: String(item.id ?? cryptoSafeId(item.question ?? "question")),
      type: item.type ?? "mcq",
      question: item.question ?? "",
      choices: item.choices,
      answer: item.answer,
      explanation: item.explanation,
    }));
}

export function normalizeMathematicsFlashcards(raw: any) {
  return getArrayPayload(raw, "cards", "flashcards").map((item: any) => ({
    id: String(item.id ?? cryptoSafeId(item.front ?? item.recto ?? item.question ?? "flashcard")),
    front: item.front ?? item.recto ?? item.question ?? "",
    back: item.back ?? item.verso ?? item.answer ?? "",
    difficulty: item.difficulty,
    tags: item.tags,
  }));
}

export function getPedagogieXpConfig(meta: MathematicsChapterMeta) {
  const xp = meta.xp;
  if (!xp) return undefined;
  return {
    cours: xp.cours ?? xp.course,
    exercice_each: xp.exercice_each ?? xp.exercise,
    exercice_all: xp.exercice_all,
    quiz_base: xp.quiz_base ?? xp.quiz,
    quiz_per_correct: xp.quiz_per_correct,
    quiz_perfect: xp.quiz_perfect,
    flashcards_base: xp.flashcards_base ?? xp.flashcard,
    flashcard_known: xp.flashcard_known,
  };
}

function cryptoSafeId(value: string) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "item";
}
