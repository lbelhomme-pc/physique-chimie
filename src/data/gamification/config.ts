// src/data/gamification/config.ts
// Configuration centrale de la gamification
// Valeurs par défaut, rangs, badges, seuils

// ─── XP par défaut (si meta.json n'a pas de bloc "xp") ──
export const DEFAULT_XP = {
  cours: 10,
  quiz_base: 5,
  quiz_per_correct: 2,
  quiz_perfect: 10,
  flashcards_base: 5,
  flashcard_known: 1,
  exercice_each: 3,
  exercice_all: 15,
  chapter_complete: 25,
  daily_login: 5,
} as const;

// ─── Rangs ────────────────────────────────────────────────
export interface Rank {
  id: string;
  name: string;
  icon: string;
  xpRequired: number;
  color: string;
}

export const RANKS: Rank[] = [
  { id: "quark",         name: "Quark",         icon: "🔹", xpRequired: 0,      color: "#94a3b8" },
  { id: "atome",         name: "Atome",         icon: "⚛️", xpRequired: 100,    color: "#60a5fa" },
  { id: "molecule",      name: "Molécule",      icon: "🧪", xpRequired: 300,    color: "#34d399" },
  { id: "cristal",       name: "Cristal",       icon: "💎", xpRequired: 600,    color: "#22d3ee" },
  { id: "cellule",       name: "Cellule",       icon: "🔬", xpRequired: 1000,   color: "#a78bfa" },
  { id: "mineral",       name: "Minéral",       icon: "🪨", xpRequired: 1800,   color: "#a3764f" },
  { id: "etoile",        name: "Étoile",        icon: "⭐", xpRequired: 3000,   color: "#fbbf24" },
  { id: "constellation", name: "Constellation", icon: "✨", xpRequired: 5000,   color: "#f97316" },
  { id: "galaxie",       name: "Galaxie",       icon: "🌌", xpRequired: 8000,   color: "#3b82f6" },
  { id: "supernova",     name: "Supernova",     icon: "💥", xpRequired: 12000,  color: "#ef4444" },
  { id: "trou-noir",     name: "Trou noir",     icon: "🕳️", xpRequired: 18000,  color: "#1e293b" },
  { id: "big-bang",      name: "Big Bang",      icon: "🌠", xpRequired: 25000,  color: "#d4af37" },
  { id: "univers",       name: "Univers",       icon: "🪐", xpRequired: 40000,  color: "#8b5cf6" },
  { id: "multivers",     name: "Multivers",     icon: "♾️",  xpRequired: 60000,  color: "#ec4899" },
];

// ─── Sous-niveaux par rang ────────────────────────────────
export type SubLevel = "bronze" | "argent" | "or";

export function getSubLevel(xp: number, rank: Rank, nextRank?: Rank): SubLevel {
  if (!nextRank) return "or"; // rang max
  const range = nextRank.xpRequired - rank.xpRequired;
  const progress = xp - rank.xpRequired;
  const ratio = progress / range;
  if (ratio < 0.33) return "bronze";
  if (ratio < 0.66) return "argent";
  return "or";
}

// ─── Streaks ──────────────────────────────────────────────
export const STREAK_BONUSES: { days: number; xp: number }[] = [
  { days: 3,   xp: 15 },
  { days: 7,   xp: 50 },
  { days: 14,  xp: 100 },
  { days: 30,  xp: 200 },
  { days: 100, xp: 500 },
  { days: 365, xp: 2000 },
];

export const STREAK_FREEZE_COST = 500; // XP pour acheter un gel
export const FREE_FREEZES_PER_WEEK = 1;

// ─── Combos ───────────────────────────────────────────────
export const COMBO_MULTIPLIERS: { activities: number; multiplier: number }[] = [
  { activities: 2, multiplier: 1.2 },
  { activities: 3, multiplier: 1.5 },
  { activities: 5, multiplier: 2.0 },
];

export const COMBO_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

// ─── Badges ───────────────────────────────────────────────
export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  category: "progression" | "maitrise" | "streak" | "fun";
  description: string;
  levels?: { bronze: number; argent: number; or: number };
  condition: string; // description lisible de la condition
}

