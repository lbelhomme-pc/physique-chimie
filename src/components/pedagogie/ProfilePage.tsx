// src/components/pedagogie/ProfilePage.tsx
// Page profil unifiée — rang, XP, streak, stats, badges, parcours de rangs

import { useState, useEffect } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { RANKS, BADGES } from "../../data/gamification/config";

const V = {
  bg: "var(--ui5-surface)", bgSec: "var(--ui5-surface-soft)", bgTer: "var(--ui5-surface-soft)",
  text: "var(--ui5-text)", textSec: "var(--ui5-text-2)", textMut: "var(--ui5-text-3)", textDis: "var(--text-disabled)",
  border: "var(--ui5-border)", borderLight: "var(--ui5-border)",
  primary: "var(--ui5-action)", primaryLt: "var(--ui5-action-soft)",
  success: "var(--accent-success)", successLt: "var(--accent-success-light)",
  warning: "var(--accent-warning)", warningLt: "var(--accent-warning-light)",
  danger: "var(--accent-danger)", dangerLt: "var(--accent-danger-light)",
  purple: "var(--accent-purple)", purpleLt: "var(--accent-purple-light)",
  orange: "var(--accent-orange)",
  shadow: "var(--shadow-card)", radiusMd: "var(--radius-md)", radiusLg: "var(--radius-lg)", radiusPill: "var(--radius-pill)",
};

const CATEGORIES = [
  { id: "all", label: "Tous", icon: "🏆" },
  { id: "progression", label: "Progression", icon: "📈" },
  { id: "maitrise", label: "Maîtrise", icon: "🎯" },
  { id: "streak", label: "Streak", icon: "🔥" },
  { id: "fun", label: "Fun", icon: "🎲" },
];

