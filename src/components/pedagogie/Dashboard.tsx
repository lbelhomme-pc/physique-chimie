// src/components/pedagogie/Dashboard.tsx
// v3 : Design compact — tout dans une boîte, pills stats, mega quiz/flashcards

import { useState, useEffect, useMemo } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { getSRSEngine } from "../../data/gamification/srs";
import { RANKS, BADGES } from "../../data/gamification/config";
import SearchBar from "../ui/SearchBar.tsx";


const V = {
  bg: "var(--bg-card)", bgSec: "var(--bg-secondary)", bgTer: "var(--bg-tertiary)", bgBody: "var(--bg-body)",
  text: "var(--text-primary)", textSec: "var(--text-secondary)", textMut: "var(--text-muted)", textDis: "var(--text-disabled)",
  border: "var(--border-color)", borderLight: "var(--border-light)",
  primary: "var(--accent-primary)", primaryLt: "var(--accent-primary-light)",
  success: "var(--accent-success)", successLt: "var(--accent-success-light)",
  warning: "var(--accent-warning)", warningLt: "var(--accent-warning-light)",
  danger: "var(--accent-danger)", purple: "var(--accent-purple)", purpleLt: "var(--accent-purple-light)",
  orange: "var(--accent-orange)", pink: "var(--accent-pink)",
  shadow: "var(--shadow-card)", shadowMd: "var(--shadow-md)",
  radius: "var(--radius-lg)", radiusPill: "var(--radius-pill)", radiusMd: "var(--radius-md)",
};

interface DashboardProps {
  chapters: { id: string; title: string; niveau: string; matiere: string; cycle: string; slug: string; flashcardIds?: string[]; }[];
}