export const BADGES: BadgeDef[] = [
  // Progression
  { id: "premier-pas",     name: "Premier pas",        icon: "🏁", category: "progression", description: "Terminer des quiz",          levels: { bronze: 1, argent: 5, or: 10 },  condition: "quiz_completed" },
  { id: "rat-bibliotheque",name: "Rat de bibliothèque", icon: "📖", category: "progression", description: "Lire des cours en entier",    levels: { bronze: 5, argent: 15, or: 30 }, condition: "cours_read" },
  { id: "travailleur",     name: "Travailleur",        icon: "📝", category: "progression", description: "Faire des exercices",          levels: { bronze: 10, argent: 30, or: 100 }, condition: "exercices_done" },
  { id: "collectionneur",  name: "Collectionneur",     icon: "🃏", category: "progression", description: "Revoir des flashcards",        levels: { bronze: 50, argent: 200, or: 500 }, condition: "flashcards_reviewed" },
  { id: "regulier",        name: "Régulier",           icon: "📊", category: "progression", description: "Se connecter plusieurs jours", levels: { bronze: 7, argent: 30, or: 100 }, condition: "total_days" },
  { id: "complet",         name: "Complet",            icon: "🎒", category: "progression", description: "Chapitres complétés à 100%",   levels: { bronze: 1, argent: 5, or: 15 },  condition: "chapters_complete" },

  // Maîtrise
  { id: "sniper",          name: "Sniper",             icon: "🎯", category: "maitrise", description: "Quiz parfaits (10/10)",            levels: { bronze: 1, argent: 3, or: 10 },  condition: "quiz_perfect" },
  { id: "perfectionniste", name: "Perfectionniste",    icon: "💯", category: "maitrise", description: "Quiz parfaits d'affilée",          levels: { bronze: 3, argent: 5, or: 10 },  condition: "quiz_perfect_streak" },
  { id: "elephant",        name: "Mémoire d'éléphant", icon: "🧠", category: "maitrise", description: "100% 'Je sais' sur des paquets", levels: { bronze: 1, argent: 5, or: 15 },  condition: "flash_perfect" },
  { id: "champion-brevet", name: "Champion du Brevet", icon: "🏆", category: "maitrise", description: "100% du programme 3ème",                                                    condition: "complete_3eme" },
  { id: "champion-bac",    name: "Champion du Bac",    icon: "🎓", category: "maitrise", description: "100% du programme Tle spé",                                                  condition: "complete_tle_spe" },

  // Streaks
  { id: "etincelle",   name: "Étincelle", icon: "🔥", category: "streak", description: "Streak de 3 jours",   condition: "streak_3" },
  { id: "flamme",      name: "Flamme",    icon: "🔥", category: "streak", description: "Streak de 7 jours",   condition: "streak_7" },
  { id: "brasier",     name: "Brasier",   icon: "🔥", category: "streak", description: "Streak de 14 jours",  condition: "streak_14" },
  { id: "inferno",     name: "Inferno",   icon: "🔥", category: "streak", description: "Streak de 30 jours",  condition: "streak_30" },
  { id: "eternel",     name: "Éternel",   icon: "🔥", category: "streak", description: "Streak de 100 jours", condition: "streak_100" },
  { id: "legende",     name: "Légende",   icon: "🔥", category: "streak", description: "Streak de 365 jours", condition: "streak_365" },

  // Fun / Secrets
  { id: "noctambule",  name: "Noctambule",  icon: "🦉", category: "fun", description: "Se connecter après 22h",              condition: "login_night" },
  { id: "leve-tot",    name: "Lève-tôt",    icon: "🌅", category: "fun", description: "Se connecter avant 7h",               condition: "login_early" },
  { id: "aventurier",  name: "Aventurier",  icon: "🎲", category: "fun", description: "4 types d'activité en 1 session",     condition: "all_activities_session" },
  { id: "laborantin",  name: "Laborantin",  icon: "🔬", category: "fun", description: "Utiliser le laboratoire",              condition: "use_lab" },
  { id: "speed-runner",name: "Speed runner", icon: "⚡", category: "fun", description: "Quiz en moins de 60 secondes",        condition: "quiz_speed_60" },
  { id: "explorateur", name: "Explorateur", icon: "🗺️", category: "fun", description: "Visiter toutes les sections du site",  condition: "visit_all_pages" },
];
