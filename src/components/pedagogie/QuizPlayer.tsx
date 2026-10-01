// src/components/pedagogie/QuizPlayer.tsx
// v7 : CSS vars + shuffle + anti-triche + KaTeX + TTS partout + hydration guard

import { useState, useMemo, useRef, useEffect } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { getCanonicalProgressStorageKey } from "../../utils/contentIds";
import XPToast, { type ToastItem } from "./XPToast";
import MathText from "./MathText";
import TextToSpeech from "./TextToSpeech";

interface QuizQuestion { id: string; type?: string; question: string; choices: string[]; answer: number; explanation?: string; }
interface ShuffledQuestion { original: QuizQuestion; shuffledChoices: string[]; correctIndex: number; }
interface QuizPlayerProps { data: QuizQuestion[] | { questions: QuizQuestion[] }; title?: string; chapterId?: string; xpConfig?: { quiz_base?: number; quiz_per_correct?: number; quiz_perfect?: number }; }
export interface QuizProgressRecord {
  date?: string;
  score?: number;
  total?: number;
  bestScore?: number;
  bestTotal?: number;
  bestPct?: number;
  attempts?: number;
  lastScore?: number;
  lastTotal?: number;
  updatedAt?: string;
}
export interface QuizAttempt { date: string; score: number; total: number; updatedAt?: string; }

function shuffleArray<T>(arr: T[]): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function prepareQuestions(q: QuizQuestion[], shuffle = true): ShuffledQuestion[] {
  const orderedQuestions = shuffle ? shuffleArray(q) : [...q];
  return orderedQuestions.map(q=>{
    const correctChoice=q.choices[q.answer];
    const choices=shuffle?shuffleArray(q.choices):[...q.choices];
    return{original:q,shuffledChoices:choices,correctIndex:choices.indexOf(correctChoice)};
  });
}

function getQuizRewardKey(c:string){return getCanonicalProgressStorageKey("quiz_reward_", c)}
function canRewardQuizToday(c:string):boolean{if(typeof window==="undefined")return true;try{const d=localStorage.getItem(getQuizRewardKey(c));if(!d)return true;return JSON.parse(d).date!==new Date().toISOString().slice(0,10)}catch{return true}}
function validNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
export function mergeQuizProgress(previous: QuizProgressRecord | null | undefined, attempt: QuizAttempt): QuizProgressRecord {
  const prevScore = validNumber(previous?.score);
  const prevTotal = Math.max(1, validNumber(previous?.total, attempt.total || 1));
  const legacyBestPct = prevScore / prevTotal;
  const prevBestScore = validNumber(previous?.bestScore, prevScore);
  const prevBestTotal = Math.max(1, validNumber(previous?.bestTotal, prevTotal));
  const prevBestPct = validNumber(previous?.bestPct, prevBestScore / prevBestTotal);
  const attemptTotal = Math.max(1, attempt.total);
  const attemptPct = attempt.score / attemptTotal;
  const bestPct = Math.max(prevBestPct, legacyBestPct);
  const keepPreviousBest = bestPct >= attemptPct;
  const dailyScore = previous?.date === attempt.date ? Math.max(prevScore, attempt.score) : attempt.score;

  return {
    ...previous,
    date: attempt.date,
    score: dailyScore,
    total: attemptTotal,
    bestScore: keepPreviousBest ? prevBestScore : attempt.score,
    bestTotal: keepPreviousBest ? prevBestTotal : attemptTotal,
    bestPct: keepPreviousBest ? bestPct : attemptPct,
    attempts: validNumber(previous?.attempts) + 1,
    lastScore: attempt.score,
    lastTotal: attemptTotal,
    updatedAt: attempt.updatedAt ?? new Date().toISOString(),
  };
}
function getStoredQuizProgress(c:string): QuizProgressRecord | null {if(typeof window==="undefined")return null;try{const d=localStorage.getItem(getQuizRewardKey(c));return d?JSON.parse(d):null}catch{return null}}
function markQuizRewardedToday(c:string,s:number,t:number){if(typeof window==="undefined")return;try{const date=new Date().toISOString().slice(0,10);const progress=mergeQuizProgress(getStoredQuizProgress(c),{date,score:s,total:t});localStorage.setItem(getQuizRewardKey(c),JSON.stringify(progress))}catch{}}

