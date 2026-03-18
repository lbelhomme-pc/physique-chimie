// src/data/accessibility/a11y-engine.ts
// Moteur d'accessibilité — gère toutes les préférences DYS
// Stocke dans localStorage, applique via classes CSS sur <html>

export interface A11yPreferences {
  // Thème
  theme: "light" | "gray-light" | "gray" | "dark" | "sepia" | "blue-light" | "auto";

  // Police
  fontFamily: "default" | "opendyslexic" | "comic-sans" | "verdana" | "arial";
  fontSize: "normal" | "large" | "x-large";

  // Espacement
  lineHeight: "normal" | "large" | "x-large";
  letterSpacing: "normal" | "large" | "x-large";
  wordSpacing: "normal" | "large" | "x-large";

  // Mise en page
  textAlign: "left" | "justify";
  maxLineWidth: "normal" | "narrow" | "very-narrow";

  // Aides visuelles
  readingGuide: boolean;       // Règle de lecture (ligne surlignée)
  syllableColoring: boolean;   // Colorisation des syllabes (optionnel)
  highlightLinks: boolean;     // Surligner les liens
  reducedMotion: boolean;      // Désactiver les animations

  // Audio
  ttsEnabled: boolean;         // Synthèse vocale activée
  ttsRate: number;             // Vitesse de lecture (0.5 à 2)

  // Focus
  focusMode: boolean;          // Mode concentration (masque éléments secondaires)
  cursorSize: "normal" | "large";
}

const STORAGE_KEY = "a11y_preferences";

const DEFAULT_PREFERENCES: A11yPreferences = {
  theme: "light",
  fontFamily: "default",
  fontSize: "normal",
  lineHeight: "normal",
  letterSpacing: "normal",
  wordSpacing: "normal",
  textAlign: "left",
  maxLineWidth: "normal",
  readingGuide: false,
  syllableColoring: false,
  highlightLinks: false,
  reducedMotion: false,
  ttsEnabled: false,
  ttsRate: 1,
  focusMode: false,
  cursorSize: "normal",
};

// ─── Profils prédéfinis ───────────────────────────────────

export interface A11yProfile {
  id: string;
  name: string;
  icon: string;
  description: string;
  overrides: Partial<A11yPreferences>;
}

export const PROFILES: A11yProfile[] = [
  {
    id: "default",
    name: "Par défaut",
    icon: "⚙️",
    description: "Affichage standard sans adaptation",
    overrides: { ...DEFAULT_PREFERENCES },
  },
  {
    id: "dyslexia",
    name: "Mode Dyslexie",
    icon: "📖",
    description: "Police OpenDyslexic, espacement augmenté, pas de justification",
    overrides: {
      fontFamily: "opendyslexic",
      fontSize: "large",
      lineHeight: "large",
      letterSpacing: "large",
      wordSpacing: "large",
      textAlign: "left",
      maxLineWidth: "narrow",
      highlightLinks: true,
    },
  },
  {
    id: "dyspraxia",
    name: "Mode Dyspraxie",
    icon: "🖱️",
    description: "Grands éléments cliquables, navigation simplifiée, pas d'animations",
    overrides: {
      fontSize: "large",
      cursorSize: "large",
      reducedMotion: true,
      highlightLinks: true,
      focusMode: true,
    },
  },
  {
    id: "adhd",
    name: "Mode TDAH",
    icon: "🎯",
    description: "Mode concentration, pas d'animations, espacement aéré",
    overrides: {
      focusMode: true,
      reducedMotion: true,
      lineHeight: "large",
      maxLineWidth: "narrow",
    },
  },
  {
    id: "visual-comfort",
    name: "Confort visuel",
    icon: "👁️",
    description: "Mode sombre, grands caractères, contraste élevé",
    overrides: {
      theme: "dark",
      fontSize: "x-large",
      lineHeight: "large",
      highlightLinks: true,
    },
  },
];

// ─── Moteur ───────────────────────────────────────────────

export class A11yEngine {
  private prefs: A11yPreferences;
  private listeners: Array<(prefs: A11yPreferences) => void> = [];

