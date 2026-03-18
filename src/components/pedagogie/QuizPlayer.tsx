// src/components/pedagogie/QuizPlayer.tsx
// v7 : CSS vars + shuffle + anti-triche + KaTeX + TTS partout + hydration guard

import { useState, useMemo, useRef, useEffect } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import XPToast, { type ToastItem } from "./XPToast";
import MathText from "./MathText";
import TextToSpeech from "./TextToSpeech";

interface QuizQuestion { id: string; type?: string; question: string; choices: string[]; answer: number; explanation?: string; }
interface ShuffledQuestion { original: QuizQuestion; shuffledChoices: string[]; correctIndex: number; }
interface QuizPlayerProps { data: QuizQuestion[] | { questions: QuizQuestion[] }; title?: string; chapterId?: string; xpConfig?: { quiz_base?: number; quiz_per_correct?: number; quiz_perfect?: number }; }

function shuffleArray<T>(arr: T[]): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function prepareQuestions(q: QuizQuestion[]): ShuffledQuestion[] { return shuffleArray(q).map(q=>{const ct=q.choices[q.answer];const sc=shuffleArray(q.choices);return{original:q,shuffledChoices:sc,correctIndex:sc.indexOf(ct)}}); }

function getQuizRewardKey(c:string){return `quiz_reward_${c}`}
function canRewardQuizToday(c:string):boolean{if(typeof window==="undefined")return true;try{const d=localStorage.getItem(getQuizRewardKey(c));if(!d)return true;return JSON.parse(d).date!==new Date().toISOString().slice(0,10)}catch{return true}}
function markQuizRewardedToday(c:string,s:number,t:number){if(typeof window==="undefined")return;try{localStorage.setItem(getQuizRewardKey(c),JSON.stringify({date:new Date().toISOString().slice(0,10),score:s,total:t}))}catch{}}

const V = {
  bg: "var(--bg-card)", bgSec: "var(--bg-secondary)", bgTer: "var(--bg-tertiary)",
  text: "var(--text-primary)", textSec: "var(--text-secondary)", textMut: "var(--text-muted)", textDis: "var(--text-disabled)",
  border: "var(--border-color)", primary: "var(--accent-primary)", primaryLt: "var(--accent-primary-light)",
  success: "var(--accent-success)", successLt: "var(--accent-success-light)",
  danger: "var(--accent-danger)", dangerLt: "var(--accent-danger-light)",
};

