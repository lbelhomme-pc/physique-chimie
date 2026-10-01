// src/components/pedagogie/ExercicesPlayer.tsx
// Lecteur d'exercices V3 : formats legacy conserves, aides progressives,
// correction masquee par defaut, schemas SVG nettoyes et auto-evaluation.

import { useMemo, useRef, useState, useEffect, type Ref } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import XPToast, { type ToastItem } from "./XPToast";
import MathText from "./MathText";
import TextToSpeech from "./TextToSpeech";
import { sanitizeTrustedSvg } from "../../utils/trustedContent";
import { getCanonicalProgressStorageKey } from "../../utils/contentIds";

type AnswerType = "text" | "number" | "nombre" | "numeric" | "expression" | "qcm" | "single-choice" | "multiple-choice";

interface ExerciceAides {
  indice?: string;
  methode?: string;
  erreurFrequente?: string;
  rappelCours?: string;
}

interface ExerciceHints {
  clue?: string;
  method?: string;
  commonMistake?: string;
  reminder?: string;
}

interface ChoiceOption {
  id?: string;
  label?: string;
  text?: string;
  value?: string;
}

interface ExerciseBlock {
  id?: string;
  type?: string;
  title?: string;
  text?: string;
  content?: string;
  svg?: string;
  schemaSvg?: string;
  accessibility?: { altText?: string; longDescription?: string };
}

interface Exercice {
  id: string;
  title?: string;
  titre?: string;
  statement?: string;
  questions?: string[];
  pedagogicalType?: string;
  curriculumItems?: string[];
  difficulty?: number;
  difficulte?: number | string;
  difficultyLabel?: string;
  niveau?: string;
  consigne?: string;
  correction?: string | string[];
  correctionEssentielle?: string | string[];
  correctionDetaillee?: string | string[];
  solution?: string | string[];
  aide?: string;
  aides?: ExerciceAides;
  hints?: ExerciceHints;
  commonMistakes?: string[];
  schemaSvg?: string | null;
  schemaCaption?: string | null;
  schemaAlt?: string | null;
  answerType?: AnswerType | string;
  choices?: Array<string | ChoiceOption>;
  options?: Array<string | ChoiceOption>;
  blocks?: ExerciseBlock[];
  skills?: string[];
  competences?: Array<{ label?: string } | string>;
  estimatedTime?: number;
}

interface NormalizedExercice extends Exercice {
  title?: string;
  consigne: string;
  questions: string[];
  difficulty?: number;
  difficultyLabel?: string;
  aides?: ExerciceAides;
  correction: string[];
  correctionEssentielle: string[];
  correctionDetaillee: string[];
  answerType: AnswerType | string;
  choices: ChoiceOption[];
}

interface ExercicesPlayerProps {
  data: Exercice[] | { exercices?: Exercice[]; exercises?: Exercice[] };
  title?: string;
  chapterId?: string;
  xpConfig?: { exercice_each?: number; exercice_all?: number };
}

const V = {
  bg: "var(--ui5-surface)",
  bgSec: "var(--ui5-surface-soft)",
  bgTer: "var(--ui5-surface-soft)",
  bgPri: "var(--ui5-surface)",
  text: "var(--ui5-text)",
  textSec: "var(--ui5-text-2)",
  textMut: "var(--ui5-text-3)",
  textDis: "var(--text-disabled)",
  border: "var(--ui5-border)",
  primary: "var(--ui5-action)",
  primaryLt: "var(--ui5-action-soft)",
  success: "var(--accent-success)",
  successLt: "var(--accent-success-light)",
  warning: "var(--accent-warning)",
  warningLt: "var(--accent-warning-light)",
  danger: "var(--accent-danger)",
  dangerLt: "var(--accent-danger-light)",
  purple: "var(--accent-purple)",
  purpleLt: "var(--accent-purple-light)",
};



function asLines(value?: string | string[]): string[] {
  if (Array.isArray(value)) return value.filter((item) => Boolean(String(item).trim()));
  return String(value ?? "").trim() ? [String(value)] : [];
}

function normalizeAnswerType(value?: string): AnswerType | string {
  const normalized = String(value ?? "text").trim().toLowerCase();
  if (["number", "numeric", "nombre", "numerique", "numérique"].includes(normalized)) return "number";
  if (["qcm", "choice", "single-choice", "single_choice", "choix"].includes(normalized)) return "qcm";
  if (["expression", "formula", "formule"].includes(normalized)) return "expression";
  return normalized || "text";
}

function normalizeChoice(option: string | ChoiceOption, index: number): ChoiceOption {
  if (typeof option === "string") return { id: `choice-${index + 1}`, label: option, value: option };
  const label = option.label ?? option.text ?? option.value ?? `Choix ${index + 1}`;
  return { ...option, id: option.id ?? `choice-${index + 1}`, label, value: option.value ?? label };
}

