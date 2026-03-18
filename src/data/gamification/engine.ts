// src/data/gamification/engine.ts
// Moteur central de gamification
// Gère : XP, rangs, streaks, badges, combos, progression chapitres
// Stockage : localStorage (migration Supabase en Phase 6)

import {
  DEFAULT_XP,
  RANKS,
  STREAK_BONUSES,
  COMBO_MULTIPLIERS,
  COMBO_TIMEOUT_MS,
  BADGES,
  FREE_FREEZES_PER_WEEK,
  STREAK_FREEZE_COST,
  getSubLevel,
  type Rank,
  type SubLevel,
  type BadgeDef,
} from "./config";

// ─── Types ────────────────────────────────────────────────

interface UserState {
  xp: number;
  badges: { id: string; level: string; unlockedAt: string }[];
  streak: {
    current: number;
    best: number;
    lastActiveDate: string;      // "YYYY-MM-DD"
    freezesUsedThisWeek: number;
    weekStart: string;           // "YYYY-MM-DD" (lundi)
  };
  combo: {
    count: number;
    lastActivityTime: number;    // timestamp ms
  };
  stats: {
    totalQuizCompleted: number;
    totalQuizPerfect: number;
    quizPerfectStreak: number;
    totalFlashcardsReviewed: number;
    totalFlashPerfect: number;
    totalExercicesDone: number;
    totalCoursRead: number;
    totalDaysActive: number;
    chaptersComplete: number;
    sessionsActivities: string[];  // activités de la session en cours
  };
  progress: {
    [chapterId: string]: {
      cours: boolean;
      quiz: boolean;
      flashcards: boolean;
      exercices: boolean;
      bestQuizScore: number;
      bestQuizTotal: number;
      flashKnownRatio: number;
    };
  };
  lastChapter: {
    path: string;
    tab: string;
    title: string;
  } | null;
}

// ─── État par défaut ──────────────────────────────────────

function defaultState(): UserState {
  return {
    xp: 0,
    badges: [],
    streak: {
      current: 0,
      best: 0,
      lastActiveDate: "",
      freezesUsedThisWeek: 0,
      weekStart: getMonday(new Date()),
    },
    combo: {
      count: 0,
      lastActivityTime: 0,
    },
    stats: {
      totalQuizCompleted: 0,
      totalQuizPerfect: 0,
      quizPerfectStreak: 0,
      totalFlashcardsReviewed: 0,
      totalFlashPerfect: 0,
      totalExercicesDone: 0,
      totalCoursRead: 0,
      totalDaysActive: 0,
      chaptersComplete: 0,
      sessionsActivities: [],
    },
    progress: {},
    lastChapter: null,
  };
}

// ─── Helpers dates ────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  if (!a || !b) return Infinity;
  const msPerDay = 86400000;
  return Math.floor(
    (new Date(b).getTime() - new Date(a).getTime()) / msPerDay
  );
}

// ─── Classe principale ───────────────────────────────────

const STORAGE_KEY = "gamification_state";

export class GamificationEngine {
  private state: UserState;
  private listeners: Array<(state: UserState) => void> = [];

  constructor() {
    this.state = this.load();
    this.checkStreak();
  }

  // ─── Persistance ──────────────────────────────────────

