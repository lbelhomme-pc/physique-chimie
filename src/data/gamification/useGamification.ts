// src/data/gamification/useGamification.ts
// Hook React pour utiliser le moteur de gamification dans les composants
// Usage : const { xp, rank, streak, engine } = useGamification();

import { useState, useEffect, useCallback } from "react";
import { getGamificationEngine, type GamificationEngine } from "./engine";
import { RANKS, type Rank, type SubLevel, getSubLevel } from "./config";

export interface GamificationState {
  xp: number;
  rank: Rank;
  nextRank: Rank | null;
  subLevel: SubLevel;
  rankProgress: { current: number; max: number; percent: number };
  streak: { current: number; best: number };
  badges: { id: string; level: string; unlockedAt: string }[];
  comboMultiplier: number;
  engine: GamificationEngine;
}

export function useGamification(): GamificationState {
  const [engine] = useState(() => getGamificationEngine());
  const [, forceUpdate] = useState(0);

  // Re-render quand l'état change
  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      forceUpdate((n) => n + 1);
    });
    return unsubscribe;
  }, [engine]);

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

/**
 * Hook pour les notifications de gamification (XP gagné, rang up, badges)
 * Affiche des toasts temporaires
 */
export interface GamificationNotification {
  id: string;
  type: "xp" | "rank_up" | "badge" | "streak_bonus";
  message: string;
  icon?: string;
  xp?: number;
}

export function useGamificationNotifications() {
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);

  const addNotification = useCallback((notif: GamificationNotification) => {
    setNotifications((prev) => [...prev, notif]);

    // Auto-dismiss après 3 secondes
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 3000);
  }, []);

  const notifyXP = useCallback((xp: number) => {
    if (xp <= 0) return;
    addNotification({
      id: `xp-${Date.now()}`,
      type: "xp",
      message: `+${xp} XP`,
      xp,
    });
  }, [addNotification]);

  const notifyRankUp = useCallback((rank: Rank) => {
    addNotification({
      id: `rank-${Date.now()}`,
      type: "rank_up",
      message: `Nouveau rang : ${rank.icon} ${rank.name} !`,
      icon: rank.icon,
    });
  }, [addNotification]);

  const notifyBadge = useCallback((badge: { name: string; icon: string }) => {
    addNotification({
      id: `badge-${Date.now()}`,
      type: "badge",
      message: `Badge débloqué : ${badge.icon} ${badge.name}`,
      icon: badge.icon,
    });
  }, [addNotification]);

  const notifyStreakBonus = useCallback((xp: number, days: number) => {
    addNotification({
      id: `streak-${Date.now()}`,
      type: "streak_bonus",
      message: `🔥 ${days} jours d'affilée ! +${xp} XP bonus`,
      xp,
    });
  }, [addNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    notifyXP,
    notifyRankUp,
    notifyBadge,
    notifyStreakBonus,
    dismissNotification,
  };
}