function getDiffStyle(d?: number) {
  if (!d || d <= 1) return { text: "Niveau 1", description: "Application", color: V.success, bg: V.successLt, border: V.success };
  if (d <= 2) return { text: "Niveau 2", description: "Entrainement", color: V.primary, bg: V.primaryLt, border: V.primary };
  if (d <= 3) return { text: "Niveau 3", description: "Raisonnement", color: V.warning, bg: V.warningLt, border: V.warning };
  if (d <= 4) return { text: "Niveau 4", description: "Approfondissement", color: V.danger, bg: V.dangerLt, border: V.danger };
  return { text: "Niveau 5", description: "Defi", color: V.purple, bg: V.purpleLt, border: V.purple };
}

function cleanDifficultyLabel(value?: string) {
  return String(value ?? "")
    .replace(/[⭐🏆]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDifficultyLabel(exercice: NormalizedExercice, style: ReturnType<typeof getDiffStyle>) {
  const label = cleanDifficultyLabel(exercice.difficultyLabel);
  return label ? `${style.text} - ${label}` : `${style.text} - ${style.description}`;
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

function getRewardedKey(chapterId: string) {
  return getCanonicalProgressStorageKey("exo_rewarded_", chapterId);
}

function getRewardedIds(chapterId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(getRewardedKey(chapterId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveRewardedIds(chapterId: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getRewardedKey(chapterId), JSON.stringify([...ids]));
  } catch {}
}

function getAideItems(exercice: NormalizedExercice) {
  const aides = exercice.aides ?? {};
  const items = [
    { key: "indice", label: "Indice", content: aides.indice },
    { key: "methode", label: "Methode", content: aides.methode },
    { key: "rappelCours", label: "Rappel de cours", content: aides.rappelCours },
    { key: "erreurFrequente", label: "Erreur frequente", content: aides.erreurFrequente },
  ];
  return items.filter((item): item is { key: string; label: string; content: string } => Boolean(item.content?.trim()));
}

function normalizeExercice(exercice: Exercice): NormalizedExercice {
  const rawDifficulty = exercice.difficulty ?? exercice.difficulte;
  const difficulty = typeof rawDifficulty === "number" ? rawDifficulty : Number(rawDifficulty);
  const correction = asLines(exercice.correction ?? exercice.solution);
  const correctionEssentielle = asLines(exercice.correctionEssentielle);
  const correctionDetaillee = asLines(exercice.correctionDetaillee);
  const hints = exercice.hints ?? {};
  const aideErreur = exercice.aides?.erreurFrequente ?? hints.commonMistake ?? exercice.commonMistakes?.join(" ");
  const choices = (exercice.choices ?? exercice.options ?? []).map(normalizeChoice);
  const answerType = choices.length ? "qcm" : normalizeAnswerType(exercice.answerType);

  return {
    ...exercice,
    title: exercice.title ?? exercice.titre,
    consigne: exercice.consigne ?? "",
    questions: Array.isArray(exercice.questions) ? exercice.questions.filter((item) => Boolean(String(item).trim())) : [],
    difficulty: Number.isFinite(difficulty) ? difficulty : undefined,
    difficultyLabel: exercice.difficultyLabel ?? exercice.niveau,
    aides: {
      ...exercice.aides,
      indice: exercice.aides?.indice ?? exercice.aide ?? hints.clue,
      methode: exercice.aides?.methode ?? hints.method,
      rappelCours: exercice.aides?.rappelCours ?? hints.reminder,
      erreurFrequente: aideErreur,
    },
    correction,
    correctionEssentielle: correctionEssentielle.length ? correctionEssentielle : correction.slice(0, 1),
    correctionDetaillee: correctionDetaillee.length ? correctionDetaillee : correction.slice(1),
    answerType,
    choices,
  };
}

function safeDomId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function getAnswerLabel(answerType: string) {
  if (answerType === "number") return "Reponse numerique";
  if (answerType === "expression") return "Expression ou calcul";
  if (answerType === "qcm") return "Choisis une proposition";
  return "Ta reponse";
}

function renderExerciseBlock(block: ExerciseBlock, index: number) {
  const blockId = block.id ?? `block-${index + 1}`;
  const title = block.title;
  const text = block.text ?? block.content;
  const svg = block.svg ?? block.schemaSvg;
  const altText = block.accessibility?.altText ?? block.accessibility?.longDescription ?? title ?? "Schema de l'exercice";

  if (svg && ["diagram", "graph", "schema", "svg"].includes(String(block.type ?? "diagram"))) {
    const trusted = sanitizeTrustedSvg(svg);
    return (
      <figure key={blockId} className="ui5-u-margin-0-0-1rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm">
        {title && <figcaption className="ui5-u-margin-bottom-0-6rem ui5-u-color-ui5-text-2 ui5-u-font-weight-700">{title}</figcaption>}
        <div
          role="img"
         aria-label={altText}
          className="ui5-u-display-flex ui5-u-justify-content-center ui5-u-overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: trusted }}
        />
      </figure>
    );
  }

  if (text) {
    return (
      <div key={blockId} className="ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-0-85rem-1rem ui5-u-margin-bottom-0-75rem">
        {title && <p className="ui5-u-margin-0-0-0-35rem ui5-u-color-ui5-text ui5-u-font-weight-700">{title}</p>}
        <MathText text={text} block className="ui5-u-color-ui5-text ui5-u-line-height-1-6" />
      </div>
    );
  }

  return null;
}

export default function ExercicesPlayer({ data, title, chapterId, xpConfig }: ExercicesPlayerProps) {
  const exercices: NormalizedExercice[] = useMemo(() => {
    const raw = Array.isArray(data) ? data : (data?.exercices ?? data?.exercises ?? []);
    return raw.map(normalizeExercice);
  }, [data]);

  const [rewardedIds, setRewardedIds] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const ids = chapterId ? getRewardedIds(chapterId) : new Set<string>();
    setRewardedIds(ids);
    setCompletedIds(new Set(ids));
  }, [chapterId]);
  const [ci, setCi] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [showCorr, setShowCorr] = useState(false);
  const [selfEval, setSelfEval] = useState<"correct" | "partial" | "incorrect" | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [filterDiff, setFilterDiff] = useState<number | null>(null);
  const [visibleAideCount, setVisibleAideCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [allNotified, setAllNotified] = useState(false);
  const answerRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const total = exercices.length;
  const filtered = useMemo(() => filterDiff === null ? exercices : exercices.filter((item) => item.difficulty === filterDiff), [exercices, filterDiff]);
  const diffs = useMemo(() => Array.from(new Set(exercices.map((item) => item.difficulty ?? 1))).sort((a, b) => a - b), [exercices]);

  if (!total) return <p className="ui5-u-font-style-italic ui5-u-color-ui5-text-3">Aucun exercice disponible.</p>;

  const cur = filtered[ci];
  if (!cur) return <p className="ui5-u-font-style-italic ui5-u-color-ui5-text-3">Aucun exercice ne correspond au filtre.</p>;

  const ds = getDiffStyle(cur.difficulty);
  const rewarded = rewardedIds.has(cur.id);
  const aideItems = getAideItems(cur);
  const visibleAides = aideItems.slice(0, visibleAideCount);
  const answerId = `${safeDomId(cur.id)}-answer`;
  const answerType = normalizeAnswerType(cur.answerType);
  const answerReady = answerType === "qcm" ? Boolean(selectedChoice) : Boolean(answer.trim());
  const responseSummary = answerType === "qcm"
    ? cur.choices.find((choice) => choice.id === selectedChoice)?.label ?? ""
    : answer;
  const trustedSchemaSvg = cur.schemaSvg ? sanitizeTrustedSvg(cur.schemaSvg) : "";
  const correctionEssential = cur.correctionEssentielle.length ? cur.correctionEssentielle : ["Correction disponible apres comparaison avec ta reponse."];
  const correctionDetailed = cur.correctionDetaillee;

  function addToast(toast: Omit<ToastItem, "id">) {
    setToasts((previous) => [...previous, { ...toast, id: `t-${Date.now()}-${Math.random()}` }]);
  }

  function dismissToast(id: string) {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }

  function rewardExo(exoId: string, xpAmount: number) {
    if (!chapterId || rewardedIds.has(exoId)) return;
    try {
      const engine = getGamificationEngine();
      const result = engine.completeExercice(chapterId, exoId, { exercice_each: xpAmount });
      const nextRewarded = new Set(rewardedIds).add(exoId);
      setRewardedIds(nextRewarded);
      saveRewardedIds(chapterId, nextRewarded);
      if (result.xp > 0) addToast({ type: "xp", message: `+${result.xp} XP`, icon: "XP" });
      if (result.rankUp) addToast({ type: "rank_up", message: `Nouveau rang : ${result.rankUp.name}`, icon: result.rankUp.icon });
      result.newBadges.forEach((badge) => addToast({ type: "badge", message: `Badge : ${badge.name}`, icon: badge.icon }));
    } catch (error) {
      console.warn(error);
    }
  }

  function checkAll(ids: Set<string>) {
    if (allNotified || ids.size < total || !chapterId) return;
    setAllNotified(true);
    const key = getCanonicalProgressStorageKey("exo_all_rewarded_", chapterId);
    if (typeof window !== "undefined" && localStorage.getItem(key)) return;
    try {
      const engine = getGamificationEngine();
      const result = engine.completeAllExercices(chapterId, xpConfig);
      if (typeof window !== "undefined") localStorage.setItem(key, "true");
      if (result.xp > 0) addToast({ type: "chapter_complete", message: `Tous termines ! +${result.xp} XP`, icon: "OK" });
    } catch (error) {
      console.warn(error);
    }
  }

  function handleShowCorr() {
    if (!answerReady) {
      if (answerRef.current) {
        answerRef.current.style.borderColor = V.warning;
        setTimeout(() => {
          if (answerRef.current) answerRef.current.style.borderColor = V.border;
        }, 1000);
      }
      return;
    }
    setShowCorr(true);
  }

  function handleEval(evaluation: "correct" | "partial" | "incorrect") {
    setSelfEval(evaluation);
    const nextCompleted = new Set(completedIds).add(cur.id);
    setCompletedIds(nextCompleted);
    const base = xpConfig?.exercice_each ?? 3;
    const xp = evaluation === "correct" ? base : evaluation === "partial" ? Math.ceil(base / 2) : 1;
    rewardExo(cur.id, xp);
    checkAll(nextCompleted);
  }

  function resetAnswer() {
    setShowCorr(false);
    setSelfEval(null);
    setAnswer("");
    setSelectedChoice("");
    setVisibleAideCount(0);
  }

  function goTo(index: number) {
    setCi(index);
    resetAnswer();
    setTimeout(() => answerRef.current?.focus(), 100);
  }

  function toggleFilter(difficulty: number) {
    setFilterDiff(filterDiff === difficulty ? null : difficulty);
    setCi(0);
    resetAnswer();
  }

  return (
    <div data-exercices-player-v3 className="learning-player learning-player--exercises">
      {title && <h3 className="learning-player__title">{title}</h3>}

      <div className="ui5-u-display-flex ui5-u-justify-content-space-between ui5-u-align-items-center ui5-u-flex-wrap-wrap ui5-u-gap-0-65rem ui5-u-margin-bottom-0-85rem">
        <div aria-label="Filtrer par niveau" className="ui5-u-display-flex ui5-u-gap-0-35rem ui5-u-flex-wrap-wrap">
          {diffs.map((difficulty) => {
            const style = getDiffStyle(difficulty);
            const active = filterDiff === difficulty;
            return (
              <button
                key={difficulty}
                type="button"
               aria-pressed={active}
                onClick={() => toggleFilter(difficulty)}
                className="ui5-u-min-height-36px ui5-u-padding-0-35rem-0-7rem ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-78rem ui5-u-font-weight-700 ui5-u-cursor-pointer ui5-u-background-ui5-value-background ui5-u-color-ui5-value-color" style={{ "--ui5-value-border": `1px solid ${active ? style.color : V.border}`, "--ui5-value-background": active ? style.bg : V.bg, "--ui5-value-color": active ? style.color : V.textSec } as React.CSSProperties}
              >
                {style.text}
              </button>
            );
          })}
        </div>
        <span className="ui5-u-color-ui5-text-3 ui5-u-font-size-0-86rem">{completedIds.size}/{total} consultes</span>
      </div>

      <div className="ui5-u-display-flex ui5-u-align-items-center ui5-u-gap-0-75rem ui5-u-margin-bottom-1rem">
        <div
          role="progressbar"
         aria-label="Progression dans les exercices"
         aria-valuemin={1}
         aria-valuemax={filtered.length}
         aria-valuenow={ci + 1}
          className="ui5-u-flex-1 ui5-u-height-8px ui5-u-background-ui5-surface-soft ui5-u-border-radius-999px ui5-u-overflow-hidden"
        >
          <div className="ui5-u-height-100 ui5-u-background-accent-warning ui5-u-border-radius-999px ui5-u-transition-width-0-4s ui5-u-width-ui5-value-width" style={{ "--ui5-value-width": `${((ci + 1) / filtered.length) * 100}%` } as React.CSSProperties} />
        </div>
        <span className="ui5-u-font-size-0-86rem ui5-u-color-ui5-text-3 ui5-u-font-weight-600 ui5-u-white-space-nowrap">{ci + 1}/{filtered.length}</span>
      </div>

      <div className="exercise-workspace">
        <aside className="exercise-rail" aria-label="Progression dans la série d’exercices">
          <p>Progression</p>
          <div className="exercise-rail__list">
            {filtered.map((exo, index) => (
              <button
                key={exo.id}
                type="button"
                className={[
                  "exercise-rail__item",
                  index === ci ? "is-current" : "",
                  completedIds.has(exo.id) ? "is-complete" : "",
                ].filter(Boolean).join(" ")}
               aria-current={index === ci ? "step" : undefined}
                onClick={() => goTo(index)}
              >
                <span>{index + 1}</span>
                <small>{completedIds.has(exo.id) ? "Terminé" : index === ci ? "En cours" : "À faire"}</small>
              </button>
            ))}
          </div>
        </aside>

        <details className="exercise-mobile-navigator">
          <summary>Exercice {ci + 1}/{filtered.length} · Voir la série</summary>
          <div className="exercise-mobile-navigator__grid">
            {filtered.map((exo, index) => (
              <button key={exo.id} type="button" aria-current={index === ci ? "step" : undefined} onClick={() => goTo(index)}>
                {index + 1}{completedIds.has(exo.id) ? " ✓" : ""}
              </button>
            ))}
          </div>
        </details>

        <div className="exercise-workspace__main">
      <section aria-labelledby={`${safeDomId(cur.id)}-title`} className="learning-question-card learning-exercise-card ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-border-left-ui5-value-border-left ui5-u-padding-1-35rem ui5-u-margin-bottom-1rem" style={{ "--ui5-value-border-left": `5px solid ${ds.color}` } as React.CSSProperties}>
        <div className="ui5-u-display-flex ui5-u-justify-content-space-between ui5-u-align-items-flex-start ui5-u-margin-bottom-1rem ui5-u-gap-0-75rem">
          <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-gap-0-2rem">
            <span className="ui5-u-font-size-0-8rem ui5-u-font-weight-800 ui5-u-text-transform-uppercase ui5-u-letter-spacing-0 ui5-u-color-ui5-text-3">
              Exercice {ci + 1}{rewarded && <span className="ui5-u-color-accent-success ui5-u-margin-left-6px">termine</span>}
            </span>
            {cur.title && <h4 id={`${safeDomId(cur.id)}-title`} className="ui5-u-font-size-1-16rem ui5-u-font-weight-800 ui5-u-color-ui5-text ui5-u-margin-0">{cur.title}</h4>}
          </div>
          <span className="ui5-u-padding-0-3rem-0-7rem ui5-u-border-radius-999px ui5-u-font-size-0-78rem ui5-u-font-weight-700 ui5-u-border-ui5-value-border ui5-u-white-space-nowrap ui5-u-color-ui5-value-color ui5-u-background-ui5-value-background" style={{ "--ui5-value-border": `1px solid ${ds.border}`, "--ui5-value-color": ds.color, "--ui5-value-background": ds.bg } as React.CSSProperties}>
            {getDifficultyLabel(cur, ds)}
          </span>
        </div>

        {(cur.skills?.length || cur.estimatedTime || cur.answerType) && (
          <div className="ui5-u-display-flex ui5-u-gap-0-45rem ui5-u-flex-wrap-wrap ui5-u-margin-bottom-0-8rem">
            {cur.estimatedTime && <span className="ui5-u-display-inline-flex ui5-u-align-items-center ui5-u-min-height-28px ui5-u-padding-0-2rem-0-55rem ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-999px ui5-u-background-ui5-surface-soft ui5-u-color-ui5-text-2 ui5-u-font-size-0-78rem ui5-u-font-weight-700">{cur.estimatedTime} min</span>}
            <span className="ui5-u-display-inline-flex ui5-u-align-items-center ui5-u-min-height-28px ui5-u-padding-0-2rem-0-55rem ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-999px ui5-u-background-ui5-surface-soft ui5-u-color-ui5-text-2 ui5-u-font-size-0-78rem ui5-u-font-weight-700">{getAnswerLabel(answerType)}</span>
            {cur.skills?.slice(0, 3).map((skill) => <span key={skill} className="ui5-u-display-inline-flex ui5-u-align-items-center ui5-u-min-height-28px ui5-u-padding-0-2rem-0-55rem ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-999px ui5-u-background-ui5-surface-soft ui5-u-color-ui5-text-2 ui5-u-font-size-0-78rem ui5-u-font-weight-700">{skill}</span>)}
          </div>
        )}

        <div className="ui5-u-padding-1rem ui5-u-background-ui5-surface-soft ui5-u-border-radius-ui5-radius-sm ui5-u-margin-bottom-0-75rem ui5-u-border-left-3px-solid-text-disabled">
          <p className="ui5-u-margin-0-0-0-45rem ui5-u-color-ui5-text-3 ui5-u-font-size-0-78rem ui5-u-font-weight-800 ui5-u-text-transform-uppercase">Énoncé</p>
          <MathText text={cur.statement ?? cur.consigne} block className="ui5-u-font-size-1rem ui5-u-color-ui5-text ui5-u-line-height-1-65 ui5-u-margin-0" />
        </div>

        {cur.questions.length > 0 && (
          <div className="ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-0-95rem-1rem ui5-u-margin-bottom-0-85rem">
            <p className="ui5-u-margin-0-0-0-6rem ui5-u-color-ui5-text ui5-u-font-weight-800">Questions</p>
            <ol className="ui5-u-display-grid ui5-u-gap-0-65rem ui5-u-padding-left-1-3rem ui5-u-margin-0 ui5-u-color-ui5-text">
              {cur.questions.map((question, index) => (
                <li key={index} className="ui5-u-padding-left-0-2rem ui5-u-line-height-1-6">
                  <MathText text={question} />
                </li>
              ))}
            </ol>
          </div>
        )}

        {cur.consigne && cur.consigne !== cur.statement && (
          <div className="ui5-u-padding-0-8rem-0-95rem ui5-u-background-ui5-action-soft ui5-u-border-1px-solid-ui5-action ui5-u-border-radius-ui5-radius-sm ui5-u-margin-bottom-0-85rem">
            <p className="ui5-u-margin-0-0-0-3rem ui5-u-color-ui5-action ui5-u-font-size-0-78rem ui5-u-font-weight-800 ui5-u-text-transform-uppercase">Consigne de rédaction</p>
            <MathText text={cur.consigne} block className="ui5-u-color-ui5-text ui5-u-line-height-1-55" />
          </div>
        )}

        {trustedSchemaSvg && (
          <figure className="ui5-u-margin-0-0-1rem ui5-u-padding-1rem ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm">
            <div
              role="img"
             aria-label={cur.schemaAlt ?? cur.schemaCaption ?? "Schema de l'exercice"}
              className="ui5-u-display-flex ui5-u-justify-content-center ui5-u-overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: trustedSchemaSvg }}
            />
            {cur.schemaCaption && (
              <figcaption className="ui5-u-margin-top-0-6rem ui5-u-font-size-0-86rem ui5-u-color-ui5-text-3 ui5-u-text-align-center ui5-u-line-height-1-4">
                {cur.schemaCaption}
              </figcaption>
            )}
          </figure>
        )}

        {cur.blocks?.map(renderExerciseBlock)}

        <div className="ui5-u-margin-bottom-1rem">
          <TextToSpeech compact text={stripHtmlForSpeech([cur.statement, ...cur.questions, cur.consigne].filter(Boolean).join(" "))} />
        </div>

        {aideItems.length > 0 && !showCorr && (
          <div className="ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-0-95rem ui5-u-margin-bottom-1rem">
            <div className="ui5-u-display-flex ui5-u-justify-content-space-between ui5-u-gap-0-75rem ui5-u-align-items-center ui5-u-flex-wrap-wrap">
              <p className="ui5-u-font-size-0-9rem ui5-u-font-weight-800 ui5-u-color-ui5-text ui5-u-margin-0">Aides progressives</p>
              <button
                type="button"
                onClick={() => setVisibleAideCount((value) => Math.min(value + 1, aideItems.length))}
                disabled={visibleAideCount >= aideItems.length}
                className={"ui5-u-min-height-36px ui5-u-padding-0-4rem-0-75rem ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm" + " " + (visibleAideCount >= aideItems.length ? "ui5-u-background-ui5-surface-soft" : "ui5-u-background-ui5-action-soft") + " " + (visibleAideCount >= aideItems.length ? "ui5-u-color-ui5-text-3" : "ui5-u-color-ui5-action") + " " + "ui5-u-font-weight-800" + " " + (visibleAideCount >= aideItems.length ? "ui5-u-cursor-not-allowed" : "ui5-u-cursor-pointer")} style={{ "--ui5-value-border": `1px solid ${visibleAideCount >= aideItems.length ? V.border : V.primary}` } as React.CSSProperties}
              >
                Aide suivante
              </button>
            </div>
            {visibleAides.length === 0 && <p className="ui5-u-margin-0-65rem-0-0 ui5-u-color-ui5-text-3 ui5-u-font-size-0-9rem">Essaie seul, puis debloque une aide si tu bloques.</p>}
            <div className={"ui5-u-display-grid ui5-u-gap-0-55rem" + " " + (visibleAides.length ? "ui5-u-margin-top-0-75rem" : "ui5-u-margin-top-0")}>
              {visibleAides.map((item, index) => (
                <div key={item.key} className="ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-surface ui5-u-padding-0-8rem-0-9rem">
                  <p className="ui5-u-margin-0-0-0-35rem ui5-u-color-ui5-action ui5-u-font-weight-800">Aide {index + 1} - {item.label}</p>
                  <MathText text={item.content} block className="ui5-u-color-ui5-text ui5-u-line-height-1-55" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!showCorr ? (
          <div className="ui5-u-display-flex ui5-u-flex-direction-column ui5-u-gap-0-55rem">
            {answerType === "qcm" ? (
              <fieldset className="ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-padding-0-8rem-0-9rem ui5-u-margin-0">
                <legend className="ui5-u-font-size-0-88rem ui5-u-font-weight-800 ui5-u-color-ui5-text-2 ui5-u-padding-0-0-25rem">{getAnswerLabel(answerType)}</legend>
                <div className="ui5-u-display-grid ui5-u-gap-0-5rem">
                  {cur.choices.map((choice) => (
                    <label key={choice.id} className={"ui5-u-display-flex ui5-u-align-items-flex-start ui5-u-gap-0-55rem ui5-u-padding-0-65rem ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm" + " " + (selectedChoice === choice.id ? "ui5-u-background-ui5-action-soft" : "ui5-u-background-ui5-surface") + " " + "ui5-u-cursor-pointer"} style={{ "--ui5-value-border": `1px solid ${selectedChoice === choice.id ? V.primary : V.border}` } as React.CSSProperties}>
                      <input
                        type="radio"
                        name={`${safeDomId(cur.id)}-choices`}
                        value={choice.id}
                        checked={selectedChoice === choice.id}
                        onChange={() => setSelectedChoice(choice.id ?? "")}
                        ref={choice === cur.choices[0] ? answerRef as Ref<HTMLInputElement> : undefined}
                      />
                      <MathText text={choice.label} />
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : answerType === "number" ? (
              <>
                <label htmlFor={answerId} className="ui5-u-font-size-0-88rem ui5-u-font-weight-800 ui5-u-color-ui5-text-2">{getAnswerLabel(answerType)}</label>
                <input
                  id={answerId}
                  ref={answerRef as Ref<HTMLInputElement>}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Ex. 13 ou 2,5"
                  inputMode="decimal"
                  className="ui5-u-width-100 ui5-u-box-sizing-border-box ui5-u-padding-0-75rem ui5-u-border-2px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-surface ui5-u-color-ui5-text ui5-u-font-inherit ui5-u-font-size-1rem"
                  autoFocus
                />
              </>
            ) : (
              <>
                <label htmlFor={answerId} className="ui5-u-font-size-0-88rem ui5-u-font-weight-800 ui5-u-color-ui5-text-2">{getAnswerLabel(answerType)}</label>
                <textarea
                  id={answerId}
                  ref={answerRef as Ref<HTMLTextAreaElement>}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Ecris ta reponse ici..."
                  className="ui5-u-width-100 ui5-u-box-sizing-border-box ui5-u-padding-0-75rem ui5-u-border-2px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-surface ui5-u-color-ui5-text ui5-u-font-inherit ui5-u-font-size-1rem ui5-u-resize-vertical ui5-u-min-height-116px"
                  rows={4}
                  autoFocus
                />
              </>
            )}
            <div className="ui5-u-display-flex ui5-u-justify-content-space-between ui5-u-align-items-center ui5-u-gap-0-75rem ui5-u-flex-wrap-wrap">
              {rewarded && <span className="ui5-u-font-size-0-82rem ui5-u-color-ui5-text-3">Deja consulte - pas de nouvel XP.</span>}
              <button
                type="button"
               aria-disabled={!answerReady}
                onClick={handleShowCorr}
                className={"ui5-u-min-height-44px ui5-u-padding-0-7rem-1-15rem" + " " + (answerReady ? "ui5-u-background-ui5-action" : "ui5-u-background-ui5-surface-soft") + " " + "ui5-u-color-fff ui5-u-border-none ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-95rem ui5-u-font-weight-800" + " " + (answerReady ? "ui5-u-cursor-pointer" : "ui5-u-cursor-not-allowed") + " " + "ui5-u-margin-left-auto"}
              >
                Voir la correction
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="ui5-u-padding-0-85rem-1rem ui5-u-background-ui5-surface-soft ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-margin-bottom-0-85rem">
              <span className="ui5-u-font-size-0-78rem ui5-u-font-weight-800 ui5-u-color-ui5-text-3 ui5-u-text-transform-uppercase ui5-u-letter-spacing-0">Ta reponse</span>
              <p className="ui5-u-font-size-0-96rem ui5-u-color-ui5-text-2 ui5-u-margin-0-3rem-0-0 ui5-u-line-height-1-5 ui5-u-white-space-pre-wrap">{responseSummary}</p>
            </div>

            <div className="ui5-u-padding-1rem ui5-u-background-accent-success-light ui5-u-border-1px-solid-accent-success ui5-u-border-radius-ui5-radius-sm ui5-u-margin-bottom-0-75rem">
              <p className="ui5-u-font-weight-800 ui5-u-font-size-0-98rem ui5-u-color-accent-success ui5-u-margin-0-0-0-55rem">Correction essentielle</p>
              {correctionEssential.map((line, index) => (
                <div key={index} className="ui5-u-font-size-0-96rem ui5-u-color-ui5-text ui5-u-line-height-1-65 ui5-u-margin-0-3rem-0">
                  <MathText text={line} block />
                </div>
              ))}
            </div>

            {correctionDetailed.length > 0 && (
              <details className="ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-0-9rem-1rem ui5-u-margin-bottom-0-85rem">
                <summary className="ui5-u-color-ui5-text ui5-u-font-weight-800 ui5-u-cursor-pointer">Correction detaillee</summary>
                <div className="ui5-u-margin-top-0-65rem">
                  {correctionDetailed.map((line, index) => (
                    <div key={index} className="ui5-u-font-size-0-95rem ui5-u-color-ui5-text ui5-u-line-height-1-65 ui5-u-margin-0-35rem-0">
                      <MathText text={line} block />
                    </div>
                  ))}
                </div>
              </details>
            )}

            <div className="ui5-u-margin-bottom-1rem">
              <TextToSpeech compact text={stripHtmlForSpeech([...correctionEssential, ...correctionDetailed].join(". "))} label="Ecouter la correction" />
            </div>

            {selfEval === null ? (
              <div className="ui5-u-margin-top-0-5rem">
                <p className="ui5-u-font-size-0-92rem ui5-u-color-ui5-text-2 ui5-u-text-align-center ui5-u-margin-bottom-0-75rem ui5-u-font-weight-700">
                  Compare ta reponse avec la correction.
                </p>
                <div className="ui5-u-display-grid ui5-u-grid-template-columns-repeat-3-minmax-0-1fr ui5-u-gap-0-5rem">
                  {([
                    ["incorrect", "Incorrect", V.danger, V.dangerLt, 1],
                    ["partial", "Partiel", V.warning, V.warningLt, 2],
                    ["correct", "Correct", V.success, V.successLt, 3],
                  ] as const).map(([evaluation, label, color, bg, xp]) => (
                    <button
                      key={evaluation}
                      type="button"
                      onClick={() => handleEval(evaluation)}
                      className="ui5-u-min-height-58px ui5-u-padding-0-65rem-0-5rem ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-value-background ui5-u-color-ui5-value-color ui5-u-font-size-0-86rem ui5-u-font-weight-800 ui5-u-cursor-pointer" style={{ "--ui5-value-border": `2px solid ${color}`, "--ui5-value-background": bg, "--ui5-value-color": color } as React.CSSProperties}
                    >
                      <span>{label}</span>
                      {!rewarded && <span className="ui5-u-display-block ui5-u-margin-top-0-18rem ui5-u-font-size-0-72rem ui5-u-color-ui5-text-3">+{xp} XP</span>}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ui5-u-text-align-center ui5-u-padding-0-75rem ui5-u-background-ui5-surface-soft ui5-u-border-radius-ui5-radius-sm ui5-u-font-size-0-92rem ui5-u-color-ui5-text-2">
                {selfEval === "correct" && <p className="ui5-u-margin-0">Marque correct - bravo.</p>}
                {selfEval === "partial" && <p className="ui5-u-margin-0">Marque partiellement correct - tu progresses.</p>}
                {selfEval === "incorrect" && <p className="ui5-u-margin-0">Marque incorrect - relis la correction puis reessaie.</p>}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="ui5-u-display-flex ui5-u-justify-content-space-between ui5-u-margin-bottom-0-85rem">
        <button type="button" onClick={() => ci > 0 && goTo(ci - 1)} disabled={ci === 0} className={"ui5-u-min-height-44px ui5-u-padding-0-55rem-1rem ui5-u-border-none ui5-u-border-radius-ui5-radius-sm" + " " + ((ci > 0) ? "ui5-u-background-ui5-surface-soft" : "ui5-u-background-ui5-surface-soft") + " " + ((ci > 0) ? "ui5-u-color-ui5-text-2" : "ui5-u-color-text-disabled") + " " + "ui5-u-font-size-0-86rem ui5-u-font-weight-700" + " " + ((ci > 0) ? "ui5-u-cursor-pointer" : "ui5-u-cursor-not-allowed")}>Precedent</button>
        <button type="button" onClick={() => ci + 1 < filtered.length && goTo(ci + 1)} disabled={ci + 1 >= filtered.length} className={"ui5-u-min-height-44px ui5-u-padding-0-55rem-1rem ui5-u-border-none ui5-u-border-radius-ui5-radius-sm" + " " + ((ci + 1 < filtered.length) ? "ui5-u-background-ui5-surface-soft" : "ui5-u-background-ui5-surface-soft") + " " + ((ci + 1 < filtered.length) ? "ui5-u-color-ui5-text-2" : "ui5-u-color-text-disabled") + " " + "ui5-u-font-size-0-86rem ui5-u-font-weight-700" + " " + ((ci + 1 < filtered.length) ? "ui5-u-cursor-pointer" : "ui5-u-cursor-not-allowed")}>Suivant</button>
      </div>
        </div>
      </div>

      <XPToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
