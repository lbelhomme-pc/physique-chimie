export type AffineVariation = "increasing" | "decreasing" | "constant";

export type AffinePoint = {
  x: number;
  y: number;
};

export function evaluateAffine(a: number, b: number, x: number): number {
  return a * x + b;
}

export function buildAffineTable(a: number, b: number, xs: number[]): AffinePoint[] {
  return xs.map((x) => ({ x, y: evaluateAffine(a, b, x) }));
}

export function affineVariationKind(a: number): AffineVariation {
  if (a > 0) return "increasing";
  if (a < 0) return "decreasing";
  return "constant";
}

export function validateAffineConjecture(a: number, conjecture: AffineVariation): boolean {
  return affineVariationKind(a) === conjecture;
}

export function formatMathNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  return Number(value.toFixed(3)).toLocaleString("fr-FR", { maximumFractionDigits: 3 });
}
