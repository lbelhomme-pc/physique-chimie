import type { MathematicsChapterListItem, MathematicsCycle, MathematicsLevel } from "./mathematiques/types";

export type DisciplineRouteId = "physique-chimie" | "mathematiques" | "laboratoire";
export type CycleRouteId = "college" | "lycee";
export type PhysicalScienceSubject = "physique" | "chimie";
export type ResourceRouteKind = "chapter" | "course" | "exercise" | "quiz" | "flashcards" | "simulation";
export type RouteRedirectPhase = "active" | "prepared";
export type RouteMigrationStatus = "active-compatible" | "redirect-only" | "stable";

export interface PhysicalScienceChapterRouteInput {
  cycle: CycleRouteId;
  niveau: string;
  matiere: PhysicalScienceSubject;
  chapitre: string;
}

export interface ChapterRouteContext {
  discipline: DisciplineRouteId;
  cycle: CycleRouteId;
  niveau: string;
  matiere?: PhysicalScienceSubject;
  chapitre: string;
  resourceKind: ResourceRouteKind;
  legacyPath?: string;
  explicitPath: string;
  canonical: string;
}

export interface ChapterNavigationItem {
  slug: string;
  title: string;
  order: number;
}

export interface ChapterNavigationLink {
  title: string;
  href: string;
}

export interface PhysicalScienceRoutePair extends PhysicalScienceChapterRouteInput {
  legacyPath: string;
  explicitPath: string;
  canonicalPath: string;
  legacyStatus: Extract<RouteMigrationStatus, "redirect-only">;
  redirectPhase: Extract<RouteRedirectPhase, "active">;
  redirectStatus: 301;
}

export const PHYSICAL_SCIENCE_ROOT = "/physique-chimie";
export const V3_ROUTE_STRATEGY = {
  physicalScienceCanonicalMode: "explicit",
  physicalScienceLegacyStatus: "redirect-only",
  physicalScienceRedirectPhase: "active",
  physicalScienceRedirectStatus: 301,
  preserveLegacyPhysicalScienceContent: false,
  notFoundRoute: "/404",
} as const;

export const MEMORIZATION_CANONICAL_ROUTES = {
  megaQuiz: "/memorisation/mega-quiz",
  megaFlashcards: "/memorisation/mega-flashcards",
  dailyReview: "/memorisation/revision-du-jour",
} as const;

export const MEMORIZATION_LEGACY_REDIRECTS = {
  "/mega-quiz": MEMORIZATION_CANONICAL_ROUTES.megaQuiz,
  "/mega-flashcards": MEMORIZATION_CANONICAL_ROUTES.megaFlashcards,
} as const;

export function getPhysicalScienceLegacyChapterPath(
  cycle: CycleRouteId,
  niveau: string,
  matiere: PhysicalScienceSubject,
  chapitre: string,
): string {
  return `/${cycle}/${niveau}/${matiere}/${chapitre}`;
}

export function getPhysicalScienceExplicitChapterPath(
  cycle: CycleRouteId,
  niveau: string,
  matiere: PhysicalScienceSubject,
  chapitre: string,
): string {
  return `${PHYSICAL_SCIENCE_ROOT}/${cycle}/${niveau}/${matiere}/${chapitre}`;
}

export function getPhysicalScienceLevelPath(cycle: CycleRouteId, niveau: string): string {
  return `/${cycle}/${niveau}`;
}

export function getPhysicalScienceSubjectPath(cycle: CycleRouteId, niveau: string, matiere: PhysicalScienceSubject): string {
  return `/${cycle}/${niveau}/${matiere}`;
}

export function getPhysicalScienceRouteContext(
  cycle: CycleRouteId,
  niveau: string,
  matiere: PhysicalScienceSubject,
  chapitre: string,
  options: { canonicalMode?: "legacy" | "explicit" } = {},
): ChapterRouteContext {
  const legacyPath = getPhysicalScienceLegacyChapterPath(cycle, niveau, matiere, chapitre);
  const explicitPath = getPhysicalScienceExplicitChapterPath(cycle, niveau, matiere, chapitre);
  const canonicalMode = options.canonicalMode ?? V3_ROUTE_STRATEGY.physicalScienceCanonicalMode;
  return {
    discipline: "physique-chimie",
    cycle,
    niveau,
    matiere,
    chapitre,
    resourceKind: "chapter",
    legacyPath,
    explicitPath,
    canonical: canonicalMode === "explicit" ? explicitPath : legacyPath,
  };
}

export function getPhysicalScienceRoutePair(chapter: PhysicalScienceChapterRouteInput): PhysicalScienceRoutePair {
  const legacyPath = getPhysicalScienceLegacyChapterPath(chapter.cycle, chapter.niveau, chapter.matiere, chapter.chapitre);
  const explicitPath = getPhysicalScienceExplicitChapterPath(chapter.cycle, chapter.niveau, chapter.matiere, chapter.chapitre);

  return {
    ...chapter,
    legacyPath,
    explicitPath,
    canonicalPath: explicitPath,
    legacyStatus: V3_ROUTE_STRATEGY.physicalScienceLegacyStatus,
    redirectPhase: V3_ROUTE_STRATEGY.physicalScienceRedirectPhase,
    redirectStatus: V3_ROUTE_STRATEGY.physicalScienceRedirectStatus,
  };
}

export function getPhysicalScienceRoutePairs(chapters: PhysicalScienceChapterRouteInput[]): PhysicalScienceRoutePair[] {
  return chapters.map(getPhysicalScienceRoutePair);
}

export function getMathematicsRouteContext(
  cycle: MathematicsCycle,
  niveau: string,
  chapitre: string,
): ChapterRouteContext {
  const explicitPath = `/mathematiques/${cycle}/${niveau}/${chapitre}`;
  return {
    discipline: "mathematiques",
    cycle,
    niveau,
    chapitre,
    resourceKind: "chapter",
    explicitPath,
    canonical: explicitPath,
  };
}

export function getChapterNavigation(
  chapters: ChapterNavigationItem[],
  currentSlug: string,
  hrefForSlug: (slug: string) => string,
): { previousChapter: ChapterNavigationLink | null; nextChapter: ChapterNavigationLink | null } {
  const ordered = [...chapters].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const index = ordered.findIndex((item) => item.slug === currentSlug);
  return {
    previousChapter: index > 0 ? { title: ordered[index - 1].title, href: hrefForSlug(ordered[index - 1].slug) } : null,
    nextChapter: index >= 0 && index < ordered.length - 1
      ? { title: ordered[index + 1].title, href: hrefForSlug(ordered[index + 1].slug) }
      : null,
  };
}

export function getPublishedMathematicsLevels(
  levels: MathematicsLevel[],
  chapters: Array<MathematicsChapterListItem | null | undefined>,
): MathematicsLevel[] {
  const publishedSlugs = new Set(
    chapters
      .filter((chapter): chapter is MathematicsChapterListItem => Boolean(chapter))
      .map((chapter) => `${chapter.cycle}:${chapter.niveau}`),
  );
  return levels
    .filter((level) => level.enabled && level.status === "available" && publishedSlugs.has(`${level.cycle}:${level.slug}`))
    .sort((a, b) => a.order - b.order);
}

export function getFuturePhysicalScienceRedirects(contexts: ChapterRouteContext[]): Record<string, string> {
  return Object.fromEntries(
    contexts
      .filter((context) => context.legacyPath)
      .map((context) => [context.legacyPath!, context.explicitPath]),
  );
}
