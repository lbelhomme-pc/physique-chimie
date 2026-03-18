// src/data/levels.ts
// Fichier unique de configuration des niveaux — collège + lycée
// Les slugs DOIVENT correspondre aux noms de dossiers dans src/data/chapters/

// ─── Types ────────────────────────────────────────────────────
export interface LevelInfo {
  slug: string;
  label: string;      // affiché dans le fil d'Ariane, les titres, etc.
  cycle: "college" | "lycee";
}

// ─── Collège ──────────────────────────────────────────────────
export const collegeLevels: LevelInfo[] = [
  { slug: "6eme",  label: "6ème",  cycle: "college" },
  { slug: "5eme",  label: "5ème",  cycle: "college" },
  { slug: "4eme",  label: "4ème",  cycle: "college" },
  { slug: "3eme",  label: "3ème",  cycle: "college" },
];

// ─── Lycée ────────────────────────────────────────────────────
export const lyceeLevels: LevelInfo[] = [
  { slug: "2nde",                      label: "Seconde",                             cycle: "lycee" },
  { slug: "1ere-ens-scientifique",     label: "1ère Enseignement scientifique",      cycle: "lycee" },
  { slug: "1ere-spe",                  label: "1ère Spécialité",                     cycle: "lycee" },
  { slug: "terminale-ens-scientifique",label: "Terminale Enseignement scientifique", cycle: "lycee" },
  { slug: "terminale-spe",            label: "Terminale Spécialité",                cycle: "lycee" },
];

// ─── Lookup rapide ────────────────────────────────────────────
export const allLevels: LevelInfo[] = [...collegeLevels, ...lyceeLevels];

/** Retrouver le label lisible à partir du slug */
export function getLevelLabel(slug: string): string {
  return allLevels.find(l => l.slug === slug)?.label ?? slug;
}

/** Retrouver le cycle à partir du slug */
export function getLevelCycle(slug: string): "college" | "lycee" | undefined {
  return allLevels.find(l => l.slug === slug)?.cycle;
}

// ─── Matières (identiques collège et lycée) ───────────────────
export const matieres = [
  { slug: "physique", label: "Physique" },
  { slug: "chimie",   label: "Chimie" },
];

export function getMatiereLabel(slug: string): string {
  return matieres.find(m => m.slug === slug)?.label ?? slug;
}
