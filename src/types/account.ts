export const ACCOUNT_ARCHITECTURE_VERSION = 1;

export type AccountProviderMode =
  | "local-only"
  | "managed-auth"
  | "managed-backend"
  | "hybrid-local-sync";

export type AccountAudience = "visitor" | "student" | "teacher" | "admin";
export type AccountPlan = "visitor" | "free" | "premium" | "teacher";
export type AccountStatus = "anonymous" | "pending" | "active" | "suspended" | "deleted";
export type AccountSessionState = "none" | "guest-local" | "authenticated";

export type AccountDataCategory =
  | "identity"
  | "learning-progress"
  | "srs"
  | "preferences"
  | "billing-status"
  | "support";

export type AccountRight =
  | "read-public-content"
  | "save-local-progress"
  | "sync-progress"
  | "use-limited-personalization"
  | "use-premium-content"
  | "manage-classroom";

export interface AccountProviderOption {
  mode: AccountProviderMode;
  label: string;
  decisionStatus: "candidate" | "rejected" | "selected-later";
  strengths: readonly string[];
  risks: readonly string[];
  migrationFit: "low" | "medium" | "high";
  lockInRisk: "low" | "medium" | "high";
}

export interface AccountPublicConfig {
  enabled: boolean;
  providerMode: AccountProviderMode;
  signInPath: string;
  signUpPath: string;
  profilePath: string;
  localProgressFirst: boolean;
}

export interface AccountIdentity {
  id: string;
  audience: AccountAudience;
  plan: AccountPlan;
  status: AccountStatus;
  displayName?: string;
}

export interface AccountSessionSnapshot {
  state: AccountSessionState;
  identity: AccountIdentity | null;
  rights: readonly AccountRight[];
  synchronizedAt?: string;
}

export interface AccountProgressSyncPlan {
  localStorageKeys: readonly string[];
  mergeStrategy: "max-score-and-latest-review" | "server-wins" | "manual-review";
  preserveLocalCopy: boolean;
  allowOfflineUse: boolean;
}

export interface AccountPrivacyRule {
  category: AccountDataCategory;
  purpose: string;
  requiredForAccount: boolean;
  retention: "local-session" | "account-life" | "legal-window" | "manual-delete";
  exposedToClient: boolean;
}

export interface AccountFormRequirement {
  field: "email" | "password" | "display-name" | "consent";
  required: boolean;
  autocomplete: string;
  accessibleName: string;
  errorMessage: string;
}

export const accountPublicConfig: AccountPublicConfig = {
  enabled: false,
  providerMode: "local-only",
  signInPath: "/connexion",
  signUpPath: "/inscription",
  profilePath: "/profil",
  localProgressFirst: true,
} as const;

export const accountProgressSyncPlan: AccountProgressSyncPlan = {
  localStorageKeys: [
    "gamification_state",
    "srs_cards",
    "pc-platform-progress-v1",
    "pc-platform-progress-v2",
  ],
  mergeStrategy: "max-score-and-latest-review",
  preserveLocalCopy: true,
  allowOfflineUse: true,
} as const;

export const accountFormRequirements: readonly AccountFormRequirement[] = [
  {
    field: "email",
    required: true,
    autocomplete: "email",
    accessibleName: "Adresse email",
    errorMessage: "Indique une adresse email valide.",
  },
  {
    field: "password",
    required: true,
    autocomplete: "current-password",
    accessibleName: "Mot de passe",
    errorMessage: "Indique ton mot de passe.",
  },
  {
    field: "display-name",
    required: false,
    autocomplete: "nickname",
    accessibleName: "Nom affiche",
    errorMessage: "Choisis un nom affiche plus court.",
  },
  {
    field: "consent",
    required: true,
    autocomplete: "off",
    accessibleName: "Consentement au compte",
    errorMessage: "Confirme les conditions avant de creer un compte.",
  },
] as const;