export default function QuizPlayer({ data, title, chapterId, xpConfig }: QuizPlayerProps) {
  const rawQ: QuizQuestion[] = useMemo(() => Array.isArray(data)?data:(data?.questions??[]), [data]);
  const [questions, setQuestions] = useState(() => prepareQuestions(rawQ));
  const [ci, setCi] = useState(0);
  const [sel, setSel] = useState<number|null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [fin, setFin] = useState(false);
  const [answers, setAnswers] = useState<(number|null)[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [xpE, setXpE] = useState(0);
  const [ready, setReady] = useState(false);
  const st = useRef(Date.now());
  const alreadyToday = chapterId ? !canRewardQuizToday(chapterId) : false;

  useEffect(() => { const timer = setTimeout(() => setReady(true), 300); return () => clearTimeout(timer); }, []);

  const total = questions.length;
  if(!total) return <p style={{fontStyle:"italic",color:V.textMut}}>Aucune question disponible.</p>;
  const cur = questions[ci];
  const isC = sel === cur.correctIndex;

  // Texte complet de la question + choix pour le TTS "Tout lire"
  const fullQuestionText = cur.original.question + ". Les choix sont : " +
    cur.shuffledChoices.map((ch, i) => `${String.fromCharCode(65+i)}, ${ch}`).join(". ");

  function addT(t:Omit<ToastItem,"id">){setToasts(p=>[...p,{...t,id:`t-${Date.now()}-${Math.random()}`}])}
  function disT(id:string){setToasts(p=>p.filter(t=>t.id!==id))}

  function handleValidate(){if(!ready||sel===null||answered)return;setAnswered(true);if(sel===cur.correctIndex)setScore(s=>s+1);setAnswers(p=>[...p,sel])}
  function handleNext(){if(ci+1>=total){setFin(true);finishQuiz()}else{setCi(i=>i+1);setSel(null);setAnswered(false)}}
  function finishQuiz(){if(chapterId){try{const e=getGamificationEngine();const d=Date.now()-st.current;if(canRewardQuizToday(chapterId)){const r=e.completeQuiz(chapterId,score,total,d,xpConfig);markQuizRewardedToday(chapterId,score,total);setXpE(r.xp);if(r.xp>0)addT({type:"xp",message:`+${r.xp} XP 🎉`,icon:"⚡"});if(r.rankUp)addT({type:"rank_up",message:`Nouveau rang : ${r.rankUp.icon} ${r.rankUp.name} !`,icon:r.rankUp.icon});r.newBadges.forEach(b=>addT({type:"badge",message:`Badge : ${b.icon} ${b.name}`,icon:b.icon}))}else{setXpE(0);addT({type:"xp",message:"Quiz déjà fait aujourd'hui — reviens demain !",icon:"ℹ️"})}}catch(e){console.warn(e)}}}
  function restart(){setQuestions(prepareQuestions(rawQ));setCi(0);setSel(null);setAnswered(false);setScore(0);setFin(false);setAnswers([]);setXpE(0);st.current=Date.now()}

  // ─── Écran de fin ─────────────────────────────────────
  if(fin){
    const pct=Math.round((score/total)*100);
    let emoji="🎉",msg="Excellent !";if(pct<40){emoji="💪";msg="Continue tes efforts !"}else if(pct<70){emoji="👍";msg="Pas mal, tu progresses !"}else if(pct<100){emoji="🌟";msg="Très bien !"}
    return(<div style={{maxWidth:600,margin:"0 auto",textAlign:"center"}}>
      <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>{emoji}</div>
      <h3 style={{fontSize:"1.4rem",fontWeight:700,color:V.text,marginBottom:"1rem"}}>{msg}</h3>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:"0.25rem",marginBottom:"0.5rem"}}>
        <span style={{fontSize:"3rem",fontWeight:800,color:V.primary}}>{score}</span><span style={{fontSize:"1.5rem",color:V.textMut}}>/</span><span style={{fontSize:"1.5rem",fontWeight:600,color:V.textSec}}>{total}</span>
      </div>
      <p style={{fontSize:"1rem",color:V.textSec,marginBottom:"0.5rem"}}>{pct}% de bonnes réponses</p>
      {xpE>0&&<p style={{fontSize:"1rem",fontWeight:700,color:V.primary,marginBottom:"0.5rem"}}>⚡ +{xpE} XP gagnés</p>}
      {xpE===0&&alreadyToday&&<p style={{fontSize:"0.85rem",color:V.textMut,fontStyle:"italic",marginBottom:"0.5rem"}}>ℹ️ Quiz déjà récompensé aujourd'hui</p>}
      <div style={{textAlign:"left",display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"1.5rem"}}>
        {questions.map((q,i)=>{const ua=answers[i];const ok=ua===q.correctIndex;return(
          <div key={q.original.id} style={{padding:"0.6rem 0.75rem",borderLeft:`4px solid ${ok?"var(--accent-success)":"var(--accent-danger)"}`,borderRadius:"0 6px 6px 0",background:V.bgSec}}>
            <div style={{display:"flex",gap:"0.5rem",fontSize:"0.9rem",color:V.text}}><span>{ok?"✅":"❌"}</span><span style={{flex:1}}><MathText text={q.original.question} /></span></div>
            {!ok&&<p style={{fontSize:"0.85rem",color:V.textSec,marginTop:"0.25rem",paddingLeft:"1.5rem"}}>Bonne réponse : <strong><MathText text={q.shuffledChoices[q.correctIndex]} /></strong></p>}
          </div>)})}
      </div>
      <button onClick={restart} style={{padding:"0.6rem 1.5rem",background:V.primary,color:"#fff",border:"none",borderRadius:8,fontSize:"0.95rem",fontWeight:600,cursor:"pointer"}}>🔄 Recommencer</button>
      <XPToast toasts={toasts} onDismiss={disT}/>
    </div>)
  }

  // ─── Écran de question ────────────────────────────────
  return(<div style={{maxWidth:700,margin:"0 auto"}}>
    {title&&<h3 style={{fontSize:"1.1rem",fontWeight:600,marginBottom:"0.75rem",color:V.text}}>{title}</h3>}
    {alreadyToday&&<p style={{fontSize:"0.85rem",color:V.textSec,background:V.bgSec,border:`1px solid ${V.border}`,borderRadius:8,padding:"0.5rem 0.75rem",marginBottom:"0.75rem",textAlign:"center"}}>ℹ️ Tu as déjà gagné des XP sur ce quiz aujourd'hui. Les XP seront disponibles demain.</p>}
    <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.25rem"}}>
      <div style={{flex:1,height:8,background:V.bgTer,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",background:V.primary,borderRadius:99,transition:"width 0.4s",width:`${((ci+(answered?1:0))/total)*100}%`}}/></div>
      <span style={{fontSize:"0.85rem",color:V.textMut,fontWeight:500,whiteSpace:"nowrap"}}>Question {ci+1}/{total}</span>
    </div>
    <div style={{background:V.bg,border:`1px solid ${V.border}`,borderRadius:12,padding:"1.5rem"}}>
      {/* Question + TTS tout lire */}
      <p style={{fontSize:"1.1rem",fontWeight:600,color:V.text,marginBottom:"0.5rem",lineHeight:1.5}}><MathText text={cur.original.question} /></p>
      <div style={{marginBottom:"1rem"}}><TextToSpeech compact text={fullQuestionText} label="Tout lire" /></div>

      {/* Choix */}
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {cur.shuffledChoices.map((ch,i)=>{
          let bg=V.bg,bc=V.border,col=V.text;
          if(answered){if(i===cur.correctIndex){bg=V.successLt;bc="var(--accent-success)";col="var(--accent-success)"}else if(i===sel&&!isC){bg=V.dangerLt;bc="var(--accent-danger)";col="var(--accent-danger)"}else{col=V.textDis}}
          else if(i===sel){bg=V.primaryLt;bc=V.primary;col=V.primary}
          return(<div key={i} style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
            <button onClick={()=>ready&&!answered&&setSel(i)} disabled={!ready||answered} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 1rem",border:`2px solid ${bc}`,borderRadius:8,background:bg,cursor:(!ready||answered)?"default":"pointer",textAlign:"left",fontSize:"0.95rem",color:col,flex:1,transition:"all 0.15s"}}>
              <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:"50%",background:V.bgTer,fontSize:"0.8rem",fontWeight:700,flexShrink:0}}>{String.fromCharCode(65+i)}</span>
              <span style={{flex:1}}><MathText text={ch} /></span>
            </button>
            <TextToSpeech compact text={ch} label="Lire" />
          </div>)})}
      </div>

      {/* Feedback + TTS sur l'explication */}
      {answered&&<div style={{marginTop:"1rem",padding:"0.75rem 1rem",borderRadius:8,background:isC?V.successLt:V.dangerLt,border:`1px solid ${isC?"var(--accent-success)":"var(--accent-danger)"}`}}>
        <p style={{fontWeight:600,fontSize:"0.95rem",marginBottom:"0.3rem"}}>{isC?"✅ Bonne réponse !":"❌ Mauvaise réponse"}</p>
        {cur.original.explanation&&<>
          <p style={{fontSize:"0.9rem",color:V.textSec,lineHeight:1.5,marginBottom:"0.5rem"}}><MathText text={cur.original.explanation} /></p>
          <TextToSpeech compact text={cur.original.explanation} label="Écouter l'explication" />
        </>}
      </div>}

      <div style={{marginTop:"1.25rem",display:"flex",justifyContent:"flex-end"}}>
        {!answered?<button onClick={handleValidate} disabled={sel===null} style={{padding:"0.6rem 1.5rem",background:sel!==null?V.primary:V.textDis,color:"#fff",border:"none",borderRadius:8,fontSize:"0.95rem",fontWeight:600,cursor:sel!==null?"pointer":"not-allowed"}}>Valider</button>
        :<button onClick={handleNext} style={{padding:"0.6rem 1.5rem",background:V.primary,color:"#fff",border:"none",borderRadius:8,fontSize:"0.95rem",fontWeight:600,cursor:"pointer"}}>{ci+1>=total?"Voir les résultats":"Question suivante →"}</button>}
      </div>
    </div>
    <div style={{marginTop:"0.75rem",textAlign:"center",fontSize:"0.85rem",color:V.textMut}}>Score : {score}/{ci+(answered?1:0)}</div>
    <XPToast toasts={toasts} onDismiss={disT}/>
  </div>)
}
