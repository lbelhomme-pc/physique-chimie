import {
  ChapterPackageContractSchema,
  CONTENT_CONTRACT_VERSION,
  formatZodIssues,
  type ChapterContract,
  type ChapterPackageContract,
  type AccessibilityAlternative,
  type AccessPolicy,
  type Competence,
  type ContentBlock,
  type ContentLink,
  type Cycle,
  type Discipline,
  type ExerciseContract,
  type FlashcardContract,
  type Lesson,
  type PedagogicalSource,
  type QuizQuestionContract,
  type RelatedChapter,
  type SeoMetadata,
} from "./contentContract.ts";
import { buildChapterContentId, normalizeIdPart } from "../utils/contentIds.ts";
import { PUBLISHED_CONTENT_SCHOOL_YEAR, resolveCurriculumVersion } from "./curriculumVersions.ts";

type UnknownRecord = Record<string, unknown>;

export interface ChapterPackageInput {
  sourcePath: string;
  discipline: Exclude<Discipline, "laboratoire">;
  cycle: Cycle;
  niveau: string;
  slug: string;
  matiere?: "physique" | "chimie";
  meta: unknown;
  coursePath: string;
  coursePresent: boolean;
  courseFormat: "mdx" | "legacy-html-fragment";
  exercices?: unknown;
  quiz?: unknown;
  flashcards?: unknown;
}

export interface ContentContractResult {
  package: ChapterPackageContract | null;
  errors: string[];
  warnings: string[];
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()) : [];
}

function asNumber(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function asDifficulty(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asArrayPayload(raw: unknown, keys: string[], adaptedFields: string[], family: string): unknown[] {
  if (Array.isArray(raw)) {
    adaptedFields.push(`${family}:array-root`);
    return raw;
  }
  const record = asRecord(raw);
  for (const key of keys) {
    if (Array.isArray(record[key])) {
      if (key !== keys[0]) adaptedFields.push(`${family}:${key}->${keys[0]}`);
      return record[key] as unknown[];
    }
  }
  return [];
}

function sourceFormat(raw: unknown, canonicalKey: string, aliases: string[]): string {
  if (Array.isArray(raw)) return "array-root";
  const record = asRecord(raw);
  if (Array.isArray(record[canonicalKey])) return canonicalKey;
  const alias = aliases.find((key) => Array.isArray(record[key]));
  return alias ?? "absent";
}

function normalizeAccess(value: unknown): AccessPolicy {
  const record = asRecord(value);
  const tier = record.tier === "premium" || record.tier === "teacher" || record.tier === "draft" ? record.tier : "free";
  return {
    tier,
    preview: asBoolean(record.preview) ?? true,
    requiresAccount: asBoolean(record.requiresAccount) ?? false,
    premiumReason: asString(record.premiumReason),
  };
}

function normalizeBlockType(value: unknown): ContentBlock["type"] {
  return value === "definition" ||
    value === "property" ||
    value === "law" ||
    value === "formula" ||
    value === "method" ||
    value === "example" ||
    value === "warning" ||
    value === "diagram" ||
    value === "graph" ||
    value === "simulation" ||
    value === "table" ||
    value === "html"
    ? value
    : "text";
}

function normalizeAccessibility(value: unknown): AccessibilityAlternative {
  const record = asRecord(value);
  return {
    altText: asString(record.altText) ?? asString(record.alt),
    longDescription: asString(record.longDescription) ?? asString(record.description),
    transcript: asString(record.transcript),
    formulaText: asString(record.formulaText) ?? asString(record.formuleTexte),
  };
}

function normalizeLinks(value: unknown): ContentLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string" && item.trim()) {
        const href = item.trim();
        return { label: href, href };
      }
      const record = asRecord(item);
      const href = asString(record.href) ?? asString(record.url) ?? asString(record.route);
      const label = asString(record.label) ?? asString(record.title) ?? href;
      if (!href || !label) return null;
      return {
        id: asString(record.id),
        label,
        href,
        kind:
          record.kind === "course" ||
          record.kind === "exercise" ||
          record.kind === "quiz" ||
          record.kind === "flashcard" ||
          record.kind === "laboratory" ||
          record.kind === "tool" ||
          record.kind === "source" ||
          record.kind === "download" ||
          record.kind === "external"
            ? record.kind
            : "related" as const,
      };
    })
    .filter((item): item is ContentLink => Boolean(item));
}

