export type AffineActivityConfig = {
  id: string;
  chapterSlug: string;
  title: string;
  objective: string;
  coefficientA: { min: number; max: number; step: number; value: number };
  coefficientB: { min: number; max: number; step: number; value: number };
  cursorX: { min: number; max: number; step: number; value: number };
  sampleXs: number[];
  conjectures: Array<{ id: "increasing" | "decreasing" | "constant"; label: string }>;
};

export const affineFunctionPilotActivity: AffineActivityConfig = {
  id: "maths-2nde-fonctions-affines-pilote",
  chapterSlug: "fonctions-generalites",
  title: "Explorer une fonction affine",
  objective:
    "Faire varier les parametres de f(x) = ax + b pour observer la courbe, formuler une conjecture sur le sens de variation, puis la valider par calcul.",
  coefficientA: { min: -4, max: 4, step: 0.5, value: 1 },
  coefficientB: { min: -6, max: 6, step: 0.5, value: 0 },
  cursorX: { min: -5, max: 5, step: 0.5, value: 2 },
  sampleXs: [-4, -2, 0, 2, 4],
  conjectures: [
    { id: "increasing", label: "La fonction est croissante" },
    { id: "decreasing", label: "La fonction est decroissante" },
    { id: "constant", label: "La fonction est constante" },
  ],
};

export function getMathematicsPilotActivity(chapterSlug: string): AffineActivityConfig | null {
  return chapterSlug === affineFunctionPilotActivity.chapterSlug ? affineFunctionPilotActivity : null;
}
