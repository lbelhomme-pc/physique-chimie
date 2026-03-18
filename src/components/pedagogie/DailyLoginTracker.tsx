// src/components/pedagogie/DailyLoginTracker.tsx
// Composant invisible qui déclenche dailyLogin() au chargement
// À placer dans le BaseLayout via client:load

import { useEffect, useState } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import XPToast, { type ToastItem } from "./XPToast";

export default function DailyLoginTracker() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function addToast(toast: Omit<ToastItem, "id">) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }
  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    try {
      const engine = getGamificationEngine();
      const result = engine.dailyLogin();

      if (result.xp > 0) {
        addToast({ type: "xp", message: `Connexion du jour : +${result.xp} XP`, icon: "🌅" });
      }

      if (result.streakBonus > 0) {
        const streak = engine.getStreak();
        addToast({
          type: "streak_bonus",
          message: `🔥 ${streak.current} jours d'affilée ! +${result.streakBonus} XP bonus`,
          icon: "🔥",
        });
      }

      if (result.rankUp) {
        addToast({
          type: "rank_up",
          message: `Nouveau rang : ${result.rankUp.icon} ${result.rankUp.name} !`,
          icon: result.rankUp.icon,
        });
      }

      for (const badge of result.newBadges) {
        addToast({
          type: "badge",
          message: `Badge : ${badge.icon} ${badge.name}`,
          icon: badge.icon,
        });
      }
    } catch (e) {
      console.warn("DailyLoginTracker: gamification not available", e);
    }
  }, []);

  // Le composant est invisible sauf pour les toasts
  return <XPToast toasts={toasts} onDismiss={dismissToast} />;
}