function normalizeSources(value: unknown, officialSource: unknown): PedagogicalSource[] {
  const sources = Array.isArray(value) ? value : officialSource ? [officialSource] : [];
  return sources
    .map((item, index) => {
      if (typeof item === "string" && item.trim()) {
        return {
          id: item.trim(),
          label: item.trim(),
          kind: "official" as const,
        };
      }
      const record = asRecord(item);
      const id = asString(record.id) ?? `source-${index + 1}`;
      const label = asString(record.label) ?? asString(record.title) ?? asString(record.name) ?? id;
      return {
        id,
        label,
        kind:
          record.kind === "official" ||
          record.kind === "textbook" ||
          record.kind === "dataset" ||
          record.kind === "media" ||
          record.kind === "internal"
            ? record.kind
            : "other" as const,
        url: asString(record.url),
        citation: asString(record.citation),
        retrievedAt: asString(record.retrievedAt),
      };
    });
}

function normalizeCompetences(value: unknown): Competence[] {
  return asStringArray(value).map((label) => ({
    id: normalizeIdPart(label),
    label,
  }));
}

function normalizeBlocks(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const record = asRecord(item);
    return {
      id: asString(record.id) ?? `block-${index + 1}`,
      type: normalizeBlockType(record.type),
      title: asString(record.title),
      body: asString(record.body) ?? asString(record.text) ?? asString(record.content),
      html: asString(record.html),
      htmlTrusted: record.htmlTrusted === true ? true as const : undefined,
      formula: asString(record.formula),
      sourceIds: asStringArray(record.sourceIds),
      links: normalizeLinks(record.links),
      accessibility: normalizeAccessibility(record.accessibility),
    };
  });
}

function normalizeLessons(value: unknown): Lesson[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const record = asRecord(item);
    return {
      id: asString(record.id) ?? `lesson-${index + 1}`,
      title: asString(record.title) ?? `Lecon ${index + 1}`,
      summary: asString(record.summary) ?? asString(record.description),
      order: asNumber(record.order) ?? index + 1,
      duration: record.duration as string | number | undefined,
      objectives: asStringArray(record.objectives),
      blocks: normalizeBlocks(record.blocks),
      links: normalizeLinks(record.links),
    };
  });
}

function normalizeSeo(meta: UnknownRecord, routeCanonical: string, adaptedFields: string[]): SeoMetadata {
  const seo = asRecord(meta.seo);
  const title = asString(seo.title) ?? asString(seo.meta_title);
  const description = asString(seo.description) ?? asString(seo.meta_description);
  if (seo.title === undefined && seo.meta_title !== undefined) adaptedFields.push("seo.meta_title->seo.title");
  if (seo.description === undefined && seo.meta_description !== undefined) adaptedFields.push("seo.meta_description->seo.description");
  return {
    title,
    description,
    canonical: asString(seo.canonical) ?? routeCanonical,
    noindex: typeof seo.noindex === "boolean" ? seo.noindex : undefined,
    schemaType: asString(seo.schema_type),
    educationalLevel: asString(seo.educationalLevel),
  };
}

function normalizeOfficialSource(value: unknown) {
  const id = asString(value);
  return id ? { id } : undefined;
}

function programmeSourceId(meta: UnknownRecord, sources: PedagogicalSource[]): string | undefined {
  const programme = asString(meta.programme);
  if (programme?.startsWith("bo-")) return programme;
  const officialSource = asString(meta.officialSource);
  if (officialSource) return officialSource;
  return sources.find((source) => source.kind === "official")?.id;
}

function normalizeRelatedChapters(value: unknown): RelatedChapter[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string" && item.trim()) return { slug: item.trim(), relation: "related" as const };
      const record = asRecord(item);
      const slug = asString(record.slug);
      if (!slug) return null;
      return {
        id: asString(record.id),
        slug,
        relation: record.relation === "previous" || record.relation === "next" || record.relation === "prerequisite" || record.relation === "extension"
          ? record.relation
          : "related" as const,
      };
    })
    .filter((item): item is RelatedChapter => Boolean(item));
}

