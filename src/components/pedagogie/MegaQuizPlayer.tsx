// src/components/pedagogie/MegaQuizPlayer.tsx
// C15 : banque multi-sujet avec choix explicite de discipline.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getLevelDisplayLabel } from "../../utils/levels";
import MathText from "./MathText";

type Discipline = "physique-chimie" | "mathematiques";
type DisciplineFilter = Discipline | "all";

interface Question {
  id: string;
  question: string;
  choices: string[];
  answer: number;
  explanation?: string;
  chapterTitle: string;
  matiere: string;
  niveau: string;
  discipline: Discipline;
}

interface MegaQuizPlayerProps {
  allQuestions?: Question[];
  dataUrl?: string;
  totalQuestions?: number;
}

function disciplineLabel(value: DisciplineFilter) {
  if (value === "mathematiques") return "📐 Mathématiques";
  if (value === "physique-chimie") return "⚗ Physique-Chimie";
  return "🔀 Toutes les disciplines";
}

function matterLabel(question: Pick<Question, "discipline" | "matiere">) {
  if (question.discipline === "mathematiques") return "📐 Mathématiques";
  return question.matiere === "chimie" ? "🧪 Chimie" : "⚡ Physique";
}

function matterFilterLabel(matiere: string) {
  if (matiere === "mathematiques") return "📐 Mathématiques";
  if (matiere === "chimie") return "🧪 Chimie";
  if (matiere === "physique") return "⚡ Physique";
  return matiere;
}

