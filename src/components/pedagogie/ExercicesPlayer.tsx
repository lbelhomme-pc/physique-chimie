// src/components/pedagogie/ExercicesPlayer.tsx
// v7 : CSS vars + input + auto-éval + anti-triche + KaTeX + TTS consigne ET correction

import { useState, useMemo, useRef } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import XPToast, { type ToastItem } from "./XPToast";
import MathText from "./MathText";
import TextToSpeech from "./TextToSpeech";

interface ExerciceAides { indice?: string; methode?: string; erreurFrequente?: string; rappelCours?: string; }
interface Exercice { id: string; title?: string; titre?: string; difficulty?: number; difficulte?: number|string; difficultyLabel?: string; niveau?: string; consigne: string; correction: string[]; aide?: string; aides?: ExerciceAides; schemaSvg?: string|null; schemaCaption?: string|null; schemaAlt?: string|null; }
interface ExercicesPlayerProps { data: Exercice[] | { exercices: Exercice[] }; title?: string; chapterId?: string; xpConfig?: { exercice_each?: number; exercice_all?: number }; }

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

function getDiffStyle(d?: number) {
  if (!d||d<=1) return {text:"Niveau 1",description:"Application",color:V.success,bg:V.successLt,border:V.success};
  if (d<=2) return {text:"Niveau 2",description:"Entraînement",color:V.primary,bg:V.primaryLt,border:V.primary};
  if (d<=3) return {text:"Niveau 3",description:"Raisonnement",color:V.warning,bg:V.warningLt,border:V.warning};
  if (d<=4) return {text:"Niveau 4",description:"Approfondissement",color:V.danger,bg:V.dangerLt,border:V.danger};
  return {text:"Niveau 5",description:"Défi",color:V.purple,bg:V.purpleLt,border:V.purple};
}

