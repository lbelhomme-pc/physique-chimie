// src/components/pedagogie/MegaFlashcardsPlayer.tsx
// C15 : banque multi-sujet avec choix explicite de discipline.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getLevelDisplayLabel } from "../../utils/levels";
import MathText from "./MathText";

type Discipline = "physique-chimie" | "mathematiques";
type DisciplineFilter = Discipline | "all";

interface Card {
  id: string;
  front: string;
  back: string;
  difficulty?: number;
  chapterTitle: string;
  matiere: string;
  niveau: string;
  discipline: Discipline;
}

interface MegaFlashcardsPlayerProps {
  allCards?: Card[];
  dataUrl?: string;
  totalCards?: number;
}

function disciplineLabel(value: DisciplineFilter) {
  if (value === "mathematiques") return "📐 Mathématiques";
  if (value === "physique-chimie") return "⚗ Physique-Chimie";
  return "🔀 Toutes les disciplines";
}

function matterFilterLabel(matiere: string) {
  if (matiere === "mathematiques") return "📐 Mathématiques";
  if (matiere === "chimie") return "🧪 Chimie";
  if (matiere === "physique") return "⚡ Physique";
  return matiere;
}

function cardLabel(card: Pick<Card, "discipline" | "matiere">) {
  if (card.discipline === "mathematiques") return "📐 Mathématiques";
  return card.matiere === "chimie" ? "🧪 Chimie" : "⚡ Physique";
}

