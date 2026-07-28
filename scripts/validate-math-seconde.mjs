import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "src", "data", "mathematiques", "chapters", "lycee", "2nde");
const requiredFiles = ["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"];
const seenIds = new Set();
const errors = [];

function fail(message) {
  errors.push(message);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function checkUnique(id, context) {
  if (!id) fail(`${context}: identifiant manquant`);
  if (seenIds.has(id)) fail(`${context}: identifiant dupliqué ${id}`);
  seenIds.add(id);
}

const entries = await readdir(base, { withFileTypes: true });
const chapterDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

if (chapterDirs.length < 10) {
  fail(`Nombre de chapitres insuffisant: ${chapterDirs.length}`);
}

for (const slug of chapterDirs) {
  const dir = path.join(base, slug);
  for (const file of requiredFiles) {
    try {
      await readFile(path.join(dir, file), "utf8");
    } catch {
      fail(`${slug}: fichier manquant ${file}`);
    }
  }

  const meta = await readJson(path.join(dir, "meta.json"));
  const course = await readFile(path.join(dir, "cours.mdx"), "utf8");
  const exercises = (await readJson(path.join(dir, "exercices.json"))).exercices ?? [];
  const quiz = (await readJson(path.join(dir, "quiz.json"))).questions ?? [];
  const cards = (await readJson(path.join(dir, "flashcards.json"))).cards ?? [];

  if (meta.slug !== slug) fail(`${slug}: meta.slug incohérent`);
  if (!meta.title || !meta.description || !meta.domain) fail(`${slug}: métadonnées incomplètes`);
  if (!course.includes("## Objectifs") || !course.includes("<svg")) fail(`${slug}: cours incomplet ou sans SVG`);
  if (exercises.length < 5) fail(`${slug}: moins de 5 exercices`);
  if (quiz.length < 4) fail(`${slug}: moins de 4 questions de quiz`);
  if (cards.length < 4) fail(`${slug}: moins de 4 flashcards`);

  for (const exercise of exercises) {
    checkUnique(exercise.id, `${slug}/exercice`);
    if (!exercise.statement && !exercise.consigne) fail(`${slug}/${exercise.id}: énoncé manquant`);
    if (!Array.isArray(exercise.correction) || exercise.correction.length < 2) fail(`${slug}/${exercise.id}: correction trop courte`);
  }

  for (const question of quiz) {
    checkUnique(question.id, `${slug}/quiz`);
    if (!Array.isArray(question.choices) || question.choices.length < 3) fail(`${slug}/${question.id}: choix insuffisants`);
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.choices.length) {
      fail(`${slug}/${question.id}: réponse invalide`);
    }
    if (!question.explanation) fail(`${slug}/${question.id}: explication manquante`);
  }

  for (const card of cards) {
    checkUnique(card.id, `${slug}/flashcard`);
    if (!card.front || !card.back) fail(`${slug}/${card.id}: flashcard incomplète`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validation mathématiques seconde OK: ${chapterDirs.length} chapitres, ${seenIds.size} objets pédagogiques.`);