  constructor() {
    this.prefs = this.load();
    if (typeof window !== "undefined") {
      this.apply();
    }
  }

  // ─── Persistance ────────────────────────────────────

  private load(): A11yPreferences {
    if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PREFERENCES };
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  private save(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
    } catch { /* */ }
    this.notify();
  }

  // ─── Listeners ──────────────────────────────────────

  subscribe(fn: (prefs: A11yPreferences) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter((l) => l !== fn); };
  }

  private notify(): void {
    const snapshot = this.getPrefs();
    this.listeners.forEach((fn) => fn(snapshot));
  }

  // ─── Lecture / écriture ─────────────────────────────

  getPrefs(): A11yPreferences {
    return { ...this.prefs };
  }

  setPref<K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]): void {
    this.prefs[key] = value;
    this.save();
    this.apply();
  }

  setMultiple(overrides: Partial<A11yPreferences>): void {
    Object.assign(this.prefs, overrides);
    this.save();
    this.apply();
  }

  applyProfile(profileId: string): void {
    const profile = PROFILES.find((p) => p.id === profileId);
    if (profile) {
      this.prefs = { ...DEFAULT_PREFERENCES, ...profile.overrides };
      this.save();
      this.apply();
    }
  }

  reset(): void {
    this.prefs = { ...DEFAULT_PREFERENCES };
    this.save();
    this.apply();
  }

  // ─── Application des classes CSS sur <html> ─────────

  apply(): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Nettoyer toutes les classes a11y existantes
    const classes = Array.from(root.classList);
    classes.forEach((c) => {
      if (c.startsWith("a11y-")) root.classList.remove(c);
    });

    // Résoudre le thème (auto = basé sur l'heure)
    let resolvedTheme = this.prefs.theme;
    if (resolvedTheme === "auto") {
      const hour = new Date().getHours();
      if (hour >= 7 && hour < 17)       resolvedTheme = "light";      // 7h-17h : clair
      else if (hour >= 17 && hour < 20) resolvedTheme = "gray-light"; // 17h-20h : gris clair
      else if (hour >= 20 && hour < 22) resolvedTheme = "gray";       // 20h-22h : gris
      else                               resolvedTheme = "dark";       // 22h-7h : sombre
    }

    // Appliquer les nouvelles classes
    root.classList.add(`a11y-theme-${resolvedTheme}`);
    root.classList.add(`a11y-font-${this.prefs.fontFamily}`);
    root.classList.add(`a11y-fontsize-${this.prefs.fontSize}`);
    root.classList.add(`a11y-lineheight-${this.prefs.lineHeight}`);
    root.classList.add(`a11y-letterspacing-${this.prefs.letterSpacing}`);
    root.classList.add(`a11y-wordspacing-${this.prefs.wordSpacing}`);
    root.classList.add(`a11y-align-${this.prefs.textAlign}`);
    root.classList.add(`a11y-linewidth-${this.prefs.maxLineWidth}`);
    root.classList.add(`a11y-cursor-${this.prefs.cursorSize}`);

    if (this.prefs.readingGuide)    root.classList.add("a11y-reading-guide");
    if (this.prefs.highlightLinks)  root.classList.add("a11y-highlight-links");
    if (this.prefs.reducedMotion)   root.classList.add("a11y-reduced-motion");
    if (this.prefs.focusMode)       root.classList.add("a11y-focus-mode");

    // Respecter prefers-reduced-motion du système
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("a11y-reduced-motion");
    }
  }

  /** Thème actuellement appliqué (utile pour le mode auto) */
  getResolvedTheme(): string {
    if (this.prefs.theme !== "auto") return this.prefs.theme;
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 17)       return "light";
    else if (hour >= 17 && hour < 20) return "gray-light";
    else if (hour >= 20 && hour < 22) return "gray";
    else                               return "dark";
  }
}

// ─── Singleton ────────────────────────────────────────────

let instance: A11yEngine | null = null;

export function getA11yEngine(): A11yEngine {
  if (!instance) {
    instance = new A11yEngine();
  }
  return instance;
}
