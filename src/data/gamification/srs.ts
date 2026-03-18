// src/data/gamification/srs.ts
// Spaced Repetition System — Algorithme SM-2 simplifié (style Anki)
// Gère les intervalles de révision par carte, par utilisateur

// ─── Types ────────────────────────────────────────────────

export interface CardState {
  cardId: string;
  chapterId: string;
  ease: number;          // Facteur de facilité (défaut 2.5, min 1.3)
  interval: number;      // Jours avant prochaine révision
  repetitions: number;   // Nombre de révisions réussies consécutives
  nextReview: string;    // "YYYY-MM-DD"
  lastReview: string;    // "YYYY-MM-DD"
  lapses: number;        // Nombre d'oublis total
}

export type SRSRating = "again" | "hard" | "good" | "easy";

export interface ReviewResult {
  cardId: string;
  newState: CardState;
  previousInterval: number;
}

// ─── Constantes ───────────────────────────────────────────

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const STORAGE_KEY = "srs_cards";

// ─── Helpers ──────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

// ─── Moteur SRS ───────────────────────────────────────────

export class SRSEngine {
  private cards: Map<string, CardState>;

  constructor() {
    this.cards = this.load();
  }

  // ─── Persistance ──────────────────────────────────────

  private load(): Map<string, CardState> {
    if (typeof window === "undefined") return new Map();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Map();
      const arr: CardState[] = JSON.parse(raw);
      const map = new Map<string, CardState>();
      for (const c of arr) {
        map.set(this.key(c.chapterId, c.cardId), c);
      }
      return map;
    } catch {
      return new Map();
    }
  }

  private save(): void {
    if (typeof window === "undefined") return;
    try {
      const arr = Array.from(this.cards.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch { /* */ }
  }

  private key(chapterId: string, cardId: string): string {
    return `${chapterId}::${cardId}`;
  }

  // ─── Obtenir l'état d'une carte ───────────────────────

  getCardState(chapterId: string, cardId: string): CardState | null {
    return this.cards.get(this.key(chapterId, cardId)) ?? null;
  }

  // ─── Créer un état initial pour une nouvelle carte ────

  private createNewCard(chapterId: string, cardId: string): CardState {
    return {
      cardId,
      chapterId,
      ease: DEFAULT_EASE,
      interval: 0,       // Jamais vue
      repetitions: 0,
      nextReview: today(),
      lastReview: "",
      lapses: 0,
    };
  }

  // ─── Algorithme SM-2 simplifié ────────────────────────

  review(chapterId: string, cardId: string, rating: SRSRating): ReviewResult {
    const k = this.key(chapterId, cardId);
    let state = this.cards.get(k) ?? this.createNewCard(chapterId, cardId);
    const previousInterval = state.interval;

    const todayStr = today();

    switch (rating) {
      case "again":
        // Oubli total → retour à 1 jour, ease baisse
        state.interval = 1;
        state.ease = Math.max(MIN_EASE, state.ease - 0.2);
        state.repetitions = 0;
        state.lapses += 1;
        break;

      case "hard":
        // Difficile → intervalle augmente peu, ease baisse un peu
        if (state.repetitions === 0) {
          state.interval = 1;
        } else {
          state.interval = Math.max(1, Math.round(state.interval * 1.2));
        }
        state.ease = Math.max(MIN_EASE, state.ease - 0.15);
        state.repetitions += 1;
        break;

      case "good":
        // Bien → intervalle normal
        if (state.repetitions === 0) {
          state.interval = 1;
        } else if (state.repetitions === 1) {
          state.interval = 3;
        } else {
          state.interval = Math.round(state.interval * state.ease);
        }
        // ease inchangé
        state.repetitions += 1;
        break;

      case "easy":
        // Facile → intervalle boosté, ease augmente
        if (state.repetitions === 0) {
          state.interval = 3;
        } else if (state.repetitions === 1) {
          state.interval = 7;
        } else {
          state.interval = Math.round(state.interval * state.ease * 1.3);
        }
        state.ease = state.ease + 0.15;
        state.repetitions += 1;
        break;
    }

    // Plafond à 365 jours
    state.interval = Math.min(365, state.interval);

    state.lastReview = todayStr;
    state.nextReview = addDays(todayStr, state.interval);

    this.cards.set(k, state);
    this.save();

    return { cardId, newState: state, previousInterval };
  }

  // ─── Cartes à revoir aujourd'hui ──────────────────────

  getDueCards(chapterId?: string): CardState[] {
    const todayStr = today();
    const due: CardState[] = [];

    for (const state of this.cards.values()) {
      if (chapterId && state.chapterId !== chapterId) continue;
      if (state.nextReview <= todayStr) {
        due.push(state);
      }
    }

    // Trier : en retard d'abord, puis par facilité croissante (les plus durs d'abord)
    due.sort((a, b) => {
      const daysOverdueA = daysBetween(a.nextReview, todayStr);
      const daysOverdueB = daysBetween(b.nextReview, todayStr);
      if (daysOverdueA !== daysOverdueB) return daysOverdueB - daysOverdueA;
      return a.ease - b.ease;
    });

    return due;
  }

  // ─── Nouvelles cartes (jamais vues) ───────────────────

  getNewCards(chapterId: string, allCardIds: string[]): string[] {
    return allCardIds.filter((id) => !this.cards.has(this.key(chapterId, id)));
  }

  // ─── Stats pour un chapitre ───────────────────────────

  getChapterStats(chapterId: string, allCardIds: string[]): {
    total: number;
    learned: number;     // vues au moins 1 fois
    learning: number;    // vues mais intervalle <= 21 jours (en apprentissage)
    mature: number;      // intervalle > 21 jours (maîtrisées)
    due: number;         // à revoir aujourd'hui
    newCards: number;     // jamais vues
    averageEase: number;
  } {
    const todayStr = today();
    let learned = 0, learning = 0, mature = 0, due = 0;
    let totalEase = 0, easeCount = 0;

    for (const id of allCardIds) {
      const state = this.cards.get(this.key(chapterId, id));
      if (state) {
        learned++;
        totalEase += state.ease;
        easeCount++;
        if (state.interval > 21) {
          mature++;
        } else {
          learning++;
        }
        if (state.nextReview <= todayStr) due++;
      }
    }

    return {
      total: allCardIds.length,
      learned,
      learning,
      mature,
      due,
      newCards: allCardIds.length - learned,
      averageEase: easeCount > 0 ? Math.round((totalEase / easeCount) * 100) / 100 : DEFAULT_EASE,
    };
  }

  // ─── Stats globales (tous chapitres) ──────────────────

  getGlobalDueCount(): number {
    const todayStr = today();
    let count = 0;
    for (const state of this.cards.values()) {
      if (state.nextReview <= todayStr) count++;
    }
    return count;
  }

  getGlobalDueByChapter(): { chapterId: string; count: number }[] {
    const todayStr = today();
    const map = new Map<string, number>();

    for (const state of this.cards.values()) {
      if (state.nextReview <= todayStr) {
        map.set(state.chapterId, (map.get(state.chapterId) ?? 0) + 1);
      }
    }

    return Array.from(map.entries())
      .map(([chapterId, count]) => ({ chapterId, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ─── Prochain intervalle prévu (pour affichage) ───────

  getNextIntervalPreview(chapterId: string, cardId: string): {
    again: number; hard: number; good: number; easy: number;
  } {
    const state = this.cards.get(this.key(chapterId, cardId))
      ?? this.createNewCard(chapterId, cardId);

    function calc(rating: SRSRating): number {
      const s = { ...state };
      switch (rating) {
        case "again": return 1;
        case "hard":
          return s.repetitions === 0 ? 1 : Math.max(1, Math.round(s.interval * 1.2));
        case "good":
          if (s.repetitions === 0) return 1;
          if (s.repetitions === 1) return 3;
          return Math.round(s.interval * s.ease);
        case "easy":
          if (s.repetitions === 0) return 3;
          if (s.repetitions === 1) return 7;
          return Math.round(s.interval * s.ease * 1.3);
      }
    }

    return {
      again: calc("again"),
      hard: calc("hard"),
      good: calc("good"),
      easy: calc("easy"),
    };
  }

  // ─── Reset ────────────────────────────────────────────

  resetChapter(chapterId: string): void {
    for (const [key, state] of this.cards.entries()) {
      if (state.chapterId === chapterId) {
        this.cards.delete(key);
      }
    }
    this.save();
  }

  resetAll(): void {
    this.cards.clear();
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

// ─── Singleton ───────────────────────────────────────────

let instance: SRSEngine | null = null;

export function getSRSEngine(): SRSEngine {
  if (!instance) {
    instance = new SRSEngine();
  }
  return instance;
}

// ─── Helper : formater un intervalle en texte lisible ────

export function formatInterval(days: number): string {
  if (days === 0) return "maintenant";
  if (days === 1) return "1 jour";
  if (days < 7) return `${days} jours`;
  if (days < 14) return "1 semaine";
  if (days < 30) return `${Math.round(days / 7)} semaines`;
  if (days < 60) return "1 mois";
  if (days < 365) return `${Math.round(days / 30)} mois`;
  return "1 an+";
}
