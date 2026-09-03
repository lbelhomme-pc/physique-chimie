import { z } from "zod";

export const CONTENT_CONTRACT_VERSION = 2;

export const DisciplineSchema = z.enum(["physique-chimie", "mathematiques", "laboratoire"]);
export const CycleSchema = z.enum(["college", "lycee"]);
export const MatiereSchema = z.enum(["physique", "chimie"]);
export const PublicationStatusSchema = z.enum(["draft", "published", "archived"]);

export const SchoolYearSchema = z.string().regex(/^\d{4}-\d{4}$/).superRefine((value, context) => {
  const [start, end] = value.split("-").map(Number);
  if (end !== start + 1) {
    context.addIssue({
      code: "custom",
      message: "School year must contain consecutive years",
    });
  }
});

export const ProgrammeVersionSchema = z.object({
  versionId: z.string().min(1),
  officialSourceId: z.string().min(1),
  label: z.string().min(1),
  track: z.string().min(1),
  publishedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  officialUrl: z.url(),
  schoolYear: SchoolYearSchema,
  appliesFrom: SchoolYearSchema,
  appliesUntil: SchoolYearSchema.optional(),
  applicable: z.literal(true),
}).superRefine((programme, context) => {
  if (programme.appliesUntil && programme.appliesUntil < programme.appliesFrom) {
    context.addIssue({
      code: "custom",
      path: ["appliesUntil"],
      message: "Programme application end must not precede application start",
    });
  }
  if (programme.schoolYear < programme.appliesFrom || (programme.appliesUntil && programme.schoolYear > programme.appliesUntil)) {
    context.addIssue({
      code: "custom",
      path: ["schoolYear"],
      message: "Programme is not applicable for the selected school year",
    });
  }
});
export const ResourceDifficultySchema = z.enum(["initiation", "entrainement", "approfondissement", "expert"]);
export const AccessTierSchema = z.enum(["free", "premium", "teacher", "draft"]);
export const ContentBlockTypeSchema = z.enum([
  "text",
  "definition",
  "property",
  "law",
  "formula",
  "method",
  "example",
  "warning",
  "diagram",
  "graph",
  "simulation",
  "table",
  "html",
]);

export const AccessPolicySchema = z.object({
  tier: AccessTierSchema.default("free"),
  preview: z.boolean().default(true),
  requiresAccount: z.boolean().default(false),
  premiumReason: z.string().min(1).optional(),
});

const DEFAULT_ACCESS_POLICY = {
  tier: "free" as const,
  preview: true,
  requiresAccount: false,
};

export const CompetenceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  domain: z.string().min(1).optional(),
  level: z.enum(["decouvrir", "sentrainer", "maitriser", "approfondir"]).optional(),
  description: z.string().min(1).optional(),
});

export const AccessibilityAlternativeSchema = z.object({
  altText: z.string().min(1).optional(),
  longDescription: z.string().min(1).optional(),
  transcript: z.string().min(1).optional(),
  formulaText: z.string().min(1).optional(),
});

export const ContentLinkSchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1),
  href: z.union([z.string().startsWith("/"), z.url()]),
  kind: z.enum(["course", "exercise", "quiz", "flashcard", "laboratory", "tool", "source", "download", "external", "related"]).default("related"),
});

export const SeoMetadataSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  canonical: z.string().min(1),
  noindex: z.boolean().optional(),
  schemaType: z.string().min(1).optional(),
  educationalLevel: z.string().min(1).optional(),
});

export const OfficialSourceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).optional(),
  url: z.url().optional(),
});

export const PedagogicalSourceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["official", "textbook", "dataset", "media", "internal", "other"]).default("other"),
  url: z.url().optional(),
  citation: z.string().min(1).optional(),
  retrievedAt: z.string().min(1).optional(),
});

export const RelatedChapterSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(1),
  relation: z.enum(["previous", "next", "prerequisite", "extension", "related"]).default("related"),
});

export const SimulationLinkSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  route: z.string().startsWith("/"),
  title: z.string().min(1).optional(),
});

export const CorrectionSchema = z.object({
  kind: z.enum(["text", "steps", "html", "formula"]).default("text"),
  available: z.boolean(),
  content: z.array(z.string()).default([]),
});

