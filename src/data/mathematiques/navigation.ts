import type { MathematicsResource } from "./types";

export const mathematicsMainNavigation: MathematicsResource[] = [
  {
    id: "college",
    title: "Collège",
    description: "Niveaux de la sixième à la troisième.",
    href: "/mathematiques/college",
    cycle: "college",
    status: "available",
  },
  {
    id: "lycee",
    title: "Lycée",
    description: "Niveaux et parcours du lycée.",
    href: "/mathematiques/lycee",
    cycle: "lycee",
    status: "available",
  },
];
