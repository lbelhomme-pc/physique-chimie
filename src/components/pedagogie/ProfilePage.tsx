// src/components/pedagogie/ProfilePage.tsx
// Page profil unifiée — rang, XP, streak, stats, badges, parcours de rangs

import { useState, useEffect } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { RANKS, BADGES } from "../../data/gamification/config";

const V = {
  bg: "var(--bg-card)", bgSec: "var(--bg-secondary)", bgTer: "var(--bg-tertiary)",
  text: "var(--text-primary)", textSec: "var(--text-secondary)", textMut: "var(--text-muted)", textDis: "var(--text-disabled)",
  border: "var(--border-color)", borderLight: "var(--border-light)",
  primary: "var(--accent-primary)", primaryLt: "var(--accent-primary-light)",
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

  return (
    <div style={{maxWidth:900,margin:"0 auto"}}>

      <h1 style={{fontSize:"1.4rem",fontWeight:800,color:V.text,marginBottom:"1.25rem"}}>👤 Mon profil</h1>

      {/* ─── Carte profil principale ─────────────────── */}
      <div style={{background:V.bg,borderRadius:V.radiusLg,boxShadow:V.shadow,padding:"1.25rem",marginBottom:"1.25rem",border:`1px solid ${V.borderLight}`}}>

        {/* Rang + XP + Streak en ligne */}
        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1rem",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flex:1,minWidth:200}}>
            <span style={{fontSize:"2rem"}}>{rank.icon}</span>
            <div>
              <div style={{fontSize:"1rem",fontWeight:700,color:V.text}}>{rank.name}</div>
              <div style={{fontSize:"0.8rem",color:V.textMut}}>{xp} XP</div>
            </div>
          </div>
          <div style={{flex:1,minWidth:150}}>
            <div style={{height:8,background:V.bgTer,borderRadius:99,overflow:"hidden",marginBottom:"0.2rem"}}>
              <div style={{height:"100%",borderRadius:99,background:rank.color,width:`${rp.percent}%`,transition:"width 0.5s"}}/>
            </div>
            {nextRank && <span style={{fontSize:"0.7rem",color:V.textMut}}>{rp.max-rp.current} XP → {nextRank.icon} {nextRank.name}</span>}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"0.25rem 0.75rem"}}>
            <span style={{fontSize:"1.3rem"}}>🔥</span>
            <span style={{fontSize:"1.2rem",fontWeight:800,color:V.orange}}>{streak.current}</span>
            <span style={{fontSize:"0.65rem",color:V.textMut}}>jour{streak.current>1?"s":""}</span>
          </div>
        </div>

        {/* Stats en grille compacte */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gap:"0.4rem"}}>
          {[
            ["📝",stats.totalQuizCompleted,"Quiz"],
            ["🎯",stats.totalQuizPerfect,"Parfaits"],
            ["🃏",stats.totalFlashcardsReviewed,"Flash"],
            ["✏️",stats.totalExercicesDone,"Exos"],
            ["📖",stats.totalCoursRead,"Cours"],
            ["📅",stats.totalDaysActive,"Jours"],
          ].map(([ico,val,lab])=>(
            <div key={lab as string} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.05rem",padding:"0.4rem 0.25rem",background:V.bgSec,borderRadius:V.radiusMd}}>
              <span style={{fontSize:"0.85rem"}}>{ico}</span>
              <span style={{fontSize:"1.1rem",fontWeight:800,color:V.text}}>{val as number}</span>
              <span style={{fontSize:"0.6rem",color:V.textMut}}>{lab}</span>
            </div>
          ))}
        </div>

        {/* Moyennes */}
        <div style={{display:"flex",justifyContent:"center",gap:"1.5rem",marginTop:"0.75rem",fontSize:"0.8rem",color:V.textMut}}>
          <span>📊 {stats.totalDaysActive>0?Math.round(xp/stats.totalDaysActive):0} XP/jour</span>
          <span>🎯 {stats.totalQuizCompleted>0?Math.round((stats.totalQuizPerfect/stats.totalQuizCompleted)*100):0}% parfaits</span>
          <span>🔥 Meilleur : {streak.best}j</span>
        </div>
      </div>

      {/* ─── Parcours de rangs ───────────────────────── */}
      <div style={{background:V.bg,borderRadius:V.radiusLg,boxShadow:V.shadow,padding:"1.25rem",marginBottom:"1.25rem",border:`1px solid ${V.borderLight}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
          <h2 style={{fontSize:"1rem",fontWeight:700,color:V.text,margin:0}}>⚛️ Parcours de rangs</h2>
          <button onClick={()=>setShowAllRanks(!showAllRanks)} style={{fontSize:"0.75rem",color:V.primary,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>
            {showAllRanks ? "Réduire" : "Voir tout"}
          </button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>
          {(showAllRanks ? RANKS : RANKS.slice(0, 5)).map((r, i) => {
            const achieved = xp >= r.xpRequired;
            const isCurrent = r.id === rank.id;
            const nextR = RANKS[i + 1];
            const progress = isCurrent && nextR ? Math.round(((xp - r.xpRequired) / (nextR.xpRequired - r.xpRequired)) * 100) : achieved ? 100 : 0;
            return (
              <div key={r.id} style={{
                display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.4rem 0.6rem",
                background:isCurrent?V.primaryLt:achieved?V.bg:V.bgSec,
                border:isCurrent?`2px solid ${V.primary}`:`1px solid ${achieved?V.borderLight:"transparent"}`,
                borderRadius:V.radiusMd,opacity:achieved?1:0.35,
              }}>
                <span style={{fontSize:"1.1rem",filter:achieved?"none":"grayscale(100%)"}}>{r.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.8rem"}}>
                    <span style={{fontWeight:isCurrent?700:500,color:V.text}}>{r.name}</span>
                    <span style={{color:V.textMut,fontSize:"0.7rem"}}>{r.xpRequired} XP</span>
                  </div>
                  {(achieved||isCurrent)&&<div style={{height:3,background:V.bgTer,borderRadius:99,overflow:"hidden",marginTop:"0.15rem"}}>
                    <div style={{height:"100%",background:r.color,borderRadius:99,width:`${progress}%`}}/>
                  </div>}
                </div>
                {isCurrent&&<span style={{fontSize:"0.6rem",fontWeight:700,color:V.primary}}>ACTUEL</span>}
                {achieved&&!isCurrent&&<span style={{fontSize:"0.7rem"}}>✅</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Badges ──────────────────────────────────── */}
      <div style={{background:V.bg,borderRadius:V.radiusLg,boxShadow:V.shadow,padding:"1.25rem",marginBottom:"1.25rem",border:`1px solid ${V.borderLight}`}}>
        <h2 style={{fontSize:"1rem",fontWeight:700,color:V.text,marginBottom:"0.5rem"}}>🏆 Badges — {badges.length}/{BADGES.length}</h2>

        {/* Filtres */}
        <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"1rem"}}>
          {CATEGORIES.map(cat => {
            const active = badgeFilter === cat.id;
            const count = cat.id === "all" ? BADGES.length : BADGES.filter(b => b.category === cat.id).length;
            return (
              <button key={cat.id} onClick={() => setBadgeFilter(cat.id)} style={{
                padding:"0.35rem 0.7rem",border:`1px solid ${active?V.primary:V.border}`,borderRadius:V.radiusPill,
                background:active?V.primaryLt:V.bg,color:active?V.primary:V.textSec,
                fontSize:"0.8rem",fontWeight:active?600:400,cursor:"pointer",fontFamily:"inherit",
              }}>
                {cat.icon} {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Grille de badges */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))",gap:"0.6rem"}}>
          {filteredBadges.map(badge => {
            const unlocked = userBadgeMap.get(badge.id);
            const isUnlocked = !!unlocked;
            return (
              <div key={badge.id} style={{
                display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem",
                padding:"0.75rem 0.5rem",background:isUnlocked?V.bg:V.bgSec,
                border:`1px solid ${isUnlocked?V.borderLight:"transparent"}`,borderRadius:V.radiusMd,
                opacity:isUnlocked?1:0.4,boxShadow:isUnlocked?"var(--shadow-xs)":"none",
              }}>
                <span style={{fontSize:"1.5rem",filter:isUnlocked?"none":"grayscale(100%)"}}>{badge.icon}</span>
                <span style={{fontSize:"0.75rem",fontWeight:700,color:V.text,textAlign:"center"}}>{badge.name}</span>
                {unlocked&&unlocked.level!=="unique"&&(
                  <span style={{
                    padding:"0.1rem 0.35rem",borderRadius:99,fontSize:"0.6rem",fontWeight:700,textTransform:"capitalize",
                    background:unlocked.level==="or"?"#fef3c7":unlocked.level==="argent"?"#f1f5f9":"#fde68a",
                    color:unlocked.level==="or"?"#92400e":unlocked.level==="argent"?"#475569":"#78350f",
                  }}>{unlocked.level}</span>
                )}
                <span style={{fontSize:"0.6rem",color:V.textMut,textAlign:"center"}}>{badge.description}</span>
                {badge.levels&&(
                  <div style={{display:"flex",gap:"0.15rem"}}>
                    {(["bronze","argent","or"] as const).map(level=>{
                      const achieved = unlocked&&(level==="bronze"?true:level==="argent"?(unlocked.level==="argent"||unlocked.level==="or"):unlocked.level==="or");
                      return <span key={level} style={{width:7,height:7,borderRadius:"50%",background:achieved?(level==="or"?"#f59e0b":level==="argent"?"#94a3b8":"#cd7f32"):V.bgTer,border:`1px solid ${achieved?"transparent":V.border}`}}/>;
                    })}
                  </div>
                )}
                {isUnlocked&&<span style={{fontSize:"0.55rem",color:V.textMut}}>Débloqué le {new Date(unlocked.unlockedAt).toLocaleDateString("fr-FR")}</span>}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
