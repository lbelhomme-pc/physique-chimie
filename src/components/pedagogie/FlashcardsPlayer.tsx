// src/components/pedagogie/FlashcardsPlayer.tsx
// v7 : CSS vars + SRS Anki + input + KaTeX + TTS sur question ET réponse

import { useState, useMemo, useRef, useEffect } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { getSRSEngine, formatInterval, type SRSRating } from "../../data/gamification/srs";
import XPToast, { type ToastItem } from "./XPToast";
import MathText from "./MathText";
import TextToSpeech from "./TextToSpeech";

interface Flashcard { id: string; front: string; back: string; difficulty?: number; tags?: string[]; recto?: string; verso?: string; question?: string; answer?: string; }
interface FlashcardsPlayerProps { data: Flashcard[] | { cards: Flashcard[] }; title?: string; chapterId?: string; xpConfig?: { flashcards_base?: number; flashcard_known?: number }; }
type SessionMode = "review" | "new" | "all";

const V = {
  bg: "var(--bg-card)", bgSec: "var(--bg-secondary)", bgTer: "var(--bg-tertiary)", bgPri: "var(--bg-primary)",
  text: "var(--text-primary)", textSec: "var(--text-secondary)", textMut: "var(--text-muted)", textDis: "var(--text-disabled)",
  border: "var(--border-color)",
  primary: "var(--accent-primary)", primaryLt: "var(--accent-primary-light)",
  success: "var(--accent-success)", successLt: "var(--accent-success-light)",
  warning: "var(--accent-warning)", warningLt: "var(--accent-warning-light)",
  danger: "var(--accent-danger)", dangerLt: "var(--accent-danger-light)",
  purple: "var(--accent-purple)", purpleLt: "var(--accent-purple-light)",
};

function shuffleArray<T>(arr: T[]): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a; }

