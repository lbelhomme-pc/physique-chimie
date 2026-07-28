export type SearchSubject = "physique-chimie" | "mathematiques";
export type SearchCycle = "college" | "lycee";
export type SearchAccessTier = "free" | "premium" | "teacher" | "draft";
export type SearchResourceType = "chapter" | "course" | "exercise" | "quiz" | "flashcard" | "laboratory" | "tool";

export interface GlobalSearchResource {
  id: string;
  title: string;
  description?: string;
  path: string;
  subject: SearchSubject;
  subjectLabel: string;
  cycle: SearchCycle;
  levelLabel: string;
  matiereLabel?: string;
  resourceType: SearchResourceType;
  accessTier?: SearchAccessTier;
  accessLabel?: string;
  slug?: string;
  keywords?: string[];
}

export interface SearchQueryOptions {
  query: string;
  subject?: SearchSubject | "all";
  cycle?: SearchCycle | "all";
  accessTier?: SearchAccessTier | "all";
  limit?: number;
}

export interface RankedSearchResource extends GlobalSearchResource {
  score: number;
}

const ACCESS_LABELS: Record<SearchAccessTier, string> = {
  free: "Gratuit",
  premium: "Premium",
  teacher: "Enseignant",
  draft: "Brouillon",
};

const RESOURCE_TYPE_LABELS: Record<SearchResourceType, string> = {
  chapter: "Chapitre",
  course: "Cours",
  exercise: "Exercice",
  quiz: "Quiz",
  flashcard: "Flashcard",
  laboratory: "Laboratoire",
  tool: "Outil",
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSearchAccessLabel(tier: SearchAccessTier = "free"): string {
  return ACCESS_LABELS[tier] ?? ACCESS_LABELS.free;
}

export function getSearchResourceTypeLabel(type: SearchResourceType): string {
  return RESOURCE_TYPE_LABELS[type] ?? type;
}

export function buildSearchDocument(resource: GlobalSearchResource): string {
  return normalizeSearchText([
    resource.title,
    resource.description ?? "",
    resource.slug ?? "",
    resource.id,
    resource.path,
    resource.subjectLabel,
    resource.cycle,
    resource.levelLabel,
    resource.matiereLabel ?? "",
    resource.accessLabel ?? getSearchAccessLabel(resource.accessTier),
    getSearchResourceTypeLabel(resource.resourceType),
    ...(resource.keywords ?? []),
  ].join(" "));
}

export function scoreSearchResource(resource: GlobalSearchResource, normalizedQuery: string): number {
  if (normalizedQuery.length < 2) return 0;

  const title = normalizeSearchText(resource.title);
  const slug = normalizeSearchText(resource.slug ?? resource.path.split("/").filter(Boolean).at(-1) ?? "");
  const keywords = (resource.keywords ?? []).map(normalizeSearchText);
  const description = normalizeSearchText(resource.description ?? "");
  const metadata = normalizeSearchText([
    resource.subjectLabel,
    resource.levelLabel,
    resource.matiereLabel ?? "",
    resource.cycle,
    getSearchResourceTypeLabel(resource.resourceType),
    resource.accessLabel ?? getSearchAccessLabel(resource.accessTier),
  ].join(" "));
  const document = buildSearchDocument(resource);

  let score = 0;
  if (title === normalizedQuery) score += 120;
  if (title.startsWith(normalizedQuery)) score += 80;
  if (title.includes(normalizedQuery)) score += 50;
  if (slug === normalizedQuery) score += 95;
  if (slug.includes(normalizedQuery)) score += 60;
  if (keywords.some((keyword) => keyword === normalizedQuery)) score += 75;
  if (keywords.some((keyword) => keyword.includes(normalizedQuery))) score += 45;
  if (normalizedQuery.length >= 3 && description.includes(normalizedQuery)) score += 25;
  if (normalizedQuery.length >= 3 && metadata.includes(normalizedQuery)) score += 15;
  if (normalizedQuery.length >= 3 && document.includes(normalizedQuery)) score += 5;

  return score;
}

export function searchResources(resources: GlobalSearchResource[], options: SearchQueryOptions): RankedSearchResource[] {
  const normalizedQuery = normalizeSearchText(options.query);
  if (normalizedQuery.length < 2) return [];

  const subject = options.subject ?? "all";
  const cycle = options.cycle ?? "all";
  const accessTier = options.accessTier ?? "all";
  const limit = options.limit ?? 12;

  return resources
    .filter((resource) => subject === "all" || resource.subject === subject)
    .filter((resource) => cycle === "all" || resource.cycle === cycle)
    .filter((resource) => accessTier === "all" || (resource.accessTier ?? "free") === accessTier)
    .map((resource) => ({ ...resource, score: scoreSearchResource(resource, normalizedQuery) }))
    .filter((resource) => resource.score > 0)
    .sort((a, b) =>
      b.score - a.score ||
      a.subject.localeCompare(b.subject) ||
      a.cycle.localeCompare(b.cycle) ||
      a.levelLabel.localeCompare(b.levelLabel) ||
      a.title.localeCompare(b.title),
    )
    .slice(0, limit);
}
