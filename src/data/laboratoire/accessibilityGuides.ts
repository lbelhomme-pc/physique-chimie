import { labApps } from "./apps";

export type LabAccessibilityGuide = {
  slug: string;
  hypothesis: string;
  measurements: string[];
  nonVisualSummary: string;
  conclusionPrompt: string;
  questions: string[];
};

const fallbackGuide = (slug: string): LabAccessibilityGuide => {
  const app = labApps.find((item) => item.slug === slug);
  return {
    slug,
    hypothesis: app
      ? `Si je fais varier les parametres principaux, je dois observer une evolution coherente avec l'objectif : ${app.objective}`
      : "Si je fais varier les parametres principaux, les valeurs mesurees doivent evoluer de facon coherente avec le modele.",
    measurements: [
      "Lire les valeurs affichees dans les panneaux ou tableaux de mesures.",
      "Comparer une seule grandeur a la fois pour identifier la cause de l'evolution.",
      "Noter le sens de variation avant de formuler une conclusion.",
    ],
    nonVisualSummary:
      "Les valeurs textuelles, le tableau de mesures et les questions guident l'exploitation lorsque le schema ou le canvas ne peut pas etre lu visuellement.",
    conclusionPrompt:
      "Je conclus en citant la grandeur modifiee, la grandeur observee et la relation physique ou chimique utilisee.",
    questions: [
      "Quelle grandeur ai-je modifiee ?",
      "Quelle valeur mesuree change le plus clairement ?",
      "La conclusion depend-elle seulement de la simulation ou aussi du modele ?",
    ],
  };
};

export const labAccessibilityGuides: Record<string, LabAccessibilityGuide> = {
  "circuit-rc": {
    slug: "circuit-rc",
    hypothesis:
      "Si R ou C augmente, la constante de temps tau = R x C augmente aussi et la charge devient plus lente.",
    measurements: [
      "Relever R, C et tau apres conversion en unites SI.",
      "Comparer uC, uR, i et l'energie au meme instant t/tau.",
      "Memoriser deux essais en ne changeant qu'une seule grandeur.",
    ],
    nonVisualSummary:
      "Le schema et les courbes sont accompagnes de valeurs textuelles, d'un tableau a plusieurs instants et d'une conclusion a rediger.",
    conclusionPrompt:
      "Je conclus sur le lien entre tau, R et C, puis j'indique ce qui change entre charge et decharge.",
    questions: [
      "Quand R double et C reste constant, que devient tau ?",
      "A t = tau, uC est-elle proche de 63 % de la valeur finale en charge ?",
      "Pourquoi la charge n'est-elle jamais exactement terminee a temps fini ?",
    ],
  },
  "diffusion-temperature": {
    slug: "diffusion-temperature",
    hypothesis:
      "Si la temperature augmente, le coefficient de diffusion augmente et le nuage de traceurs s'elargit plus vite.",
    measurements: [
      "Comparer les coefficients D des milieux A et B.",
      "Relever la largeur RMS et la valeur moyenne <r2> au meme instant.",
      "Verifier si le brassage ajoute un effet organise distinct de la diffusion seule.",
    ],
    nonVisualSummary:
      "Les deux enceintes visuelles sont doublees par des listes de mesures, une description SVG et une region de statut textuelle.",
    conclusionPrompt:
      "Je conclus en separant l'effet de la temperature sur la diffusion et l'effet du protocole de brassage.",
    questions: [
      "Quel milieu possede le plus grand coefficient D ?",
      "Si le temps est multiplie par quatre, que devient la distance RMS attendue ?",
      "Pourquoi le brassage ne mesure-t-il pas la diffusion seule ?",
    ],
  },
};

export function getLabAccessibilityGuide(slug: string): LabAccessibilityGuide {
  return labAccessibilityGuides[slug] ?? fallbackGuide(slug);
}

export function listMissingSpecificLabGuides(): string[] {
  const specificSlugs = new Set(Object.keys(labAccessibilityGuides));
  return labApps.map((app) => app.slug).filter((slug) => !specificSlugs.has(slug));
}