function normalizeCorrection(value: unknown) {
  if (Array.isArray(value)) {
    return { kind: "steps" as const, available: value.length > 0, content: value.map(String) };
  }
  if (typeof value === "string" && value.trim()) {
    return { kind: "text" as const, available: true, content: [value.trim()] };
  }
  return { kind: "text" as const, available: false, content: [] };
}

function normalizeExercises(raw: unknown, adaptedFields: string[]): ExerciseContract[] {
  const source = sourceFormat(raw, "exercices", ["exercises"]);
  return asArrayPayload(raw, ["exercices", "exercises"], adaptedFields, "exercices").map((item, index) => {
    const record = asRecord(item);
    const statement = asString(record.consigne) ?? asString(record.statement) ?? asString(record.title) ?? asString(record.titre);
    const correction = normalizeCorrection(record.correction);
    return {
      contractVersion: CONTENT_CONTRACT_VERSION,
      id: asString(record.id) ?? `exercice-${index + 1}`,
      title: asString(record.title) ?? asString(record.titre),
      statement: statement ?? `Exercice ${index + 1}`,
      access: normalizeAccess(record.access),
      blocks: normalizeBlocks(record.blocks),
      links: normalizeLinks(record.links),
      sources: normalizeSources(record.sources, record.officialSource),
      competences: normalizeCompetences(record.competences ?? record.skills),
      accessibility: normalizeAccessibility(record.accessibility ?? {
        altText: asString(record.schemaAlt),
        longDescription: asString(record.schemaCaption),
      }),
      difficulty: asDifficulty(record.difficulty ?? record.difficulte ?? record.difficultyLabel ?? record.niveau),
      duration: asString(record.estimatedTime),
      correctionAvailable: correction.available,
      correction,
      tags: asStringArray(record.tags),
      skills: asStringArray(record.skills),
      sourceFormat: source,
    };
  });
}

function normalizeQuiz(raw: unknown, adaptedFields: string[]): QuizQuestionContract[] {
  const source = sourceFormat(raw, "questions", ["quiz"]);
  return asArrayPayload(raw, ["questions", "quiz"], adaptedFields, "quiz").map((item, index) => {
    const record = asRecord(item);
    const answer = record.answer ?? record.correctAnswer;
    if (record.answer === undefined && record.correctAnswer !== undefined) adaptedFields.push("quiz.correctAnswer->answer");
    return {
      contractVersion: CONTENT_CONTRACT_VERSION,
      id: asString(record.id) ?? `question-${index + 1}`,
      type: asString(record.type) ?? "mcq",
      question: asString(record.question) ?? `Question ${index + 1}`,
      access: normalizeAccess(record.access),
      blocks: normalizeBlocks(record.blocks),
      links: normalizeLinks(record.links),
      sources: normalizeSources(record.sources, record.officialSource),
      competences: normalizeCompetences(record.competences ?? record.skills),
      accessibility: normalizeAccessibility(record.accessibility),
      choices: asStringArray(record.choices),
      answer: typeof answer === "number" || typeof answer === "string" || typeof answer === "boolean" || Array.isArray(answer) ? answer as number | string | boolean | number[] : 0,
      explanation: asString(record.explanation),
      difficulty: asDifficulty(record.difficulty),
      skills: asStringArray(record.skills),
      sourceFormat: source,
    };
  });
}

function normalizeFlashcards(raw: unknown, adaptedFields: string[]): FlashcardContract[] {
  const source = sourceFormat(raw, "cards", ["flashcards"]);
  return asArrayPayload(raw, ["cards", "flashcards"], adaptedFields, "flashcards").map((item, index) => {
    const record = asRecord(item);
    const front = asString(record.front) ?? asString(record.recto) ?? asString(record.question);
    const back = asString(record.back) ?? asString(record.verso) ?? asString(record.answer);
    if (record.front === undefined && (record.recto !== undefined || record.question !== undefined)) adaptedFields.push("flashcards.recto/question->front");
    if (record.back === undefined && (record.verso !== undefined || record.answer !== undefined)) adaptedFields.push("flashcards.verso/answer->back");
    return {
      contractVersion: CONTENT_CONTRACT_VERSION,
      id: asString(record.id) ?? `flashcard-${index + 1}`,
      front: front ?? `Flashcard ${index + 1}`,
      back: back ?? "",
      access: normalizeAccess(record.access),
      links: normalizeLinks(record.links),
      sources: normalizeSources(record.sources, record.officialSource),
      competences: normalizeCompetences(record.competences ?? record.tags),
      accessibility: normalizeAccessibility(record.accessibility),
      difficulty: asDifficulty(record.difficulty),
      tags: asStringArray(record.tags),
      sourceFormat: source,
    };
  });
}

