export interface PhysiqueChimiePortalLink {
  id: string;
  title: string;
  description: string;
  href: string;
}

export const physiqueChimieMainNavigation: readonly PhysiqueChimiePortalLink[] = [
  {
    id: "college",
    title: "Collège",
    description: "Sciences et technologie en 6e, puis Physique-Chimie en 5e, 4e et 3e.",
    href: "/college",
  },
  {
    id: "lycee",
    title: "Lycée",
    description: "Seconde, spécialité Physique-Chimie et Enseignement scientifique.",
    href: "/lycee",
  },
] as const;

export const physiqueChimieLyceeTracks: readonly PhysiqueChimiePortalLink[] = [
  {
    id: "2nde",
    title: "Seconde",
    description: "Physique-Chimie de seconde générale et technologique.",
    href: "/lycee/2nde",
  },
  {
    id: "1ere-spe",
    title: "Première — spécialité PC",
    description: "Parcours de spécialité Physique-Chimie en première.",
    href: "/lycee/1ere-spe",
  },
  {
    id: "1ere-ens-scientifique",
    title: "Première — Enseignement scientifique",
    description: "Parcours Enseignement scientifique rattaché à l’espace Physique-Chimie.",
    href: "/lycee/1ere-ens-scientifique",
  },
  {
    id: "terminale-spe",
    title: "Terminale — spécialité PC",
    description: "Parcours de spécialité Physique-Chimie en terminale.",
    href: "/lycee/terminale-spe",
  },
  {
    id: "terminale-ens-scientifique",
    title: "Terminale — Enseignement scientifique",
    description: "Parcours Enseignement scientifique rattaché à l’espace Physique-Chimie.",
    href: "/lycee/terminale-ens-scientifique",
  },
] as const;

export const physiqueChimieResourceNavigation: readonly PhysiqueChimiePortalLink[] = [
  {
    id: "laboratoire",
    title: "Laboratoire virtuel",
    description: "Simulations et activités réellement interactives pour expérimenter.",
    href: "/laboratoire",
  },
  {
    id: "methodes",
    title: "Outils et méthodes",
    description: "Mesures, conversions, graphiques, rédaction et méthodes scientifiques.",
    href: "/outils-methodes",
  },
  {
    id: "memorisation",
    title: "Mémorisation",
    description: "Quiz et flashcards pour réviser les notions déjà publiées.",
    href: "/memorisation",
  },
] as const;
