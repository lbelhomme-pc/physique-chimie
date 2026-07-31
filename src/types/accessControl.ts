import type { AccessPolicy } from "../content-model/index.ts";
import type { AccountPlan, AccountRight } from "./account";

export const ACCESS_CONTROL_VERSION = 1;

export type AccessAudience = AccountPlan;

export type AccessDecision =
  | "allow"
  | "preview"
  | "account-required"
  | "upgrade-required"
  | "teacher-only"
  | "draft-hidden";

export type AccessResourceFamily =
  | "chapter-overview"
  | "essential-course"
  | "level-1-exercise"
  | "essential-correction"
  | "detailed-correction"
  | "quiz"
  | "flashcards"
  | "laboratory"
  | "scientific-kit"
  | "personalized-progress"
  | "personalized-review"
  | "pdf-annals";

export type PremiumUse = "none" | "depth" | "comfort" | "tracking" | "teacher";
export type AccessGateCta = "none" | "sign-in" | "upgrade" | "ask-teacher";

export interface AccessGateInput {
  policy: AccessPolicy;
  audience: AccessAudience;
  rights?: readonly AccountRight[];
}

export interface AccessGateResult {
  decision: AccessDecision;
  allowed: boolean;
  preview: boolean;
  reason: string;
  cta: AccessGateCta;
}

export interface PremiumMatrixRow {
  family: AccessResourceFamily;
  label: string;
  visitor: AccessDecision;
  free: AccessDecision;
  premium: AccessDecision;
  teacher: AccessDecision;
  essential: boolean;
  premiumUse: PremiumUse;
}

export const premiumAccessMatrix: readonly PremiumMatrixRow[] = [
  {
    family: "chapter-overview",
    label: "Apercu des chapitres",
    visitor: "allow",
    free: "allow",
    premium: "allow",
    teacher: "allow",
    essential: true,
    premiumUse: "none",
  },
  {
    family: "essential-course",
    label: "Cours essentiels",
    visitor: "preview",
    free: "allow",
    premium: "allow",
    teacher: "allow",
    essential: true,
    premiumUse: "none",
  },
  {
    family: "level-1-exercise",
    label: "Exercices niveau 1",
    visitor: "preview",
    free: "allow",
    premium: "allow",
    teacher: "allow",
    essential: true,
    premiumUse: "none",
  },
  {
    family: "essential-correction",
    label: "Corrections essentielles",
    visitor: "preview",
    free: "allow",
    premium: "allow",
    teacher: "allow",
    essential: true,
    premiumUse: "none",
  },
  {
    family: "detailed-correction",
    label: "Corrections detaillees",
    visitor: "account-required",
    free: "preview",
    premium: "allow",
    teacher: "allow",
    essential: false,
    premiumUse: "depth",
  },
  {
    family: "quiz",
    label: "Quiz",
    visitor: "preview",
    free: "preview",
    premium: "allow",
    teacher: "allow",
    essential: false,
    premiumUse: "comfort",
  },
  {
    family: "flashcards",
    label: "Flashcards",
    visitor: "preview",
    free: "preview",
    premium: "allow",
    teacher: "allow",
    essential: false,
    premiumUse: "comfort",
  },
  {
    family: "laboratory",
    label: "Laboratoire",
    visitor: "preview",
    free: "preview",
    premium: "allow",
    teacher: "allow",
    essential: false,
    premiumUse: "depth",
  },
  {
    family: "scientific-kit",
    label: "Kit scientifique",
    visitor: "preview",
    free: "preview",
    premium: "allow",
    teacher: "allow",
    essential: false,
    premiumUse: "comfort",
  },
  {
    family: "personalized-progress",
    label: "Progression personnalisee",
    visitor: "account-required",
    free: "allow",
    premium: "allow",
    teacher: "allow",
    essential: false,
    premiumUse: "tracking",
  },
  {
    family: "personalized-review",
    label: "Revision personnalisee",
    visitor: "account-required",
    free: "preview",
    premium: "allow",
    teacher: "allow",
    essential: false,
    premiumUse: "tracking",
  },
  {
    family: "pdf-annals",
    label: "Annales et fiches PDF",
    visitor: "preview",
    free: "preview",
    premium: "allow",
    teacher: "allow",
    essential: false,
    premiumUse: "comfort",
  },
] as const;

export const premiumGatePrototype = {
  title: "Contenu d'approfondissement",
  message:
    "La notion essentielle reste disponible. Cette ressource ajoute un entrainement, un confort de revision ou un suivi avance.",
  previewLabel: "Apercu accessible",
  ariaPrefix: "Acces limite",
  signInLabel: "Se connecter",
  upgradeLabel: "Voir l'acces Premium",
} as const;

export function resolveAccessGate(input: AccessGateInput): AccessGateResult {
  const { policy, audience, rights = [] } = input;
  const hasPremiumRight = audience === "premium" || rights.includes("use-premium-content");
  const hasTeacherRight = audience === "teacher" || rights.includes("manage-classroom");
  const preview = Boolean(policy.preview);

  if (policy.tier === "draft") {
    return hasTeacherRight
      ? allowResult("Brouillon visible par l'equipe enseignante.")
      : blockedResult("draft-hidden", preview, "Ressource en preparation, non publiee.", "none");
  }

  if (policy.tier === "teacher") {
    return hasTeacherRight
      ? allowResult("Ressource reservee aux usages enseignants.")
      : blockedResult("teacher-only", preview, "Acces reserve aux enseignants.", "ask-teacher");
  }

  if (policy.requiresAccount && audience === "visitor") {
    return blockedResult(
      "account-required",
      preview,
      "Un compte gratuit est necessaire pour enregistrer ou reprendre cette ressource.",
      "sign-in",
    );
  }

  if (policy.tier === "premium" && !hasPremiumRight) {
    const decision = audience === "visitor" && preview ? "preview" : "upgrade-required";
    return blockedResult(
      decision,
      preview,
      policy.premiumReason ?? premiumGatePrototype.message,
      audience === "visitor" ? "sign-in" : "upgrade",
    );
  }

  return allowResult("Acces autorise selon la politique de contenu.");
}

function allowResult(reason: string): AccessGateResult {
  return {
    decision: "allow",
    allowed: true,
    preview: false,
    reason,
    cta: "none",
  };
}

function blockedResult(
  decision: Exclude<AccessDecision, "allow">,
  preview: boolean,
  reason: string,
  cta: AccessGateCta,
): AccessGateResult {
  return {
    decision,
    allowed: false,
    preview,
    reason,
    cta,
  };
}