  private load(): UserState {
    if (typeof window === "undefined") return defaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return { ...defaultState(), ...JSON.parse(raw) };
    } catch {
      return defaultState();
    }
  }

  private save(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch { /* localStorage full or unavailable */ }
    this.notify();
  }

  // ─── Listeners (pour React) ───────────────────────────

  subscribe(fn: (state: UserState) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(): void {
    const snapshot = this.getState();
    this.listeners.forEach((fn) => fn(snapshot));
  }

  // ─── Lecture de l'état ────────────────────────────────

  getState(): UserState {
    return JSON.parse(JSON.stringify(this.state));
  }

  getXP(): number {
    return this.state.xp;
  }

  getRank(): Rank {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (this.state.xp >= r.xpRequired) rank = r;
      else break;
    }
    return rank;
  }

  getNextRank(): Rank | null {
    const current = this.getRank();
    const idx = RANKS.indexOf(current);
    return idx + 1 < RANKS.length ? RANKS[idx + 1] : null;
  }

  getSubLevel(): SubLevel {
    const rank = this.getRank();
    const next = this.getNextRank();
    return getSubLevel(this.state.xp, rank, next ?? undefined);
  }

  getRankProgress(): { current: number; max: number; percent: number } {
    const rank = this.getRank();
    const next = this.getNextRank();
    if (!next) return { current: this.state.xp, max: this.state.xp, percent: 100 };
    const current = this.state.xp - rank.xpRequired;
    const max = next.xpRequired - rank.xpRequired;
    return { current, max, percent: Math.round((current / max) * 100) };
  }

  getStreak(): { current: number; best: number } {
    return {
      current: this.state.streak.current,
      best: this.state.streak.best,
    };
  }

  getBadges(): { id: string; level: string; unlockedAt: string }[] {
    return [...this.state.badges];
  }

  getChapterProgress(chapterId: string): {
    cours: boolean;
    quiz: boolean;
    flashcards: boolean;
    exercices: boolean;
    percent: number;
    bestQuizScore: number;
    bestQuizTotal: number;
  } {
    const p = this.state.progress[chapterId] ?? {
      cours: false, quiz: false, flashcards: false, exercices: false,
      bestQuizScore: 0, bestQuizTotal: 0, flashKnownRatio: 0,
    };
    const done = [p.cours, p.quiz, p.flashcards, p.exercices].filter(Boolean).length;
    return { ...p, percent: done * 25 };
  }

  getLastChapter() {
    return this.state.lastChapter;
  }

  getStats() {
    return { ...this.state.stats };
  }

  getComboMultiplier(): number {
    const now = Date.now();
    if (now - this.state.combo.lastActivityTime > COMBO_TIMEOUT_MS) {
      return 1;
    }
    let mult = 1;
    for (const c of COMBO_MULTIPLIERS) {
      if (this.state.combo.count >= c.activities) mult = c.multiplier;
    }
    return mult;
  }

  // ─── Attribution d'XP ────────────────────────────────

  private addXP(amount: number): { xp: number; rankUp: Rank | null } {
    const oldRank = this.getRank();

    // Appliquer le combo
    const multiplier = this.getComboMultiplier();
    const finalXP = Math.round(amount * multiplier);

    this.state.xp += finalXP;

    const newRank = this.getRank();
    const rankUp = newRank.id !== oldRank.id ? newRank : null;

    return { xp: finalXP, rankUp };
  }

  private bumpCombo(): void {
    const now = Date.now();
    if (now - this.state.combo.lastActivityTime > COMBO_TIMEOUT_MS) {
      this.state.combo.count = 1;
    } else {
      this.state.combo.count += 1;
    }
    this.state.combo.lastActivityTime = now;
  }

  // ─── Actions principales ──────────────────────────────

  /**
   * L'élève a lu un cours en entier
   */
  completeCours(
    chapterId: string,
    xpConfig?: { cours?: number }
  ): { xp: number; rankUp: Rank | null; newBadges: BadgeDef[] } {
    const xpAmount = xpConfig?.cours ?? DEFAULT_XP.cours;
    const alreadyDone = this.state.progress[chapterId]?.cours;

    if (!alreadyDone) {
      this.ensureProgress(chapterId);
      this.state.progress[chapterId].cours = true;
      this.state.stats.totalCoursRead += 1;
      this.bumpCombo();
      this.trackActivity("cours");
      this.updateStreak();
      const result = this.addXP(xpAmount);
      this.checkChapterComplete(chapterId);
      const newBadges = this.checkBadges();
      this.save();
      return { ...result, newBadges };
    }

    return { xp: 0, rankUp: null, newBadges: [] };
  }

  /**
   * L'élève a terminé un quiz
   */
  completeQuiz(
    chapterId: string,
    score: number,
    total: number,
    durationMs?: number,
    xpConfig?: { quiz_base?: number; quiz_per_correct?: number; quiz_perfect?: number }
  ): { xp: number; rankUp: Rank | null; newBadges: BadgeDef[] } {
    const base = xpConfig?.quiz_base ?? DEFAULT_XP.quiz_base;
    const perCorrect = xpConfig?.quiz_per_correct ?? DEFAULT_XP.quiz_per_correct;
    const perfectBonus = xpConfig?.quiz_perfect ?? DEFAULT_XP.quiz_perfect;

    let xpAmount = base + score * perCorrect;
    const isPerfect = score === total && total > 0;
    if (isPerfect) xpAmount += perfectBonus;

    this.ensureProgress(chapterId);
    this.state.progress[chapterId].quiz = true;

    // Meilleur score
    if (score > (this.state.progress[chapterId].bestQuizScore ?? 0)) {
      this.state.progress[chapterId].bestQuizScore = score;
      this.state.progress[chapterId].bestQuizTotal = total;
    }

    this.state.stats.totalQuizCompleted += 1;
    if (isPerfect) {
      this.state.stats.totalQuizPerfect += 1;
      this.state.stats.quizPerfectStreak += 1;
    } else {
      this.state.stats.quizPerfectStreak = 0;
    }

    // Speed runner check
    if (durationMs && durationMs < 60000) {
      this.trackActivity("speed_quiz");
    }

    this.bumpCombo();
    this.trackActivity("quiz");
    this.updateStreak();
    const result = this.addXP(xpAmount);
    this.checkChapterComplete(chapterId);
    const newBadges = this.checkBadges();
    this.save();
    return { ...result, newBadges };
  }

  /**
   * L'élève a terminé une session de flashcards
   */
  completeFlashcards(
    chapterId: string,
    knownCount: number,
    totalCount: number,
    xpConfig?: { flashcards_base?: number; flashcard_known?: number }
  ): { xp: number; rankUp: Rank | null; newBadges: BadgeDef[] } {
    const base = xpConfig?.flashcards_base ?? DEFAULT_XP.flashcards_base;
    const perKnown = xpConfig?.flashcard_known ?? DEFAULT_XP.flashcard_known;

    let xpAmount = base + knownCount * perKnown;
    const isPerfect = knownCount === totalCount && totalCount > 0;
    if (isPerfect) xpAmount += 10;

    this.ensureProgress(chapterId);
    this.state.progress[chapterId].flashcards = true;
    this.state.progress[chapterId].flashKnownRatio =
      totalCount > 0 ? knownCount / totalCount : 0;

    this.state.stats.totalFlashcardsReviewed += totalCount;
    if (isPerfect) this.state.stats.totalFlashPerfect += 1;

    this.bumpCombo();
    this.trackActivity("flashcards");
    this.updateStreak();
    const result = this.addXP(xpAmount);
    this.checkChapterComplete(chapterId);
    const newBadges = this.checkBadges();
    this.save();
    return { ...result, newBadges };
  }

  /**
   * L'élève a consulté la correction d'un exercice
   */
  completeExercice(
    chapterId: string,
    exerciceId: string,
    xpConfig?: { exercice_each?: number }
  ): { xp: number; rankUp: Rank | null; newBadges: BadgeDef[] } {
    const xpAmount = xpConfig?.exercice_each ?? DEFAULT_XP.exercice_each;

    this.state.stats.totalExercicesDone += 1;
    this.bumpCombo();
    this.trackActivity("exercices");
    this.updateStreak();
    const result = this.addXP(xpAmount);
    const newBadges = this.checkBadges();
    this.save();
    return { ...result, newBadges };
  }

  /**
   * L'élève a terminé TOUS les exercices d'un chapitre
   */
  completeAllExercices(
    chapterId: string,
    xpConfig?: { exercice_all?: number }
  ): { xp: number; rankUp: Rank | null; newBadges: BadgeDef[] } {
    const xpAmount = xpConfig?.exercice_all ?? DEFAULT_XP.exercice_all;

    this.ensureProgress(chapterId);
    this.state.progress[chapterId].exercices = true;

    const result = this.addXP(xpAmount);
    this.checkChapterComplete(chapterId);
    const newBadges = this.checkBadges();
    this.save();
    return { ...result, newBadges };
  }

  /**
   * Connexion quotidienne (appelée au chargement de la page)
   */
  dailyLogin(): { xp: number; rankUp: Rank | null; newBadges: BadgeDef[]; streakBonus: number } {
    const todayStr = today();
    let streakBonus = 0;

    // Vérifier si déjà connecté aujourd'hui
    if (this.state.streak.lastActiveDate === todayStr) {
      return { xp: 0, rankUp: null, newBadges: [], streakBonus: 0 };
    }

    // Mettre à jour le streak AVANT d'ajouter les XP
    this.updateStreak();

    // Ajouter les XP de connexion
    const result = this.addXP(DEFAULT_XP.daily_login);

    // Vérifier les bonus de streak
    for (const sb of STREAK_BONUSES) {
      if (this.state.streak.current === sb.days) {
        this.state.xp += sb.xp;
        streakBonus = sb.xp;
      }
    }

    // Badges horaires
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) this.trackActivity("night_login");
    if (hour >= 5 && hour < 7) this.trackActivity("early_login");

    this.state.stats.totalDaysActive += 1;
    const newBadges = this.checkBadges();
    this.save();
    return { ...result, newBadges, streakBonus };
  }

  /**
   * Sauvegarder le dernier chapitre consulté
   */
  setLastChapter(path: string, tab: string, title: string): void {
    this.state.lastChapter = { path, tab, title };
    this.save();
  }

  // ─── Streak ───────────────────────────────────────────

  private updateStreak(): void {
    const todayStr = today();
    const last = this.state.streak.lastActiveDate;

    if (last === todayStr) return; // déjà compté aujourd'hui

    const gap = daysBetween(last, todayStr);

    // Reset de la semaine de gels
    const currentMonday = getMonday(new Date());
    if (this.state.streak.weekStart !== currentMonday) {
      this.state.streak.weekStart = currentMonday;
      this.state.streak.freezesUsedThisWeek = 0;
    }

    if (gap === 1) {
      // Jour consécutif
      this.state.streak.current += 1;
    } else if (gap === 2 && this.state.streak.freezesUsedThisWeek < FREE_FREEZES_PER_WEEK) {
      // 1 jour raté, utilise un gel gratuit
      this.state.streak.freezesUsedThisWeek += 1;
      this.state.streak.current += 1; // on continue le streak
    } else if (gap > 1) {
      // Streak cassé
      this.state.streak.current = 1;
    } else {
      // Premier jour
      this.state.streak.current = 1;
    }

    if (this.state.streak.current > this.state.streak.best) {
      this.state.streak.best = this.state.streak.current;
    }

    this.state.streak.lastActiveDate = todayStr;
  }

  private checkStreak(): void {
    // Vérifier si le streak est toujours valide au chargement
    const todayStr = today();
    const last = this.state.streak.lastActiveDate;
    if (!last) return;

    const gap = daysBetween(last, todayStr);
    if (gap > 2) {
      // Streak définitivement cassé
      this.state.streak.current = 0;
      this.save();
    }
  }

  // ─── Progression chapitres ────────────────────────────

  private ensureProgress(chapterId: string): void {
    if (!this.state.progress[chapterId]) {
      this.state.progress[chapterId] = {
        cours: false,
        quiz: false,
        flashcards: false,
        exercices: false,
        bestQuizScore: 0,
        bestQuizTotal: 0,
        flashKnownRatio: 0,
      };
    }
  }

  private checkChapterComplete(chapterId: string): void {
    const p = this.state.progress[chapterId];
    if (p && p.cours && p.quiz && p.flashcards && p.exercices) {
      // Vérifier que le bonus n'a pas déjà été donné
      const key = `chapter_complete_${chapterId}`;
      if (typeof window !== "undefined" && !localStorage.getItem(key)) {
        this.state.xp += DEFAULT_XP.chapter_complete;
        this.state.stats.chaptersComplete += 1;
        localStorage.setItem(key, "true");
      }
    }
  }

  // ─── Tracking d'activités (session) ───────────────────

  private trackActivity(type: string): void {
    if (!this.state.stats.sessionsActivities.includes(type)) {
      this.state.stats.sessionsActivities.push(type);
    }
  }

  // ─── Badges ───────────────────────────────────────────

  private checkBadges(): BadgeDef[] {
    const newBadges: BadgeDef[] = [];
    const s = this.state.stats;
    const streak = this.state.streak.current;

    for (const badge of BADGES) {
      const existing = this.state.badges.find((b) => b.id === badge.id);

      let earnedLevel: string | null = null;

      // Badges à niveaux
      if (badge.levels) {
        let target = 0;
        switch (badge.condition) {
          case "quiz_completed":       target = s.totalQuizCompleted; break;
          case "cours_read":           target = s.totalCoursRead; break;
          case "exercices_done":       target = s.totalExercicesDone; break;
          case "flashcards_reviewed":  target = s.totalFlashcardsReviewed; break;
          case "total_days":           target = s.totalDaysActive; break;
          case "chapters_complete":    target = s.chaptersComplete; break;
          case "quiz_perfect":         target = s.totalQuizPerfect; break;
          case "quiz_perfect_streak":  target = s.quizPerfectStreak; break;
          case "flash_perfect":        target = s.totalFlashPerfect; break;
        }

        if (target >= badge.levels.or) earnedLevel = "or";
        else if (target >= badge.levels.argent) earnedLevel = "argent";
        else if (target >= badge.levels.bronze) earnedLevel = "bronze";
      }

      // Badges streak
      if (badge.condition === "streak_3"   && streak >= 3)   earnedLevel = "unique";
      if (badge.condition === "streak_7"   && streak >= 7)   earnedLevel = "unique";
      if (badge.condition === "streak_14"  && streak >= 14)  earnedLevel = "unique";
      if (badge.condition === "streak_30"  && streak >= 30)  earnedLevel = "unique";
      if (badge.condition === "streak_100" && streak >= 100) earnedLevel = "unique";
      if (badge.condition === "streak_365" && streak >= 365) earnedLevel = "unique";

      // Badges fun
      const activities = this.state.stats.sessionsActivities;
      if (badge.condition === "login_night" && activities.includes("night_login")) earnedLevel = "unique";
      if (badge.condition === "login_early" && activities.includes("early_login")) earnedLevel = "unique";
      if (badge.condition === "quiz_speed_60" && activities.includes("speed_quiz")) earnedLevel = "unique";
      if (badge.condition === "all_activities_session") {
        const has = ["cours", "quiz", "flashcards", "exercices"].every((a) => activities.includes(a));
        if (has) earnedLevel = "unique";
      }

      // Attribuer si nouveau ou upgrade
      if (earnedLevel) {
        if (!existing) {
          this.state.badges.push({ id: badge.id, level: earnedLevel, unlockedAt: today() });
          newBadges.push(badge);
        } else if (existing.level !== earnedLevel && earnedLevel !== "unique") {
          existing.level = earnedLevel;
          existing.unlockedAt = today();
          newBadges.push(badge);
        }
      }
    }

    return newBadges;
  }

  // ─── Reset (pour debug) ───────────────────────────────

  reset(): void {
    this.state = defaultState();
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.notify();
  }
}

// ─── Instance singleton ──────────────────────────────────

let instance: GamificationEngine | null = null;

export function getGamificationEngine(): GamificationEngine {
  if (!instance) {
    instance = new GamificationEngine();
  }
  return instance;
}

// ─── Hook React ──────────────────────────────────────────

export function useGamification() {
  // Ce hook sera importé dans les composants React
  // Il utilise useSyncExternalStore ou useState + useEffect
  // Implémentation légère :
  if (typeof window === "undefined") {
    return {
      xp: 0,
      rank: RANKS[0],
      nextRank: RANKS[1],
      subLevel: "bronze" as SubLevel,
      rankProgress: { current: 0, max: 100, percent: 0 },
      streak: { current: 0, best: 0 },
      badges: [],
      comboMultiplier: 1,
      engine: null as unknown as GamificationEngine,
    };
  }

  const engine = getGamificationEngine();
  return {
    xp: engine.getXP(),
    rank: engine.getRank(),
    nextRank: engine.getNextRank(),
    subLevel: engine.getSubLevel(),
    rankProgress: engine.getRankProgress(),
    streak: engine.getStreak(),
    badges: engine.getBadges(),
    comboMultiplier: engine.getComboMultiplier(),
    engine,
  };
}
