export type KitToolId =
  | "calculator"
  | "converter"
  | "graph"
  | "balance"
  | "solution"
  | "measure"
  | "safety";

export interface KitUnitFamily {
  id: string;
  label: string;
  baseUnit: string;
  units: { label: string; factor: number }[];
}

export interface KitMethodCard {
  id: string;
  title: string;
  toolId: KitToolId;
  objective: string;
  steps: string[];
  example: string;
  commonMistake: string;
}

export interface KitChapterLink {
  title: string;
  href: string;
  level: string;
  toolIds: KitToolId[];
  usage: string;
}

export interface KitQuizQuestion {
  id: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export const kitUnitFamilies: KitUnitFamily[] = [
  { id: "length", label: "Longueur", baseUnit: "m", units: [
    { label: "km", factor: 1000 }, { label: "m", factor: 1 }, { label: "dm", factor: 0.1 }, { label: "cm", factor: 0.01 }, { label: "mm", factor: 0.001 },
  ] },
  { id: "mass", label: "Masse", baseUnit: "g", units: [
    { label: "kg", factor: 1000 }, { label: "g", factor: 1 }, { label: "mg", factor: 0.001 },
  ] },
  { id: "volume", label: "Volume", baseUnit: "L", units: [
    { label: "m3", factor: 1000 }, { label: "L", factor: 1 }, { label: "dL", factor: 0.1 }, { label: "cL", factor: 0.01 }, { label: "mL", factor: 0.001 }, { label: "cm3", factor: 0.001 },
  ] },
  { id: "time", label: "Duree", baseUnit: "s", units: [
    { label: "h", factor: 3600 }, { label: "min", factor: 60 }, { label: "s", factor: 1 }, { label: "ms", factor: 0.001 },
  ] },
  { id: "speed", label: "Vitesse", baseUnit: "m/s", units: [
    { label: "km/h", factor: 1 / 3.6 }, { label: "m/s", factor: 1 }, { label: "cm/s", factor: 0.01 },
  ] },
  { id: "energy", label: "Energie", baseUnit: "J", units: [
    { label: "kWh", factor: 3600000 }, { label: "kJ", factor: 1000 }, { label: "J", factor: 1 }, { label: "eV", factor: 1.602e-19 },
  ] },
];

export const kitMethodCards: KitMethodCard[] = [
  {
    id: "grandeurs-unites",
    title: "Identifier grandeur, valeur et unite",
    toolId: "converter",
    objective: "Eviter les calculs justes avec une unite fausse.",
    steps: ["Repere la grandeur cherchee.", "Convertis toutes les donnees dans des unites compatibles.", "Ecris le resultat avec son unite."],
    example: "100 mL = 0,100 L avant d'utiliser une concentration en g/L.",
    commonMistake: "Melanger mL et L dans la meme relation.",
  },
  {
    id: "graphique",
    title: "Tracer et lire un graphique",
    toolId: "graph",
    objective: "Verifier une proportionnalite et lire une pente utile.",
    steps: ["Place la grandeur choisie en abscisse.", "Indique les unites sur les axes.", "Trace les points puis interprete la tendance."],
    example: "Pour U = f(I), une droite passant par l'origine indique un conducteur ohmique.",
    commonMistake: "Oublier que la pente porte une unite.",
  },
  {
    id: "solution",
    title: "Preparer une solution",
    toolId: "solution",
    objective: "Calculer une masse a peser ou un volume a prelever.",
    steps: ["Identifie dissolution ou dilution.", "Convertis le volume en L si necessaire.", "Verifie que le protocole est realisable en securite."],
    example: "Pour Cm = 5,0 g/L et V = 100 mL, il faut m = 0,50 g.",
    commonMistake: "Utiliser V en mL dans m = Cm x V.",
  },
  {
    id: "securite",
    title: "Lire la securite avant manipulation",
    toolId: "safety",
    objective: "Relier le calcul au protocole experimental reel.",
    steps: ["Lis les pictogrammes et consignes.", "Choisis lunettes, blouse ou gants si besoin.", "Ne goute jamais et ne pipette jamais a la bouche."],
    example: "Pour une dilution d'acide, on verse l'acide dans l'eau, doucement.",
    commonMistake: "Commencer la manipulation avant d'avoir identifie le risque.",
  },
];

export const kitChapterLinks: KitChapterLink[] = [
  {
    title: "Proprietes de la matiere",
    href: "/college/5eme/chimie/proprietes-matiere/",
    level: "5e",
    toolIds: ["converter", "measure"],
    usage: "Associer masse, volume, temperature, pression, unite et appareil.",
  },
  {
    title: "Circuits electriques",
    href: "/college/5eme/physique/circuits-electriques/",
    level: "5e",
    toolIds: ["graph", "measure"],
    usage: "Lire tension et intensite puis exploiter un tableau de mesures.",
  },
  {
    title: "Solutions et concentrations",
    href: "/lycee/2nde/chimie/solutions-concentrations/",
    level: "2nde",
    toolIds: ["solution", "converter"],
    usage: "Verifier dissolution, dilution et conversions mL/L.",
  },
  {
    title: "Signaux et capteurs",
    href: "/lycee/2nde/physique/signaux-capteurs/",
    level: "2nde",
    toolIds: ["graph", "calculator"],
    usage: "Tracer une courbe d'etalonnage et lire une grandeur physique.",
  },
];

export const kitMiniQuiz: KitQuizQuestion[] = [
  {
    id: "kit-q1",
    question: "Avant d'utiliser une relation avec un volume en litre, que faut-il faire avec 250 mL ?",
    choices: ["Garder 250", "Convertir en 0,250 L", "Multiplier par 1000", "Supprimer l'unite"],
    answer: 1,
    explanation: "250 mL = 0,250 L. La valeur change quand l'unite change.",
  },
  {
    id: "kit-q2",
    question: "Sur un graphique scientifique, que doit-on indiquer sur chaque axe ?",
    choices: ["Seulement x et y", "La couleur des points", "La grandeur et l'unite", "Le nom du logiciel"],
    answer: 2,
    explanation: "Un axe sans grandeur ni unite ne permet pas d'interpreter correctement la mesure.",
  },
  {
    id: "kit-q3",
    question: "Quelle action est une regle de securite de base au laboratoire ?",
    choices: ["Gouter une solution inconnue", "Pipeter a la bouche", "Lire les pictogrammes", "Melanger au hasard"],
    answer: 2,
    explanation: "Les pictogrammes et consignes orientent les protections et les gestes a adopter.",
  },
];
