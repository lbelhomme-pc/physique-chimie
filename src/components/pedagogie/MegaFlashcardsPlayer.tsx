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



  const P = ({ a, onClick, children }: { a: boolean; onClick: () => void; children: ReactNode }) => (
    <button type="button" aria-pressed={a} onClick={onClick} className={"ui5-u-padding-0-35rem-0-8rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-none ui5-u-cursor-pointer ui5-u-font-weight-600 ui5-u-font-size-0-78rem ui5-u-font-family-inherit" + " " + (a ? "ui5-u-background-ui5-action" : "ui5-u-background-ui5-surface-soft") + " " + (a ? "ui5-u-color-fff" : "ui5-u-color-ui5-text-3") + " " + "ui5-u-transition-all-0-15s"}>{children}</button>
  );

  const restart = () => { setStarted(false); setIdx(0); setFlipped(false); setResults([]); };
  const selectDiscipline = (discipline: DisciplineFilter) => {
    setFDiscipline(discipline);
    setFNiveau("all");
    setFMatiere("all");
    setFChapter("all");
  };

  if (loading) {
    return <div data-mega-flashcards-player-v3="true" role="status" aria-live="polite" className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-5rem ui5-u-border-1px-solid-ui5-border ui5-u-text-align-center ui5-u-color-ui5-text-3">Chargement de {totalCards ?? "la banque de"} cartes...</div>;
  }

  if (loadError) {
    return <div data-mega-flashcards-player-v3="true" role="alert" className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-5rem ui5-u-border-1px-solid-ui5-border ui5-u-text-align-center ui5-u-color-accent-danger">{loadError}</div>;
  }

  if (!started) {
    return (
      <div data-mega-flashcards-player-v3="true" className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-5rem ui5-u-border-1px-solid-ui5-border">
        <h2 className="ui5-u-font-size-1-1rem ui5-u-font-weight-700 ui5-u-color-ui5-text ui5-u-text-align-center ui5-u-margin-bottom-1rem">⚙️ Mega Flashcards</h2>
        <div className="ui5-u-margin-bottom-0-75rem">
          <p className="ui5-u-font-size-0-8rem ui5-u-font-weight-600 ui5-u-color-ui5-text-3 ui5-u-margin-bottom-0-4rem">Discipline :</p>
          <div data-discipline-filter="mega-flashcards" className="ui5-u-display-flex ui5-u-gap-0-3rem ui5-u-flex-wrap-wrap">
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
          <p className="ui5-u-font-size-0-8rem ui5-u-font-weight-600 ui5-u-color-ui5-text-3 ui5-u-margin-bottom-0-4rem">🔢 Cartes :</p>
          <div className="ui5-u-display-flex ui5-u-gap-0-3rem ui5-u-flex-wrap-wrap">
            {[10, 15, 20, 30, 50].map((count) => <P key={count} a={nb === count} onClick={() => setNb(count)}>{count}</P>)}
          </div>
        </div>
        <p className="ui5-u-font-size-0-8rem ui5-u-color-ui5-text-3 ui5-u-text-align-center ui5-u-margin-bottom-0-75rem">{filtered.length} cartes disponibles</p>
        <button type="button" onClick={() => { if (filtered.length > 0) { setSessionSeed((seed) => seed + 1); setStarted(true); } }} className={"ui5-u-display-block ui5-u-width-100 ui5-u-padding-0-8rem ui5-u-border-none ui5-u-border-radius-ui5-radius-sm" + " " + (filtered.length > 0 ? "ui5-u-background-ui5-action" : "ui5-u-background-ui5-surface-soft") + " " + (filtered.length > 0 ? "ui5-u-color-fff" : "ui5-u-color-ui5-text-3") + " " + "ui5-u-font-weight-700 ui5-u-font-size-1rem" + " " + (filtered.length > 0 ? "ui5-u-cursor-pointer" : "ui5-u-cursor-not-allowed") + " " + "ui5-u-font-family-inherit"}>🚀 Lancer !</button>
      </div>
    );
  }

  if (done) {
    const known = results.filter((result) => result === "k").length;
    const unknown = results.filter((result) => result === "u").length;
    const pct = pool.length ? Math.round((known / pool.length) * 100) : 0;
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 60 ? "👍" : "📚";
    return (
      <div data-mega-flashcards-result-v3="true" className="ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1-5rem ui5-u-border-1px-solid-ui5-border ui5-u-text-align-center">
        <span className="ui5-u-font-size-3rem">{emoji}</span>
        <h2 className="ui5-u-font-size-1-3rem ui5-u-font-weight-800 ui5-u-color-ui5-text ui5-u-margin-0-5rem-0">Session terminée !</h2>
        <div className="ui5-u-display-flex ui5-u-justify-content-center ui5-u-gap-1-5rem ui5-u-margin-1rem-0">
          <div><p className="ui5-u-font-size-2rem ui5-u-font-weight-900 ui5-u-color-accent-success">{known}</p><p className="ui5-u-font-size-0-8rem ui5-u-color-ui5-text-3">✅ Connues</p></div>
          <div><p className="ui5-u-font-size-2rem ui5-u-font-weight-900 ui5-u-color-accent-danger">{unknown}</p><p className="ui5-u-font-size-0-8rem ui5-u-color-ui5-text-3">❌ À revoir</p></div>
        </div>
        <p className="ui5-u-font-size-1rem ui5-u-color-ui5-text-3 ui5-u-margin-bottom-1rem">{pct}%</p>
        <div className="ui5-u-display-flex ui5-u-gap-0-75rem ui5-u-justify-content-center">
          <button type="button" onClick={restart} className="ui5-u-padding-0-6rem-1-5rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-none ui5-u-cursor-pointer ui5-u-background-ui5-action ui5-u-color-fff ui5-u-font-weight-600 ui5-u-font-size-0-9rem ui5-u-font-family-inherit">🔄 Recommencer</button>
          <a href="/" className="ui5-u-padding-0-6rem-1-5rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-1px-solid-ui5-border ui5-u-background-ui5-surface ui5-u-color-ui5-text-3 ui5-u-font-weight-600 ui5-u-font-size-0-9rem ui5-u-text-decoration-none">🏠 Accueil</a>
        </div>
      </div>
    );
  }

  if (!cur) return null;
  const currentIsChemistry = cur.discipline === "physique-chimie" && cur.matiere === "chimie";

  return (
    <div data-mega-flashcards-player-v3="true">
      <div className="ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-75rem ui5-u-margin-bottom-1rem">
        <span className="ui5-u-font-size-0-8rem ui5-u-font-weight-700 ui5-u-color-ui5-text-3">{idx + 1}/{pool.length}</span>
        <div className="ui5-u-flex-1 ui5-u-height-6px ui5-u-background-ui5-surface-soft ui5-u-border-radius-999px ui5-u-overflow-hidden"><div className="ui5-u-height-100 ui5-u-background-ui5-action ui5-u-border-radius-999px ui5-u-width-ui5-value-width ui5-u-transition-width-0-3s" style={{ "--ui5-value-width": `${((idx + 1) / pool.length) * 100}%` } as React.CSSProperties} /></div>
        <span className="ui5-u-font-size-0-75rem ui5-u-color-accent-success">✅ {results.filter((result) => result === "k").length}</span>
        <span className="ui5-u-font-size-0-75rem ui5-u-color-accent-danger">❌ {results.filter((result) => result === "u").length}</span>
      </div>
      <div role="button" tabIndex={0} aria-pressed={flipped} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !flipped) { event.preventDefault(); setFlipped(true); } }} onClick={() => !flipped && setFlipped(true)} className={"ui5-u-background-ui5-surface ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-2rem-1-5rem ui5-u-min-height-200px ui5-u-border-1px-solid-ui5-border" + " " + (flipped ? "ui5-u-cursor-default" : "ui5-u-cursor-pointer") + " " + "ui5-u-display-flex ui5-u-flex-direction-column ui5-u-justify-content-center ui5-u-align-items-center ui5-u-text-align-center ui5-u-transition-all-0-2s"}>
        <span className={"ui5-u-font-size-0-7rem ui5-u-font-weight-600 ui5-u-padding-0-15rem-0-5rem ui5-u-border-radius-ui5-radius-sm ui5-u-margin-bottom-0-75rem" + " " + (currentIsChemistry ? "ui5-u-background-accent-purple-light" : "ui5-u-background-ui5-action-soft") + " " + (currentIsChemistry ? "ui5-u-color-accent-purple" : "ui5-u-color-ui5-action")}>{cardLabel(cur)} · {cur.chapterTitle}</span>
        {!flipped ? (
          <>
            <p className="ui5-u-font-size-1-1rem ui5-u-font-weight-700 ui5-u-color-ui5-text ui5-u-line-height-1-5"><MathText text={cur.front} /></p>
            <p className="ui5-u-font-size-0-8rem ui5-u-color-ui5-text-3 ui5-u-margin-top-1rem">👆 Clique pour voir la réponse</p>
          </>
        ) : (
          <>
            <p className="ui5-u-font-size-0-8rem ui5-u-color-ui5-text-3 ui5-u-margin-bottom-0-5rem"><MathText text={cur.front} /></p>
            <div className="ui5-u-width-60 ui5-u-height-1px ui5-u-background-ui5-border ui5-u-margin-0-5rem-0" />
            <p className="ui5-u-font-size-1-05rem ui5-u-font-weight-600 ui5-u-color-accent-success ui5-u-line-height-1-5 ui5-u-margin-top-0-5rem"><MathText text={cur.back} /></p>
          </>
        )}
      </div>
      {flipped && (
        <div className="ui5-u-display-flex ui5-u-gap-0-75rem ui5-u-margin-top-1rem ui5-u-justify-content-center">
          <button type="button" onClick={() => { setResults((items) => [...items, "u"]); setFlipped(false); setIdx((value) => value + 1); }} className="ui5-u-flex-1 ui5-u-padding-0-7rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-2px-solid-accent-danger ui5-u-background-accent-danger-light ui5-u-color-accent-danger ui5-u-font-weight-700 ui5-u-font-size-0-9rem ui5-u-cursor-pointer ui5-u-font-family-inherit">❌ À revoir</button>
          <button type="button" onClick={() => { setResults((items) => [...items, "k"]); setFlipped(false); setIdx((value) => value + 1); }} className="ui5-u-flex-1 ui5-u-padding-0-7rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-2px-solid-accent-success ui5-u-background-accent-success-light ui5-u-color-accent-success ui5-u-font-weight-700 ui5-u-font-size-0-9rem ui5-u-cursor-pointer ui5-u-font-family-inherit">✅ Connue !</button>
        </div>
      )}
    </div>
  );
}