export default function ProfilePage() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [engine] = useState(() => getGamificationEngine());
  const [, forceUpdate] = useState(0);
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [showAllRanks, setShowAllRanks] = useState(false);

  useEffect(() => { const u = engine.subscribe(() => forceUpdate(n => n + 1)); return u; }, [engine]);

  const xp = engine.getXP(), rank = engine.getRank(), nextRank = engine.getNextRank();
  const rp = engine.getRankProgress(), streak = engine.getStreak(), badges = engine.getBadges();
  const stats = engine.getStats();
  const userBadgeMap = new Map(badges.map(b => [b.id, b]));
  const filteredBadges = badgeFilter === "all" ? BADGES : BADGES.filter(b => b.category === badgeFilter);

  if (!ready) return <p role="status" aria-live="polite">Chargement du profil local…</p>;

  return (
    <div className="ui5-u-max-width-900px ui5-u-margin-0-auto">

      <h2 className="ui5-u-font-size-1-4rem ui5-u-font-weight-800 ui5-u-color-ui5-text ui5-u-margin-bottom-1-25rem">👤 Mon profil</h2>

      {/* ─── Carte profil principale ─────────────────── */}
      <div className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-25rem ui5-u-margin-bottom-1-25rem ui5-u-border-1px-solid-ui5-border">

        {/* Rang + XP + Streak en ligne */}
        <div className="ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-1rem ui5-u-margin-bottom-1rem ui5-u-flex-wrap-wrap">
          <div className="ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-5rem ui5-u-flex-1 ui5-u-min-width-200px">
            <span className="ui5-u-font-size-2rem">{rank.icon}</span>
            <div>
              <div className="ui5-u-font-size-1rem ui5-u-font-weight-700 ui5-u-color-ui5-text">{rank.name}</div>
              <div className="ui5-u-font-size-0-8rem ui5-u-color-ui5-text-3">{xp} XP</div>
            </div>
          </div>
          <div className="ui5-u-flex-1 ui5-u-min-width-150px">
            <div className="ui5-u-height-8px ui5-u-background-ui5-surface-soft ui5-u-border-radius-999px ui5-u-overflow-hidden ui5-u-margin-bottom-0-2rem">
              <div className="ui5-u-height-100 ui5-u-border-radius-999px ui5-u-background-ui5-value-background ui5-u-width-ui5-value-width ui5-u-transition-width-0-5s" style={{ "--ui5-value-background": rank.color, "--ui5-value-width": `${rp.percent}%` } as React.CSSProperties}/>
            </div>
            {nextRank && <span className="ui5-u-font-size-0-7rem ui5-u-color-ui5-text-3">{rp.max-rp.current} XP → {nextRank.icon} {nextRank.name}</span>}
          </div>
          <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-padding-0-25rem-0-75rem">
            <span className="ui5-u-font-size-1-3rem">🔥</span>
            <span className="ui5-u-font-size-1-2rem ui5-u-font-weight-800 ui5-u-color-accent-orange">{streak.current}</span>
            <span className="ui5-u-font-size-0-65rem ui5-u-color-ui5-text-3">jour{streak.current>1?"s":""}</span>
          </div>
        </div>

        {/* Stats en grille compacte */}
        <div className="ui5-u-display-grid ui5-u-grid-template-columns-repeat-6-1fr ui5-u-gap-0-4rem">
          {[
            ["📝",stats.totalQuizCompleted,"Quiz"],
            ["🎯",stats.totalQuizPerfect,"Parfaits"],
            ["🃏",stats.totalFlashcardsReviewed,"Flash"],
            ["✏️",stats.totalExercicesDone,"Exos"],
            ["📖",stats.totalCoursRead,"Cours"],
            ["📅",stats.totalDaysActive,"Jours"],
          ].map(([ico,val,lab])=>(
            <div key={lab as string} className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-05rem ui5-u-padding-0-4rem-0-25rem ui5-u-background-ui5-surface-soft ui5-u-border-radius-ui5-radius-sm">
              <span className="ui5-u-font-size-0-85rem">{ico}</span>
              <span className="ui5-u-font-size-1-1rem ui5-u-font-weight-800 ui5-u-color-ui5-text">{val as number}</span>
              <span className="ui5-u-font-size-0-6rem ui5-u-color-ui5-text-3">{lab}</span>
            </div>
          ))}
        </div>

        {/* Moyennes */}
        <div className="ui5-u-display-flex ui5-u-justify-content-center ui5-u-gap-1-5rem ui5-u-margin-top-0-75rem ui5-u-font-size-0-8rem ui5-u-color-ui5-text-3">
          <span>📊 {stats.totalDaysActive>0?Math.round(xp/stats.totalDaysActive):0} XP/jour</span>
          <span>🎯 {stats.totalQuizCompleted>0?Math.round((stats.totalQuizPerfect/stats.totalQuizCompleted)*100):0}% parfaits</span>
          <span>🔥 Meilleur : {streak.best}j</span>
        </div>
      </div>

      {/* ─── Parcours de rangs ───────────────────────── */}
      <div className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-25rem ui5-u-margin-bottom-1-25rem ui5-u-border-1px-solid-ui5-border">
        <div className="ui5-u-display-flex ui5-u-justify-content-space-between ui5-u-align-items-center ui5-u-margin-bottom-0-75rem">
          <h2 className="ui5-u-font-size-1rem ui5-u-font-weight-700 ui5-u-color-ui5-text ui5-u-margin-0">⚛️ Parcours de rangs</h2>
          <button onClick={()=>setShowAllRanks(!showAllRanks)} className="ui5-u-font-size-0-75rem ui5-u-color-ui5-action ui5-u-background-none ui5-u-border-none ui5-u-cursor-pointer ui5-u-font-family-inherit">
            {showAllRanks ? "Réduire" : "Voir tout"}
          </button>
        </div>
        <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-gap-0-3rem">
          {(showAllRanks ? RANKS : RANKS.slice(0, 5)).map((r, i) => {
            const achieved = xp >= r.xpRequired;
            const isCurrent = r.id === rank.id;
            const nextR = RANKS[i + 1];
            const progress = isCurrent && nextR ? Math.round(((xp - r.xpRequired) / (nextR.xpRequired - r.xpRequired)) * 100) : achieved ? 100 : 0;
            return (
              <div key={r.id} className={"ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-6rem ui5-u-padding-0-4rem-0-6rem" + " " + (isCurrent ? "ui5-u-background-ui5-action-soft" : (achieved ? "ui5-u-background-ui5-surface" : "ui5-u-background-ui5-surface-soft")) + " " + "ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm" + " " + (achieved ? "ui5-u-opacity-1" : "ui5-u-opacity-0-35")} style={{ "--ui5-value-border": isCurrent?`2px solid ${V.primary}`:`1px solid ${achieved?V.borderLight:"transparent"}` } as React.CSSProperties}>
                <span className={"ui5-u-font-size-1-1rem" + " " + (achieved ? "ui5-u-filter-none" : "ui5-u-filter-grayscale-100")}>{r.icon}</span>
                <div className="ui5-u-flex-1 ui5-u-min-width-0">
                  <div className="ui5-u-display-flex ui5-u-justify-content-space-between ui5-u-font-size-0-8rem">
                    <span className={(isCurrent ? "ui5-u-font-weight-700" : "ui5-u-font-weight-500") + " " + "ui5-u-color-ui5-text"}>{r.name}</span>
                    <span className="ui5-u-color-ui5-text-3 ui5-u-font-size-0-7rem">{r.xpRequired} XP</span>
                  </div>
                  {(achieved||isCurrent)&&<div className="ui5-u-height-3px ui5-u-background-ui5-surface-soft ui5-u-border-radius-999px ui5-u-overflow-hidden ui5-u-margin-top-0-15rem">
                    <div className="ui5-u-height-100 ui5-u-background-ui5-value-background ui5-u-border-radius-999px ui5-u-width-ui5-value-width" style={{ "--ui5-value-background": r.color, "--ui5-value-width": `${progress}%` } as React.CSSProperties}/>
                  </div>}
                </div>
                {isCurrent&&<span className="ui5-u-font-size-0-6rem ui5-u-font-weight-700 ui5-u-color-ui5-action">ACTUEL</span>}
                {achieved&&!isCurrent&&<span className="ui5-u-font-size-0-7rem">✅</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Badges ──────────────────────────────────── */}
      <div className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-25rem ui5-u-margin-bottom-1-25rem ui5-u-border-1px-solid-ui5-border">
        <h2 className="ui5-u-font-size-1rem ui5-u-font-weight-700 ui5-u-color-ui5-text ui5-u-margin-bottom-0-5rem">🏆 Badges — {badges.length}/{BADGES.length}</h2>

        {/* Filtres */}
        <div className="ui5-u-display-flex ui5-u-gap-0-3rem ui5-u-flex-wrap-wrap ui5-u-margin-bottom-1rem">
          {CATEGORIES.map(cat => {
            const active = badgeFilter === cat.id;
            const count = cat.id === "all" ? BADGES.length : BADGES.filter(b => b.category === cat.id).length;
            return (
              <button key={cat.id} onClick={() => setBadgeFilter(cat.id)} className={"ui5-u-padding-0-35rem-0-7rem ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm" + " " + (active ? "ui5-u-background-ui5-action-soft" : "ui5-u-background-ui5-surface") + " " + (active ? "ui5-u-color-ui5-action" : "ui5-u-color-ui5-text-2") + " " + "ui5-u-font-size-0-8rem" + " " + (active ? "ui5-u-font-weight-600" : "ui5-u-font-weight-400") + " " + "ui5-u-cursor-pointer ui5-u-font-family-inherit"} style={{ "--ui5-value-border": `1px solid ${active?V.primary:V.border}` } as React.CSSProperties}>
                {cat.icon} {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Grille de badges */}
        <div className="ui5-u-display-grid ui5-u-grid-template-columns-repeat-auto-fill-minmax-130px-1fr ui5-u-gap-0-6rem">
          {filteredBadges.map(badge => {
            const unlocked = userBadgeMap.get(badge.id);
            const isUnlocked = !!unlocked;
            return (
              <div key={badge.id} className={"ui5-u-display-flex ui5-u-flex-direction-column ui5-u-align-items-center ui5-u-gap-0-2rem ui5-u-padding-0-75rem-0-5rem" + " " + (isUnlocked ? "ui5-u-background-ui5-surface" : "ui5-u-background-ui5-surface-soft") + " " + "ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm" + " " + (isUnlocked ? "ui5-u-opacity-1" : "ui5-u-opacity-0-4") + " " + (isUnlocked ? "ui5-u-box-shadow-none" : "ui5-u-box-shadow-none")} style={{ "--ui5-value-border": `1px solid ${isUnlocked?V.borderLight:"transparent"}` } as React.CSSProperties}>
                <span className={"ui5-u-font-size-1-5rem" + " " + (isUnlocked ? "ui5-u-filter-none" : "ui5-u-filter-grayscale-100")}>{badge.icon}</span>
                <span className="ui5-u-font-size-0-75rem ui5-u-font-weight-700 ui5-u-color-ui5-text ui5-u-text-align-center">{badge.name}</span>
                {unlocked&&unlocked.level!=="unique"&&(
                  <span className={"ui5-u-padding-0-1rem-0-35rem ui5-u-border-radius-999px ui5-u-font-size-0-6rem ui5-u-font-weight-700 ui5-u-text-transform-capitalize" + " " + (unlocked.level==="or" ? "ui5-u-background-fef3c7" : (unlocked.level==="argent" ? "ui5-u-background-f1f5f9" : "ui5-u-background-fde68a")) + " " + (unlocked.level==="or" ? "ui5-u-color-92400e" : (unlocked.level==="argent" ? "ui5-u-color-475569" : "ui5-u-color-78350f"))}>{unlocked.level}</span>
                )}
                <span className="ui5-u-font-size-0-6rem ui5-u-color-ui5-text-3 ui5-u-text-align-center">{badge.description}</span>
                {badge.levels&&(
                  <div className="ui5-u-display-flex ui5-u-gap-0-15rem">
                    {(["bronze","argent","or"] as const).map(level=>{
                      const achieved = unlocked&&(level==="bronze"?true:level==="argent"?(unlocked.level==="argent"||unlocked.level==="or"):unlocked.level==="or");
                      return <span key={level} className={"ui5-u-width-7px ui5-u-height-7px ui5-u-border-radius-50" + " " + (achieved ? (level==="or" ? "ui5-u-background-f59e0b" : (level==="argent" ? "ui5-u-background-94a3b8" : "ui5-u-background-cd7f32")) : "ui5-u-background-ui5-surface-soft") + " " + "ui5-u-border-ui5-value-border"} style={{ "--ui5-value-border": `1px solid ${achieved?"transparent":V.border}` } as React.CSSProperties}/>;
                    })}
                  </div>
                )}
                {isUnlocked&&<span className="ui5-u-font-size-0-55rem ui5-u-color-ui5-text-3">Débloqué le {new Date(unlocked.unlockedAt).toLocaleDateString("fr-FR")}</span>}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