export default function FlashcardsPlayer({ data, title, chapterId, xpConfig }: FlashcardsPlayerProps) {
  const allCards: Flashcard[] = useMemo(() => {
    const raw = Array.isArray(data) ? data : data?.cards ?? [];
    return raw.map(c => ({ ...c, front: c.front??c.recto??c.question??"", back: c.back??c.verso??c.answer??"" }));
  }, [data]);

  const srs = useMemo(() => getSRSEngine(), []);
  const srsStats = useMemo(() => chapterId ? srs.getChapterStats(chapterId, allCards.map(c => c.id)) : null, [chapterId, allCards]);

  const [mode, setMode] = useState<SessionMode|null>(null);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [ci, setCi] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{cardId:string;rating:SRSRating}[]>([]);
  const [fin, setFin] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const total = sessionCards.length;
  const cur = sessionCards[ci] ?? null;

  function addT(t:Omit<ToastItem,"id">){setToasts(p=>[...p,{...t,id:`t-${Date.now()}-${Math.random()}`}])}
  function disT(id:string){setToasts(p=>p.filter(t=>t.id!==id))}

  function startSession(m: SessionMode) {
    setMode(m);
    let cards: Flashcard[] = [];
    if (chapterId && m === "review") {
      const dueIds = new Set(srs.getDueCards(chapterId).map(s => s.cardId));
      cards = allCards.filter(c => dueIds.has(c.id));
    } else if (chapterId && m === "new") {
      const newIdSet = new Set(srs.getNewCards(chapterId, allCards.map(c => c.id)));
      cards = allCards.filter(c => newIdSet.has(c.id)).slice(0, 20);
    } else { cards = allCards; }
    setSessionCards(shuffleArray(cards)); setCi(0); setRevealed(false); setInput(""); setResults([]); setFin(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ─── Écran de choix ───────────────────────────────────
  if (mode === null) {
    const due = srsStats?.due ?? 0, newC = srsStats?.newCards ?? allCards.length;
    const learning = srsStats?.learning ?? 0, mature = srsStats?.mature ?? 0;
    return (
      <div style={{maxWidth:600,margin:"0 auto"}}>
        {title && <h3 style={{fontSize:"1.1rem",fontWeight:600,marginBottom:"0.75rem",color:V.text}}>{title}</h3>}
        {srsStats && (
          <div style={{display:"flex",justifyContent:"center",gap:"0.5rem",fontSize:"0.8rem",marginBottom:"1rem",padding:"0.5rem",background:V.bgSec,borderRadius:8,flexWrap:"wrap"}}>
            <span style={{color:V.danger}}>🔴 {due} à revoir</span><span style={{color:V.textMut}}>•</span>
            <span style={{color:V.primary}}>🔵 {newC} nouvelles</span><span style={{color:V.textMut}}>•</span>
            <span style={{color:V.warning}}>🟡 {learning} en apprentissage</span><span style={{color:V.textMut}}>•</span>
            <span style={{color:V.success}}>🟢 {mature} maîtrisées</span>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"1rem"}}>
          {due > 0 && <button onClick={() => startSession("review")} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem",padding:"1rem",border:`2px solid ${V.primary}`,borderRadius:12,background:V.primaryLt,cursor:"pointer",width:"100%",position:"relative"}}><span style={{fontSize:"1.5rem"}}>🔄</span><span style={{fontSize:"1rem",fontWeight:700,color:V.text}}>Révision du jour</span><span style={{fontSize:"0.85rem",color:V.textSec}}>{due} carte(s) à revoir</span><span style={{position:"absolute",top:8,right:10,fontSize:"0.65rem",fontWeight:700,background:V.primary,color:"#fff",padding:"0.15rem 0.5rem",borderRadius:99}}>Recommandé</span></button>}
          {newC > 0 && <button onClick={() => startSession("new")} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem",padding:"1rem",border:`2px solid ${V.border}`,borderRadius:12,background:V.bg,cursor:"pointer",width:"100%"}}><span style={{fontSize:"1.5rem"}}>✨</span><span style={{fontSize:"1rem",fontWeight:700,color:V.text}}>Nouvelles cartes</span><span style={{fontSize:"0.85rem",color:V.textSec}}>{Math.min(newC,20)} carte(s)</span></button>}
          <button onClick={() => startSession("all")} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem",padding:"1rem",border:`2px solid ${V.border}`,borderRadius:12,background:V.bg,cursor:"pointer",width:"100%"}}><span style={{fontSize:"1.5rem"}}>📚</span><span style={{fontSize:"1rem",fontWeight:700,color:V.text}}>Toutes les cartes</span><span style={{fontSize:"0.85rem",color:V.textSec}}>{allCards.length} carte(s)</span></button>
        </div>
        {(learning > 0 || mature > 0) && (
          <div style={{textAlign:"center"}}>
            <p style={{fontSize:"0.8rem",fontWeight:600,color:V.textSec,marginBottom:"0.3rem"}}>Progression mémorisation</p>
            <div style={{height:10,background:V.bgTer,borderRadius:99,overflow:"hidden",display:"flex"}}>
              <div style={{height:"100%",background:V.success,width:`${(mature/allCards.length)*100}%`}}/>
              <div style={{height:"100%",background:V.warning,width:`${(learning/allCards.length)*100}%`}}/>
            </div>
            <p style={{fontSize:"0.8rem",color:V.textMut,marginTop:"0.3rem"}}>{mature} maîtrisée{mature>1?"s":""} · {learning} en apprentissage · {newC} nouvelle{newC>1?"s":""}</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Fin de session ───────────────────────────────────
  if (fin || total === 0) {
    const ag = results.filter(r=>r.rating==="again").length;
    const ha = results.filter(r=>r.rating==="hard").length;
    const go = results.filter(r=>r.rating==="good").length;
    const ea = results.filter(r=>r.rating==="easy").length;
    return (
      <div style={{maxWidth:500,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>{total===0?"🎉":go+ea>ha+ag?"🌟":"💪"}</div>
        <h3 style={{fontSize:"1.4rem",fontWeight:700,color:V.text,marginBottom:"1.25rem"}}>{total===0?"Rien à revoir !":"Session terminée !"}</h3>
        {total===0?<p style={{fontSize:"1rem",color:V.textSec,marginBottom:"1.5rem"}}>Toutes tes cartes sont à jour. Reviens demain !</p>:(
          <div style={{display:"flex",justifyContent:"center",gap:"1rem",marginBottom:"1.5rem"}}>
            {[[ag,"😰","Oublié",V.danger],[ha,"😕","Difficile",V.warning],[go,"🙂","Bien",V.success],[ea,"😎","Facile",V.primary]].map(([v,ico,lab,col])=>(
              <div key={lab as string} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.2rem"}}>
                <span style={{fontSize:"1.8rem",fontWeight:800,color:col as string}}>{v as number}</span>
                <span style={{fontSize:"0.75rem",color:V.textSec}}>{ico} {lab}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",alignItems:"center"}}>
          <button onClick={()=>setMode(null)} style={{padding:"0.6rem 1.5rem",background:V.purple,color:"#fff",border:"none",borderRadius:8,fontSize:"0.95rem",fontWeight:600,cursor:"pointer"}}>← Retour au menu</button>
          {ag>0&&<button onClick={()=>{const ids=new Set(results.filter(r=>r.rating==="again").map(r=>r.cardId));setSessionCards(shuffleArray(sessionCards.filter(c=>ids.has(c.id))));setCi(0);setRevealed(false);setInput("");setResults([]);setFin(false);}} style={{padding:"0.6rem 1.5rem",background:"transparent",color:V.purple,border:`2px solid ${V.purple}`,borderRadius:8,fontSize:"0.9rem",fontWeight:500,cursor:"pointer"}}>🔄 Revoir les {ag} oubliée(s)</button>}
        </div>
        <XPToast toasts={toasts} onDismiss={disT}/>
      </div>
    );
  }

  // ─── Carte en cours ───────────────────────────────────
  if (!cur) return null;
  const intervals = chapterId ? srs.getNextIntervalPreview(chapterId, cur.id) : {again:1,hard:1,good:3,easy:7};

  function handleReveal() {
    if (!input.trim()) { if(inputRef.current){inputRef.current.style.borderColor=V.warning;setTimeout(()=>{if(inputRef.current)inputRef.current.style.borderColor=V.border},1000)} return; }
    setRevealed(true);
  }

  function handleRate(rating: SRSRating) {
    if (chapterId) srs.review(chapterId, cur.id, rating);
    const newResults = [...results, {cardId:cur.id, rating}];
    setResults(newResults);
    if (ci+1 >= total) {
      const known = newResults.filter(r=>r.rating==="good"||r.rating==="easy").length;
      if(chapterId){try{const e=getGamificationEngine();const r=e.completeFlashcards(chapterId,known,total,xpConfig);if(r.xp>0)addT({type:"xp",message:`+${r.xp} XP 🎉`,icon:"⚡"});if(r.rankUp)addT({type:"rank_up",message:`Nouveau rang : ${r.rankUp.icon} ${r.rankUp.name} !`,icon:r.rankUp.icon});r.newBadges.forEach(b=>addT({type:"badge",message:`Badge : ${b.icon} ${b.name}`,icon:b.icon}))}catch(e){console.warn(e)}}
      setFin(true);
    } else { setCi(i=>i+1); setRevealed(false); setInput(""); setTimeout(()=>inputRef.current?.focus(),100); }
  }

  const diff = cur.difficulty;
  const diffInfo = !diff?null:diff<=1?{text:"Facile",color:V.success,bg:V.successLt}:diff<=2?{text:"Moyen",color:V.warning,bg:V.warningLt}:{text:"Difficile",color:V.danger,bg:V.dangerLt};

  return (
    <div style={{maxWidth:600,margin:"0 auto"}}>
      {title&&<h3 style={{fontSize:"1.1rem",fontWeight:600,marginBottom:"0.75rem",color:V.text}}>{title}</h3>}

      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"}}>
        <div style={{flex:1,height:8,background:V.bgTer,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",background:V.purple,borderRadius:99,transition:"width 0.4s",width:`${((ci+1)/total)*100}%`}}/></div>
        <span style={{fontSize:"0.85rem",color:V.textMut,fontWeight:500,whiteSpace:"nowrap"}}>{ci+1}/{total}</span>
      </div>

      {diffInfo && (
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
          <span style={{fontSize:"0.75rem",fontWeight:600,color:V.textMut,textTransform:"uppercase"}}>{mode==="review"?"🔄 Révision":mode==="new"?"✨ Nouvelles":"📚 Toutes"}</span>
          <span style={{padding:"0.2rem 0.6rem",borderRadius:99,fontSize:"0.75rem",fontWeight:600,color:diffInfo.color,background:diffInfo.bg}}>{diffInfo.text}</span>
        </div>
      )}

      {/* Question + TTS */}
      <div style={{position:"relative",padding:"1.5rem",background:V.bg,border:`2px solid ${V.border}`,borderRadius:16,marginBottom:"1rem",minHeight:80}}>
        <span style={{position:"absolute",top:10,left:14,fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:V.textMut}}>Question</span>
        <p style={{fontSize:"1.15rem",fontWeight:500,color:V.text,textAlign:"center",lineHeight:1.6,margin:"0.5rem 0 0"}}><MathText text={cur.front} /></p>
        <div style={{marginTop:"0.5rem",display:"flex",justifyContent:"center"}}><TextToSpeech compact text={cur.front} label="Lire" /></div>
      </div>

      {/* Input ou Revealed */}
      {!revealed ? (
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1rem"}}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleReveal()}}}
            placeholder="Tape ta réponse ici..." style={{width:"100%",padding:"0.75rem",border:`2px solid ${V.border}`,borderRadius:10,fontSize:"1rem",fontFamily:"inherit",resize:"vertical",outline:"none",transition:"border-color 0.2s",boxSizing:"border-box",background:V.bgPri,color:V.text}} rows={3} autoFocus/>
          <button onClick={handleReveal} style={{padding:"0.65rem 1.5rem",background:input.trim()?V.purple:V.textDis,color:"#fff",border:"none",borderRadius:8,fontSize:"0.95rem",fontWeight:600,cursor:input.trim()?"pointer":"not-allowed",alignSelf:"flex-end"}}>Vérifier →</button>
        </div>
      ) : (
        <div style={{marginBottom:"1rem"}}>
          {/* Ta réponse */}
          <div style={{padding:"0.75rem 1rem",background:V.bgSec,border:`1px solid ${V.border}`,borderRadius:8,marginBottom:"0.75rem"}}>
            <span style={{fontSize:"0.75rem",fontWeight:700,color:V.textMut,textTransform:"uppercase"}}>📝 Ta réponse</span>
            <p style={{fontSize:"0.95rem",color:V.textSec,margin:"0.25rem 0 0",lineHeight:1.5}}>{input}</p>
          </div>

          {/* Réponse attendue + TTS */}
          <div style={{padding:"0.75rem 1rem",background:V.successLt,border:`1px solid ${V.success}`,borderRadius:8,marginBottom:"0.5rem"}}>
            <span style={{fontSize:"0.75rem",fontWeight:700,color:V.textMut,textTransform:"uppercase"}}>✅ Réponse attendue</span>
            <p style={{fontSize:"0.95rem",color:V.success,margin:"0.25rem 0 0",lineHeight:1.5,fontWeight:500}}><MathText text={cur.back} /></p>
          </div>
          <div style={{marginBottom:"1rem"}}><TextToSpeech compact text={cur.back} label="Écouter la réponse" /></div>

          {/* Boutons Anki */}
          <p style={{fontSize:"0.9rem",color:V.textSec,textAlign:"center",marginBottom:"0.5rem",fontWeight:500}}>Comment as-tu répondu ?</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0.4rem"}}>
            {([["again","😰","Oublié",V.danger,V.dangerLt],["hard","😕","Difficile",V.warning,V.warningLt],["good","🙂","Bien",V.success,V.successLt],["easy","😎","Facile",V.primary,V.primaryLt]] as const).map(([rating,emoji,label,color,bg])=>(
              <button key={rating} onClick={()=>handleRate(rating)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.1rem",padding:"0.5rem 0.25rem",border:`2px solid ${color}`,borderRadius:10,background:bg,color,fontSize:"0.8rem",fontWeight:600,cursor:"pointer"}}>
                <span style={{fontSize:"1.3rem"}}>{emoji}</span>
                <span style={{fontSize:"0.75rem",fontWeight:700}}>{label}</span>
                <span style={{fontSize:"0.65rem",color:V.textMut}}>{formatInterval(intervals[rating])}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"center",gap:"0.75rem",fontSize:"0.85rem",color:V.textMut,marginTop:"0.5rem"}}>
        {results.length>0&&<>
          <span style={{color:V.danger}}>😰 {results.filter(r=>r.rating==="again").length}</span>
          <span style={{color:V.warning}}>😕 {results.filter(r=>r.rating==="hard").length}</span>
          <span style={{color:V.success}}>🙂 {results.filter(r=>r.rating==="good").length}</span>
          <span style={{color:V.primary}}>😎 {results.filter(r=>r.rating==="easy").length}</span>
        </>}
      </div>
      <XPToast toasts={toasts} onDismiss={disT}/>
    </div>
  );
}