export default function Dashboard({ chapters }: DashboardProps) {
  const [engine] = useState(() => getGamificationEngine());
  const [srs] = useState(() => getSRSEngine());
  const [, forceUpdate] = useState(0);

  useEffect(() => { const u = engine.subscribe(() => forceUpdate(n => n + 1)); return u; }, [engine]);

  const xp = engine.getXP();
  const rank = engine.getRank();
  const nextRank = engine.getNextRank();
  const rp = engine.getRankProgress();
  const streak = engine.getStreak();
  const badges = engine.getBadges();
  const stats = engine.getStats();
  const lastCh = engine.getLastChapter();
  const globalDue = srs.getGlobalDueCount();

  const isNew = xp === 0 && stats.totalDaysActive <= 1;

  // Calculer % physique et chimie
  const physChapters = chapters.filter(c => c.matiere === "physique");
  const chimChapters = chapters.filter(c => c.matiere === "chimie");
  const physPercent = physChapters.length > 0
    ? Math.round(physChapters.reduce((s, c) => s + engine.getChapterProgress(c.id).percent, 0) / physChapters.length)
    : 0;
  const chimPercent = chimChapters.length > 0
    ? Math.round(chimChapters.reduce((s, c) => s + engine.getChapterProgress(c.id).percent, 0) / chimChapters.length)
    : 0;

  // ─── NOUVEL ÉLÈVE ─────────────────────────────────────
  if (isNew) {
    return (
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",padding:"2rem 0 1.5rem"}}>
          <span style={{fontSize:"3rem"}}>🔬</span>
          <h1 style={{fontSize:"2rem",fontWeight:800,color:V.primary,margin:"0.5rem 0",letterSpacing:"-0.02em"}}>Plateforme de Physique-Chimie</h1>
          <p style={{fontSize:"1.05rem",color:V.textMut}}>Bienvenue sur ton espace de révisions interactif 🚀</p>
        </div>

        {/* Boîte comment ça marche */}
        <div style={{background:V.bg,borderRadius:V.radius,boxShadow:V.shadow,padding:"1.5rem",marginBottom:"1.5rem",border:`1px solid ${V.borderLight}`}}>
          <h2 style={{fontSize:"1.1rem",fontWeight:700,color:V.text,marginBottom:"1rem",textAlign:"center"}}>🎯 Comment ça marche ?</h2>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"0.75rem"}}>
            {[["📖","Lis le cours"],["✏️","Exercices"],["❓","Quiz"],["🃏","Flashcards"],["⚡","Gagne des XP !"]].map(([ico,txt],i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.5rem 1rem",background:V.bgSec,borderRadius:V.radiusPill,fontSize:"0.85rem",fontWeight:600,color:V.textSec}}>
                <span>{ico}</span>{txt}
              </div>
            ))}
          </div>
        </div>

        <p style={{textAlign:"center",fontSize:"0.95rem",color:V.textMut,marginBottom:"1.5rem"}}>
          Bonjour ! 👋 Que souhaites-tu réviser aujourd'hui ? Sélectionne une catégorie ci-dessus pour accéder aux cours et exercices.
        </p>
      </div>
    );
  }

  // ─── DASHBOARD COMPACT ────────────────────────────────
  return (
    <div style={{maxWidth:900,margin:"0 auto"}}>

      {/* Header */}
      <div style={{textAlign:"center",padding:"1.5rem 0 0.75rem"}}>
        <span style={{fontSize:"2.5rem"}}>🔬</span>
        <h1 style={{fontSize:"1.8rem",fontWeight:800,color:V.primary,margin:"0.3rem 0",letterSpacing:"-0.02em"}}>Plateforme de Physique-Chimie</h1>
        <p style={{fontSize:"1rem",color:V.textMut}}>Bienvenue sur ton espace de révisions interactif 🚀</p>
      </div>

      {/* Stats pills */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"0.75rem",flexWrap:"wrap",margin:"1rem 0"}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",padding:"0.45rem 1rem",background:V.bg,border:`1px solid ${V.border}`,borderRadius:V.radiusPill,fontSize:"0.85rem",fontWeight:600,color:V.orange,boxShadow:"var(--shadow-xs)"}}>
          🔥 {streak.current} Jour{streak.current > 1 ? "s" : ""}
        </span>
        <span style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",padding:"0.45rem 1rem",background:V.bg,border:`1px solid ${V.border}`,borderRadius:V.radiusPill,fontSize:"0.85rem",fontWeight:600,color:V.primary,boxShadow:"var(--shadow-xs)"}}>
          ⚡ Physique : {physPercent}%
        </span>
        <span style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",padding:"0.45rem 1rem",background:V.bg,border:`1px solid ${V.border}`,borderRadius:V.radiusPill,fontSize:"0.85rem",fontWeight:600,color:V.success,boxShadow:"var(--shadow-xs)"}}>
          🧪 Chimie : {chimPercent}%
        </span>
        {/* Rang pill */}
        <span style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",padding:"0.45rem 1rem",border:"2px solid #d4af37",borderRadius:V.radiusPill,background:V.bg,fontWeight:700,fontSize:"0.85rem",color:"#b8860b",boxShadow:"var(--shadow-sm)"}}>
          🏅 <span style={{color:"#b8860b",textTransform:"uppercase",letterSpacing:"0.03em"}}>Rang : {rank.name}</span>
          <span style={{color:V.textMut,fontWeight:500}}>{xp} / {nextRank ? nextRank.xpRequired : "MAX"} XP</span>
          <span style={{width:60,height:6,background:V.bgTer,borderRadius:99,overflow:"hidden",display:"inline-block"}}>
            <span style={{display:"block",height:"100%",background:"#d4af37",borderRadius:99,width:`${rp.percent}%`}}/>
          </span>
          <a href="/profil" style={{fontSize:"0.7rem",color:V.primary,textDecoration:"none"}}>📊</a>
        </span>
      </div>

{/* Barre de recherche */}
<div style={{maxWidth:700,margin:"1rem auto"}}>
  <SearchBar
    chapters={chapters.map(ch => ({
      ...ch,
      path: `/${ch.cycle}/${ch.niveau}/${ch.matiere}/${ch.slug}`
    }))}
  />
</div>

      {/* Message de bienvenue */}
      <p style={{textAlign:"center",fontSize:"1.1rem",fontWeight:700,color:V.text,margin:"1.5rem 0 0.3rem"}}>
        Bonjour ! 👋
      </p>
      <p style={{textAlign:"center",fontSize:"0.95rem",color:V.textMut,marginBottom:"1.5rem"}}>
        Que souhaites-tu réviser aujourd'hui ? Sélectionne une catégorie ci-dessus pour accéder aux cours et exercices.
      </p>

      {/* Espaces de révisions globaux */}
      <div style={{background:V.bg,borderRadius:V.radius,boxShadow:V.shadow,padding:"1.25rem",marginBottom:"1.5rem",border:`1px solid ${V.borderLight}`}}>
        <h2 style={{fontSize:"1rem",fontWeight:700,color:V.text,textAlign:"center",marginBottom:"1rem"}}>🚀 Espaces de Révisions Globaux</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
          <a href="/memorisation" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",padding:"1rem",background:V.purpleLt,border:`2px solid ${V.purple}`,borderRadius:V.radiusMd,textDecoration:"none",color:V.purple,fontWeight:700,fontSize:"0.95rem",transition:"transform 0.2s"}}>
            <span style={{fontSize:"1.5rem"}}>🃏</span>
            Mega Flashcards
            {globalDue > 0 && <span style={{fontSize:"0.75rem",fontWeight:500,color:V.textMut}}>{globalDue} carte(s) à revoir</span>}
          </a>
          <a href="/memorisation" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",padding:"1rem",background:V.primaryLt,border:`2px solid ${V.primary}`,borderRadius:V.radiusMd,textDecoration:"none",color:V.primary,fontWeight:700,fontSize:"0.95rem",transition:"transform 0.2s"}}>
            <span style={{fontSize:"1.5rem"}}>❓</span>
            Mega Quiz
            <span style={{fontSize:"0.75rem",fontWeight:500,color:V.textMut}}>Tous chapitres confondus</span>
          </a>
        </div>
      </div>

      {/* Progression + Stats + Badges — tout dans une boîte */}
      <div style={{background:V.bg,borderRadius:V.radius,boxShadow:V.shadow,padding:"1.25rem",marginBottom:"1.5rem",border:`1px solid ${V.borderLight}`}}>

        {/* Mini stats en ligne */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"0.5rem",marginBottom:"1rem"}}>
          {[["📝",stats.totalQuizCompleted,"Quiz"],["🃏",stats.totalFlashcardsReviewed,"Flash"],["✏️",stats.totalExercicesDone,"Exos"],["📖",stats.totalCoursRead,"Cours"]].map(([ico,val,lab])=>(
            <div key={lab as string} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.1rem",padding:"0.5rem",background:V.bgSec,borderRadius:V.radiusMd}}>
              <span style={{fontSize:"1rem"}}>{ico}</span>
              <span style={{fontSize:"1.2rem",fontWeight:800,color:V.text}}>{val as number}</span>
              <span style={{fontSize:"0.65rem",color:V.textMut}}>{lab}</span>
            </div>
          ))}
        </div>

        {/* Progression chapitres */}
        {(() => {
          const withProgress = chapters.filter(c => engine.getChapterProgress(c.id).percent > 0);
          if (withProgress.length === 0) return <p style={{fontSize:"0.85rem",color:V.textMut,fontStyle:"italic",textAlign:"center"}}>Commence un chapitre pour voir ta progression !</p>;
          return (
            <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",marginBottom:"0.75rem"}}>
              {withProgress.slice(0, 5).map(ch => {
                const p = engine.getChapterProgress(ch.id);
                return (
                  <a key={ch.id} href={`/${ch.cycle}/${ch.niveau}/${ch.matiere}/${ch.slug}`} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.5rem 0.75rem",background:V.bgSec,borderRadius:V.radiusMd,textDecoration:"none",color:"inherit"}}>
                    <span style={{fontSize:"0.85rem",fontWeight:600,color:V.text,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ch.title}</span>
                    <span style={{fontSize:"0.75rem",fontWeight:700,color:V.textMut,flexShrink:0}}>{p.percent}%</span>
                    <span style={{width:50,height:5,background:V.bgTer,borderRadius:99,overflow:"hidden",flexShrink:0}}>
                      <span style={{display:"block",height:"100%",borderRadius:99,width:`${p.percent}%`,background:p.percent===100?V.success:p.percent>=50?V.warning:V.primary}}/>
                    </span>
                    <span style={{display:"flex",gap:"0.2rem",fontSize:"0.7rem",flexShrink:0}}>
                      <span style={{opacity:p.cours?1:0.2}}>📖</span>
                      <span style={{opacity:p.exercices?1:0.2}}>✏️</span>
                      <span style={{opacity:p.quiz?1:0.2}}>❓</span>
                      <span style={{opacity:p.flashcards?1:0.2}}>🃏</span>
                    </span>
                  </a>
                );
              })}
            </div>
          );
        })()}

        {/* Badges en ligne */}
        {badges.length > 0 && (
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
            <span style={{fontSize:"0.8rem",fontWeight:600,color:V.textMut}}>🏆</span>
            {badges.slice(0, 6).map(b => {
              const def = BADGES.find(d => d.id === b.id);
              return def ? <span key={b.id} title={def.name} style={{fontSize:"1.1rem"}}>{def.icon}</span> : null;
            })}
            {badges.length > 6 && <span style={{fontSize:"0.75rem",color:V.textMut}}>+{badges.length - 6}</span>}
            <a href="/profil" style={{fontSize:"0.75rem",color:V.primary,marginLeft:"auto"}}>Voir tout →</a>
          </div>
        )}
      </div>

      {/* Reprendre */}
      {lastCh && (
        <a href={lastCh.path} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 1.25rem",background:V.primaryLt,border:`1px solid ${V.border}`,borderRadius:V.radiusMd,textDecoration:"none",color:"inherit",marginBottom:"1.5rem",boxShadow:"var(--shadow-xs)"}}>
          <span style={{fontSize:"1rem"}}>🕐</span>
          <span style={{flex:1,fontSize:"0.9rem",fontWeight:600,color:V.text}}>Reprendre : {lastCh.title}</span>
          <span style={{fontSize:"0.8rem",color:V.textMut}}>{lastCh.tab}</span>
          <span style={{color:V.primary}}>→</span>
        </a>
      )}
    </div>
  );
}