function canonicalIdFor(input: ChapterPackageInput): string {
  if (input.discipline === "mathematiques") {
    return buildChapterContentId({
      discipline: "mathematiques",
      cycle: input.cycle,
      niveau: input.niveau,
      chapitre: input.slug,
    });
  }

  if (!input.matiere) {
    throw new Error(`${input.sourcePath} :: matiere :: matiere physique-chimie manquante`);
  }

  return buildChapterContentId({
    discipline: "physique-chimie",
    cycle: input.cycle,
    niveau: input.niveau,
    matiere: input.matiere,
    chapitre: input.slug,
  });
}

function classify(missing: string[], adaptedFields: string[], messages: string[]) {
  if (messages.length > 0) return "bloquant" as const;
  if (missing.length > 0) return "incomplet-publiable" as const;
  if (adaptedFields.length > 0) return "adapte" as const;
  return "conforme" as const;
}

export function normalizeChapterPackage(input: ChapterPackageInput): ContentContractResult {
  const meta = asRecord(input.meta);
  const adaptedFields: string[] = [];
  const missingEditorialFields: string[] = [];
  const messages: string[] = [];
  const routeCanonical = input.discipline === "mathematiques"
    ? `/mathematiques/${input.cycle}/${input.niveau}/${input.slug}`
    : `/${input.cycle}/${input.niveau}/${input.matiere}/${input.slug}`;

  const title = asString(meta.title);
  const description = asString(meta.description);
  const programme = asString(meta.theme) ?? asString(meta.domain) ?? asString(meta.source);
  if (!title) messages.push(`${input.sourcePath} :: title :: titre manquant`);
  if (!description) messages.push(`${input.sourcePath} :: description :: description manquante`);
  if (input.discipline === "physique-chimie" && !input.matiere) messages.push(`${input.sourcePath} :: matiere :: matiere physique-chimie manquante`);
  if (!programme) missingEditorialFields.push("programme");

  const objectives = asStringArray(meta.objectives);
  if (objectives.length === 0) missingEditorialFields.push("objectives");
  const competencies = asStringArray(meta.competencies);
  if (competencies.length === 0) missingEditorialFields.push("competencies");
  const access = normalizeAccess(meta.access);
  const links = normalizeLinks(meta.links);
  const sources = normalizeSources(meta.sources, meta.officialSource);
  const curriculumSourceId = programmeSourceId(meta, sources);
  const resolvedProgrammeVersion = curriculumSourceId
    ? resolveCurriculumVersion({
        discipline: input.discipline,
        cycle: input.cycle,
        niveau: input.niveau,
        schoolYear: PUBLISHED_CONTENT_SCHOOL_YEAR,
        sourceId: curriculumSourceId,
      })
    : null;
  if (!curriculumSourceId) {
    messages.push(`${input.sourcePath} :: programmeVersion :: source officielle de programme manquante`);
  } else if (!resolvedProgrammeVersion) {
    messages.push(
      `${input.sourcePath} :: programmeVersion :: ${curriculumSourceId} non applicable ou non enregistre pour ${PUBLISHED_CONTENT_SCHOOL_YEAR}`,
    );
  }
  const competences = normalizeCompetences(meta.competences ?? meta.competencies);
  const lessons = normalizeLessons(meta.lessons ?? meta.lecons);
  const blocks = normalizeBlocks(meta.blocks ?? meta.blocs);
  const prerequisites = asStringArray(meta.prerequisites);
  if (prerequisites.length === 0) missingEditorialFields.push("prerequisites");
  if (meta.status === undefined) adaptedFields.push("publicationStatus:public-route->published");

  if (messages.length > 0 || !resolvedProgrammeVersion) {
    return {
      package: null,
      errors: messages,
      warnings: missingEditorialFields.map((field) => `${input.sourcePath} :: ${field} :: donnee editoriale manquante`),
    };
  }

  const chapter: ChapterContract = {
    contractVersion: CONTENT_CONTRACT_VERSION,
    canonicalId: canonicalIdFor(input),
    discipline: input.discipline,
    cycle: input.cycle,
    niveau: input.niveau,
    programme: programme ?? "non-renseigne",
    programmeVersion: {
      versionId: resolvedProgrammeVersion.id,
      officialSourceId: resolvedProgrammeVersion.officialSourceId,
      label: resolvedProgrammeVersion.label,
      track: resolvedProgrammeVersion.track,
      publishedOn: resolvedProgrammeVersion.publishedOn,
      officialUrl: resolvedProgrammeVersion.officialUrl,
      schoolYear: resolvedProgrammeVersion.schoolYear,
      appliesFrom: resolvedProgrammeVersion.appliesFrom,
      ...(resolvedProgrammeVersion.appliesUntil ? { appliesUntil: resolvedProgrammeVersion.appliesUntil } : {}),
      applicable: true,
    },
    contentQualityVersion: asNumber(meta.contentQualityVersion),
    curriculumItems: asStringArray(meta.curriculumItems),
    slug: input.slug,
    title: title ?? input.slug,
    description: description ?? "Description non renseignee",
    objectives,
    access,
    lessons,
    blocks,
    links,
    sources,
    duration: meta.duration as string | number | undefined,
    prerequisites,
    competencies,
    competences,
    publicationStatus: meta.status === "draft" || meta.status === "archived" ? meta.status : "published",
    seo: normalizeSeo(meta, routeCanonical, adaptedFields),
    notion: asString(meta.notion),
    difficulty: meta.difficulty as string | number | undefined,
    correctionAvailable: undefined,
    tags: [...asStringArray(meta.tags), ...asStringArray(meta.keywords)],
    officialSource: normalizeOfficialSource(meta.officialSource),
    relatedChapters: normalizeRelatedChapters(meta.relatedChapters),
    tools: asStringArray(meta.tools),
    simulations: [],
    order: asNumber(meta.order),
    updatedAt: asString(meta.updatedAt),
    sourcePath: input.sourcePath,
    legacy: {
      adaptedFields: [...new Set(adaptedFields)],
      missingEditorialFields: [...new Set(missingEditorialFields)],
      sourceFormat: input.discipline === "mathematiques" ? "mathematiques-meta-v1" : "physique-chimie-meta-v1",
    },
    ...(input.matiere ? { matiere: input.matiere } : {}),
  };

  const exercises = normalizeExercises(input.exercices, adaptedFields);
  const quiz = normalizeQuiz(input.quiz, adaptedFields);
  const flashcards = normalizeFlashcards(input.flashcards, adaptedFields);
  const candidate = {
    chapter: {
      ...chapter,
      legacy: {
        ...chapter.legacy,
        adaptedFields: [...new Set(adaptedFields)],
      },
    },
    course: {
      path: input.coursePath,
      format: input.courseFormat,
      present: input.coursePresent,
    },
    activities: [
      { id: `${chapter.canonicalId}:course`, title: "Cours", kind: "course" as const, access, duration: typeof chapter.duration === "string" ? chapter.duration : undefined, links: [] },
      { id: `${chapter.canonicalId}:exercise`, title: "Exercices", kind: "exercise" as const, access, correctionAvailable: exercises.some((item) => item.correctionAvailable), links: [] },
      { id: `${chapter.canonicalId}:quiz`, title: "Quiz", kind: "quiz" as const, access, links: [] },
      { id: `${chapter.canonicalId}:flashcards`, title: "Flashcards", kind: "flashcard-deck" as const, access, links: [] },
    ],
    exercises,
    quiz,
    flashcards,
    validation: {
      status: classify(missingEditorialFields, adaptedFields, messages),
      messages: [...messages, ...missingEditorialFields.map((field) => `${input.sourcePath} :: ${field} :: donnee editoriale manquante`)],
    },
  };

  const parsed = ChapterPackageContractSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      package: null,
      errors: [...messages, ...formatZodIssues(input.sourcePath, parsed.error)],
      warnings: [],
    };
  }

  return {
    package: parsed.data,
    errors: messages,
    warnings: missingEditorialFields.map((field) => `${input.sourcePath} :: ${field} :: donnee editoriale manquante`),
  };
}
