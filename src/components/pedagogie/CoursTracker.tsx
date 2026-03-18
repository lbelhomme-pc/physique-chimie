// src/components/pedagogie/CoursTracker.tsx
// v2 : Tracking scroll + XP + bouton TTS qui lit le cours depuis le DOM

import { useEffect, useRef, useState } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import XPToast, { type ToastItem } from "./XPToast";
import TextToSpeech from "./TextToSpeech";

interface CoursTrackerProps {
  chapterId: string;
  xpConfig?: { cours?: number };
  children: React.ReactNode;
}

export default function CoursTracker({ chapterId, xpConfig, children }: CoursTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasTracked, setHasTracked] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const maxScrollRef = useRef(0);
  const [coursText, setCoursText] = useState("");

  function addToast(toast: Omit<ToastItem, "id">) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }
  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // Extraire le texte du cours depuis le DOM pour le TTS
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const text = containerRef.current.innerText || containerRef.current.textContent || "";
        setCoursText(text.trim());
      }
    }, 1000); // Attendre que le MDX soit rendu
    return () => clearTimeout(timer);
  }, [children]);

  // Vérifier si déjà marqué comme lu
  useEffect(() => {
    try {
      const engine = getGamificationEngine();
      const progress = engine.getChapterProgress(chapterId);
      if (progress?.cours) {
        setHasTracked(true);
      }
    } catch { /* */ }
  }, [chapterId]);

  // Scroll tracking
  useEffect(() => {
    if (hasTracked) return;

    function handleScroll() {
      if (hasTracked) return;
      const container = containerRef.current;
      if (!container) return;

      const windowHeight = window.innerHeight;
      const containerHeight = container.scrollHeight;
      const containerTop = container.offsetTop;
      const scrolled = window.scrollY + windowHeight - containerTop;
      const percent = Math.min(100, Math.max(0, (scrolled / containerHeight) * 100));

      if (percent > maxScrollRef.current) {
        maxScrollRef.current = percent;
      }

      if (maxScrollRef.current >= 90 && !hasTracked) {
        setHasTracked(true);
        rewardCoursRead();
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapterId, hasTracked]);

  function rewardCoursRead() {
    try {
      const engine = getGamificationEngine();
      const result = engine.completeCours(chapterId, xpConfig);

      if (result.xp > 0) {
        addToast({ type: "xp", message: `Cours lu ! +${result.xp} XP 📖`, icon: "📖" });
      }
      if (result.rankUp) {
        addToast({ type: "rank_up", message: `Nouveau rang : ${result.rankUp.icon} ${result.rankUp.name} !`, icon: result.rankUp.icon });
      }
      for (const badge of result.newBadges) {
        addToast({ type: "badge", message: `Badge : ${badge.icon} ${badge.name}`, icon: badge.icon });
      }
    } catch (e) {
      console.warn("CoursTracker: gamification not available", e);
    }
  }

  return (
    <div>
      {/* Barre TTS pour le cours */}
      {coursText.length > 50 && (
        <div style={{ marginBottom: "1rem" }}>
          <TextToSpeech text={coursText} label="Écouter le cours" />
        </div>
      )}

      {/* Indicateur si déjà lu */}
      {hasTracked && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.3rem 0.7rem", background: "var(--accent-success-light)",
          border: "1px solid var(--accent-success)", borderRadius: 6,
          fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-success)",
          marginBottom: "1rem",
        }}>
          ✅ Cours déjà lu
        </div>
      )}

      {/* Contenu MDX du cours */}
      <div ref={containerRef}>
        {children}
      </div>

      <XPToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