export default function MegaQuizPlayer({ allQuestions, dataUrl, totalQuestions }: MegaQuizPlayerProps) {
  const [remoteQuestions, setRemoteQuestions] = useState<Question[]>(allQuestions ?? []);
  const [loading, setLoading] = useState(Boolean(dataUrl && !allQuestions));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fDiscipline, setFDiscipline] = useState<DisciplineFilter>("physique-chimie");
  const [fNiveau, setFNiveau] = useState("all");
  const [fMatiere, setFMatiere] = useState("all");
  const [fChapter, setFChapter] = useState("all");
  const [nb, setNb] = useState(10);
  const [started, setStarted] = useState(false);
  const [sessionSeed, setSessionSeed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
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

  const disciplineQuestions = useMemo(
    () => fDiscipline === "all" ? questions : questions.filter((question) => question.discipline === fDiscipline),
    [questions, fDiscipline],
  );
  const niveaux = [...new Set(disciplineQuestions.map((question) => question.niveau))].sort();
  const matieres = [...new Set(disciplineQuestions.map((question) => question.matiere))].sort();

  const filtered = useMemo(() => {
    let result = disciplineQuestions;
    if (fNiveau !== "all") result = result.filter((question) => question.niveau === fNiveau);
    if (fMatiere !== "all") result = result.filter((question) => question.matiere === fMatiere);
    if (fChapter !== "all") result = result.filter((question) => question.chapterTitle === fChapter);
    return result;
  }, [disciplineQuestions, fNiveau, fMatiere, fChapter]);

  const chapters = [...new Set(filtered.map((question) => question.chapterTitle))].sort();
  const pool = useMemo(
    () => retryQuestions ?? [...filtered]
      .map((question) => ({ question, order: Math.random() + Number.EPSILON * sessionSeed }))
      .sort((a, b) => a.order - b.order)
      .map((entry) => entry.question)
      .slice(0, nb),
    [filtered, nb, retryQuestions, sessionSeed],
  );

  const cur = pool[idx];
  const done = idx >= pool.length && started;

  useEffect(() => {
    if (!started) setRetryQuestions(null);
  }, [started]);

  const V = {
    bg: "var(--ui5-surface)", bgS: "var(--ui5-surface-soft)", bd: "var(--ui5-border)",
    t: "var(--ui5-text)", tm: "var(--ui5-text-3)",
    p: "var(--ui5-action)", pL: "var(--ui5-action-soft)",
    s: "var(--accent-success)", sL: "var(--accent-success-light)",
    d: "var(--accent-danger)", dL: "var(--accent-danger-light)",
    pu: "var(--accent-purple)", puL: "var(--accent-purple-light)",
    r: "var(--radius-lg)", rm: "var(--radius-md)", rp: "var(--radius-pill)", sh: "var(--shadow-card)",
  };

  const P = ({ a, onClick, children }: { a: boolean; onClick: () => void; children: ReactNode }) => (
    <button
      type="button"
     aria-pressed={a}
      onClick={onClick}
      className={"ui5-u-padding-0-35rem-0-8rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-none ui5-u-cursor-pointer ui5-u-font-weight-600 ui5-u-font-size-0-78rem ui5-u-font-family-inherit" + " " + (a ? "ui5-u-background-ui5-action" : "ui5-u-background-ui5-surface-soft") + " " + (a ? "ui5-u-color-fff" : "ui5-u-color-ui5-text-3") + " " + "ui5-u-transition-all-0-15s"}
    >
      {children}
    </button>
  );

  const selectDiscipline = (discipline: DisciplineFilter) => {
    setFDiscipline(discipline);
    setFNiveau("all");
    setFMatiere("all");
    setFChapter("all");
    setRetryQuestions(null);
  };

  if (loading) {
    return <div data-mega-quiz-player-v3="true" role="status" aria-live="polite" className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-5rem ui5-u-border-1px-solid-ui5-border ui5-u-text-align-center ui5-u-color-ui5-text-3">Chargement de {totalQuestions ?? "la banque de"} questions...</div>;
  }

  if (loadError) {
    return <div data-mega-quiz-player-v3="true" role="alert" className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-5rem ui5-u-border-1px-solid-ui5-border ui5-u-text-align-center ui5-u-color-accent-danger">{loadError}</div>;
  }

  if (!started) {
    return (
      <div data-mega-quiz-player-v3="true" className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-5rem ui5-u-border-1px-solid-ui5-border">
        <h2 className="ui5-u-font-size-1-1rem ui5-u-font-weight-700 ui5-u-color-ui5-text ui5-u-text-align-center ui5-u-margin-bottom-1rem">⚙️ Configuration du Mega Quiz</h2>
        <div className="ui5-u-margin-bottom-0-75rem">
          <p className="ui5-u-font-size-0-8rem ui5-u-font-weight-600 ui5-u-color-ui5-text-3 ui5-u-margin-bottom-0-4rem">Discipline :</p>
          <div data-discipline-filter="mega-quiz" className="ui5-u-display-flex ui5-u-gap-0-3rem ui5-u-flex-wrap-wrap">
            <P a={fDiscipline === "physique-chimie"} onClick={() => selectDiscipline("physique-chimie")}>{disciplineLabel("physique-chimie")}</P>
            <P a={fDiscipline === "mathematiques"} onClick={() => selectDiscipline("mathematiques")}>{disciplineLabel("mathematiques")}</P>
            <P a={fDiscipline === "all"} onClick={() => selectDiscipline("all")}>{disciplineLabel("all")}</P>
          </div>
          <p className="ui5-u-font-size-0-75rem ui5-u-color-ui5-text-3 ui5-u-margin-0-4rem-0-0">Le mélange des disciplines n’est activé que si tu choisis « Toutes les disciplines ».</p>
        </div>
        <div className="ui5-u-margin-bottom-0-75rem">
          <p className="ui5-u-font-size-0-8rem ui5-u-font-weight-600 ui5-u-color-ui5-text-3 ui5-u-margin-bottom-0-4rem">📚 Niveau :</p>
          <div className="ui5-u-display-flex ui5-u-gap-0-3rem ui5-u-flex-wrap-wrap">
            <P a={fNiveau === "all"} onClick={() => { setFNiveau("all"); setFChapter("all"); }}>Tous</P>
            {niveaux.map((niveau) => <P key={niveau} a={fNiveau === niveau} onClick={() => { setFNiveau(niveau); setFChapter("all"); }}>{getLevelDisplayLabel(niveau)}</P>)}
          </div>
        </div>
        <div className="ui5-u-margin-bottom-0-75rem">
          <p className="ui5-u-font-size-0-8rem ui5-u-font-weight-600 ui5-u-color-ui5-text-3 ui5-u-margin-bottom-0-4rem">Matière :</p>
          <div className="ui5-u-display-flex ui5-u-gap-0-3rem ui5-u-flex-wrap-wrap">
            <P a={fMatiere === "all"} onClick={() => { setFMatiere("all"); setFChapter("all"); }}>Toutes</P>
            {matieres.map((matiere) => <P key={matiere} a={fMatiere === matiere} onClick={() => { setFMatiere(matiere); setFChapter("all"); }}>{matterFilterLabel(matiere)}</P>)}
          </div>
        </div>
        <div className="ui5-u-margin-bottom-0-75rem">
          <p className="ui5-u-font-size-0-8rem ui5-u-font-weight-600 ui5-u-color-ui5-text-3 ui5-u-margin-bottom-0-4rem">📖 Chapitre :</p>
          <div className="ui5-u-display-flex ui5-u-gap-0-3rem ui5-u-flex-wrap-wrap">
            <P a={fChapter === "all"} onClick={() => setFChapter("all")}>Tous ({filtered.length})</P>
            {chapters.map((chapter) => <P key={chapter} a={fChapter === chapter} onClick={() => setFChapter(chapter)}>{chapter}</P>)}
          </div>
        </div>
        <div className="ui5-u-margin-bottom-1rem">
          <p className="ui5-u-font-size-0-8rem ui5-u-font-weight-600 ui5-u-color-ui5-text-3 ui5-u-margin-bottom-0-4rem">🔢 Questions :</p>
          <div className="ui5-u-display-flex ui5-u-gap-0-3rem ui5-u-flex-wrap-wrap">
            {[5, 10, 15, 20, 30].map((count) => <P key={count} a={nb === count} onClick={() => setNb(count)}>{count}</P>)}
          </div>
        </div>
        <p className="ui5-u-font-size-0-8rem ui5-u-color-ui5-text-3 ui5-u-text-align-center ui5-u-margin-bottom-0-75rem">{filtered.length} questions disponibles</p>
        <button type="button" onClick={() => { if (filtered.length > 0) { setSessionSeed((seed) => seed + 1); setStarted(true); } }} className={"ui5-u-display-block ui5-u-width-100 ui5-u-padding-0-8rem ui5-u-border-none ui5-u-border-radius-ui5-radius-sm" + " " + (filtered.length > 0 ? "ui5-u-background-ui5-action" : "ui5-u-background-ui5-surface-soft") + " " + (filtered.length > 0 ? "ui5-u-color-fff" : "ui5-u-color-ui5-text-3") + " " + "ui5-u-font-weight-700 ui5-u-font-size-1rem" + " " + (filtered.length > 0 ? "ui5-u-cursor-pointer" : "ui5-u-cursor-not-allowed") + " " + "ui5-u-font-family-inherit"}>🚀 Lancer !</button>
      </div>
    );
  }

  if (done) {
    const pct = pool.length ? Math.round((score / pool.length) * 100) : 0;
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 60 ? "👍" : pct >= 40 ? "💪" : "📚";
    return (
      <div data-mega-quiz-result-v3="true" className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-5rem ui5-u-border-1px-solid-ui5-border ui5-u-text-align-center">
        <span className="ui5-u-font-size-3rem">{emoji}</span>
        <h2 className="ui5-u-font-size-1-3rem ui5-u-font-weight-800 ui5-u-color-ui5-text ui5-u-margin-0-5rem-0">Mega Quiz terminé !</h2>
        <p className={"ui5-u-font-size-2rem ui5-u-font-weight-900" + " " + (pct >= 60 ? "ui5-u-color-accent-success" : "ui5-u-color-accent-danger")}>{score}/{pool.length}</p>
        <p className="ui5-u-font-size-1rem ui5-u-color-ui5-text-3">{pct}%</p>
        <div className="ui5-u-display-flex ui5-u-flex-wrap-wrap ui5-u-justify-content-center ui5-u-gap-0-3rem ui5-u-margin-1rem-0">
          {log.map((ok, index) => <span key={index} className={"ui5-u-width-24px ui5-u-height-24px ui5-u-border-radius-50 ui5-u-display-inline-flex ui5-u-align-items-center ui5-u-justify-content-center ui5-u-font-size-0-65rem ui5-u-font-weight-700" + " " + (ok ? "ui5-u-background-accent-success-light" : "ui5-u-background-accent-danger-light") + " " + (ok ? "ui5-u-color-accent-success" : "ui5-u-color-accent-danger")}>{index + 1}</span>)}
        </div>
        {log.some((ok) => !ok) && <div className="ui5-u-margin-top-1rem"><button type="button" onClick={() => { setRetryQuestions(pool.filter((_, index) => !log[index])); setStarted(true); setIdx(0); setSel(null); setRev(false); setScore(0); setLog([]); }} className="ui5-u-padding-0-6rem-1-5rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-2px-solid-ui5-action ui5-u-cursor-pointer ui5-u-background-transparent ui5-u-color-ui5-action ui5-u-font-weight-600 ui5-u-font-size-0-9rem ui5-u-font-family-inherit">Reprendre les erreurs</button></div>}
        <div className="ui5-u-display-flex ui5-u-gap-0-75rem ui5-u-justify-content-center ui5-u-margin-top-1rem">
          <button type="button" onClick={() => { setStarted(false); setIdx(0); setSel(null); setRev(false); setScore(0); setLog([]); }} className="ui5-u-padding-0-6rem-1-5rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-none ui5-u-cursor-pointer ui5-u-background-ui5-action ui5-u-color-fff ui5-u-font-weight-600 ui5-u-font-size-0-9rem ui5-u-font-family-inherit">🔄 Recommencer</button>
          <a href="/" className="ui5-u-padding-0-6rem-1-5rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-1px-solid-ui5-border ui5-u-background-ui5-surface ui5-u-color-ui5-text-3 ui5-u-font-weight-600 ui5-u-font-size-0-9rem ui5-u-text-decoration-none">🏠 Accueil</a>
        </div>
      </div>
    );
  }

  if (!cur) return null;
  const currentLabel = matterLabel(cur);
  const currentIsChemistry = cur.discipline === "physique-chimie" && cur.matiere === "chimie";

  return (
    <div data-mega-quiz-player-v3="true" className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-5rem ui5-u-border-1px-solid-ui5-border">
      <div className="ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-75rem ui5-u-margin-bottom-1rem">
        <span className="ui5-u-font-size-0-8rem ui5-u-font-weight-700 ui5-u-color-ui5-text-3">{idx + 1}/{pool.length}</span>
        <div className="ui5-u-flex-1 ui5-u-height-6px ui5-u-background-ui5-surface-soft ui5-u-border-radius-999px ui5-u-overflow-hidden"><div className="ui5-u-height-100 ui5-u-background-ui5-action ui5-u-border-radius-999px ui5-u-width-ui5-value-width ui5-u-transition-width-0-3s" style={{ "--ui5-value-width": `${((idx + 1) / pool.length) * 100}%` } as React.CSSProperties} /></div>
        <span className="ui5-u-font-size-0-8rem ui5-u-font-weight-700 ui5-u-color-accent-success">✅ {score}</span>
      </div>
      <span className={"ui5-u-display-inline-block ui5-u-font-size-0-7rem ui5-u-font-weight-600 ui5-u-padding-0-15rem-0-5rem ui5-u-border-radius-ui5-radius-sm ui5-u-margin-bottom-0-75rem" + " " + (currentIsChemistry ? "ui5-u-background-accent-purple-light" : "ui5-u-background-ui5-action-soft") + " " + (currentIsChemistry ? "ui5-u-color-accent-purple" : "ui5-u-color-ui5-action")}>{currentLabel} · {cur.chapterTitle}</span>
      <h3 className="ui5-u-font-size-1-05rem ui5-u-font-weight-700 ui5-u-color-ui5-text ui5-u-margin-bottom-1rem ui5-u-line-height-1-4"><MathText text={cur.question} /></h3>
      <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-gap-0-5rem">
        {cur.choices.map((choice, index) => {
          let bg = V.bgS; let bc = "transparent"; let co = V.t;
          if (rev) {
            if (index === cur.answer) { bg = V.sL; bc = V.s; co = V.s; }
            else if (index === sel && index !== cur.answer) { bg = V.dL; bc = V.d; co = V.d; }
          } else if (index === sel) { bg = V.pL; bc = V.p; co = V.p; }
          return <button type="button" key={index} onClick={() => { if (!rev) setSel(index); }} className={"ui5-u-padding-0-7rem-1rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-ui5-value-border ui5-u-background-ui5-value-background ui5-u-color-ui5-value-color ui5-u-font-weight-600 ui5-u-font-size-0-9rem ui5-u-text-align-left" + " " + (rev ? "ui5-u-cursor-default" : "ui5-u-cursor-pointer") + " " + "ui5-u-font-family-inherit ui5-u-transition-all-0-15s"} style={{ "--ui5-value-border": `2px solid ${bc}`, "--ui5-value-background": bg, "--ui5-value-color": co } as React.CSSProperties}><MathText text={choice} /></button>;
        })}
      </div>
      {rev && cur.explanation && <div className="ui5-u-margin-top-0-75rem ui5-u-padding-0-75rem-1rem ui5-u-background-ui5-surface-soft ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-85rem ui5-u-color-ui5-text-3">💡 <MathText text={cur.explanation} /></div>}
      <div className="ui5-u-margin-top-1rem ui5-u-text-align-right">
        {!rev
          ? <button type="button" onClick={() => { if (sel === null) return; setRev(true); if (sel === cur.answer) setScore((value) => value + 1); setLog((items) => [...items, sel === cur.answer]); }} disabled={sel === null} className={"ui5-u-padding-0-6rem-1-5rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-none" + " " + (sel !== null ? "ui5-u-cursor-pointer" : "ui5-u-cursor-not-allowed") + " " + (sel !== null ? "ui5-u-background-ui5-action" : "ui5-u-background-ui5-surface-soft") + " " + (sel !== null ? "ui5-u-color-fff" : "ui5-u-color-ui5-text-3") + " " + "ui5-u-font-weight-600 ui5-u-font-size-0-9rem ui5-u-font-family-inherit"}>Valider ✓</button>
          : <button type="button" onClick={() => { setSel(null); setRev(false); setIdx((value) => value + 1); }} className="ui5-u-padding-0-6rem-1-5rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-none ui5-u-cursor-pointer ui5-u-background-ui5-action ui5-u-color-fff ui5-u-font-weight-600 ui5-u-font-size-0-9rem ui5-u-font-family-inherit">Suivant →</button>}
      </div>
    </div>
  );
}