export const ContentBlockSchema = z.object({
  id: z.string().min(1),
  type: ContentBlockTypeSchema,
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  html: z.string().min(1).optional(),
  htmlTrusted: z.literal(true).optional(),
  formula: z.string().min(1).optional(),
  sourceIds: z.array(z.string().min(1)).default([]),
  links: z.array(ContentLinkSchema).default([]),
  accessibility: AccessibilityAlternativeSchema.default({}),
}).superRefine((block, context) => {
  if (block.html && block.htmlTrusted !== true) {
    context.addIssue({
      code: "custom",
      path: ["htmlTrusted"],
      message: "HTML content must be explicitly marked as trusted",
    });
  }

  if (["diagram", "graph", "simulation"].includes(block.type) && !block.accessibility.altText && !block.accessibility.longDescription) {
    context.addIssue({
      code: "custom",
      path: ["accessibility"],
      message: "Visual blocks require altText or longDescription",
    });
  }

  if (block.type === "formula" && !block.accessibility.formulaText && !block.accessibility.altText) {
    context.addIssue({
      code: "custom",
      path: ["accessibility"],
      message: "Formula blocks require formulaText or altText",
    });
  }
});

export const LessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1).optional(),
  order: z.number().refine(Number.isFinite, "Expected finite number").optional(),
  duration: z.union([z.string().min(1), z.number().positive()]).optional(),
  objectives: z.array(z.string()).default([]),
  blocks: z.array(ContentBlockSchema).default([]),
  links: z.array(ContentLinkSchema).default([]),
});

export const ExerciseSchema = z.object({
  contractVersion: z.literal(CONTENT_CONTRACT_VERSION),
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  statement: z.string().min(1),
  access: AccessPolicySchema.default(DEFAULT_ACCESS_POLICY),
  blocks: z.array(ContentBlockSchema).default([]),
  links: z.array(ContentLinkSchema).default([]),
  sources: z.array(PedagogicalSourceSchema).default([]),
  competences: z.array(CompetenceSchema).default([]),
  accessibility: AccessibilityAlternativeSchema.default({}),
  difficulty: z.union([ResourceDifficultySchema, z.number().int().min(1).max(5), z.string().min(1)]).optional(),
  duration: z.string().min(1).optional(),
  correctionAvailable: z.boolean(),
  correction: CorrectionSchema.optional(),
  tags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  sourceFormat: z.string().min(1),
});

export const QuizQuestionSchema = z.object({
  contractVersion: z.literal(CONTENT_CONTRACT_VERSION),
  id: z.string().min(1),
  type: z.string().min(1),
  question: z.string().min(1),
  access: AccessPolicySchema.default(DEFAULT_ACCESS_POLICY),
  blocks: z.array(ContentBlockSchema).default([]),
  links: z.array(ContentLinkSchema).default([]),
  sources: z.array(PedagogicalSourceSchema).default([]),
  competences: z.array(CompetenceSchema).default([]),
  accessibility: AccessibilityAlternativeSchema.default({}),
  choices: z.array(z.string()).min(2),
  answer: z.union([z.number().int(), z.array(z.number().int()), z.string().min(1), z.boolean()]),
  explanation: z.string().optional(),
  difficulty: z.union([ResourceDifficultySchema, z.number().int().min(1).max(5), z.string().min(1)]).optional(),
  skills: z.array(z.string()).default([]),
  sourceFormat: z.string().min(1),
});

export const FlashcardSchema = z.object({
  contractVersion: z.literal(CONTENT_CONTRACT_VERSION),
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  access: AccessPolicySchema.default(DEFAULT_ACCESS_POLICY),
  links: z.array(ContentLinkSchema).default([]),
  sources: z.array(PedagogicalSourceSchema).default([]),
  competences: z.array(CompetenceSchema).default([]),
  accessibility: AccessibilityAlternativeSchema.default({}),
  difficulty: z.union([ResourceDifficultySchema, z.number().int().min(1).max(5), z.string().min(1)]).optional(),
  tags: z.array(z.string()).default([]),
  sourceFormat: z.string().min(1),
});

export const ActivitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: z.enum(["course", "exercise", "quiz", "flashcard-deck", "simulation", "tool"]),
  access: AccessPolicySchema.default(DEFAULT_ACCESS_POLICY),
  duration: z.string().min(1).optional(),
  correctionAvailable: z.boolean().optional(),
  links: z.array(ContentLinkSchema).default([]),
});

