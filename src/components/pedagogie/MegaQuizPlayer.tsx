// src/components/pedagogie/MegaQuizPlayer.tsx
// v2 : KaTeX + filtres niveau/matière/chapitre

import { useState, useMemo, useEffect } from "react";
import { getLevelDisplayLabel } from "../../utils/levels";
import MathText from "./MathText";

interface Question {
  id: string; question: string; choices: string[]; answer: number; explanation: string;
  chapterTitle: string; matiere: string; niveau: string;
}

interface MegaQuizPlayerProps {
  allQuestions?: Question[];
  dataUrl?: string;
  totalQuestions?: number;
}

export default function MegaQuizPlayer({ allQuestions, dataUrl, totalQuestions }: MegaQuizPlayerProps) {
  const [remoteQuestions, setRemoteQuestions] = useState<Question[]>(allQuestions ?? []);
  const [loading, setLoading] = useState(Boolean(dataUrl && !allQuestions));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fNiveau, setFNiveau] = useState("all");
  const [fMatiere, setFMatiere] = useState("all");
  const [fChapter, setFChapter] = useState("all");
  const [nb, setNb] = useState(10);
  const [started, setStarted] = useState(false);
  const [sessionSeed, setSessionSeed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number|null>(null);
  const [rev, setRev] = useState(false);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<boolean[]>([]);
  const [retryQuestions, setRetryQuestions] = useState<Question[] | null>(null);

  const questions = allQuestions ?? remoteQuestions;

  useEffect(() => {
    if (!dataUrl || allQuestions) return;
    let cancelled = false;
    setLoading(true);
    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ questions?: Question[] }>;
      })
      .then((payload) => {
        if (cancelled) return;
        setRemoteQuestions(Array.isArray(payload.questions) ? payload.questions : []);
        setLoadError(null);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Impossible de charger les questions pour le moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allQuestions, dataUrl]);

  const niveaux = [...new Set(questions.map(q => q.niveau))].sort();
  const matieres = [...new Set(questions.map(q => q.matiere))];

  const filtered = useMemo(() => {
    let f = questions;
    if (fNiveau !== "all") f = f.filter(q => q.niveau === fNiveau);
    if (fMatiere !== "all") f = f.filter(q => q.matiere === fMatiere);
    if (fChapter !== "all") f = f.filter(q => q.chapterTitle === fChapter);
    return f;
  }, [questions, fNiveau, fMatiere, fChapter]);

  const chapters = [...new Set(filtered.map(q => q.chapterTitle))].sort();

  const pool = useMemo(() => retryQuestions ?? [...filtered]
    .map((question) => ({ question, order: Math.random() + Number.EPSILON * sessionSeed }))
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.question)
    .slice(0, nb), [filtered, nb, retryQuestions, sessionSeed]);

  const cur = pool[idx];
  const done = idx >= pool.length && started;

  useEffect(() => {
    if (!started) setRetryQuestions(null);
  }, [started]);

  const V = {
    bg:"var(--bg-card)",bgS:"var(--bg-secondary)",bd:"var(--border-color)",
    t:"var(--text-primary)",tm:"var(--text-muted)",
    p:"var(--accent-primary)",pL:"var(--accent-primary-light)",
    s:"var(--accent-success)",sL:"var(--accent-success-light)",
    d:"var(--accent-danger)",dL:"var(--accent-danger-light)",
    pu:"var(--accent-purple)",puL:"var(--accent-purple-light)",
    r:"var(--radius-lg)",rm:"var(--radius-md)",rp:"var(--radius-pill)",sh:"var(--shadow-card)"
  };

  const P = ({a,onClick,children}:{a:boolean;onClick:()=>void;children:React.ReactNode}) => (
    <button onClick={onClick} style={{padding:"0.35rem 0.8rem",borderRadius:V.rp,border:"none",cursor:"pointer",fontWeight:600,fontSize:"0.78rem",fontFamily:"inherit",background:a?V.p:V.bgS,color:a?"#fff":V.tm,transition:"all 0.15s"}}>{children}</button>
  );

  if (loading) {
    return (
      <div data-mega-quiz-player-v3="true" role="status" aria-live="polite" style={{background:V.bg,borderRadius:V.r,boxShadow:V.sh,padding:"1.5rem",border:`1px solid ${V.bd}`,textAlign:"center",color:V.tm}}>
        Chargement de {totalQuestions ?? "la banque de"} questions...
      </div>
    );
  }

  if (loadError) {
    return (
      <div data-mega-quiz-player-v3="true" role="alert" style={{background:V.bg,borderRadius:V.r,boxShadow:V.sh,padding:"1.5rem",border:`1px solid ${V.bd}`,textAlign:"center",color:V.d}}>
        {loadError}
      </div>
    );
  }

  if (!started) {
    return (
      <div data-mega-quiz-player-v3="true" style={{background:V.bg,borderRadius:V.r,boxShadow:V.sh,padding:"1.5rem",border:`1px solid ${V.bd}`}}>
        <h2 style={{fontSize:"1.1rem",fontWeight:700,color:V.t,textAlign:"center",marginBottom:"1rem"}}>⚙️ Configuration du Mega Quiz</h2>
        <div style={{marginBottom:"0.75rem"}}>
          <p style={{fontSize:"0.8rem",fontWeight:600,color:V.tm,marginBottom:"0.4rem"}}>📚 Niveau :</p>
          <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
            <P a={fNiveau==="all"} onClick={()=>{setFNiveau("all");setFChapter("all");}}>Tous</P>
            {niveaux.map(n=><P key={n} a={fNiveau===n} onClick={()=>{setFNiveau(n);setFChapter("all");}}>{getLevelDisplayLabel(n)}</P>)}
          </div>
        </div>
        <div style={{marginBottom:"0.75rem"}}>
          <p style={{fontSize:"0.8rem",fontWeight:600,color:V.tm,marginBottom:"0.4rem"}}>🔬 Matière :</p>
          <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
            <P a={fMatiere==="all"} onClick={()=>{setFMatiere("all");setFChapter("all");}}>🔀 Toutes</P>
            {matieres.map(m=><P key={m} a={fMatiere===m} onClick={()=>{setFMatiere(m);setFChapter("all");}}>{m==="chimie"?"🧪 Chimie":"⚡ Physique"}</P>)}
          </div>
        </div>
        <div style={{marginBottom:"0.75rem"}}>
          <p style={{fontSize:"0.8rem",fontWeight:600,color:V.tm,marginBottom:"0.4rem"}}>📖 Chapitre :</p>
          <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
            <P a={fChapter==="all"} onClick={()=>setFChapter("all")}>Tous ({filtered.length})</P>
            {chapters.map(ch=><P key={ch} a={fChapter===ch} onClick={()=>setFChapter(ch)}>{ch}</P>)}
          </div>
        </div>
        <div style={{marginBottom:"1rem"}}>
          <p style={{fontSize:"0.8rem",fontWeight:600,color:V.tm,marginBottom:"0.4rem"}}>🔢 Questions :</p>
          <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
            {[5,10,15,20,30].map(n=><P key={n} a={nb===n} onClick={()=>setNb(n)}>{n}</P>)}
          </div>
        </div>
        <p style={{fontSize:"0.8rem",color:V.tm,textAlign:"center",marginBottom:"0.75rem"}}>{filtered.length} questions disponibles</p>
        <button onClick={()=>{if(filtered.length>0){setSessionSeed(seed=>seed+1);setStarted(true);}}} style={{display:"block",width:"100%",padding:"0.8rem",border:"none",borderRadius:V.rm,background:filtered.length>0?V.p:V.bgS,color:filtered.length>0?"#fff":V.tm,fontWeight:700,fontSize:"1rem",cursor:filtered.length>0?"pointer":"not-allowed",fontFamily:"inherit"}}>🚀 Lancer !</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score/pool.length)*100);
    const emoji = pct===100?"🏆":pct>=80?"🌟":pct>=60?"👍":pct>=40?"💪":"📚";
    return (
      <div data-mega-quiz-result-v3="true" style={{background:V.bg,borderRadius:V.r,boxShadow:V.sh,padding:"1.5rem",border:`1px solid ${V.bd}`,textAlign:"center"}}>
        <span style={{fontSize:"3rem"}}>{emoji}</span>
        <h2 style={{fontSize:"1.3rem",fontWeight:800,color:V.t,margin:"0.5rem 0"}}>Mega Quiz terminé !</h2>
        <p style={{fontSize:"2rem",fontWeight:900,color:pct>=60?V.s:V.d}}>{score}/{pool.length}</p>
        <p style={{fontSize:"1rem",color:V.tm}}>{pct}%</p>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"0.3rem",margin:"1rem 0"}}>
          {log.map((ok,i)=><span key={i} style={{width:24,height:24,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:700,background:ok?V.sL:V.dL,color:ok?V.s:V.d}}>{i+1}</span>)}
        </div>
        {log.some(ok=>!ok)&&<div style={{marginTop:"1rem"}}><button onClick={()=>{setRetryQuestions(pool.filter((_,i)=>!log[i]));setStarted(true);setIdx(0);setSel(null);setRev(false);setScore(0);setLog([]);}} style={{padding:"0.6rem 1.5rem",borderRadius:V.rm,border:`2px solid ${V.p}`,cursor:"pointer",background:"transparent",color:V.p,fontWeight:600,fontSize:"0.9rem",fontFamily:"inherit"}}>Reprendre les erreurs</button></div>}
        <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",marginTop:"1rem"}}>
          <button onClick={()=>{setStarted(false);setIdx(0);setSel(null);setRev(false);setScore(0);setLog([]);}} style={{padding:"0.6rem 1.5rem",borderRadius:V.rm,border:"none",cursor:"pointer",background:V.p,color:"#fff",fontWeight:600,fontSize:"0.9rem",fontFamily:"inherit"}}>🔄 Recommencer</button>
          <a href="/" style={{padding:"0.6rem 1.5rem",borderRadius:V.rm,border:`1px solid ${V.bd}`,background:V.bg,color:V.tm,fontWeight:600,fontSize:"0.9rem",textDecoration:"none"}}>🏠 Accueil</a>
        </div>
      </div>
    );
  }

  return (
    <div data-mega-quiz-player-v3="true" style={{background:V.bg,borderRadius:V.r,boxShadow:V.sh,padding:"1.5rem",border:`1px solid ${V.bd}`}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1rem"}}>
        <span style={{fontSize:"0.8rem",fontWeight:700,color:V.tm}}>{idx+1}/{pool.length}</span>
        <div style={{flex:1,height:6,background:V.bgS,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",background:V.p,borderRadius:99,width:`${((idx+1)/pool.length)*100}%`,transition:"width 0.3s"}}/></div>
        <span style={{fontSize:"0.8rem",fontWeight:700,color:V.s}}>✅ {score}</span>
      </div>
      <span style={{display:"inline-block",fontSize:"0.7rem",fontWeight:600,padding:"0.15rem 0.5rem",borderRadius:V.rp,marginBottom:"0.75rem",background:cur.matiere==="chimie"?V.puL:V.pL,color:cur.matiere==="chimie"?V.pu:V.p}}>{cur.matiere==="chimie"?"🧪":"⚡"} {cur.chapterTitle}</span>
      <h3 style={{fontSize:"1.05rem",fontWeight:700,color:V.t,marginBottom:"1rem",lineHeight:1.4}}><MathText text={cur.question}/></h3>
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {cur.choices.map((c,i)=>{
          let bg=V.bgS,bc="transparent",co=V.t;
          if(rev){if(i===cur.answer){bg=V.sL;bc=V.s;co=V.s;}else if(i===sel&&i!==cur.answer){bg=V.dL;bc=V.d;co=V.d;}}
          else if(i===sel){bg=V.pL;bc=V.p;co=V.p;}
          return <button key={i} onClick={()=>{if(!rev)setSel(i);}} style={{padding:"0.7rem 1rem",borderRadius:V.rm,border:`2px solid ${bc}`,background:bg,color:co,fontWeight:600,fontSize:"0.9rem",textAlign:"left",cursor:rev?"default":"pointer",fontFamily:"inherit",transition:"all 0.15s"}}><MathText text={c}/></button>;
        })}
      </div>
      {rev&&cur.explanation&&<div style={{marginTop:"0.75rem",padding:"0.75rem 1rem",background:V.bgS,borderRadius:V.rm,fontSize:"0.85rem",color:V.tm}}>💡 <MathText text={cur.explanation}/></div>}
      <div style={{marginTop:"1rem",textAlign:"right"}}>
        {!rev?<button onClick={()=>{if(sel===null)return;setRev(true);if(sel===cur.answer)setScore(s=>s+1);setLog(l=>[...l,sel===cur.answer]);}} disabled={sel===null} style={{padding:"0.6rem 1.5rem",borderRadius:V.rm,border:"none",cursor:sel!==null?"pointer":"not-allowed",background:sel!==null?V.p:V.bgS,color:sel!==null?"#fff":V.tm,fontWeight:600,fontSize:"0.9rem",fontFamily:"inherit"}}>Valider ✓</button>
        :<button onClick={()=>{setSel(null);setRev(false);setIdx(i=>i+1);}} style={{padding:"0.6rem 1.5rem",borderRadius:V.rm,border:"none",cursor:"pointer",background:V.p,color:"#fff",fontWeight:600,fontSize:"0.9rem",fontFamily:"inherit"}}>Suivant →</button>}
      </div>
    </div>
  );
}
