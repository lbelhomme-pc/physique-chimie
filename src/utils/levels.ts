const LEVEL_DISPLAY_LABELS: Record<string, string> = {
  "6eme": "6e",
  "5eme": "5e",
  "4eme": "4e",
  "3eme": "3e",
  "2nde": "2nde",
  "1ere": "1re",
  "1ere-ens-scientifique": "1re enseignement scientifique",
  "1ere-spe": "1re spécialité",
  "terminale": "Terminale",
  "terminale-ens-scientifique": "Terminale enseignement scientifique",
  "terminale-spe": "Terminale spécialité",
};

export function getLevelDisplayLabel(levelSlug: string): string {
  return LEVEL_DISPLAY_LABELS[levelSlug] ?? levelSlug;
}
