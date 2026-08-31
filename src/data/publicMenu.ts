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
    title: "Mémorisation",
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
    title: "Kit scientifique",
    href: "/outils-methodes/kit-scientifique",
    tone: "kit",
    discipline: "transversal",
    links: [
      { label: "Laboratoire virtuel", href: "/laboratoire" },
      { label: "Tableau périodique", href: "/outils-methodes/tableau-periodique" },
      { label: "Calculatrice scientifique", href: "/outils-methodes/kit-scientifique#calculator" },
      { label: "Convertisseur d'unités", href: "/outils-methodes/kit-scientifique#converter" },
      { label: "Traceur graphique", href: "/outils-methodes/kit-scientifique#graph" },
      { label: "Préparation d'une solution", href: "/outils-methodes/kit-scientifique#solution" },
      { label: "Équilibrer une équation chimique", href: "/outils-methodes/kit-scientifique#balance" },
    ],
  },
] as const satisfies readonly PublicMenuSection[];
