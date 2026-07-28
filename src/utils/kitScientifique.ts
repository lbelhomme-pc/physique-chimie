import { kitUnitFamilies, type KitUnitFamily } from "../data/kitScientifique";

export interface GraphPoint {
  x: number;
  y: number;
}

export function findUnitFamily(familyId: string): KitUnitFamily {
  const family = kitUnitFamilies.find((item) => item.id === familyId);
  if (!family) throw new Error(`Famille d'unites inconnue: ${familyId}`);
  return family;
}

export function convertUnitValue(value: number, familyId: string, fromUnit: string, toUnit: string): number {
  if (!Number.isFinite(value)) throw new Error("Valeur non finie");
  const family = findUnitFamily(familyId);
  const from = family.units.find((unit) => unit.label === fromUnit);
  const to = family.units.find((unit) => unit.label === toUnit);
  if (!from || !to) throw new Error("Unite inconnue");
  return value * from.factor / to.factor;
}

export function dissolutionMassGrams(concentrationMassGL: number, volumeMl: number): number {
  if (!Number.isFinite(concentrationMassGL) || !Number.isFinite(volumeMl) || concentrationMassGL < 0 || volumeMl < 0) {
    throw new Error("Donnees de dissolution invalides");
  }
  return concentrationMassGL * volumeMl / 1000;
}

export function dilutionVolumeMl(c1: number, c2: number, v2Ml: number): number {
  if (!Number.isFinite(c1) || !Number.isFinite(c2) || !Number.isFinite(v2Ml) || c1 <= 0 || c2 < 0 || v2Ml < 0) {
    throw new Error("Donnees de dilution invalides");
  }
  return (c2 * v2Ml) / c1;
}

export function linearModelThroughOrigin(points: GraphPoint[]): { slope: number; rmsError: number } {
  if (points.length < 2) throw new Error("Deux points au minimum sont necessaires");
  const denominator = points.reduce((sum, point) => sum + point.x * point.x, 0);
  if (denominator === 0) throw new Error("Abscisses insuffisantes");
  const slope = points.reduce((sum, point) => sum + point.x * point.y, 0) / denominator;
  const rmsError = Math.sqrt(points.reduce((sum, point) => {
    const delta = point.y - slope * point.x;
    return sum + delta * delta;
  }, 0) / points.length);
  return { slope, rmsError };
}

export function parseMeasurementPairs(text: string): GraphPoint[] {
  return String(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [x, y] = line.split(/[;,\t ]+/).map((value) => Number(String(value).replace(",", ".")));
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("Point invalide");
      return { x, y };
    });
}