function cleanDifficultyLabel(value?: string) {
  return String(value ?? "")
    .replace(/[⭐🏆]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDifficultyLabel(exercice: Exercice, style: ReturnType<typeof getDiffStyle>) {
  const label = cleanDifficultyLabel(exercice.difficultyLabel);
  return label ? `${style.text} — ${label}` : `${style.text} — ${style.description}`;
}

function stripHtmlForSpeech(text: string): string {
  return text
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getRewardedKey(c:string){return `exo_rewarded_${c}`}
function getRewardedIds(c:string):Set<string>{if(typeof window==="undefined")return new Set();try{const r=localStorage.getItem(getRewardedKey(c));return r?new Set(JSON.parse(r)):new Set()}catch{return new Set()}}
function saveRewardedIds(c:string,ids:Set<string>){if(typeof window==="undefined")return;try{localStorage.setItem(getRewardedKey(c),JSON.stringify([...ids]))}catch{}}

function getAideItems(exercice: Exercice) {
  const aides = exercice.aides ?? {};
  const items = [
    { key: "indice", label: "Indice", content: aides.indice ?? exercice.aide },
    { key: "methode", label: "Méthode", content: aides.methode },
    { key: "erreurFrequente", label: "Erreur fréquente", content: aides.erreurFrequente },
    { key: "rappelCours", label: "Rappel de cours", content: aides.rappelCours },
  ];
  return items.filter((item): item is { key: string; label: string; content: string } => Boolean(item.content?.trim()));
}

function normalizeExercice(exercice: Exercice): Exercice {
  const rawDifficulty = exercice.difficulty ?? exercice.difficulte;
  const difficulty = typeof rawDifficulty === "number" ? rawDifficulty : Number(rawDifficulty);
  const aides = exercice.aides || exercice.aide
    ? { ...exercice.aides, indice: exercice.aides?.indice ?? exercice.aide }
    : exercice.aides;
  return {
    ...exercice,
    title: exercice.title ?? exercice.titre,
    difficulty: Number.isFinite(difficulty) ? difficulty : undefined,
    difficultyLabel: exercice.difficultyLabel ?? exercice.niveau,
    aides,
  };
}

function safeDomId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export default function ExercicesPlayer({ data, title, chapterId, xpConfig }: ExercicesPlayerProps) {
  const exercices: Exercice[] = useMemo(() => {
    const raw = Array.isArray(data)?data:(data?.exercices??[]);
    return raw.map(normalizeExercice);
  }, [data]);
  const [rewardedIds, setRewardedIds] = useState<Set<string>>(() => chapterId ? getRewardedIds(chapterId) : new Set());
  const [ci, setCi] = useState(0);
  const [input, setInput] = useState("");
  const [showCorr, setShowCorr] = useState(false);
  const [selfEval, setSelfEval] = useState<"correct"|"partial"|"incorrect"|null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => chapterId ? getRewardedIds(chapterId) : new Set());
  const [filterDiff, setFilterDiff] = useState<number|null>(null);
  const [openAides, setOpenAides] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [allNotified, setAllNotified] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const total = exercices.length;
  const filtered = useMemo(() => filterDiff===null?exercices:exercices.filter(e=>e.difficulty===filterDiff), [exercices,filterDiff]);
  const diffs = useMemo(() => Array.from(new Set(exercices.map(e=>e.difficulty??1))).sort((a,b)=>a-b), [exercices]);

  if (!total) return <p style={{fontStyle:"italic",color:V.textMut}}>Aucun exercice disponible.</p>;

  const cur = filtered[ci];
  if (!cur) return <p style={{fontStyle:"italic",color:V.textMut}}>Aucun exercice ne correspond au filtre.</p>;

  const ds = getDiffStyle(cur.difficulty);
  const rewarded = rewardedIds.has(cur.id);
  const aideItems = getAideItems(cur);
  const answerId = `${safeDomId(cur.id)}-answer`;

  function addT(t:Omit<ToastItem,"id">){setToasts(p=>[...p,{...t,id:`t-${Date.now()}-${Math.random()}`}])}
  function disT(id:string){setToasts(p=>p.filter(t=>t.id!==id))}

  function rewardExo(exoId:string, xpAmount:number) {
    if(!chapterId||rewardedIds.has(exoId))return;
    try{const e=getGamificationEngine();const r=e.completeExercice(chapterId,exoId,{exercice_each:xpAmount});
    const nr=new Set(rewardedIds).add(exoId);setRewardedIds(nr);saveRewardedIds(chapterId,nr);
    if(r.xp>0)addT({type:"xp",message:`+${r.xp} XP`,icon:"⚡"});
    if(r.rankUp)addT({type:"rank_up",message:`Nouveau rang : ${r.rankUp.icon} ${r.rankUp.name} !`,icon:r.rankUp.icon});
    r.newBadges.forEach(b=>addT({type:"badge",message:`Badge : ${b.icon} ${b.name}`,icon:b.icon}))}catch(e){console.warn(e)}
  }

  function checkAll(ids:Set<string>){
    if(allNotified||ids.size<total||!chapterId)return;setAllNotified(true);
    const k=`exo_all_rewarded_${chapterId}`;if(typeof window!=="undefined"&&localStorage.getItem(k))return;
    try{const e=getGamificationEngine();const r=e.completeAllExercices(chapterId,xpConfig);if(typeof window!=="undefined")localStorage.setItem(k,"true");
    if(r.xp>0)addT({type:"chapter_complete",message:`Tous terminés ! +${r.xp} XP 🎉`,icon:"🏆"})}catch(e){console.warn(e)}
  }

  function handleShowCorr(){
    if(!input.trim()){if(inputRef.current){inputRef.current.style.borderColor=V.warning;setTimeout(()=>{if(inputRef.current)inputRef.current.style.borderColor=V.border},1000)}return}
    setShowCorr(true);
  }

  function handleEval(ev:"correct"|"partial"|"incorrect"){
    setSelfEval(ev);
    const nc=new Set(completedIds).add(cur.id);setCompletedIds(nc);
    const base=xpConfig?.exercice_each??3;
    const xp=ev==="correct"?base:ev==="partial"?Math.ceil(base/2):1;
    rewardExo(cur.id,xp);checkAll(nc);
  }

  function goTo(i:number){setCi(i);setShowCorr(false);setSelfEval(null);setInput("");setOpenAides({});setTimeout(()=>inputRef.current?.focus(),100)}
  function toggleFilter(d:number){setFilterDiff(filterDiff===d?null:d);setCi(0);setShowCorr(false);setSelfEval(null);setInput("");setOpenAides({})}
  function toggleAide(key:string){setOpenAides(prev=>({...prev,[key]:!prev[key]}))}

  return (
    <div style={{maxWidth:700,margin:"0 auto"}}>
      {title&&<h3 style={{fontSize:"1.1rem",fontWeight:600,marginBottom:"0.75rem",color:V.text}}>{title}</h3>}

      {/* Filtres */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.5rem",marginBottom:"0.75rem"}}>
        <div style={{display:"flex",gap:"0.35rem",flexWrap:"wrap"}}>
          {diffs.map(d=>{const s=getDiffStyle(d);const active=filterDiff===d;return(
            <button key={d} type="button" aria-pressed={active} onClick={()=>toggleFilter(d)} style={{padding:"0.25rem 0.6rem",border:`1px solid ${active?s.color:V.border}`,borderRadius:6,fontSize:"0.75rem",fontWeight:600,cursor:"pointer",background:active?s.bg:"transparent",color:active?s.color:V.textSec}}>{s.text}</button>
          )})}
        </div>
      </div>

      {/* Progress */}
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1rem"}}>
        <div role="progressbar" aria-label="Progression dans les exercices" aria-valuemin={1} aria-valuemax={filtered.length} aria-valuenow={ci+1} style={{flex:1,height:8,background:V.bgTer,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",background:V.warning,borderRadius:99,transition:"width 0.4s",width:`${((ci+1)/filtered.length)*100}%`}}/></div>
        <span style={{fontSize:"0.85rem",color:V.textMut,fontWeight:500,whiteSpace:"nowrap"}}>{ci+1}/{filtered.length}</span>
      </div>

      {/* Carte exercice */}
      <div style={{background:V.bg,border:`1px solid ${V.border}`,borderLeft:`5px solid ${ds.color}`,borderRadius:12,padding:"1.5rem",marginBottom:"1rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem",gap:"0.5rem"}}>
          <div style={{display:"flex",flexDirection:"column",gap:"0.15rem"}}>
            <span style={{fontSize:"0.8rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",color:V.textMut}}>
              Exercice {ci+1}{rewarded&&<span style={{color:V.success,marginLeft:6}}>✅</span>}
            </span>
            {cur.title&&<h4 style={{fontSize:"1.15rem",fontWeight:700,color:V.text,margin:0}}>{cur.title}</h4>}
          </div>
          <span style={{padding:"0.25rem 0.65rem",borderRadius:99,fontSize:"0.75rem",fontWeight:600,border:`1px solid ${ds.border}`,whiteSpace:"nowrap",color:ds.color,background:ds.bg}}>{getDifficultyLabel(cur, ds)}</span>
        </div>

        {/* Consigne + TTS */}
        <div style={{padding:"1rem",background:V.bgSec,borderRadius:8,marginBottom:"0.5rem",borderLeft:`3px solid ${V.textDis}`}}>
          <MathText text={cur.consigne} block style={{fontSize:"1rem",color:V.text,lineHeight:1.6,margin:0}} />
        </div>
        {cur.schemaSvg&&(
          <figure style={{margin:"0 0 1rem",padding:"1rem",background:V.bgPri,border:`1px solid ${V.border}`,borderRadius:10}}>
            <div
              role="img"
              aria-label={cur.schemaAlt??cur.schemaCaption??"Schéma de l'exercice"}
              style={{display:"flex",justifyContent:"center",overflowX:"auto"}}
              dangerouslySetInnerHTML={{__html:cur.schemaSvg}}
            />
            {cur.schemaCaption&&(
              <figcaption style={{marginTop:"0.6rem",fontSize:"0.85rem",color:V.textMut,textAlign:"center",lineHeight:1.4}}>
                {cur.schemaCaption}
              </figcaption>
            )}
          </figure>
        )}
        <div style={{marginBottom:"1rem"}}><TextToSpeech compact text={stripHtmlForSpeech(cur.consigne)} /></div>

        {aideItems.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:"0.55rem",marginBottom:"1rem"}}>
            <p style={{fontSize:"0.85rem",fontWeight:700,color:V.textSec,margin:0}}>Aides progressives</p>
            {aideItems.map(item=>{
              const open=Boolean(openAides[item.key]);
              const panelId=`${safeDomId(cur.id)}-${item.key}-aide`;
              return (
                <div key={item.key} style={{border:`1px solid ${V.border}`,borderRadius:10,background:V.bgPri,overflow:"hidden"}}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={()=>toggleAide(item.key)}
                    style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"0.75rem",padding:"0.7rem 0.85rem",border:"none",background:open?V.primaryLt:V.bgSec,color:V.text,fontSize:"0.9rem",fontWeight:700,textAlign:"left",cursor:"pointer"}}
                  >
                    <span>{item.label}</span>
                    <span aria-hidden="true" style={{fontSize:"1rem",color:V.textMut}}>{open?"−":"+"}</span>
                  </button>
                  {open&&(
                    <div id={panelId} style={{padding:"0.8rem 0.9rem",borderTop:`1px solid ${V.border}`,fontSize:"0.92rem",lineHeight:1.55,color:V.text}}>
                      <MathText text={item.content} block />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Input ou correction */}
        {!showCorr?(
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            <label htmlFor={answerId} style={{fontSize:"0.85rem",fontWeight:600,color:V.textSec}}>✏️ Ta réponse :</label>
            <textarea id={answerId} ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              placeholder="Écris ta réponse ici..." style={{width:"100%",padding:"0.75rem",border:`2px solid ${V.border}`,borderRadius:10,fontSize:"1rem",fontFamily:"inherit",resize:"vertical",outline:"none",boxSizing:"border-box",background:V.bgPri,color:V.text}} rows={4} autoFocus/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              {rewarded&&<span style={{fontSize:"0.8rem",color:V.textMut,fontStyle:"italic"}}>Déjà consulté — pas de nouvel XP</span>}
              <button type="button" aria-disabled={!input.trim()} onClick={handleShowCorr} style={{padding:"0.65rem 1.5rem",background:input.trim()?V.warning:V.textDis,color:"#fff",border:"none",borderRadius:8,fontSize:"0.95rem",fontWeight:600,cursor:input.trim()?"pointer":"not-allowed",marginLeft:"auto"}}>👁️ Voir la correction</button>
            </div>
          </div>
        ):(
          <div>
            {/* Réponse élève */}
            <div style={{padding:"0.75rem 1rem",background:V.bgSec,border:`1px solid ${V.border}`,borderRadius:8,marginBottom:"0.75rem"}}>
              <span style={{fontSize:"0.75rem",fontWeight:700,color:V.textMut,textTransform:"uppercase"}}>📝 Ta réponse</span>
              <p style={{fontSize:"0.95rem",color:V.textSec,margin:"0.25rem 0 0",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{input}</p>
            </div>
            {/* Correction avec KaTeX */}
            <div style={{padding:"1rem",background:V.successLt,border:`1px solid ${V.success}`,borderRadius:8,marginBottom:"0.5rem"}}>
              <p style={{fontWeight:700,fontSize:"0.95rem",color:V.success,marginBottom:"0.5rem"}}>✅ Correction</p>
              {cur.correction.map((l,i)=>
                <div key={i} style={{fontSize:"0.95rem",color:V.text,lineHeight:1.6,margin:"0.3rem 0"}}>
                  <MathText text={l} block />
                </div>
              )}
            </div>
            <div style={{marginBottom:"1rem"}}><TextToSpeech compact text={stripHtmlForSpeech(cur.correction.join(". "))} label="Écouter la correction" /></div>
            {/* Auto-éval */}
            {selfEval===null&&(
              <div style={{marginTop:"0.5rem"}}>
                <p style={{fontSize:"0.9rem",color:V.textSec,textAlign:"center",marginBottom:"0.75rem",fontWeight:500}}>
                  {rewarded?"Compare ta réponse avec la correction :":"Comment as-tu répondu ? (les XP dépendent de ton honnêteté 😉)"}
                </p>
                <div style={{display:"flex",gap:"0.5rem"}}>
                  {([["incorrect","😰","Incorrect",V.danger,V.dangerLt,1],["partial","😕","Partiel",V.warning,V.warningLt,2],["correct","😎","Correct",V.success,V.successLt,3]] as const).map(([ev,emoji,label,color,bg,xp])=>(
                    <button key={ev} type="button" onClick={()=>handleEval(ev)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.15rem",padding:"0.6rem 0.5rem",border:`2px solid ${color}`,borderRadius:10,background:bg,color,fontSize:"0.85rem",fontWeight:600,cursor:"pointer"}}>
                      <span style={{fontSize:"1.5rem"}}>{emoji}</span>
                      <span>{label}</span>
                      {!rewarded&&<span style={{fontSize:"0.7rem",color:V.textMut}}>+{xp} XP</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selfEval!==null&&(
              <div style={{textAlign:"center",padding:"0.75rem",background:V.bgSec,borderRadius:8,fontSize:"0.9rem",color:V.textSec}}>
                {selfEval==="correct"&&<p>😎 Marqué <strong>Correct</strong> — bravo !</p>}
                {selfEval==="partial"&&<p>😕 Marqué <strong>Partiellement correct</strong> — tu progresses !</p>}
                {selfEval==="incorrect"&&<p>😰 Marqué <strong>Incorrect</strong> — relis la correction !</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.75rem"}}>
        <button type="button" onClick={()=>ci>0&&goTo(ci-1)} disabled={ci===0} style={{padding:"0.5rem 1rem",border:"none",borderRadius:8,background:ci>0?V.bgTer:V.bgSec,color:ci>0?V.textSec:V.textDis,fontSize:"0.85rem",fontWeight:500,cursor:ci>0?"pointer":"not-allowed"}}>← Précédent</button>
        <button type="button" onClick={()=>ci+1<filtered.length&&goTo(ci+1)} disabled={ci+1>=filtered.length} style={{padding:"0.5rem 1rem",border:"none",borderRadius:8,background:ci+1<filtered.length?V.bgTer:V.bgSec,color:ci+1<filtered.length?V.textSec:V.textDis,fontSize:"0.85rem",fontWeight:500,cursor:ci+1<filtered.length?"pointer":"not-allowed"}}>Suivant →</button>
      </div>

      {/* Pastilles */}
      <div style={{display:"flex",justifyContent:"center",gap:"0.35rem",flexWrap:"wrap",marginBottom:"0.75rem"}}>
        {filtered.map((exo,i)=>(
          <button key={exo.id} type="button" aria-label={`Afficher l'exercice ${i+1}`} aria-current={i===ci?"true":undefined} onClick={()=>goTo(i)} style={{width:30,height:30,borderRadius:"50%",border:"none",fontSize:"0.75rem",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            background:i===ci?V.primary:completedIds.has(exo.id)?V.successLt:V.bgTer,
            color:i===ci?"#fff":V.textSec,
          }}>{i+1}</button>
        ))}
      </div>

      <div style={{textAlign:"center",fontSize:"0.85rem",color:V.textMut}}>{completedIds.size}/{total} exercice(s) consulté(s)</div>
      <XPToast toasts={toasts} onDismiss={disT}/>
    </div>
  );
}
