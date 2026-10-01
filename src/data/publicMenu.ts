export type PublicMenuTone = "maths" | "pc" | "science" | "memory" | "kit";

export interface PublicMenuLink {
  label: string;
  href: string;
}

export interface PublicMenuSection {
  title: string;
  href: string;
  tone: PublicMenuTone;
  discipline: "mathematiques" | "physique-chimie" | "transversal";
  links: readonly PublicMenuLink[];
}

export const publicMenuSections = [
  {
    title: "Mathématiques",
    href: "/mathematiques",
    tone: "maths",
    discipline: "mathematiques",
    links: [
      { label: "Collège", href: "/mathematiques/college" },
      { label: "Lycée", href: "/mathematiques/lycee" },
      { label: "Méthodes", href: "/outils-methodes/methodes-maths-lycee" },
    ],
  },
  {
    title: "Physique-Chimie",
    href: "/physique-chimie",
    tone: "pc",
    discipline: "physique-chimie",
    links: [
      { label: "Collège", href: "/college" },
      { label: "Lycée", href: "/lycee" },
      { label: "Méthodes", href: "/outils-methodes" },
    ],
  },
  {
    title: "Réviser",
    href: "/memorisation",
    tone: "memory",
    discipline: "transversal",
    links: [
      { label: "QCM et quiz", href: "/memorisation/mega-quiz" },
      { label: "Flashcards", href: "/memorisation/mega-flashcards" },
      { label: "Exercices", href: "/college" },
    ],
  },
  {
    title: "Outils",
    href: "/outils-methodes/kit-scientifique",
    tone: "kit",
    discipline: "transversal",
    links: [
      { label: "Laboratoire virtuel", href: "/laboratoire" },
      { label: "Kit scientifique", href: "/outils-methodes/kit-scientifique" },
      { label: "Tableau périodique", href: "/outils-methodes/tableau-periodique" },
      { label: "Méthodes", href: "/outils-methodes" },
    ],
  },
] as const satisfies readonly PublicMenuSection[];
