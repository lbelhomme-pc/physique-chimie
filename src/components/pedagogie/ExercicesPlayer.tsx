// src/components/pedagogie/ExercicesPlayer.tsx
// Lecteur d'exercices V3 : formats legacy conserves, aides progressives,
// correction masquee par defaut, schemas SVG nettoyes et auto-evaluation.

import { useMemo, useRef, useState, type CSSProperties, type Ref } from "react";
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
  bg: "var(--bg-card)",
  bgSec: "var(--bg-secondary)",
  bgTer: "var(--bg-tertiary)",
  bgPri: "var(--bg-primary)",
  text: "var(--text-primary)",
  textSec: "var(--text-secondary)",
  textMut: "var(--text-muted)",
  textDis: "var(--text-disabled)",
  border: "var(--border-color)",
  primary: "var(--accent-primary)",
  primaryLt: "var(--accent-primary-light)",
  success: "var(--accent-success)",
  successLt: "var(--accent-success-light)",
  warning: "var(--accent-warning)",
  warningLt: "var(--accent-warning-light)",
  danger: "var(--accent-danger)",
  dangerLt: "var(--accent-danger-light)",
  purple: "var(--accent-purple)",
  purpleLt: "var(--accent-purple-light)",
};

const cardStyle: CSSProperties = {
  background: V.bg,
  border: `1px solid ${V.border}`,
  borderRadius: 8,
  boxShadow: "var(--shadow-card)",
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
      <figure key={blockId} style={{ margin: "0 0 1rem", padding: "1rem", background: V.bgPri, border: `1px solid ${V.border}`, borderRadius: 8 }}>
        {title && <figcaption style={{ marginBottom: "0.6rem", color: V.textSec, fontWeight: 700 }}>{title}</figcaption>}
        <div
          role="img"
          aria-label={altText}
          style={{ display: "flex", justifyContent: "center", overflowX: "auto" }}
          dangerouslySetInnerHTML={{ __html: trusted }}
        />
      </figure>
    );
  }

  if (text) {
    return (
      <div key={blockId} style={{ ...cardStyle, padding: "0.85rem 1rem", marginBottom: "0.75rem" }}>
        {title && <p style={{ margin: "0 0 0.35rem", color: V.text, fontWeight: 700 }}>{title}</p>}
        <MathText text={text} block style={{ color: V.text, lineHeight: 1.6 }} />
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

  const [rewardedIds, setRewardedIds] = useState<Set<string>>(() => chapterId ? getRewardedIds(chapterId) : new Set());
  const [ci, setCi] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [showCorr, setShowCorr] = useState(false);
  const [selfEval, setSelfEval] = useState<"correct" | "partial" | "incorrect" | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => chapterId ? getRewardedIds(chapterId) : new Set());
  const [filterDiff, setFilterDiff] = useState<number | null>(null);
  const [visibleAideCount, setVisibleAideCount] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [allNotified, setAllNotified] = useState(false);
  const answerRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const total = exercices.length;
  const filtered = useMemo(() => filterDiff === null ? exercices : exercices.filter((item) => item.difficulty === filterDiff), [exercices, filterDiff]);
  const diffs = useMemo(() => Array.from(new Set(exercices.map((item) => item.difficulty ?? 1))).sort((a, b) => a - b), [exercices]);

  if (!total) return <p style={{ fontStyle: "italic", color: V.textMut }}>Aucun exercice disponible.</p>;

  const cur = filtered[ci];
  if (!cur) return <p style={{ fontStyle: "italic", color: V.textMut }}>Aucun exercice ne correspond au filtre.</p>;

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
    <div data-exercices-player-v3 style={{ maxWidth: 760, margin: "0 auto" }}>
      {title && <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", color: V.text }}>{title}</h3>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.65rem", marginBottom: "0.85rem" }}>
        <div aria-label="Filtrer par niveau" style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {diffs.map((difficulty) => {
            const style = getDiffStyle(difficulty);
            const active = filterDiff === difficulty;
            return (
              <button
                key={difficulty}
                type="button"
                aria-pressed={active}
                onClick={() => toggleFilter(difficulty)}
                style={{
                  minHeight: 36,
                  padding: "0.35rem 0.7rem",
                  border: `1px solid ${active ? style.color : V.border}`,
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: active ? style.bg : V.bg,
                  color: active ? style.color : V.textSec,
                }}
              >
                {style.text}
              </button>
            );
          })}
        </div>
        <span style={{ color: V.textMut, fontSize: "0.86rem" }}>{completedIds.size}/{total} consultes</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div
          role="progressbar"
          aria-label="Progression dans les exercices"
          aria-valuemin={1}
          aria-valuemax={filtered.length}
          aria-valuenow={ci + 1}
          style={{ flex: 1, height: 8, background: V.bgTer, borderRadius: 99, overflow: "hidden" }}
        >
          <div style={{ height: "100%", background: V.warning, borderRadius: 99, transition: "width 0.4s", width: `${((ci + 1) / filtered.length) * 100}%` }} />
        </div>
        <span style={{ fontSize: "0.86rem", color: V.textMut, fontWeight: 600, whiteSpace: "nowrap" }}>{ci + 1}/{filtered.length}</span>
      </div>

      <section aria-labelledby={`${safeDomId(cur.id)}-title`} style={{ ...cardStyle, borderLeft: `5px solid ${ds.color}`, padding: "1.35rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", gap: "0.75rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0, color: V.textMut }}>
              Exercice {ci + 1}{rewarded && <span style={{ color: V.success, marginLeft: 6 }}>termine</span>}
            </span>
            {cur.title && <h4 id={`${safeDomId(cur.id)}-title`} style={{ fontSize: "1.16rem", fontWeight: 800, color: V.text, margin: 0 }}>{cur.title}</h4>}
          </div>
          <span style={{ padding: "0.3rem 0.7rem", borderRadius: 999, fontSize: "0.78rem", fontWeight: 700, border: `1px solid ${ds.border}`, whiteSpace: "nowrap", color: ds.color, background: ds.bg }}>
            {getDifficultyLabel(cur, ds)}
          </span>
        </div>

        {(cur.skills?.length || cur.estimatedTime || cur.answerType) && (
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
            {cur.estimatedTime && <span style={metaPillStyle}>{cur.estimatedTime} min</span>}
            <span style={metaPillStyle}>{getAnswerLabel(answerType)}</span>
            {cur.skills?.slice(0, 3).map((skill) => <span key={skill} style={metaPillStyle}>{skill}</span>)}
          </div>
        )}

        <div style={{ padding: "1rem", background: V.bgSec, borderRadius: 8, marginBottom: "0.75rem", borderLeft: `3px solid ${V.textDis}` }}>
          <p style={{ margin: "0 0 0.45rem", color: V.textMut, fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase" }}>Énoncé</p>
          <MathText text={cur.statement ?? cur.consigne} block style={{ fontSize: "1rem", color: V.text, lineHeight: 1.65, margin: 0 }} />
        </div>

        {cur.questions.length > 0 && (
          <div style={{ ...cardStyle, padding: "0.95rem 1rem", marginBottom: "0.85rem", background: V.bgPri }}>
            <p style={{ margin: "0 0 0.6rem", color: V.text, fontWeight: 800 }}>Questions</p>
            <ol style={{ display: "grid", gap: "0.65rem", paddingLeft: "1.3rem", margin: 0, color: V.text }}>
              {cur.questions.map((question, index) => (
                <li key={index} style={{ paddingLeft: "0.2rem", lineHeight: 1.6 }}>
                  <MathText text={question} />
                </li>
              ))}
            </ol>
          </div>
        )}

        {cur.consigne && cur.consigne !== cur.statement && (
          <div style={{ padding: "0.8rem 0.95rem", background: V.primaryLt, border: `1px solid ${V.primary}`, borderRadius: 8, marginBottom: "0.85rem" }}>
            <p style={{ margin: "0 0 0.3rem", color: V.primary, fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase" }}>Consigne de rédaction</p>
            <MathText text={cur.consigne} block style={{ color: V.text, lineHeight: 1.55 }} />
          </div>
        )}

        {trustedSchemaSvg && (
          <figure style={{ margin: "0 0 1rem", padding: "1rem", background: V.bgPri, border: `1px solid ${V.border}`, borderRadius: 8 }}>
            <div
              role="img"
              aria-label={cur.schemaAlt ?? cur.schemaCaption ?? "Schema de l'exercice"}
              style={{ display: "flex", justifyContent: "center", overflowX: "auto" }}
              dangerouslySetInnerHTML={{ __html: trustedSchemaSvg }}
            />
            {cur.schemaCaption && (
              <figcaption style={{ marginTop: "0.6rem", fontSize: "0.86rem", color: V.textMut, textAlign: "center", lineHeight: 1.4 }}>
                {cur.schemaCaption}
              </figcaption>
            )}
          </figure>
        )}

        {cur.blocks?.map(renderExerciseBlock)}

        <div style={{ marginBottom: "1rem" }}>
          <TextToSpeech compact text={stripHtmlForSpeech([cur.statement, ...cur.questions, cur.consigne].filter(Boolean).join(" "))} />
        </div>

        {aideItems.length > 0 && !showCorr && (
          <div style={{ ...cardStyle, padding: "0.95rem", marginBottom: "1rem", background: V.bgPri }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <p style={{ fontSize: "0.9rem", fontWeight: 800, color: V.text, margin: 0 }}>Aides progressives</p>
              <button
                type="button"
                onClick={() => setVisibleAideCount((value) => Math.min(value + 1, aideItems.length))}
                disabled={visibleAideCount >= aideItems.length}
                style={{
                  minHeight: 36,
                  padding: "0.4rem 0.75rem",
                  border: `1px solid ${visibleAideCount >= aideItems.length ? V.border : V.primary}`,
                  borderRadius: 8,
                  background: visibleAideCount >= aideItems.length ? V.bgSec : V.primaryLt,
                  color: visibleAideCount >= aideItems.length ? V.textMut : V.primary,
                  fontWeight: 800,
                  cursor: visibleAideCount >= aideItems.length ? "not-allowed" : "pointer",
                }}
              >
                Aide suivante
              </button>
            </div>
            {visibleAides.length === 0 && <p style={{ margin: "0.65rem 0 0", color: V.textMut, fontSize: "0.9rem" }}>Essaie seul, puis debloque une aide si tu bloques.</p>}
            <div style={{ display: "grid", gap: "0.55rem", marginTop: visibleAides.length ? "0.75rem" : 0 }}>
              {visibleAides.map((item, index) => (
                <div key={item.key} style={{ border: `1px solid ${V.border}`, borderRadius: 8, background: V.bg, padding: "0.8rem 0.9rem" }}>
                  <p style={{ margin: "0 0 0.35rem", color: V.primary, fontWeight: 800 }}>Aide {index + 1} - {item.label}</p>
                  <MathText text={item.content} block style={{ color: V.text, lineHeight: 1.55 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!showCorr ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {answerType === "qcm" ? (
              <fieldset style={{ border: `1px solid ${V.border}`, borderRadius: 8, padding: "0.8rem 0.9rem", margin: 0 }}>
                <legend style={{ fontSize: "0.88rem", fontWeight: 800, color: V.textSec, padding: "0 0.25rem" }}>{getAnswerLabel(answerType)}</legend>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {cur.choices.map((choice) => (
                    <label key={choice.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.55rem", padding: "0.65rem", border: `1px solid ${selectedChoice === choice.id ? V.primary : V.border}`, borderRadius: 8, background: selectedChoice === choice.id ? V.primaryLt : V.bgPri, cursor: "pointer" }}>
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
                <label htmlFor={answerId} style={{ fontSize: "0.88rem", fontWeight: 800, color: V.textSec }}>{getAnswerLabel(answerType)}</label>
                <input
                  id={answerId}
                  ref={answerRef as Ref<HTMLInputElement>}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Ex. 13 ou 2,5"
                  inputMode="decimal"
                  style={inputStyle}
                  autoFocus
                />
              </>
            ) : (
              <>
                <label htmlFor={answerId} style={{ fontSize: "0.88rem", fontWeight: 800, color: V.textSec }}>{getAnswerLabel(answerType)}</label>
                <textarea
                  id={answerId}
                  ref={answerRef as Ref<HTMLTextAreaElement>}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Ecris ta reponse ici..."
                  style={{ ...inputStyle, resize: "vertical", minHeight: 116 }}
                  rows={4}
                  autoFocus
                />
              </>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {rewarded && <span style={{ fontSize: "0.82rem", color: V.textMut }}>Deja consulte - pas de nouvel XP.</span>}
              <button
                type="button"
                aria-disabled={!answerReady}
                onClick={handleShowCorr}
                style={{
                  minHeight: 42,
                  padding: "0.7rem 1.15rem",
                  background: answerReady ? V.warning : V.textDis,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  cursor: answerReady ? "pointer" : "not-allowed",
                  marginLeft: "auto",
                }}
              >
                Voir la correction
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ padding: "0.85rem 1rem", background: V.bgSec, border: `1px solid ${V.border}`, borderRadius: 8, marginBottom: "0.85rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: V.textMut, textTransform: "uppercase", letterSpacing: 0 }}>Ta reponse</span>
              <p style={{ fontSize: "0.96rem", color: V.textSec, margin: "0.3rem 0 0", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{responseSummary}</p>
            </div>

            <div style={{ padding: "1rem", background: V.successLt, border: `1px solid ${V.success}`, borderRadius: 8, marginBottom: "0.75rem" }}>
              <p style={{ fontWeight: 800, fontSize: "0.98rem", color: V.success, margin: "0 0 0.55rem" }}>Correction essentielle</p>
              {correctionEssential.map((line, index) => (
                <div key={index} style={{ fontSize: "0.96rem", color: V.text, lineHeight: 1.65, margin: "0.3rem 0" }}>
                  <MathText text={line} block />
                </div>
              ))}
            </div>

            {correctionDetailed.length > 0 && (
              <details style={{ ...cardStyle, padding: "0.9rem 1rem", marginBottom: "0.85rem" }}>
                <summary style={{ color: V.text, fontWeight: 800, cursor: "pointer" }}>Correction detaillee</summary>
                <div style={{ marginTop: "0.65rem" }}>
                  {correctionDetailed.map((line, index) => (
                    <div key={index} style={{ fontSize: "0.95rem", color: V.text, lineHeight: 1.65, margin: "0.35rem 0" }}>
                      <MathText text={line} block />
                    </div>
                  ))}
                </div>
              </details>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <TextToSpeech compact text={stripHtmlForSpeech([...correctionEssential, ...correctionDetailed].join(". "))} label="Ecouter la correction" />
            </div>

            {selfEval === null ? (
              <div style={{ marginTop: "0.5rem" }}>
                <p style={{ fontSize: "0.92rem", color: V.textSec, textAlign: "center", marginBottom: "0.75rem", fontWeight: 700 }}>
                  Compare ta reponse avec la correction.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" }}>
                  {([
                    ["incorrect", "Incorrect", V.danger, V.dangerLt, 1],
                    ["partial", "Partiel", V.warning, V.warningLt, 2],
                    ["correct", "Correct", V.success, V.successLt, 3],
                  ] as const).map(([evaluation, label, color, bg, xp]) => (
                    <button
                      key={evaluation}
                      type="button"
                      onClick={() => handleEval(evaluation)}
                      style={{ minHeight: 58, padding: "0.65rem 0.5rem", border: `2px solid ${color}`, borderRadius: 8, background: bg, color, fontSize: "0.86rem", fontWeight: 800, cursor: "pointer" }}
                    >
                      <span>{label}</span>
                      {!rewarded && <span style={{ display: "block", marginTop: "0.18rem", fontSize: "0.72rem", color: V.textMut }}>+{xp} XP</span>}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "0.75rem", background: V.bgSec, borderRadius: 8, fontSize: "0.92rem", color: V.textSec }}>
                {selfEval === "correct" && <p style={{ margin: 0 }}>Marque correct - bravo.</p>}
                {selfEval === "partial" && <p style={{ margin: 0 }}>Marque partiellement correct - tu progresses.</p>}
                {selfEval === "incorrect" && <p style={{ margin: 0 }}>Marque incorrect - relis la correction puis reessaie.</p>}
              </div>
            )}
          </div>
        )}
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.85rem" }}>
        <button type="button" onClick={() => ci > 0 && goTo(ci - 1)} disabled={ci === 0} style={navButtonStyle(ci > 0)}>Precedent</button>
        <button type="button" onClick={() => ci + 1 < filtered.length && goTo(ci + 1)} disabled={ci + 1 >= filtered.length} style={navButtonStyle(ci + 1 < filtered.length)}>Suivant</button>
      </div>

      <div aria-label="Choisir un exercice" style={{ display: "flex", justifyContent: "center", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        {filtered.map((exo, index) => (
          <button
            key={exo.id}
            type="button"
            aria-label={`Afficher l'exercice ${index + 1}`}
            aria-current={index === ci ? "true" : undefined}
            onClick={() => goTo(index)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              fontSize: "0.78rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: index === ci ? V.primary : completedIds.has(exo.id) ? V.successLt : V.bgTer,
              color: index === ci ? "#fff" : V.textSec,
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <XPToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

const metaPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "0.2rem 0.55rem",
  border: `1px solid ${V.border}`,
  borderRadius: 999,
  background: V.bgSec,
  color: V.textSec,
  fontSize: "0.78rem",
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.75rem",
  border: `2px solid ${V.border}`,
  borderRadius: 8,
  background: V.bgPri,
  color: V.text,
  font: "inherit",
  fontSize: "1rem",
  outline: "none",
};

function navButtonStyle(enabled: boolean): CSSProperties {
  return {
    minHeight: 40,
    padding: "0.55rem 1rem",
    border: "none",
    borderRadius: 8,
    background: enabled ? V.bgTer : V.bgSec,
    color: enabled ? V.textSec : V.textDis,
    fontSize: "0.86rem",
    fontWeight: 700,
    cursor: enabled ? "pointer" : "not-allowed",
  };
}
