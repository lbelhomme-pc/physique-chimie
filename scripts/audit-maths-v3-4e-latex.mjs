import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEVEL_ROOT = path.join(ROOT, "src", "data", "mathematiques", "chapters", "college", "4eme");
const EXPECTED_CHAPTERS = 13;
const SUPPORTED_ENVIRONMENTS = new Set(["itemize","enumerate","tabular","array","verbatim","lstlisting","definition","propriete","methode","exemple","attention","remarque","aretenir"]);
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const count = (text, regexp) => [...text.matchAll(regexp)].length;
const correctionText = (exercise) => Array.isArray(exercise.correction) ? exercise.correction.join(" ") : String(exercise.correction ?? "");

function environmentBalance(tex) {
  const begins = new Map();
  const ends = new Map();
  for (const m of tex.matchAll(/\\begin\{([^}]+)\}/g)) begins.set(m[1], (begins.get(m[1]) ?? 0) + 1);
  for (const m of tex.matchAll(/\\end\{([^}]+)\}/g)) ends.set(m[1], (ends.get(m[1]) ?? 0) + 1);
  const names = new Set([...begins.keys(), ...ends.keys()]);
  return [...names].filter((name) => (begins.get(name) ?? 0) !== (ends.get(name) ?? 0)).map((name) => ({ name, begin: begins.get(name) ?? 0, end: ends.get(name) ?? 0 }));
}

const chapterDirs = readdirSync(LEVEL_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(LEVEL_ROOT, entry.name))
  .filter((dir) => existsSync(path.join(dir, "meta.json")))
  .sort();

const errors = [];
const metrics = [];

