export type DisciplineId = "mathematiques" | "physique-chimie" | "enseignement-scientifique" | "transversal";
export type PublicDisciplineId = "mathematiques" | "physique-chimie";
export type PhysiqueChimieTrackId = "physique-chimie" | "enseignement-scientifique";

export interface DisciplineIdentity {
  id: DisciplineId;
  label: string;
  shortLabel: string;
  href: string;
  mark: string;
  iconLabel: string;
  accentVar: string;
  surfaceVar: string;
  borderVar: string;
  microcopy: string;
  description: string;
}

export const disciplineIdentities: Record<DisciplineId, DisciplineIdentity> = {
  mathematiques: {
    id: "mathematiques",
    label: "Mathématiques",
    shortLabel: "Maths",
    href: "/mathematiques",
    mark: "∑",
    iconLabel: "Symbole somme",
    accentVar: "--v3-color-discipline-maths",
    surfaceVar: "--v3-color-discipline-maths-bg",
    borderVar: "--v3-color-discipline-maths-border",
    microcopy: "Calculer, raisonner, modéliser",
    description: "Repères de cours, exercices, quiz et méthodes pour les mathématiques.",
  },
  "physique-chimie": {
    id: "physique-chimie",
    label: "Physique-Chimie",
    shortLabel: "PC",
    href: "/physique-chimie",
    mark: "PC",
    iconLabel: "Initiales Physique-Chimie",
    accentVar: "--v3-color-discipline-pc",
    surfaceVar: "--v3-color-discipline-pc-bg",
    borderVar: "--v3-color-discipline-pc-border",
    microcopy: "Observer, mesurer, expliquer",
    description: "Cours, exercices, quiz et laboratoires de Physique-Chimie, avec l’Enseignement scientifique intégré au lycée.",
  },
  "enseignement-scientifique": {
    id: "enseignement-scientifique",
    label: "Enseignement scientifique",
    shortLabel: "ES",
    href: "/lycee/1ere-ens-scientifique",
    mark: "ES",
    iconLabel: "Initiales Enseignement scientifique",
    accentVar: "--v3-color-discipline-science",
    surfaceVar: "--v3-color-discipline-science-bg",
    borderVar: "--v3-color-discipline-science-border",
    microcopy: "Relier les sciences, le climat, le vivant et l'énergie",
    description: "Parcours du lycée intégré à l’espace Physique-Chimie.",
  },
  transversal: {
    id: "transversal",
    label: "Toutes les matières",
    shortLabel: "Tous",
    href: "/",
    mark: "T",
    iconLabel: "Repère transversal",
    accentVar: "--v3-color-action",
    surfaceVar: "--v3-color-action-subtle",
    borderVar: "--v3-color-border-default",
    microcopy: "Choisir une matière ou chercher une ressource",
    description: "Accueil, recherche, mémorisation et ressources communes.",
  },
};

export const publicDisciplineIds = [
  "mathematiques",
  "physique-chimie",
] as const satisfies readonly PublicDisciplineId[];

export function getDisciplineIdentity(id: DisciplineId | undefined): DisciplineIdentity {
  return disciplineIdentities[id ?? "transversal"];
}

export function getDisciplineFromLevelSlug(levelSlug: string | undefined): PublicDisciplineId {
  void levelSlug;
  return "physique-chimie";
}

export function getPhysiqueChimieTrackFromLevelSlug(levelSlug: string | undefined): PhysiqueChimieTrackId {
  return levelSlug?.includes("ens-scientifique") ? "enseignement-scientifique" : "physique-chimie";
}

export function getDisciplineStyle(identity: DisciplineIdentity): string {
  return [
    `--discipline-accent: var(${identity.accentVar})`,
    `--discipline-surface: var(${identity.surfaceVar})`,
    `--discipline-border: var(${identity.borderVar})`,
  ].join("; ");
}
