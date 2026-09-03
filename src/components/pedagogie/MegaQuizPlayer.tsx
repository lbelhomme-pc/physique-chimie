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
    bg: "var(--bg-card)", bgS: "var(--bg-secondary)", bd: "var(--border-color)",
    t: "var(--text-primary)", tm: "var(--text-muted)",
    p: "var(--accent-primary)", pL: "var(--accent-primary-light)",
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
      style={{ padding: "0.35rem 0.8rem", borderRadius: V.rp, border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.78rem", fontFamily: "inherit", background: a ? V.p : V.bgS, color: a ? "#fff" : V.tm, transition: "all 0.15s" }}
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
    return <div data-mega-quiz-player-v3="true" role="status" aria-live="polite" style={{ background: V.bg, borderRadius: V.r, boxShadow: V.sh, padding: "1.5rem", border: `1px solid ${V.bd}`, textAlign: "center", color: V.tm }}>Chargement de {totalQuestions ?? "la banque de"} questions...</div>;
  }

  if (loadError) {
    return <div data-mega-quiz-player-v3="true" role="alert" style={{ background: V.bg, borderRadius: V.r, boxShadow: V.sh, padding: "1.5rem", border: `1px solid ${V.bd}`, textAlign: "center", color: V.d }}>{loadError}</div>;
  }

  if (!started) {
    return (
      <div data-mega-quiz-player-v3="true" style={{ background: V.bg, borderRadius: V.r, boxShadow: V.sh, padding: "1.5rem", border: `1px solid ${V.bd}` }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: V.t, textAlign: "center", marginBottom: "1rem" }}>⚙️ Configuration du Mega Quiz</h2>
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: V.tm, marginBottom: "0.4rem" }}>Discipline :</p>
          <div data-discipline-filter="mega-quiz" style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            <P a={fDiscipline === "physique-chimie"} onClick={() => selectDiscipline("physique-chimie")}>{disciplineLabel("physique-chimie")}</P>
            <P a={fDiscipline === "mathematiques"} onClick={() => selectDiscipline("mathematiques")}>{disciplineLabel("mathematiques")}</P>
            <P a={fDiscipline === "all"} onClick={() => selectDiscipline("all")}>{disciplineLabel("all")}</P>
          </div>
          <p style={{ fontSize: "0.75rem", color: V.tm, margin: "0.4rem 0 0" }}>Le mélange des disciplines n’est activé que si tu choisis « Toutes les disciplines ».</p>
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: V.tm, marginBottom: "0.4rem" }}>📚 Niveau :</p>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            <P a={fNiveau === "all"} onClick={() => { setFNiveau("all"); setFChapter("all"); }}>Tous</P>
            {niveaux.map((niveau) => <P key={niveau} a={fNiveau === niveau} onClick={() => { setFNiveau(niveau); setFChapter("all"); }}>{getLevelDisplayLabel(niveau)}</P>)}
          </div>
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: V.tm, marginBottom: "0.4rem" }}>Matière :</p>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            <P a={fMatiere === "all"} onClick={() => { setFMatiere("all"); setFChapter("all"); }}>Toutes</P>
            {matieres.map((matiere) => <P key={matiere} a={fMatiere === matiere} onClick={() => { setFMatiere(matiere); setFChapter("all"); }}>{matterFilterLabel(matiere)}</P>)}
          </div>
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: V.tm, marginBottom: "0.4rem" }}>📖 Chapitre :</p>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            <P a={fChapter === "all"} onClick={() => setFChapter("all")}>Tous ({filtered.length})</P>
            {chapters.map((chapter) => <P key={chapter} a={fChapter === chapter} onClick={() => setFChapter(chapter)}>{chapter}</P>)}
          </div>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: V.tm, marginBottom: "0.4rem" }}>🔢 Questions :</p>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {[5, 10, 15, 20, 30].map((count) => <P key={count} a={nb === count} onClick={() => setNb(count)}>{count}</P>)}
          </div>
        </div>
        <p style={{ fontSize: "0.8rem", color: V.tm, textAlign: "center", marginBottom: "0.75rem" }}>{filtered.length} questions disponibles</p>
        <button type="button" onClick={() => { if (filtered.length > 0) { setSessionSeed((seed) => seed + 1); setStarted(true); } }} style={{ display: "block", width: "100%", padding: "0.8rem", border: "none", borderRadius: V.rm, background: filtered.length > 0 ? V.p : V.bgS, color: filtered.length > 0 ? "#fff" : V.tm, fontWeight: 700, fontSize: "1rem", cursor: filtered.length > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>🚀 Lancer !</button>
      </div>
    );
  }

  if (done) {
    const pct = pool.length ? Math.round((score / pool.length) * 100) : 0;
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 60 ? "👍" : pct >= 40 ? "💪" : "📚";
    return (
      <div data-mega-quiz-result-v3="true" style={{ background: V.bg, borderRadius: V.r, boxShadow: V.sh, padding: "1.5rem", border: `1px solid ${V.bd}`, textAlign: "center" }}>
        <span style={{ fontSize: "3rem" }}>{emoji}</span>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: V.t, margin: "0.5rem 0" }}>Mega Quiz terminé !</h2>
        <p style={{ fontSize: "2rem", fontWeight: 900, color: pct >= 60 ? V.s : V.d }}>{score}/{pool.length}</p>
        <p style={{ fontSize: "1rem", color: V.tm }}>{pct}%</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.3rem", margin: "1rem 0" }}>
          {log.map((ok, index) => <span key={index} style={{ width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, background: ok ? V.sL : V.dL, color: ok ? V.s : V.d }}>{index + 1}</span>)}
        </div>
        {log.some((ok) => !ok) && <div style={{ marginTop: "1rem" }}><button type="button" onClick={() => { setRetryQuestions(pool.filter((_, index) => !log[index])); setStarted(true); setIdx(0); setSel(null); setRev(false); setScore(0); setLog([]); }} style={{ padding: "0.6rem 1.5rem", borderRadius: V.rm, border: `2px solid ${V.p}`, cursor: "pointer", background: "transparent", color: V.p, fontWeight: 600, fontSize: "0.9rem", fontFamily: "inherit" }}>Reprendre les erreurs</button></div>}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1rem" }}>
          <button type="button" onClick={() => { setStarted(false); setIdx(0); setSel(null); setRev(false); setScore(0); setLog([]); }} style={{ padding: "0.6rem 1.5rem", borderRadius: V.rm, border: "none", cursor: "pointer", background: V.p, color: "#fff", fontWeight: 600, fontSize: "0.9rem", fontFamily: "inherit" }}>🔄 Recommencer</button>
          <a href="/" style={{ padding: "0.6rem 1.5rem", borderRadius: V.rm, border: `1px solid ${V.bd}`, background: V.bg, color: V.tm, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>🏠 Accueil</a>
        </div>
      </div>
    );
  }

  if (!cur) return null;
  const currentLabel = matterLabel(cur);
  const currentIsChemistry = cur.discipline === "physique-chimie" && cur.matiere === "chimie";

  return (
    <div data-mega-quiz-player-v3="true" style={{ background: V.bg, borderRadius: V.r, boxShadow: V.sh, padding: "1.5rem", border: `1px solid ${V.bd}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: V.tm }}>{idx + 1}/{pool.length}</span>
        <div style={{ flex: 1, height: 6, background: V.bgS, borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", background: V.p, borderRadius: 99, width: `${((idx + 1) / pool.length) * 100}%`, transition: "width 0.3s" }} /></div>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: V.s }}>✅ {score}</span>
      </div>
      <span style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: V.rp, marginBottom: "0.75rem", background: currentIsChemistry ? V.puL : V.pL, color: currentIsChemistry ? V.pu : V.p }}>{currentLabel} · {cur.chapterTitle}</span>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: V.t, marginBottom: "1rem", lineHeight: 1.4 }}><MathText text={cur.question} /></h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {cur.choices.map((choice, index) => {
          let bg = V.bgS; let bc = "transparent"; let co = V.t;
          if (rev) {
            if (index === cur.answer) { bg = V.sL; bc = V.s; co = V.s; }
            else if (index === sel && index !== cur.answer) { bg = V.dL; bc = V.d; co = V.d; }
          } else if (index === sel) { bg = V.pL; bc = V.p; co = V.p; }
          return <button type="button" key={index} onClick={() => { if (!rev) setSel(index); }} style={{ padding: "0.7rem 1rem", borderRadius: V.rm, border: `2px solid ${bc}`, background: bg, color: co, fontWeight: 600, fontSize: "0.9rem", textAlign: "left", cursor: rev ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s" }}><MathText text={choice} /></button>;
        })}
      </div>
      {rev && cur.explanation && <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: V.bgS, borderRadius: V.rm, fontSize: "0.85rem", color: V.tm }}>💡 <MathText text={cur.explanation} /></div>}
      <div style={{ marginTop: "1rem", textAlign: "right" }}>
        {!rev
          ? <button type="button" onClick={() => { if (sel === null) return; setRev(true); if (sel === cur.answer) setScore((value) => value + 1); setLog((items) => [...items, sel === cur.answer]); }} disabled={sel === null} style={{ padding: "0.6rem 1.5rem", borderRadius: V.rm, border: "none", cursor: sel !== null ? "pointer" : "not-allowed", background: sel !== null ? V.p : V.bgS, color: sel !== null ? "#fff" : V.tm, fontWeight: 600, fontSize: "0.9rem", fontFamily: "inherit" }}>Valider ✓</button>
          : <button type="button" onClick={() => { setSel(null); setRev(false); setIdx((value) => value + 1); }} style={{ padding: "0.6rem 1.5rem", borderRadius: V.rm, border: "none", cursor: "pointer", background: V.p, color: "#fff", fontWeight: 600, fontSize: "0.9rem", fontFamily: "inherit" }}>Suivant →</button>}
      </div>
    </div>
  );
}
