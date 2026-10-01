// src/components/pedagogie/BadgesPage.tsx
// Page vitrine de tous les badges

import { useState, useEffect } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { BADGES } from "../../data/gamification/config";

const V = {
  bg: "var(--ui5-surface)", bgSec: "var(--ui5-surface-soft)", bgTer: "var(--ui5-surface-soft)",
  text: "var(--ui5-text)", textSec: "var(--ui5-text-2)", textMut: "var(--ui5-text-3)", textDis: "var(--text-disabled)",
  border: "var(--ui5-border)", primary: "var(--ui5-action)", primaryLt: "var(--ui5-action-soft)",
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
    <div className="ui5-u-max-width-800px ui5-u-margin-0-auto">
      <h1 className="ui5-u-font-size-1-5rem ui5-u-font-weight-800 ui5-u-color-ui5-text ui5-u-margin-bottom-0-5rem">🏆 Mes badges</h1>
      <p className="ui5-u-font-size-0-95rem ui5-u-color-ui5-text-2 ui5-u-margin-bottom-1-5rem">
        {unlockedCount}/{BADGES.length} badges débloqués
      </p>

      {/* Filtres par catégorie */}
      <div className="ui5-u-display-flex ui5-u-gap-0-35rem ui5-u-flex-wrap-wrap ui5-u-margin-bottom-1-5rem">
        {CATEGORIES.map(cat => {
          const active = filter === cat.id;
          const count = cat.id === "all" ? BADGES.length : BADGES.filter(b => b.category === cat.id).length;
          return (
            <button key={cat.id} onClick={() => setFilter(cat.id)} className={"ui5-u-padding-0-4rem-0-8rem ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm" + " " + (active ? "ui5-u-background-ui5-action-soft" : "ui5-u-background-ui5-surface") + " " + (active ? "ui5-u-color-ui5-action" : "ui5-u-color-ui5-text-2") + " " + "ui5-u-font-size-0-85rem" + " " + (active ? "ui5-u-font-weight-600" : "ui5-u-font-weight-400") + " " + "ui5-u-cursor-pointer"} style={{ "--ui5-value-border": `1px solid ${active ? V.primary : V.border}` } as React.CSSProperties}>
              {cat.icon} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grille de badges */}
      <div className="ui5-u-display-grid ui5-u-grid-template-columns-repeat-auto-fill-minmax-150px-1fr ui5-u-gap-0-75rem">
        {filtered.map(badge => {
          const unlocked = userBadgeMap.get(badge.id);
          const isUnlocked = !!unlocked;

          return (
            <div key={badge.id} className={"ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-3rem ui5-u-padding-1rem-0-75rem" + " " + (isUnlocked ? "ui5-u-background-ui5-surface" : "ui5-u-background-ui5-surface-soft") + " " + "ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm" + " " + (isUnlocked ? "ui5-u-opacity-1" : "ui5-u-opacity-0-5") + " " + (isUnlocked ? "ui5-u-box-shadow-none" : "ui5-u-box-shadow-none") + " " + "ui5-u-transition-all-0-2s"} style={{ "--ui5-value-border": `1px solid ${isUnlocked ? V.border : "transparent"}` } as React.CSSProperties}>
              <span className={"ui5-u-font-size-2rem" + " " + (isUnlocked ? "ui5-u-filter-none" : "ui5-u-filter-grayscale-100")}>
                {badge.icon}
              </span>
              <span className="ui5-u-font-size-0-85rem ui5-u-font-weight-700 ui5-u-color-ui5-text ui5-u-text-align-center">
                {badge.name}
              </span>
              {unlocked && unlocked.level !== "unique" && (
                <span className={"ui5-u-padding-0-1rem-0-4rem ui5-u-border-radius-999px ui5-u-font-size-0-65rem ui5-u-font-weight-700 ui5-u-text-transform-capitalize" + " " + (unlocked.level === "or" ? "ui5-u-background-fef3c7" : (unlocked.level === "argent" ? "ui5-u-background-f1f5f9" : "ui5-u-background-fde68a")) + " " + (unlocked.level === "or" ? "ui5-u-color-92400e" : (unlocked.level === "argent" ? "ui5-u-color-475569" : "ui5-u-color-78350f"))}>
                  {unlocked.level}
                </span>
              )}
              <span className="ui5-u-font-size-0-7rem ui5-u-color-ui5-text-3 ui5-u-text-align-center">
                {badge.description}
              </span>
              {badge.levels && (
                <div className="ui5-u-display-flex ui5-u-gap-0-2rem ui5-u-margin-top-0-2rem">
                  {(["bronze", "argent", "or"] as const).map(level => {
                    const threshold = badge.levels![level];
                    const achieved = unlocked && (
                      level === "bronze" ? true :
                      level === "argent" ? (unlocked.level === "argent" || unlocked.level === "or") :
                      unlocked.level === "or"
                    );
                    return (
                      <span key={level} className={"ui5-u-width-8px ui5-u-height-8px ui5-u-border-radius-50" + " " + (achieved ? (level === "or" ? "ui5-u-background-f59e0b" : (level === "argent" ? "ui5-u-background-94a3b8" : "ui5-u-background-cd7f32")) : "ui5-u-background-ui5-surface-soft") + " " + "ui5-u-border-ui5-value-border"} style={{ "--ui5-value-border": `1px solid ${achieved ? "transparent" : V.border}` } as React.CSSProperties} title={`${level}: ${threshold}`} />
                    );
                  })}
                </div>
              )}
              {isUnlocked && (
                <span className="ui5-u-font-size-0-6rem ui5-u-color-ui5-text-3">
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