const V = {
  bg: "var(--ui5-surface)", bgSec: "var(--ui5-surface-soft)", bgTer: "var(--ui5-surface-soft)",
  text: "var(--ui5-text)", textSec: "var(--ui5-text-2)", textMut: "var(--ui5-text-3)", textDis: "var(--text-disabled)",
  border: "var(--ui5-border)", primary: "var(--ui5-action)", primaryLt: "var(--ui5-action-soft)",
  success: "var(--accent-success)", successLt: "var(--accent-success-light)",
  danger: "var(--accent-danger)", dangerLt: "var(--accent-danger-light)",
};

export default function QuizPlayer({ data, title, chapterId, xpConfig }: QuizPlayerProps) {
  const rawQ: QuizQuestion[] = useMemo(() => Array.isArray(data)?data:(data?.questions??[]), [data]);
  const [questions, setQuestions] = useState(() => prepareQuestions(rawQ, false));
  const [ci, setCi] = useState(0);
  const [sel, setSel] = useState<number|null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [fin, setFin] = useState(false);
  const [answers, setAnswers] = useState<(number|null)[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [xpE, setXpE] = useState(0);
  const [ready, setReady] = useState(false);
  const [alreadyToday, setAlreadyToday] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const st = useRef(Date.now());

  useEffect(() => {
    setReady(false);
    setQuestions(prepareQuestions(rawQ, false));
    setCi(0);
    setSel(null);
    setAnswered(false);
    setScore(0);
    setFin(false);
    setAnswers([]);
    setXpE(0);
    setRetryMode(false);
    setAlreadyToday(chapterId ? !canRewardQuizToday(chapterId) : false);

    const timer = setTimeout(() => {
      setQuestions(prepareQuestions(rawQ, true));
      st.current = Date.now();
      setReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [rawQ, chapterId]);

  const total = questions.length;
  if(!total) return <p className="ui5-u-font-style-italic ui5-u-color-ui5-text-3">Aucune question disponible.</p>;
  const cur = questions[ci];
  const isC = sel === cur.correctIndex;

  // Texte complet de la question + choix pour le TTS "Tout lire"
  const fullQuestionText = cur.original.question + ". Les choix sont : " +
    cur.shuffledChoices.map((ch, i) => `${String.fromCharCode(65+i)}, ${ch}`).join(". ");

  function addT(t:Omit<ToastItem,"id">){setToasts(p=>[...p,{...t,id:`t-${Date.now()}-${Math.random()}`}])}
  function disT(id:string){setToasts(p=>p.filter(t=>t.id!==id))}

  function handleValidate(){if(!ready||sel===null||answered)return;setAnswered(true);if(sel===cur.correctIndex)setScore(s=>s+1);setAnswers(p=>{const n=[...p];n[ci]=sel;return n})}
  function scoreFromAnswers(nextAnswers:(number|null)[]=answers){return questions.reduce((sum,q,i)=>sum+(nextAnswers[i]===q.correctIndex?1:0),0)}
  function handleNext(){if(ci+1>=total){const finalScore=scoreFromAnswers();setScore(finalScore);setFin(true);finishQuizV3(finalScore)}else{setCi(i=>i+1);setSel(null);setAnswered(false)}}
  function finishQuiz(){if(chapterId){try{const e=getGamificationEngine();const d=Date.now()-st.current;if(canRewardQuizToday(chapterId)){const r=e.completeQuiz(chapterId,score,total,d,xpConfig);markQuizRewardedToday(chapterId,score,total);setAlreadyToday(true);setXpE(r.xp);if(r.xp>0)addT({type:"xp",message:`+${r.xp} XP 🎉`,icon:"⚡"});if(r.rankUp)addT({type:"rank_up",message:`Nouveau rang : ${r.rankUp.icon} ${r.rankUp.name} !`,icon:r.rankUp.icon});r.newBadges.forEach(b=>addT({type:"badge",message:`Badge : ${b.icon} ${b.name}`,icon:b.icon}))}else{setAlreadyToday(true);setXpE(0);addT({type:"xp",message:"Quiz déjà fait aujourd'hui — reviens demain !",icon:"ℹ️"})}}catch(e){console.warn(e)}}}
  function finishQuizV3(finalScore:number){if(chapterId){try{const e=getGamificationEngine();const d=Date.now()-st.current;if(canRewardQuizToday(chapterId)){const r=e.completeQuiz(chapterId,finalScore,total,d,xpConfig);markQuizRewardedToday(chapterId,finalScore,total);setAlreadyToday(true);setXpE(r.xp);if(r.xp>0)addT({type:"xp",message:`+${r.xp} XP gagne`,icon:"XP"});if(r.rankUp)addT({type:"rank_up",message:`Nouveau rang : ${r.rankUp.name} !`,icon:r.rankUp.icon});r.newBadges.forEach(b=>addT({type:"badge",message:`Badge : ${b.name}`,icon:b.icon}))}else{markQuizRewardedToday(chapterId,finalScore,total);setAlreadyToday(true);setXpE(0);addT({type:"xp",message:"Quiz deja recompense aujourd'hui - reviens demain !",icon:"i"})}}catch(e){console.warn(e)}}}
  function restart(){setQuestions(prepareQuestions(rawQ));setCi(0);setSel(null);setAnswered(false);setScore(0);setFin(false);setAnswers([]);setXpE(0);setRetryMode(false);st.current=Date.now();setReady(true)}
  function retryIncorrectQuestions(){const missed=questions.filter((q,i)=>answers[i]!==q.correctIndex);if(!missed.length)return;setQuestions(missed);setCi(0);setSel(null);setAnswered(false);setScore(0);setFin(false);setAnswers([]);setXpE(0);setRetryMode(true);st.current=Date.now();setReady(true)}
  void finishQuiz;

  // ─── Écran de fin ─────────────────────────────────────
  if(fin){
    const pct=Math.round((score/total)*100);
    const missedCount=questions.filter((q,i)=>answers[i]!==q.correctIndex).length;
    let emoji="🎉",msg="Excellent !";if(pct<40){emoji="💪";msg="Continue tes efforts !"}else if(pct<70){emoji="👍";msg="Pas mal, tu progresses !"}else if(pct<100){emoji="🌟";msg="Très bien !"}
    return(<div data-quiz-result-v3="true"  className="learning-player learning-result-card ui5-u-text-align-center">
      <div className="ui5-u-font-size-3rem ui5-u-margin-bottom-0-5rem">{emoji}</div>
      <h3 className="ui5-u-font-size-1-4rem ui5-u-font-weight-700 ui5-u-color-ui5-text ui5-u-margin-bottom-1rem">{msg}</h3>
      <div className="quiz-result-score" aria-label={`Score ${score} sur ${total}, soit ${pct} pour cent`}>
        <strong>{score}/{total}</strong>
        <span>{pct}% de bonnes réponses</span>
      </div>
      <div className="quiz-remediation">
        <strong>{missedCount === 0 ? "Toutes les notions de ce quiz sont validées." : `${missedCount} question${missedCount > 1 ? "s" : ""} à revoir`}</strong>
        <span>{missedCount === 0 ? "Tu peux passer à la ressource suivante." : "Relis les explications ci-dessous puis reprends uniquement tes erreurs."}</span>
      </div>
      {xpE>0&&<p className="ui5-u-font-size-1rem ui5-u-font-weight-700 ui5-u-color-ui5-action ui5-u-margin-bottom-0-5rem">⚡ +{xpE} XP gagnés</p>}
      {xpE===0&&alreadyToday&&<p className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3 ui5-u-font-style-italic ui5-u-margin-bottom-0-5rem">ℹ️ Quiz déjà récompensé aujourd'hui</p>}
      <div className="ui5-u-text-align-left ui5-u-display-flex ui5-u-flex-direction-column ui5-u-gap-0-5rem ui5-u-margin-bottom-1-5rem">
        {questions.map((q,i)=>{const ua=answers[i];const ok=ua===q.correctIndex;return(
          <div key={q.original.id} className="ui5-u-padding-0-6rem-0-75rem ui5-u-border-left-ui5-value-border-left ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-surface-soft" style={{ "--ui5-value-border-left": `4px solid ${ok?"var(--accent-success)":"var(--accent-danger)"}` } as React.CSSProperties}>
            <div className="ui5-u-display-flex ui5-u-gap-0-5rem ui5-u-font-size-0-9rem ui5-u-color-ui5-text"><span>{ok?"✅":"❌"}</span><span className="ui5-u-flex-1"><MathText text={q.original.question} /></span></div>
            {!ok&&<p className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-2 ui5-u-margin-top-0-25rem ui5-u-padding-left-1-5rem">Bonne réponse : <strong><MathText text={q.shuffledChoices[q.correctIndex]} /></strong></p>}
          </div>)})}
      </div>
      <div className="quiz-result-actions">
        {missedCount>0&&<button className="quiz-result-action quiz-result-action--primary" onClick={retryIncorrectQuestions}>Reprendre mes erreurs</button>}
        <button className="quiz-result-action" onClick={restart}>Recommencer le quiz</button>
      </div>
      <XPToast toasts={toasts} onDismiss={disT}/>
    </div>)
  }

  // ─── Écran de question ────────────────────────────────
  return(<div data-quiz-player-v3="true" data-retry-mode={retryMode ? "true" : "false"} className="learning-player learning-player--quiz">
    {title&&<h3 className="learning-player__title">{title}</h3>}
    {alreadyToday&&<p className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-2 ui5-u-background-ui5-surface-soft ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-padding-0-5rem-0-75rem ui5-u-margin-bottom-0-75rem ui5-u-text-align-center">ℹ️ Tu as déjà gagné des XP sur ce quiz aujourd'hui. Les XP seront disponibles demain.</p>}
    <div className="ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-75rem ui5-u-margin-bottom-1-25rem">
      <div className="ui5-u-flex-1 ui5-u-height-8px ui5-u-background-ui5-surface-soft ui5-u-border-radius-999px ui5-u-overflow-hidden"><div className="ui5-u-height-100 ui5-u-background-ui5-action ui5-u-border-radius-999px ui5-u-transition-width-0-4s ui5-u-width-ui5-value-width" style={{ "--ui5-value-width": `${((ci+(answered?1:0))/total)*100}%` } as React.CSSProperties}/></div>
      <span className="ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3 ui5-u-font-weight-500 ui5-u-white-space-nowrap">Question {ci+1}/{total}</span>
    </div>
    <div  className="learning-question-card ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-padding-1-5rem">
      {/* Question + TTS tout lire */}
      <p className="ui5-u-font-size-1-1rem ui5-u-font-weight-600 ui5-u-color-ui5-text ui5-u-margin-bottom-0-5rem ui5-u-line-height-1-5"><MathText text={cur.original.question} /></p>
      <div className="ui5-u-margin-bottom-1rem"><TextToSpeech compact text={fullQuestionText} label="Tout lire" /></div>

      {/* Choix */}
      <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-gap-0-5rem">
        {cur.shuffledChoices.map((ch,i)=>{
          let bg=V.bg,bc=V.border,col=V.text;
          if(answered){if(i===cur.correctIndex){bg=V.successLt;bc="var(--accent-success)";col="var(--accent-success)"}else if(i===sel&&!isC){bg=V.dangerLt;bc="var(--accent-danger)";col="var(--accent-danger)"}else{col=V.textDis}}
          else if(i===sel){bg=V.primaryLt;bc=V.primary;col=V.primary}
          return(<div key={i} className="ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-4rem">
            <button  onClick={()=>ready&&!answered&&setSel(i)} disabled={!ready||answered} className={"learning-choice ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-75rem ui5-u-padding-0-75rem-1rem ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-value-background" + " " + ((!ready||answered) ? "ui5-u-cursor-default" : "ui5-u-cursor-pointer") + " " + "ui5-u-text-align-left ui5-u-font-size-0-95rem ui5-u-color-ui5-value-color ui5-u-flex-1 ui5-u-transition-all-0-15s"} style={{ "--ui5-value-border": `2px solid ${bc}`, "--ui5-value-background": bg, "--ui5-value-color": col } as React.CSSProperties}>
              <span className="ui5-u-display-flex ui5-u-align-items-center ui5-u-justify-content-center ui5-u-width-28px ui5-u-height-28px ui5-u-border-radius-50 ui5-u-background-ui5-surface-soft ui5-u-font-size-0-8rem ui5-u-font-weight-700 ui5-u-flex-shrink-0">{String.fromCharCode(65+i)}</span>
              <span className="ui5-u-flex-1"><MathText text={ch} /></span>
            </button>
            <TextToSpeech compact text={ch} label="Lire" />
          </div>)})}
      </div>

      {/* Feedback + TTS sur l'explication */}
      {answered&&<div  className={"learning-feedback ui5-u-margin-top-1rem ui5-u-padding-0-75rem-1rem ui5-u-border-radius-ui5-radius-sm" + " " + (isC ? "ui5-u-background-accent-success-light" : "ui5-u-background-accent-danger-light") + " " + "ui5-u-border-ui5-value-border"} style={{ "--ui5-value-border": `1px solid ${isC?"var(--accent-success)":"var(--accent-danger)"}` } as React.CSSProperties}>
        <p className="ui5-u-font-weight-600 ui5-u-font-size-0-95rem ui5-u-margin-bottom-0-3rem">{isC?"✅ Bonne réponse !":"❌ Mauvaise réponse"}</p>
        {cur.original.explanation&&<>
          <p className="ui5-u-font-size-0-9rem ui5-u-color-ui5-text-2 ui5-u-line-height-1-5 ui5-u-margin-bottom-0-5rem"><MathText text={cur.original.explanation} /></p>
          <TextToSpeech compact text={cur.original.explanation} label="Écouter l'explication" />
        </>}
      </div>}

      <div className="ui5-u-margin-top-1-25rem ui5-u-display-flex ui5-u-justify-content-flex-end">
        {!answered?<button onClick={handleValidate} disabled={sel===null} className={"ui5-u-padding-0-6rem-1-5rem" + " " + (sel!==null ? "ui5-u-background-ui5-action" : "ui5-u-background-text-disabled") + " " + "ui5-u-color-fff ui5-u-border-none ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-95rem ui5-u-font-weight-600" + " " + (sel!==null ? "ui5-u-cursor-pointer" : "ui5-u-cursor-not-allowed")}>Valider</button>
        :<button onClick={handleNext} className="ui5-u-padding-0-6rem-1-5rem ui5-u-background-ui5-action ui5-u-color-fff ui5-u-border-none ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-95rem ui5-u-font-weight-600 ui5-u-cursor-pointer">{ci+1>=total?"Voir les résultats":"Question suivante →"}</button>}
      </div>
    </div>
    <div className="ui5-u-margin-top-0-75rem ui5-u-text-align-center ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3">Score : {score}/{ci+(answered?1:0)}</div>
    <XPToast toasts={toasts} onDismiss={disT}/>
  </div>)
}