export const ChapterContractSchema = z.object({
  contractVersion: z.literal(CONTENT_CONTRACT_VERSION),
  canonicalId: z.string().min(1),
  discipline: DisciplineSchema,
  cycle: CycleSchema,
  niveau: z.string().min(1),
  matiere: MatiereSchema.optional(),
  programme: z.string().min(1),
  programmeVersion: ProgrammeVersionSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  objectives: z.array(z.string()).default([]),
  access: AccessPolicySchema.default(DEFAULT_ACCESS_POLICY),
  lessons: z.array(LessonSchema).default([]),
  blocks: z.array(ContentBlockSchema).default([]),
  links: z.array(ContentLinkSchema).default([]),
  sources: z.array(PedagogicalSourceSchema).default([]),
  duration: z.union([z.string().min(1), z.number().positive()]).optional(),
  prerequisites: z.array(z.string()).default([]),
  competencies: z.array(z.string()).default([]),
  competences: z.array(CompetenceSchema).default([]),
  publicationStatus: PublicationStatusSchema,
  seo: SeoMetadataSchema,
  notion: z.string().min(1).optional(),
  difficulty: z.union([ResourceDifficultySchema, z.number().int().min(1).max(5), z.string().min(1)]).optional(),
  correctionAvailable: z.boolean().optional(),
  tags: z.array(z.string()).default([]),
  officialSource: OfficialSourceSchema.optional(),
  relatedChapters: z.array(RelatedChapterSchema).default([]),
  tools: z.array(z.string()).default([]),
  simulations: z.array(SimulationLinkSchema).default([]),
  order: z.number().refine(Number.isFinite, "Expected finite number").optional(),
  updatedAt: z.string().min(1).optional(),
  sourcePath: z.string().min(1),
  legacy: z.object({
    adaptedFields: z.array(z.string()).default([]),
    missingEditorialFields: z.array(z.string()).default([]),
    sourceFormat: z.string().min(1),
  }),
});

export const ChapterPackageContractSchema = z.object({
  chapter: ChapterContractSchema,
  course: z.object({
    path: z.string().min(1),
    format: z.enum(["mdx", "legacy-html-fragment"]),
    present: z.boolean(),
  }),
  activities: z.array(ActivitySchema).default([]),
  exercises: z.array(ExerciseSchema).default([]),
  quiz: z.array(QuizQuestionSchema).default([]),
  flashcards: z.array(FlashcardSchema).default([]),
  validation: z.object({
    status: z.enum(["conforme", "adapte", "incomplet-publiable", "bloquant"]),
    messages: z.array(z.string()).default([]),
  }),
});

export type Discipline = z.infer<typeof DisciplineSchema>;
export type Cycle = z.infer<typeof CycleSchema>;
export type PublicationStatus = z.infer<typeof PublicationStatusSchema>;
export type SchoolYear = z.infer<typeof SchoolYearSchema>;
export type ProgrammeVersion = z.infer<typeof ProgrammeVersionSchema>;
export type AccessPolicy = z.infer<typeof AccessPolicySchema>;
export type Competence = z.infer<typeof CompetenceSchema>;
export type AccessibilityAlternative = z.infer<typeof AccessibilityAlternativeSchema>;
export type ContentLink = z.infer<typeof ContentLinkSchema>;
export type PedagogicalSource = z.infer<typeof PedagogicalSourceSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type SeoMetadata = z.infer<typeof SeoMetadataSchema>;
export type OfficialSource = z.infer<typeof OfficialSourceSchema>;
export type RelatedChapter = z.infer<typeof RelatedChapterSchema>;
export type SimulationLink = z.infer<typeof SimulationLinkSchema>;
export type ExerciseContract = z.infer<typeof ExerciseSchema>;
export type QuizQuestionContract = z.infer<typeof QuizQuestionSchema>;
export type FlashcardContract = z.infer<typeof FlashcardSchema>;
export type ChapterContract = z.infer<typeof ChapterContractSchema>;
export type ChapterPackageContract = z.infer<typeof ChapterPackageContractSchema>;

export function formatZodIssues(file: string, error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const field = issue.path.length ? issue.path.join(".") : "(racine)";
    return `${file} :: ${field} :: ${issue.message}`;
  });
}
