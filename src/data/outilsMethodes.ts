export type OutilMethodeType = "outil" | "methode";
export type OutilMethodeLevel = "college" | "lycee" | "transverse";

export interface OutilMethodeResource {
  title: string;
  href: string;
  type: OutilMethodeType;
  levels: OutilMethodeLevel[];
  theme: string;
  description: string;
  details: string;
  symbol: string;
}

export const outilsMethodesResources: OutilMethodeResource[] = [
  {
    title: "Kit scientifique",
    href: "/outils-methodes/kit-scientifique",
    type: "outil",
    levels: ["college", "lycee", "transverse"],
    theme: "Calculs et vérifications",
    description: "Calculatrice, convertisseur, traceur, équilibreur et préparation de solutions.",
    details: "À utiliser quand l'élève doit faire, vérifier ou visualiser rapidement un calcul.",
    symbol: "Σ",
  },
  {
    title: "Tableau périodique interactif",
    href: "/outils-methodes/tableau-periodique",
    type: "outil",
    levels: ["college", "lycee", "transverse"],
    theme: "Chimie",
    description: "Recherche par nom, symbole ou numéro atomique, avec fiches d'éléments.",
    details: "Ressource de consultation utile dès le collège et encore au lycée.",
    symbol: "H",
  },
  {
    title: "Méthodes maths physique-chimie collège",
    href: "/outils-methodes/methodes-maths-college",
    type: "methode",
    levels: ["college"],
    theme: "Maths pour la physique-chimie",
    description: "Conversions, formules, proportionnalité, graphiques, puissances de 10, arrondis et rédaction.",
    details: "Fiches méthodes complètes pour refaire les calculs attendus en physique-chimie au collège.",
    symbol: "fx",
  },
  {
    title: "Formulaires collège",
    href: "/outils-methodes/formulaires-college",
    type: "methode",
    levels: ["college"],
    theme: "Relations utiles",
    description: "Relations de mécanique, électricité, chimie et signaux, avec unités et pièges.",
    details: "À utiliser comme aide-mémoire pour choisir une relation et vérifier les unités.",
    symbol: "=",
  },
  {
    title: "Méthodes numériques - Seconde",
    href: "/outils-methodes/seconde-numerique",
    type: "methode",
    levels: ["lycee"],
    theme: "Données et numérique",
    description: "Tableur, histogrammes, nuages de points, modèles, capteurs et Python.",
    details: "Fiches méthodes liées aux chapitres de seconde : mesures, mouvement, signaux et capteurs.",
    symbol: "#",
  },
  {
    title: "Méthodes maths physique-chimie lycée",
    href: "/outils-methodes/methodes-maths-lycee",
    type: "methode",
    levels: ["lycee"],
    theme: "Maths pour la physique-chimie",
    description: "Conversions, algèbre, proportionnalité, graphes, vecteurs, dérivées, incertitudes et rédaction bac.",
    details: "Fiches méthodes de la seconde à la terminale pour choisir et justifier les outils mathématiques utiles.",
    symbol: "∫",
  },
  {
    title: "Python en physique-chimie",
    href: "/outils-methodes/python",
    type: "methode",
    levels: ["lycee", "transverse"],
    theme: "Python",
    description: "Scripts guidés pour tracer, modéliser et exploiter des données expérimentales.",
    details: "Fiche de méthode pour comprendre à quoi sert Python dans les activités scientifiques.",
    symbol: "Py",
  },
  {
    title: "Cours Python lycée",
    href: "/outils-methodes/cours-python",
    type: "methode",
    levels: ["lycee", "transverse"],
    theme: "Python",
    description: "Variables, listes, boucles, conditions, fonctions, graphiques et exercices.",
    details: "Cours progressif pour apprendre à lire, modifier et écrire de petits scripts.",
    symbol: "Py",
  },
  {
    title: "Laboratoire Python",
    href: "/outils-methodes/python-lab",
    type: "outil",
    levels: ["lycee", "transverse"],
    theme: "Python interactif",
    description: "Tester de petits scripts directement dans le navigateur avec Pyodide.",
    details: "Outil d'exécution : l'élève peut lancer du code, voir une sortie texte ou un graphique.",
    symbol: "▶",
  },
];

export const typeLabels: Record<OutilMethodeType, string> = {
  outil: "Outils",
  methode: "Méthodes",
};

export const typeDefinitions: Record<OutilMethodeType, string> = {
  outil: "Un outil aide à faire, calculer, vérifier, visualiser ou manipuler.",
  methode: "Une méthode donne une démarche à apprendre, refaire et justifier.",
};

export function getResourcesByLevel(level: OutilMethodeLevel) {
  return outilsMethodesResources.filter((resource) => resource.levels.includes(level));
}

export function getResourcesByType(resources: OutilMethodeResource[], type: OutilMethodeType) {
  return resources.filter((resource) => resource.type === type);
}
