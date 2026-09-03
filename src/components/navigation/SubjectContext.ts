import {
  disciplineIdentities,
  getDisciplineIdentity,
  type PublicDisciplineId,
} from "../../data/disciplineIdentity";

export type SubjectId = PublicDisciplineId | "transversal";
export type CycleContext = "college" | "lycee";

export interface LayoutSubjectContext {
  subject?: SubjectId;
  cycle?: CycleContext;
  level?: string;
  resourceType?: string;
}

export const SUBJECT_LABELS: Record<PublicDisciplineId, string> = {
  "physique-chimie": disciplineIdentities["physique-chimie"].label,
  mathematiques: disciplineIdentities.mathematiques.label,
};

export const SUBJECT_HOME_PATHS: Record<PublicDisciplineId, string> = {
  "physique-chimie": disciplineIdentities["physique-chimie"].href,
  mathematiques: disciplineIdentities.mathematiques.href,
};

export function getSubjectLabel(subject: SubjectId | undefined): string {
  return getDisciplineIdentity(subject).label;
}

export function getSubjectContextFromPath(pathname: string): LayoutSubjectContext {
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const segments = normalized.split("/").filter(Boolean);

  if (segments[0] === "mathematiques") {
    return {
      subject: "mathematiques",
      cycle: segments[1] === "college" || segments[1] === "lycee" ? segments[1] : undefined,
      level: segments[2],
      resourceType: segments.length >= 4 ? "chapter" : undefined,
    };
  }

  if (segments[0] === "physique-chimie") {
    return {
      subject: "physique-chimie",
      cycle: segments[1] === "college" || segments[1] === "lycee" ? segments[1] : undefined,
      level: segments[2],
      resourceType: segments.length >= 5 ? "chapter" : undefined,
    };
  }

  if (segments[0] === "college" || segments[0] === "lycee") {
    return {
      subject: "physique-chimie",
      cycle: segments[0],
      level: segments[1],
      resourceType: segments.length >= 4 ? "chapter" : undefined,
    };
  }

  if (segments[0] === "laboratoire" || segments[0] === "outils-methodes") {
    return { subject: "physique-chimie", resourceType: segments[0] === "laboratoire" ? "simulation" : "tool" };
  }

  return { subject: "transversal" };
}
