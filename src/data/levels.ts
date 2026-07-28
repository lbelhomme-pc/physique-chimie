// src/data/levels.ts
// Fichier unique de configuration des niveaux : collège + lycée.
// Les slugs doivent correspondre aux noms de dossiers dans src/data/chapters/.

export interface LevelInfo {
  slug: string;
  label: string;
  cycle: "college" | "lycee";
}

export const collegeLevels: LevelInfo[] = [
  { slug: "6eme", label: "6e", cycle: "college" },
  { slug: "5eme", label: "5e", cycle: "college" },
  { slug: "4eme", label: "4e", cycle: "college" },
  { slug: "3eme", label: "3e", cycle: "college" },
];

export const lyceeLevels: LevelInfo[] = [
  { slug: "2nde", label: "Seconde", cycle: "lycee" },
  { slug: "1ere-ens-scientifique", label: "1re Enseignement scientifique", cycle: "lycee" },
  { slug: "1ere-spe", label: "1re Spécialité", cycle: "lycee" },
  { slug: "terminale-ens-scientifique", label: "Terminale Enseignement scientifique", cycle: "lycee" },
  { slug: "terminale-spe", label: "Terminale Spécialité", cycle: "lycee" },
];

export const allLevels: LevelInfo[] = [...collegeLevels, ...lyceeLevels];

export function getLevelLabel(slug: string): string {
  return allLevels.find((level) => level.slug === slug)?.label ?? slug;
}

export function getLevelCycle(slug: string): "college" | "lycee" | undefined {
  return allLevels.find((level) => level.slug === slug)?.cycle;
}

export const matieres = [
  { slug: "physique", label: "Physique" },
  { slug: "chimie", label: "Chimie" },
];

export function getMatiereLabel(slug: string): string {
  return matieres.find((matiere) => matiere.slug === slug)?.label ?? slug;
}
