// src/components/pedagogie/StatsPage.tsx
// Page de statistiques détaillées

import { useState, useEffect, useMemo } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { RANKS } from "../../data/gamification/config";

const V = {
  bg: "var(--bg-card)", bgSec: "var(--bg-secondary)", bgTer: "var(--bg-tertiary)",
  text: "var(--text-primary)", textSec: "var(--text-secondary)", textMut: "var(--text-muted)",
  border: "var(--border-color)",
  primary: "var(--accent-primary)", primaryLt: "var(--accent-primary-light)",
  success: "var(--accent-success)", successLt: "var(--accent-success-light)",
  warning: "var(--accent-warning)", danger: "var(--accent-danger)",
  purple: "var(--accent-purple)",
};

export default function StatsPage() {
  const [engine] = useState(() => getGamificationEngine());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const u = engine.subscribe(() => forceUpdate(n => n + 1));
    return u;
  }, [engine]);

  const xp = engine.getXP();
  const rank = engine.getRank();
  const nextRank = engine.getNextRank();
  const rp = engine.getRankProgress();
  const streak = engine.getStreak();
  const stats = engine.getStats();
  const badges = engine.getBadges();

  // Rangs traversés
  const ranksAchieved = RANKS.filter(r => xp >= r.xpRequired);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: V.text, marginBottom: "1.5rem" }}>📈 Mes statistiques</h1>

      {/* Profil résumé */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
        <div style={cardStyle}>
          <span style={{ fontSize: "2rem" }}>{rank.icon}</span>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: V.text }}>{rank.name}</span>
          <span style={{ fontSize: "0.85rem", color: V.textMut }}>{xp} XP total</span>
          <div style={{ width: "100%", height: 6, background: V.bgTer, borderRadius: 99, overflow: "hidden", marginTop: "0.3rem" }}>
            <div style={{ height: "100%", background: rank.color, borderRadius: 99, width: `${rp.percent}%` }} />
          </div>
          {nextRank && <span style={{ fontSize: "0.7rem", color: V.textMut }}>{rp.max - rp.current} XP → {nextRank.icon} {nextRank.name}</span>}
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: "2rem" }}>🔥</span>
          <span style={{ fontSize: "1.8rem", fontWeight: 800, color: V.warning }}>{streak.current}</span>
          <span style={{ fontSize: "0.85rem", color: V.textMut }}>Streak actuel</span>
          <span style={{ fontSize: "0.75rem", color: V.textMut }}>Meilleur : {streak.best} jours</span>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: "2rem" }}>🏆</span>
          <span style={{ fontSize: "1.8rem", fontWeight: 800, color: V.purple }}>{badges.length}</span>
          <span style={{ fontSize: "0.85rem", color: V.textMut }}>Badges débloqués</span>
          <a href="/badges" style={{ fontSize: "0.75rem", color: V.primary }}>Voir tous →</a>
        </div>
      </div>

      {/* Stats détaillées */}
      <h2 style={sectionTitle}>📊 Activité globale</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "2rem" }}>
        {[
          ["📝", stats.totalQuizCompleted, "Quiz terminés", V.primary],
          ["🎯", stats.totalQuizPerfect, "Quiz parfaits", V.success],
          ["🃏", stats.totalFlashcardsReviewed, "Flashcards révisées", V.purple],
          ["✏️", stats.totalExercicesDone, "Exercices faits", V.warning],
          ["📖", stats.totalCoursRead, "Cours lus", V.primary],
          ["📅", stats.totalDaysActive, "Jours actifs", V.success],
        ].map(([ico, val, label, color]) => (
          <div key={label as string} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
            padding: "1rem", background: V.bg, border: `1px solid ${V.border}`, borderRadius: 10,
          }}>
            <span style={{ fontSize: "1.3rem" }}>{ico}</span>
            <span style={{ fontSize: "1.6rem", fontWeight: 800, color: color as string }}>{val as number}</span>
            <span style={{ fontSize: "0.75rem", color: V.textMut, textAlign: "center" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Progression XP */}
      <h2 style={sectionTitle}>⚛️ Parcours de rangs</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "2rem" }}>
        {RANKS.map((r, i) => {
          const achieved = xp >= r.xpRequired;
          const isCurrent = r.id === rank.id;
          const nextR = RANKS[i + 1];
          const progress = isCurrent && nextR
            ? Math.round(((xp - r.xpRequired) / (nextR.xpRequired - r.xpRequired)) * 100)
            : achieved ? 100 : 0;

          return (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.5rem 0.75rem",
              background: isCurrent ? V.primaryLt : achieved ? V.bg : V.bgTer,
              border: isCurrent ? `2px solid ${V.primary}` : `1px solid ${achieved ? V.border : "transparent"}`,
              borderRadius: 8, opacity: achieved ? 1 : 0.4,
            }}>
              <span style={{ fontSize: "1.3rem", filter: achieved ? "none" : "grayscale(100%)" }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.15rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: isCurrent ? 700 : 500, color: V.text }}>{r.name}</span>
                  <span style={{ fontSize: "0.75rem", color: V.textMut }}>{r.xpRequired} XP</span>
                </div>
                {(achieved || isCurrent) && (
                  <div style={{ height: 4, background: V.bgTer, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: r.color, borderRadius: 99, width: `${progress}%`, transition: "width 0.3s" }} />
                  </div>
                )}
              </div>
              {isCurrent && <span style={{ fontSize: "0.7rem", fontWeight: 700, color: V.primary }}>ACTUEL</span>}
              {achieved && !isCurrent && <span style={{ fontSize: "0.8rem" }}>✅</span>}
            </div>
          );
        })}
      </div>

      {/* Moyennes */}
      <h2 style={sectionTitle}>📐 Moyennes</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
        <div style={cardStyle}>
          <span style={{ fontSize: "0.85rem", color: V.textMut }}>XP moyen par jour actif</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: V.primary }}>
            {stats.totalDaysActive > 0 ? Math.round(xp / stats.totalDaysActive) : 0}
          </span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: "0.85rem", color: V.textMut }}>Taux de quiz parfaits</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: V.success }}>
            {stats.totalQuizCompleted > 0 ? Math.round((stats.totalQuizPerfect / stats.totalQuizCompleted) * 100) : 0}%
          </span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: "0.85rem", color: V.textMut }}>Chapitres complétés</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: V.warning }}>
            {stats.chaptersComplete}
          </span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: "0.85rem", color: V.textMut }}>Meilleur streak</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: V.danger }}>
            🔥 {streak.best} jours
          </span>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
  padding: "1rem", background: "var(--bg-card)", border: "1px solid var(--border-color)",
  borderRadius: 12, textAlign: "center",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem",
};