export default function MegaFlashcardsPlayer({ allCards, dataUrl, totalCards }: MegaFlashcardsPlayerProps) {
  const [remoteCards, setRemoteCards] = useState<Card[]>(allCards ?? []);
  const [loading, setLoading] = useState(Boolean(dataUrl && !allCards));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fDiscipline, setFDiscipline] = useState<DisciplineFilter>("physique-chimie");
  const [fNiveau, setFNiveau] = useState("all");
  const [fMatiere, setFMatiere] = useState("all");
  const [fChapter, setFChapter] = useState("all");
  const [nb, setNb] = useState(15);
  const [started, setStarted] = useState(false);
  const [sessionSeed, setSessionSeed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<("k" | "u")[]>([]);

  const cards = allCards ?? remoteCards;

  useEffect(() => {
    if (!dataUrl || allCards) return;
    let cancelled = false;
    setLoading(true);
    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ cards?: Card[] }>;
      })
      .then((payload) => {
        if (cancelled) return;
        setRemoteCards(Array.isArray(payload.cards) ? payload.cards : []);
        setLoadError(null);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Impossible de charger les cartes pour le moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allCards, dataUrl]);

  const disciplineCards = useMemo(
    () => fDiscipline === "all" ? cards : cards.filter((card) => card.discipline === fDiscipline),
    [cards, fDiscipline],
  );
  const niveaux = [...new Set(disciplineCards.map((card) => card.niveau))].sort();
  const matieres = [...new Set(disciplineCards.map((card) => card.matiere))].sort();

  const filtered = useMemo(() => {
    let result = disciplineCards;
    if (fNiveau !== "all") result = result.filter((card) => card.niveau === fNiveau);
    if (fMatiere !== "all") result = result.filter((card) => card.matiere === fMatiere);
    if (fChapter !== "all") result = result.filter((card) => card.chapterTitle === fChapter);
    return result;
  }, [disciplineCards, fNiveau, fMatiere, fChapter]);

  const chapters = [...new Set(filtered.map((card) => card.chapterTitle))].sort();
  const pool = useMemo(
    () => [...filtered]
      .map((card) => ({ card, order: Math.random() + Number.EPSILON * sessionSeed }))
      .sort((a, b) => a.order - b.order)
      .map((entry) => entry.card)
      .slice(0, nb),
    [filtered, nb, sessionSeed],
  );
  const cur = pool[idx];
  const done = idx >= pool.length && started;

  const V = {
    bg: "var(--bg-card)", bgS: "var(--bg-secondary)", bd: "var(--border-color)",
    t: "var(--text-primary)", tm: "var(--text-muted)",
    p: "var(--accent-primary)", pL: "var(--accent-primary-light)",
    s: "var(--accent-success)", sL: "var(--accent-success-light)",
    d: "var(--accent-danger)", dL: "var(--accent-danger-light)",
    pu: "var(--accent-purple)", puL: "var(--accent-purple-light)",
    r: "var(--radius-lg)", rm: "var(--radius-md)", rp: "var(--radius-pill)", sh: "var(--shadow-card)", shM: "var(--shadow-md)",
  };

  const P = ({ a, onClick, children }: { a: boolean; onClick: () => void; children: ReactNode }) => (
    <button type="button" aria-pressed={a} onClick={onClick} style={{ padding: "0.35rem 0.8rem", borderRadius: V.rp, border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.78rem", fontFamily: "inherit", background: a ? V.p : V.bgS, color: a ? "#fff" : V.tm, transition: "all 0.15s" }}>{children}</button>
  );

  const restart = () => { setStarted(false); setIdx(0); setFlipped(false); setResults([]); };
  const selectDiscipline = (discipline: DisciplineFilter) => {
    setFDiscipline(discipline);
    setFNiveau("all");
    setFMatiere("all");
    setFChapter("all");
  };

  if (loading) {
    return <div data-mega-flashcards-player-v3="true" role="status" aria-live="polite" style={{ background: V.bg, borderRadius: V.r, boxShadow: V.sh, padding: "1.5rem", border: `1px solid ${V.bd}`, textAlign: "center", color: V.tm }}>Chargement de {totalCards ?? "la banque de"} cartes...</div>;
  }

  if (loadError) {
    return <div data-mega-flashcards-player-v3="true" role="alert" style={{ background: V.bg, borderRadius: V.r, boxShadow: V.sh, padding: "1.5rem", border: `1px solid ${V.bd}`, textAlign: "center", color: V.d }}>{loadError}</div>;
  }

  if (!started) {
    return (
      <div data-mega-flashcards-player-v3="true" style={{ background: V.bg, borderRadius: V.r, boxShadow: V.sh, padding: "1.5rem", border: `1px solid ${V.bd}` }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: V.t, textAlign: "center", marginBottom: "1rem" }}>⚙️ Mega Flashcards</h2>
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: V.tm, marginBottom: "0.4rem" }}>Discipline :</p>
          <div data-discipline-filter="mega-flashcards" style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
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
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: V.tm, marginBottom: "0.4rem" }}>🔢 Cartes :</p>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {[10, 15, 20, 30, 50].map((count) => <P key={count} a={nb === count} onClick={() => setNb(count)}>{count}</P>)}
          </div>
        </div>
        <p style={{ fontSize: "0.8rem", color: V.tm, textAlign: "center", marginBottom: "0.75rem" }}>{filtered.length} cartes disponibles</p>
        <button type="button" onClick={() => { if (filtered.length > 0) { setSessionSeed((seed) => seed + 1); setStarted(true); } }} style={{ display: "block", width: "100%", padding: "0.8rem", border: "none", borderRadius: V.rm, background: filtered.length > 0 ? V.p : V.bgS, color: filtered.length > 0 ? "#fff" : V.tm, fontWeight: 700, fontSize: "1rem", cursor: filtered.length > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>🚀 Lancer !</button>
      </div>
    );
  }

  if (done) {
    const known = results.filter((result) => result === "k").length;
    const unknown = results.filter((result) => result === "u").length;
    const pct = pool.length ? Math.round((known / pool.length) * 100) : 0;
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 60 ? "👍" : "📚";
    return (
      <div data-mega-flashcards-result-v3="true" style={{ background: V.bg, borderRadius: V.r, boxShadow: V.sh, padding: "1.5rem", border: `1px solid ${V.bd}`, textAlign: "center" }}>
        <span style={{ fontSize: "3rem" }}>{emoji}</span>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: V.t, margin: "0.5rem 0" }}>Session terminée !</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", margin: "1rem 0" }}>
          <div><p style={{ fontSize: "2rem", fontWeight: 900, color: V.s }}>{known}</p><p style={{ fontSize: "0.8rem", color: V.tm }}>✅ Connues</p></div>
          <div><p style={{ fontSize: "2rem", fontWeight: 900, color: V.d }}>{unknown}</p><p style={{ fontSize: "0.8rem", color: V.tm }}>❌ À revoir</p></div>
        </div>
        <p style={{ fontSize: "1rem", color: V.tm, marginBottom: "1rem" }}>{pct}%</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button type="button" onClick={restart} style={{ padding: "0.6rem 1.5rem", borderRadius: V.rm, border: "none", cursor: "pointer", background: V.p, color: "#fff", fontWeight: 600, fontSize: "0.9rem", fontFamily: "inherit" }}>🔄 Recommencer</button>
          <a href="/" style={{ padding: "0.6rem 1.5rem", borderRadius: V.rm, border: `1px solid ${V.bd}`, background: V.bg, color: V.tm, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>🏠 Accueil</a>
        </div>
      </div>
    );
  }

  if (!cur) return null;
  const currentIsChemistry = cur.discipline === "physique-chimie" && cur.matiere === "chimie";

  return (
    <div data-mega-flashcards-player-v3="true">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: V.tm }}>{idx + 1}/{pool.length}</span>
        <div style={{ flex: 1, height: 6, background: V.bgS, borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", background: V.p, borderRadius: 99, width: `${((idx + 1) / pool.length) * 100}%`, transition: "width 0.3s" }} /></div>
        <span style={{ fontSize: "0.75rem", color: V.s }}>✅ {results.filter((result) => result === "k").length}</span>
        <span style={{ fontSize: "0.75rem", color: V.d }}>❌ {results.filter((result) => result === "u").length}</span>
      </div>
      <div role="button" tabIndex={0} aria-pressed={flipped} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !flipped) { event.preventDefault(); setFlipped(true); } }} onClick={() => !flipped && setFlipped(true)} style={{ background: V.bg, borderRadius: V.r, boxShadow: V.shM, padding: "2rem 1.5rem", minHeight: 200, border: `1px solid ${V.bd}`, cursor: flipped ? "default" : "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", transition: "all 0.2s" }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: V.rp, marginBottom: "0.75rem", background: currentIsChemistry ? V.puL : V.pL, color: currentIsChemistry ? V.pu : V.p }}>{cardLabel(cur)} · {cur.chapterTitle}</span>
        {!flipped ? (
          <>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: V.t, lineHeight: 1.5 }}><MathText text={cur.front} /></p>
            <p style={{ fontSize: "0.8rem", color: V.tm, marginTop: "1rem" }}>👆 Clique pour voir la réponse</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: "0.8rem", color: V.tm, marginBottom: "0.5rem" }}><MathText text={cur.front} /></p>
            <div style={{ width: "60%", height: 1, background: V.bd, margin: "0.5rem 0" }} />
            <p style={{ fontSize: "1.05rem", fontWeight: 600, color: V.s, lineHeight: 1.5, marginTop: "0.5rem" }}><MathText text={cur.back} /></p>
          </>
        )}
      </div>
      {flipped && (
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", justifyContent: "center" }}>
          <button type="button" onClick={() => { setResults((items) => [...items, "u"]); setFlipped(false); setIdx((value) => value + 1); }} style={{ flex: 1, padding: "0.7rem", borderRadius: V.rm, border: `2px solid ${V.d}`, background: V.dL, color: V.d, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>❌ À revoir</button>
          <button type="button" onClick={() => { setResults((items) => [...items, "k"]); setFlipped(false); setIdx((value) => value + 1); }} style={{ flex: 1, padding: "0.7rem", borderRadius: V.rm, border: `2px solid ${V.s}`, background: V.sL, color: V.s, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>✅ Connue !</button>
        </div>
      )}
    </div>
  );
}
