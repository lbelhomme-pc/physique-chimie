import type { MathematicsCycle, MathematicsLevel } from "./types";

export const mathematicsCollegeLevels: MathematicsLevel[] = [
  {
    slug: "6eme",
    label: "Sixième",
    shortLabel: "6e",
    cycle: "college",
    path: "/mathematiques/college/6eme",
    description: "Cours, exercices progressifs N1 à N3, quiz et flashcards conformes au programme officiel de mathématiques de 6e publié en 2025.",
    enabled: true,
    status: "available",
    order: 1,
  },
  {
    slug: "5eme",
    label: "Cinquième",
    shortLabel: "5e",
    cycle: "college",
    path: "/mathematiques/college/5eme",
    description: "Cours, exercices progressifs N1 à N3, quiz et flashcards conformes au programme officiel 2026 de mathématiques de 5e.",
    enabled: true,
    status: "available",
    order: 2,
  },
  {
    slug: "4eme",
    label: "Quatrième",
    shortLabel: "4e",
    cycle: "college",
    path: "/mathematiques/college/4eme",
    description: "Premier lot de cours, exercices N1 à N3, quiz et flashcards fondé sur le programme 2020 encore applicable en 4e en 2026-2027.",
    enabled: true,
    status: "available",
    order: 3,
  },
  {
    slug: "3eme",
    label: "Troisième",
    shortLabel: "3e",
    cycle: "college",
    path: "/mathematiques/college/3eme",
    description: "Premier lot de cours, exercices N1 à N3, quiz et flashcards fondé sur le programme 2020 encore applicable en 3e en 2026-2027.",
    enabled: true,
    status: "available",
    order: 4,
  },
];

export const mathematicsLyceeLevels: MathematicsLevel[] = [
  {
    slug: "2nde",
    label: "Seconde",
    shortLabel: "2nde",
    cycle: "lycee",
    path: "/mathematiques/lycee/2nde",
    description: "Cours, méthodes, exercices, quiz et flashcards pour le programme officiel de seconde générale et technologique.",
    enabled: true,
    status: "available",
    order: 1,
  },
  {
    slug: "1ere-generale",
    label: "Première générale",
    shortLabel: "1re générale",
    cycle: "lycee",
    path: "/mathematiques/lycee/1ere-generale",
    description: "Espace lycée à compléter progressivement.",
    enabled: true,
    status: "planned",
    order: 2,
  },
  {
    slug: "1ere-ens-scientifique",
    label: "Première — maths intégrées à l’enseignement scientifique",
    shortLabel: "1re maths intégrées ES",
    cycle: "lycee",
    path: "/mathematiques/lycee/1ere-ens-scientifique",
    description: "Mathématiques intégrées à l’enseignement scientifique en Première générale, conformes au programme officiel 2026.",
    enabled: true,
    status: "available",
    order: 2.5,
  },
  {
    slug: "1ere-technologique",
    label: "Première technologique",
    shortLabel: "1re techno",
    cycle: "lycee",
    path: "/mathematiques/lycee/1ere-technologique",
    description: "Espace lycée à compléter progressivement.",
    enabled: true,
    status: "planned",
    order: 3,
  },
  {
    slug: "1ere-specialite-mathematiques",
    label: "Première spécialité mathématiques",
    shortLabel: "1re spé maths",
    cycle: "lycee",
    path: "/mathematiques/lycee/1ere-specialite-mathematiques",
    description: "Cours, exercices progressifs N1 à N3, quiz et flashcards conformes au programme officiel 2026 de Première spécialité mathématiques.",
    enabled: true,
    status: "available",
    order: 4,
  },
  {
    slug: "terminale-generale",
    label: "Terminale générale",
    shortLabel: "Tle générale",
    cycle: "lycee",
    path: "/mathematiques/lycee/terminale-generale",
    description: "Espace lycée à compléter progressivement.",
    enabled: true,
    status: "planned",
    order: 5,
  },
  {
    slug: "terminale-technologique",
    label: "Terminale technologique",
    shortLabel: "Tle techno",
    cycle: "lycee",
    path: "/mathematiques/lycee/terminale-technologique",
    description: "Espace lycée à compléter progressivement.",
    enabled: true,
    status: "planned",
    order: 6,
  },
  {
    slug: "terminale-specialite-mathematiques",
    label: "Terminale spécialité mathématiques",
    shortLabel: "Tle spé maths",
    cycle: "lycee",
    path: "/mathematiques/lycee/terminale-specialite-mathematiques",
    description: "Programme complet de Terminale spécialité actuellement en vigueur, avec cours, exercices N1 à N3, quiz, flashcards, algorithmique et préparation au bac.",
    enabled: true,
    status: "available",
    order: 7,
  },
  {
    slug: "terminale-mathematiques-complementaires",
    label: "Terminale mathématiques complémentaires",
    shortLabel: "Maths complémentaires",
    cycle: "lycee",
    path: "/mathematiques/lycee/terminale-mathematiques-complementaires",
    description: "Programme complet de mathématiques complémentaires actuellement en vigueur, structuré selon les neuf thèmes officiels d'étude.",
    enabled: true,
    status: "available",
    order: 8,
  },
  {
    slug: "terminale-mathematiques-expertes",
    label: "Terminale mathématiques expertes",
    shortLabel: "Maths expertes",
    cycle: "lycee",
    path: "/mathematiques/lycee/terminale-mathematiques-expertes",
    description: "Espace lycée à compléter progressivement.",
    enabled: true,
    status: "planned",
    order: 9,
  },
];

export const allMathematicsLevels = [
  ...mathematicsCollegeLevels,
  ...mathematicsLyceeLevels,
].sort((a, b) => a.order - b.order);

export function getMathematicsLevelsByCycle(cycle: MathematicsCycle) {
  return (cycle === "college" ? mathematicsCollegeLevels : mathematicsLyceeLevels)
    .filter((level) => level.enabled)
    .sort((a, b) => a.order - b.order);
}

export function getMathematicsLevel(cycle: MathematicsCycle, slug: string) {
  return getMathematicsLevelsByCycle(cycle).find((level) => level.slug === slug) ?? null;
}

export function getMathematicsLevelLabel(cycleOrSlug: MathematicsCycle | string, maybeSlug?: string) {
  const slug = maybeSlug ?? cycleOrSlug;
  return allMathematicsLevels.find((level) => level.slug === slug)?.label ?? slug;
}

export function getMathematicsCycleLabel(cycle: MathematicsCycle) {
  return cycle === "college" ? "Collège" : "Lycée";
}
