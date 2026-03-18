// src/components/pedagogie/BadgesPage.tsx
// Page vitrine de tous les badges

import { useState, useEffect } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { BADGES, type BadgeDef } from "../../data/gamification/config";

const V = {
  bg: "var(--bg-card)", bgSec: "var(--bg-secondary)", bgTer: "var(--bg-tertiary)",
  text: "var(--text-primary)", textSec: "var(--text-secondary)", textMut: "var(--text-muted)", textDis: "var(--text-disabled)",
  border: "var(--border-color)", primary: "var(--accent-primary)", primaryLt: "var(--accent-primary-light)",
  success: "var(--accent-success)", warning: "var(--accent-warning)", danger: "var(--accent-danger)", purple: "var(--accent-purple)",
};

const CATEGORIES = [
  { id: "all", label: "Tous", icon: "🏆" },
  { id: "progression", label: "Progression", icon: "📈" },
  { id: "maitrise", label: "Maîtrise", icon: "🎯" },
  { id: "streak", label: "Streak", icon: "🔥" },
  { id: "fun", label: "Fun", icon: "🎲" },
];

export default function BadgesPage() {
  const [engine] = useState(() => getGamificationEngine());
  const [, forceUpdate] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const u = engine.subscribe(() => forceUpdate(n => n + 1));
    return u;
  }, [engine]);

  const userBadges = engine.getBadges();
  const userBadgeMap = new Map(userBadges.map(b => [b.id, b]));

  const filtered = filter === "all" ? BADGES : BADGES.filter(b => b.category === filter);
  const unlockedCount = userBadges.length;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: V.text, marginBottom: "0.5rem" }}>🏆 Mes badges</h1>
      <p style={{ fontSize: "0.95rem", color: V.textSec, marginBottom: "1.5rem" }}>
        {unlockedCount}/{BADGES.length} badges débloqués
      </p>

      {/* Filtres par catégorie */}
      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {CATEGORIES.map(cat => {
          const active = filter === cat.id;
          const count = cat.id === "all" ? BADGES.length : BADGES.filter(b => b.category === cat.id).length;
          return (
            <button key={cat.id} onClick={() => setFilter(cat.id)} style={{
              padding: "0.4rem 0.8rem", border: `1px solid ${active ? V.primary : V.border}`,
              borderRadius: 8, background: active ? V.primaryLt : V.bg,
              color: active ? V.primary : V.textSec, fontSize: "0.85rem", fontWeight: active ? 600 : 400, cursor: "pointer",
            }}>
              {cat.icon} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grille de badges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
        {filtered.map(badge => {
          const unlocked = userBadgeMap.get(badge.id);
          const isUnlocked = !!unlocked;

          return (
            <div key={badge.id} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem",
              padding: "1rem 0.75rem", background: isUnlocked ? V.bg : V.bgTer,
              border: `1px solid ${isUnlocked ? V.border : "transparent"}`,
              borderRadius: 12, opacity: isUnlocked ? 1 : 0.5,
              boxShadow: isUnlocked ? "var(--shadow-sm)" : "none",
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: "2rem", filter: isUnlocked ? "none" : "grayscale(100%)" }}>
                {badge.icon}
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: V.text, textAlign: "center" }}>
                {badge.name}
              </span>
              {unlocked && unlocked.level !== "unique" && (
                <span style={{
                  padding: "0.1rem 0.4rem", borderRadius: 99, fontSize: "0.65rem", fontWeight: 700,
                  textTransform: "capitalize",
                  background: unlocked.level === "or" ? "#fef3c7" : unlocked.level === "argent" ? "#f1f5f9" : "#fde68a",
                  color: unlocked.level === "or" ? "#92400e" : unlocked.level === "argent" ? "#475569" : "#78350f",
                }}>
                  {unlocked.level}
                </span>
              )}
              <span style={{ fontSize: "0.7rem", color: V.textMut, textAlign: "center" }}>
                {badge.description}
              </span>
              {badge.levels && (
                <div style={{ display: "flex", gap: "0.2rem", marginTop: "0.2rem" }}>
                  {(["bronze", "argent", "or"] as const).map(level => {
                    const threshold = badge.levels![level];
                    const achieved = unlocked && (
                      level === "bronze" ? true :
                      level === "argent" ? (unlocked.level === "argent" || unlocked.level === "or") :
                      unlocked.level === "or"
                    );
                    return (
                      <span key={level} style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: achieved ? (level === "or" ? "#f59e0b" : level === "argent" ? "#94a3b8" : "#cd7f32") : V.bgTer,
                        border: `1px solid ${achieved ? "transparent" : V.border}`,
                      }} title={`${level}: ${threshold}`} />
                    );
                  })}
                </div>
              )}
              {isUnlocked && (
                <span style={{ fontSize: "0.6rem", color: V.textMut }}>
                  Débloqué le {new Date(unlocked.unlockedAt).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