for (const dir of chapterDirs) {
  const slug = path.basename(dir);
  const meta = readJson(path.join(dir, "meta.json"));
  const texFile = path.join(dir, "cours.tex");
  const exercisesFile = path.join(dir, "exercices.json");
  const quizFile = path.join(dir, "quiz.json");
  const flashFile = path.join(dir, "flashcards.json");

  if (meta.courseFormat !== "latex") errors.push(slug + ": courseFormat != latex");
  if (meta.courseSource !== "cours.tex") errors.push(slug + ": courseSource != cours.tex");
  if (Number(meta.courseFormatVersion) !== 3) errors.push(slug + ": courseFormatVersion != 3");
  if (Number(meta.courseQualityVersion) !== 3) errors.push(slug + ": courseQualityVersion != 3");
  if (Number(meta.contentQualityVersion) !== 3) errors.push(slug + ": contentQualityVersion != 3");
  if (!Array.isArray(meta.objectives) || meta.objectives.length < 4) errors.push(slug + ": moins de 4 objectifs");
  if (!Array.isArray(meta.curriculumItems) || meta.curriculumItems.length < 4) errors.push(slug + ": curriculumItems insuffisants");

  for (const file of [texFile, exercisesFile, quizFile, flashFile]) {
    if (!existsSync(file)) errors.push(slug + ": fichier absent -> " + path.basename(file));
  }
  if (![texFile, exercisesFile, quizFile, flashFile].every(existsSync)) continue;

  const tex = readFileSync(texFile, "utf8");
  const normalized = tex.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const significant = tex.replace(/\s+/g, " ").trim().length;
  const sections = count(tex, /^\\section\*?\{.+\}\s*$/gm);
  const displayOpen = count(tex, /^\\\[\s*$/gm);
  const displayClose = count(tex, /^\\\]\s*$/gm);
  const figures = count(tex, /^\\coursefigure\{/gm);
  const environments = [...new Set([...tex.matchAll(/\\begin\{([^}]+)\}/g)].map((m) => m[1]))];

  if (significant < 7000) errors.push(slug + ": cours trop court (" + significant + " < 7000)");
  if (sections < 6) errors.push(slug + ": moins de 6 sections");
  if (figures < 2) errors.push(slug + ": moins de 2 figures pédagogiques");
  if (displayOpen !== displayClose) errors.push(slug + ": blocs \\[...\\] déséquilibrés");
  if (!/^\\section\*?\{Objectifs\}/m.test(tex)) errors.push(slug + ": section Objectifs absente");
  if (!/^\\section\*?\{.*Erreurs? frequentes.*\}/mi.test(normalized)) errors.push(slug + ": section Erreurs fréquentes absente");
  if (!/^\\section\*?\{.*A retenir.*\}/mi.test(normalized)) errors.push(slug + ": section À retenir absente");

  for (const issue of environmentBalance(tex)) errors.push(slug + ": environnement " + issue.name + " déséquilibré (" + issue.begin + "/" + issue.end + ")");
  for (const env of environments) if (!SUPPORTED_ENVIRONMENTS.has(env)) errors.push(slug + ": environnement non supporté -> " + env);
  const forbidden = [["titre Markdown", /^#{1,6}\s+/m],["gras Markdown", /\*\*[^*]+\*\*/],["bloc Markdown", /```/],["figure HTML", /<(?:figure|img|svg|figcaption)\b/i]];
  for (const [label, regexp] of forbidden) if (regexp.test(tex)) errors.push(slug + ": résidu " + label);

  const exercises = readJson(exercisesFile).exercices ?? [];
  const levels = { N1: 0, N2: 0, N3: 0 };
  const exerciseIds = new Set();
  let developed = 0;
  if (exercises.length !== 12) errors.push(slug + ": " + exercises.length + " exercices au lieu de 12");
  for (const exercise of exercises) {
    if (levels[exercise.level] !== undefined) levels[exercise.level] += 1;
    else errors.push(slug + ": niveau exercice invalide -> " + exercise.id);
    if (exerciseIds.has(exercise.id)) errors.push(slug + ": id exercice dupliqué -> " + exercise.id);
    exerciseIds.add(exercise.id);
    const statementLength = String(exercise.statement ?? "").trim().length;
    const correctionLength = correctionText(exercise).trim().length;
    const minStatement = exercise.level === "N1" ? 12 : exercise.level === "N2" ? 20 : 45;
    const minCorrection = exercise.level === "N1" ? 18 : exercise.level === "N2" ? 40 : 70;
    if (statementLength < minStatement) errors.push(slug + ": énoncé trop court -> " + exercise.id + " (" + statementLength + " < " + minStatement + ")");
    if (correctionLength < minCorrection) errors.push(slug + ": correction trop courte -> " + exercise.id + " (" + correctionLength + " < " + minCorrection + ")");
    if ((exercise.level === "N2" || exercise.level === "N3") && statementLength >= 80 && correctionLength >= 100) developed += 1;
  }
  for (const level of ["N1","N2","N3"]) if (levels[level] !== 4) errors.push(slug + ": " + level + "=" + levels[level] + " au lieu de 4");
  if (developed < 4) errors.push(slug + ": seulement " + developed + " problèmes N2/N3 développés (< 4)");

  const quiz = readJson(quizFile).questions ?? [];
  const quizIds = new Set();
  if (quiz.length < 10) errors.push(slug + ": quiz insuffisant (" + quiz.length + " < 10)");
  for (const item of quiz) {
    if (quizIds.has(item.id)) errors.push(slug + ": id quiz dupliqué -> " + item.id);
    quizIds.add(item.id);
    if (!Array.isArray(item.choices) || item.choices.length < 2) errors.push(slug + ": choix quiz insuffisants -> " + item.id);
    if (String(item.explanation ?? "").trim().length < 20) errors.push(slug + ": explication quiz trop courte -> " + item.id);
  }

  const cards = readJson(flashFile).cards ?? [];
  const flashIds = new Set();
  if (cards.length < 12) errors.push(slug + ": flashcards insuffisantes (" + cards.length + " < 12)");
  for (const card of cards) {
    if (flashIds.has(card.id)) errors.push(slug + ": id flashcard dupliqué -> " + card.id);
    flashIds.add(card.id);
    if (String(card.front ?? "").trim().length < 2 || String(card.back ?? "").trim().length < 2) errors.push(slug + ": flashcard vide -> " + card.id);
  }

  metrics.push({ slug, significant, sections, figures, exercises: exercises.length, levels, developed, quiz: quiz.length, flashcards: cards.length });
}

if (chapterDirs.length !== EXPECTED_CHAPTERS) errors.push("4e: " + chapterDirs.length + " chapitres trouvés au lieu de " + EXPECTED_CHAPTERS);

console.log("Audit Mathématiques V3 — 4e complète");
for (const item of metrics) console.log("- " + item.slug + ": " + item.significant + " car., " + item.figures + " figures, ex " + item.exercises + " (" + item.levels.N1 + "/" + item.levels.N2 + "/" + item.levels.N3 + "), problèmes développés " + item.developed + ", quiz " + item.quiz + ", flash " + item.flashcards);

if (errors.length) {
  console.error("\nECHEC — " + errors.length + " anomalie(s)");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

console.log("\nOK — les 13 chapitres de 4e satisfont le contrat pédagogique V3.");
