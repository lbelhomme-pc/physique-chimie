// src/components/pedagogie/TextToSpeech.tsx
// Bouton "Écouter" — lit le texte à voix haute via Web Speech API
// Usage : <TextToSpeech text="Le texte à lire" />

import { useState, useEffect, useRef, useCallback } from "react";

interface TextToSpeechProps {
  /** Texte à lire (les formules LaTeX $...$ sont nettoyées automatiquement) */
  text: string;
  /** Label du bouton */
  label?: string;
  /** Vitesse de lecture (0.5 à 2, défaut 0.9) */
  rate?: number;
  /** Style compact (petit bouton) ou étendu (avec contrôles) */
  compact?: boolean;
}

// ─── Nettoyer le texte LaTeX pour la lecture ──────────────
function cleanForSpeech(text: string): string {
  return text
    // Supprimer les blocs $$...$$
    .replace(/\$\$[\s\S]*?\$\$/g, " formule mathématique ")
    // Supprimer les formules inline $...$
    .replace(/\$[^$]+\$/g, (match) => {
      // Essayer d'extraire un texte lisible
      const inner = match.slice(1, -1);
      // Cas courants
      if (inner.includes("\\text{")) {
        return inner.replace(/.*\\text\{([^}]+)\}.*/, "$1");
      }
      if (inner === "Z" || inner === "A" || inner === "N") return inner;
      if (inner.match(/^[A-Za-z0-9=+\-×÷]+$/)) return inner;
      return " formule ";
    })
    // Nettoyer les commandes LaTeX restantes
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}^_]/g, "")
    // Nettoyer les espaces multiples
    .replace(/\s+/g, " ")
    .trim();
}

export default function TextToSpeech({ text, label = "Écouter", rate = 0.9, compact = false }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const [currentRate, setCurrentRate] = useState(rate);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
    // Cleanup au démontage
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const speak = useCallback(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    // Si en pause, reprendre
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Annuler toute lecture en cours
    synth.cancel();

    const cleanText = cleanForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "fr-FR";
    utterance.rate = currentRate;
    utterance.pitch = 1;

    // Chercher une voix française
    const voices = synth.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith("fr")) ?? voices[0];
    if (frVoice) utterance.voice = frVoice;

    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [text, supported, isPaused, currentRate]);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  if (!supported) return null;

  const V = {
    primary: "var(--ui5-action)",
    primaryLt: "var(--ui5-action-soft)",
    text: "var(--ui5-text)",
    textSec: "var(--ui5-text-2)",
    textMut: "var(--ui5-text-3)",
    border: "var(--ui5-border)",
    bg: "var(--ui5-surface)",
  };

  // ─── Mode compact (petit bouton) ──────────────────────
  if (compact) {
    return (
      <button
        onClick={isPlaying ? stop : speak}
        className={"ui5-u-padding-0-35rem-0-7rem ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm" + " " + (isPlaying ? "ui5-u-background-ui5-action-soft" : "ui5-u-background-ui5-surface") + " " + (isPlaying ? "ui5-u-color-ui5-action" : "ui5-u-color-ui5-text-2") + " " + "ui5-u-font-size-0-8rem ui5-u-cursor-pointer ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-3rem"}
        title={isPlaying ? "Arrêter la lecture" : "Lire à voix haute"}
      >
        <span>{isPlaying ? "⏹️" : "🔊"}</span>
        <span>{isPlaying ? "Stop" : label}</span>
      </button>
    );
  }

  // ─── Mode étendu (avec contrôles vitesse) ─────────────
  return (
    <div className="ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-5rem ui5-u-padding-0-5rem-0-75rem ui5-u-background-ui5-action-soft ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-flex-wrap-wrap">
      {/* Bouton play/pause/stop */}
      {!isPlaying && !isPaused && (
        <button onClick={speak} className="ui5-u-padding-0-4rem-0-8rem ui5-u-border-none ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-85rem ui5-u-font-weight-600 ui5-u-cursor-pointer ui5-u-background-ui5-action ui5-u-color-fff">
          🔊 {label}
        </button>
      )}
      {isPlaying && (
        <button onClick={pause} className="ui5-u-padding-0-4rem-0-8rem ui5-u-border-none ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-85rem ui5-u-font-weight-600 ui5-u-cursor-pointer ui5-u-background-ui5-action ui5-u-color-fff">
          ⏸️ Pause
        </button>
      )}
      {isPaused && (
        <button onClick={speak} className="ui5-u-padding-0-4rem-0-8rem ui5-u-border-none ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-85rem ui5-u-font-weight-600 ui5-u-cursor-pointer ui5-u-background-ui5-action ui5-u-color-fff">
          ▶️ Reprendre
        </button>
      )}
      {(isPlaying || isPaused) && (
        <button onClick={stop} className="ui5-u-padding-0-4rem-0-8rem ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-85rem ui5-u-font-weight-600 ui5-u-cursor-pointer ui5-u-background-transparent ui5-u-color-ui5-text-2">
          ⏹️ Stop
        </button>
      )}

      {/* Vitesse */}
      <div className="ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-3rem ui5-u-margin-left-auto">
        <span className="ui5-u-font-size-0-7rem ui5-u-color-ui5-text-3">Vitesse :</span>
        {[0.7, 0.9, 1.1, 1.3].map((r) => (
          <button
            key={r}
            onClick={() => setCurrentRate(r)}
            className={"ui5-u-padding-0-15rem-0-4rem ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm" + " " + (currentRate === r ? "ui5-u-background-ui5-action-soft" : "ui5-u-background-transparent") + " " + (currentRate === r ? "ui5-u-color-ui5-action" : "ui5-u-color-ui5-text-3") + " " + "ui5-u-font-size-0-7rem" + " " + (currentRate === r ? "ui5-u-font-weight-700" : "ui5-u-font-weight-400") + " " + "ui5-u-cursor-pointer"} style={{ "--ui5-value-border": `1px solid ${currentRate === r ? V.primary : V.border}` } as React.CSSProperties}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}
