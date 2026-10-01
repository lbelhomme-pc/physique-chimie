// src/components/pedagogie/StatsPage.tsx
// Page de statistiques détaillées

import { useState, useEffect } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { RANKS } from "../../data/gamification/config";

const V = {
  bg: "var(--ui5-surface)", bgSec: "var(--ui5-surface-soft)", bgTer: "var(--ui5-surface-soft)",
  text: "var(--ui5-text)", textSec: "var(--ui5-text-2)", textMut: "var(--ui5-text-3)",
  border: "var(--ui5-border)",
  primary: "var(--ui5-action)", primaryLt: "var(--ui5-action-soft)",
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

  return (
    <div className="ui5-u-max-width-800px ui5-u-margin-0-auto">
      <h1 className="ui5-u-font-size-1-5rem ui5-u-font-weight-800 ui5-u-color-ui5-text ui5-u-margin-bottom-1-5rem">📈 Mes statistiques</h1>

      {/* Profil résumé */}
      <div className="ui5-u-display-grid ui5-u-grid-template-columns-1fr-1fr-1fr ui5-u-gap-0-75rem ui5-u-margin-bottom-2rem">
        <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-2rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-text-align-center">
          <span className="ui5-u-font-size-2rem">{rank.icon}</span>
          <span className="ui5-u-font-size-1-2rem ui5-u-font-weight-800 ui5-u-color-ui5-text">{rank.name}</span>
          <span className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3">{xp} XP total</span>
          <div className="ui5-u-width-100 ui5-u-height-6px ui5-u-background-ui5-surface-soft ui5-u-border-radius-999px ui5-u-overflow-hidden ui5-u-margin-top-0-3rem">
            <div className="ui5-u-height-100 ui5-u-background-ui5-value-background ui5-u-border-radius-999px ui5-u-width-ui5-value-width" style={{ "--ui5-value-background": rank.color, "--ui5-value-width": `${rp.percent}%` } as React.CSSProperties} />
          </div>
          {nextRank && <span className="ui5-u-font-size-0-7rem ui5-u-color-ui5-text-3">{rp.max - rp.current} XP → {nextRank.icon} {nextRank.name}</span>}
        </div>

        <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-2rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-text-align-center">
          <span className="ui5-u-font-size-2rem">🔥</span>
          <span className="ui5-u-font-size-1-8rem ui5-u-font-weight-800 ui5-u-color-accent-warning">{streak.current}</span>
          <span className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3">Streak actuel</span>
          <span className="ui5-u-font-size-0-75rem ui5-u-color-ui5-text-3">Meilleur : {streak.best} jours</span>
        </div>

        <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-2rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-text-align-center">
          <span className="ui5-u-font-size-2rem">🏆</span>
          <span className="ui5-u-font-size-1-8rem ui5-u-font-weight-800 ui5-u-color-accent-purple">{badges.length}</span>
          <span className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3">Badges débloqués</span>
          <a href="/badges" className="ui5-u-font-size-0-75rem ui5-u-color-ui5-action">Voir tous →</a>
        </div>
      </div>

      {/* Stats détaillées */}
      <h2 className="ui5-stat-section-title">📊 Activité globale</h2>
      <div className="ui5-u-display-grid ui5-u-grid-template-columns-repeat-3-1fr ui5-u-gap-0-5rem ui5-u-margin-bottom-2rem">
        {[
          ["📝", stats.totalQuizCompleted, "Quiz terminés", V.primary],
          ["🎯", stats.totalQuizPerfect, "Quiz parfaits", V.success],
          ["🃏", stats.totalFlashcardsReviewed, "Flashcards révisées", V.purple],
          ["✏️", stats.totalExercicesDone, "Exercices faits", V.warning],
          ["📖", stats.totalCoursRead, "Cours lus", V.primary],
          ["📅", stats.totalDaysActive, "Jours actifs", V.success],
        ].map(([ico, val, label, color]) => (
          <div key={label as string} className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-2rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm">
            <span className="ui5-u-font-size-1-3rem">{ico}</span>
            <span className="ui5-u-font-size-1-6rem ui5-u-font-weight-800 ui5-u-color-ui5-value-color" style={{ "--ui5-value-color": color as string } as React.CSSProperties}>{val as number}</span>
            <span className="ui5-u-font-size-0-75rem ui5-u-color-ui5-text-3 ui5-u-text-align-center">{label}</span>
          </div>
        ))}
      </div>

      {/* Progression XP */}
      <h2 className="ui5-stat-section-title">⚛️ Parcours de rangs</h2>
      <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-gap-0-4rem ui5-u-margin-bottom-2rem">
        {RANKS.map((r, i) => {
          const achieved = xp >= r.xpRequired;
          const isCurrent = r.id === rank.id;
          const nextR = RANKS[i + 1];
          const progress = isCurrent && nextR
            ? Math.round(((xp - r.xpRequired) / (nextR.xpRequired - r.xpRequired)) * 100)
            : achieved ? 100 : 0;

          return (
            <div key={r.id} className={"ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-75rem ui5-u-padding-0-5rem-0-75rem" + " " + (isCurrent ? "ui5-u-background-ui5-action-soft" : (achieved ? "ui5-u-background-ui5-surface" : "ui5-u-background-ui5-surface-soft")) + " " + "ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm" + " " + (achieved ? "ui5-u-opacity-1" : "ui5-u-opacity-0-4")} style={{ "--ui5-value-border": isCurrent ? `2px solid ${V.primary}` : `1px solid ${achieved ? V.border : "transparent"}` } as React.CSSProperties}>
              <span className={"ui5-u-font-size-1-3rem" + " " + (achieved ? "ui5-u-filter-none" : "ui5-u-filter-grayscale-100")}>{r.icon}</span>
              <div className="ui5-u-flex-1">
                <div className="ui5-u-display-flex ui5-u-justify-content-space-between ui5-u-margin-bottom-0-15rem">
                  <span className={"ui5-u-font-size-0-85rem" + " " + (isCurrent ? "ui5-u-font-weight-700" : "ui5-u-font-weight-500") + " " + "ui5-u-color-ui5-text"}>{r.name}</span>
                  <span className="ui5-u-font-size-0-75rem ui5-u-color-ui5-text-3">{r.xpRequired} XP</span>
                </div>
                {(achieved || isCurrent) && (
                  <div className="ui5-u-height-4px ui5-u-background-ui5-surface-soft ui5-u-border-radius-999px ui5-u-overflow-hidden">
                    <div className="ui5-u-height-100 ui5-u-background-ui5-value-background ui5-u-border-radius-999px ui5-u-width-ui5-value-width ui5-u-transition-width-0-3s" style={{ "--ui5-value-background": r.color, "--ui5-value-width": `${progress}%` } as React.CSSProperties} />
                  </div>
                )}
              </div>
              {isCurrent && <span className="ui5-u-font-size-0-7rem ui5-u-font-weight-700 ui5-u-color-ui5-action">ACTUEL</span>}
              {achieved && !isCurrent && <span className="ui5-u-font-size-0-8rem">✅</span>}
            </div>
          );
        })}
      </div>

      {/* Moyennes */}
      <h2 className="ui5-stat-section-title">📐 Moyennes</h2>
      <div className="ui5-u-display-grid ui5-u-grid-template-columns-1fr-1fr ui5-u-gap-0-75rem ui5-u-margin-bottom-2rem">
        <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-2rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-text-align-center">
          <span className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3">XP moyen par jour actif</span>
          <span className="ui5-u-font-size-1-5rem ui5-u-font-weight-800 ui5-u-color-ui5-action">
            {stats.totalDaysActive > 0 ? Math.round(xp / stats.totalDaysActive) : 0}
          </span>
        </div>
        <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-2rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-text-align-center">
          <span className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3">Taux de quiz parfaits</span>
          <span className="ui5-u-font-size-1-5rem ui5-u-font-weight-800 ui5-u-color-accent-success">
            {stats.totalQuizCompleted > 0 ? Math.round((stats.totalQuizPerfect / stats.totalQuizCompleted) * 100) : 0}%
          </span>
        </div>
        <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-2rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-text-align-center">
          <span className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3">Chapitres complétés</span>
          <span className="ui5-u-font-size-1-5rem ui5-u-font-weight-800 ui5-u-color-accent-warning">
            {stats.chaptersComplete}
          </span>
        </div>
        <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-2rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-text-align-center">
          <span className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3">Meilleur streak</span>
          <span className="ui5-u-font-size-1-5rem ui5-u-font-weight-800 ui5-u-color-accent-danger">
            🔥 {streak.best} jours
          </span>
        </div>
      </div>
    </div>
  );
}
