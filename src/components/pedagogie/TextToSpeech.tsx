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
    primary: "var(--accent-primary)",
    primaryLt: "var(--accent-primary-light)",
    text: "var(--text-primary)",
    textSec: "var(--text-secondary)",
    textMut: "var(--text-muted)",
    border: "var(--border-color)",
    bg: "var(--bg-card)",
  };

  // ─── Mode compact (petit bouton) ──────────────────────
  if (compact) {
    return (
      <button
        onClick={isPlaying ? stop : speak}
        style={{
          padding: "0.35rem 0.7rem",
          border: `1px solid ${V.border}`,
          borderRadius: 6,
          background: isPlaying ? V.primaryLt : V.bg,
          color: isPlaying ? V.primary : V.textSec,
          fontSize: "0.8rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
        title={isPlaying ? "Arrêter la lecture" : "Lire à voix haute"}
      >
        <span>{isPlaying ? "⏹️" : "🔊"}</span>
        <span>{isPlaying ? "Stop" : label}</span>
      </button>
    );
  }

  // ─── Mode étendu (avec contrôles vitesse) ─────────────
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 0.75rem",
      background: V.primaryLt,
      border: `1px solid ${V.border}`,
      borderRadius: 8,
      flexWrap: "wrap",
    }}>
      {/* Bouton play/pause/stop */}
      {!isPlaying && !isPaused && (
        <button onClick={speak} style={{...btnStyle, background: V.primary, color: "#fff"}}>
          🔊 {label}
        </button>
      )}
      {isPlaying && (
        <button onClick={pause} style={{...btnStyle, background: V.primary, color: "#fff"}}>
          ⏸️ Pause
        </button>
      )}
      {isPaused && (
        <button onClick={speak} style={{...btnStyle, background: V.primary, color: "#fff"}}>
          ▶️ Reprendre
        </button>
      )}
      {(isPlaying || isPaused) && (
        <button onClick={stop} style={{...btnStyle, background: "transparent", color: V.textSec, border: `1px solid ${V.border}`}}>
          ⏹️ Stop
        </button>
      )}

      {/* Vitesse */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginLeft: "auto" }}>
        <span style={{ fontSize: "0.7rem", color: V.textMut }}>Vitesse :</span>
        {[0.7, 0.9, 1.1, 1.3].map((r) => (
          <button
            key={r}
            onClick={() => setCurrentRate(r)}
            style={{
              padding: "0.15rem 0.4rem",
              border: `1px solid ${currentRate === r ? V.primary : V.border}`,
              borderRadius: 4,
              background: currentRate === r ? V.primaryLt : "transparent",
              color: currentRate === r ? V.primary : V.textMut,
              fontSize: "0.7rem",
              fontWeight: currentRate === r ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.4rem 0.8rem",
  border: "none",
  borderRadius: 6,
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer",
};
