import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHAPTER_ROOT = path.join(ROOT, "src", "data", "mathematiques", "chapters");

const asArray = (value, keys) => {
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return [];
};

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

function findChapterDirs(root) {
  const result = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;
      if (existsSync(path.join(full, "meta.json"))) result.push(full);
      else walk(full);
    }
  };
  walk(root);
  return result.sort();
}

function textLength(value) {
  return value.replace(/\s+/g, " ").trim().length;
}

function countMatches(text, regexp) {
  return [...text.matchAll(regexp)].length;
}

function stripLatexMath(value) {
  return String(value ?? "")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ")
    .replace(/\\\([\s\S]*?\\\)/g, " ")
    .replace(/\\\[[\s\S]*?\\\]/g, " ");
}

function rawMathIssue(value) {
  const remaining = stripLatexMath(value);
  const suspicious = remaining.match(/(?:\d+[.,]\d+|\d+\s*%|\d+\s*[×÷=<>≈≤≥+−*\/]\s*\d+|[A-Za-z]\s*[∩∪=<>≈≤≥]\s*[A-Za-z0-9]|[∩∪√∞])/u);
  return suspicious?.[0] ?? null;
}

function correctionText(correction) {
  if (typeof correction === "string") return correction.trim();
  if (Array.isArray(correction)) return correction.map(String).join(" ").trim();
  if (correction && typeof correction === "object") return JSON.stringify(correction);
  return "";
}

function levelOf(exercise) {
  const value = exercise?.level ?? exercise?.niveau ?? exercise?.difficulty ?? exercise?.difficulte ?? "";
  const normalized = String(value).toUpperCase();
  if (normalized.includes("N1") || normalized === "1" || normalized.includes("INITIATION")) return "N1";
  if (normalized.includes("N2") || normalized === "2" || normalized.includes("ENTRAINEMENT")) return "N2";
  if (normalized.includes("N3") || normalized === "3" || normalized.includes("APPROFONDISSEMENT") || normalized.includes("EXPERT")) return "N3";
  return "OTHER";
}

function validateCourse(course, cycle) {
  const errors = [];
  const minChars = cycle === "college" ? 7000 : 9000;
  const minDisplayMath = cycle === "college" ? 4 : 6;
  const significant = textLength(course);
  const headings = countMatches(course, /^#{2,4}\s+.+$/gm);
  const displayMath = countMatches(course, /\$\$[\s\S]*?\$\$/g);
  const examples = countMatches(course, /^#{2,4}\s+.*exemple/gim);
  const visualCount = countMatches(course, /<(svg|img)\b/gi);
  const hasPedagogicalVisual = /<(svg|img)\b[^>]*(aria-label|alt)=["'][^"']*(graph|courbe|repère|histogramme|nuage|diagramme|arbre|droite|figure|schéma|representation|représentation)/i.test(course);
  const svgBlocks = [...course.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)].map((match) => match[0]);
  const inaccessibleSvg = svgBlocks.filter((svg) => !/role=["']img["']/i.test(svg) || !/aria-label=["'][^"']+["']/i.test(svg));

  if (significant < minChars) errors.push("cours: " + significant + " caractères < " + minChars);
  if (headings < 6) errors.push("cours: " + headings + " sections < 6");
  if (displayMath < minDisplayMath) errors.push("cours: " + displayMath + " blocs LaTeX affichés < " + minDisplayMath);
  if (examples < 2) errors.push("cours: " + examples + " exemples développés < 2");
  if (visualCount < 2) errors.push("cours: " + visualCount + " visuel(s) mathématique(s) < 2");
  if (!hasPedagogicalVisual) errors.push("cours: aucun graphique/schéma/figure mathématique identifiable par son alternative accessible");
  if (inaccessibleSvg.length) errors.push("cours: " + inaccessibleSvg.length + " SVG sans role=img et aria-label");
  if (!/^#{2,4}\s+.*méthode/im.test(course)) errors.push("cours: section méthode absente");
  if (!/^#{2,4}\s+.*erreurs? fréquentes?/im.test(course)) errors.push("cours: section erreurs fréquentes absente");
  if (!/^#{2,4}\s+.*(à retenir|synthèse)/im.test(course)) errors.push("cours: synthèse / À retenir absente");

  return {
    errors,
    metrics: { significant, headings, displayMath, examples, visuals: visualCount },
  };
}

function validateLatexFields(label, fields, errors) {
  for (const [field, value] of fields) {
    if (typeof value !== "string") continue;
    const issue = rawMathIssue(value);
    if (issue) errors.push(label + ": écriture mathématique hors LaTeX dans " + field + " -> " + issue);
  }
}

function validateExercises(raw) {
  const exercises = asArray(raw, ["exercices", "exercises"]);
  const errors = [];
  const levels = { N1: 0, N2: 0, N3: 0, OTHER: 0 };
  const ids = new Set();
  const pedagogicalTypes = new Set();
  const skillsCovered = new Set();
  let visualExercises = 0;

  for (const exercise of exercises) {
    const id = exercise?.id ?? "(sans id)";
    const level = levelOf(exercise);
    levels[level] += 1;

    if (exercise?.id) {
      if (ids.has(exercise.id)) errors.push("exercices: id dupliqué " + exercise.id);
      ids.add(exercise.id);
    }

    const statement = String(exercise?.statement ?? "").trim();
    const questions = Array.isArray(exercise?.questions)
      ? exercise.questions
          .map((question) => typeof question === "string" ? question : question?.text ?? question?.question ?? "")
          .filter((question) => String(question).trim())
      : [];
    const correctionLines = Array.isArray(exercise?.correction) ? exercise.correction : [exercise?.correction].filter(Boolean);
    const correction = correctionText(exercise?.correction);
    const skills = Array.isArray(exercise?.skills) ? exercise.skills : Array.isArray(exercise?.competences) ? exercise.competences : [];
    const curriculumItems = Array.isArray(exercise?.curriculumItems) ? exercise.curriculumItems.filter(Boolean) : [];
    const pedagogicalType = String(exercise?.pedagogicalType ?? "").trim();

    if (pedagogicalType) pedagogicalTypes.add(pedagogicalType);
    for (const skill of skills) skillsCovered.add(typeof skill === "string" ? skill : skill?.label);

    const hasVisual =
      Boolean(exercise?.schemaSvg) ||
      (Array.isArray(exercise?.blocks) && exercise.blocks.some((block) => ["diagram", "graph", "schema", "svg", "table"].includes(String(block?.type ?? "").toLowerCase())));
    if (hasVisual) visualExercises += 1;

    const minStatement = level === "N3" ? 120 : level === "N2" ? 80 : 45;
    if (statement.length < minStatement) {
      errors.push("exercices " + id + ": énoncé " + statement.length + " caractères < " + minStatement + " pour " + level);
    }

    const minQuestions = level === "N3" ? 3 : level === "N2" ? 2 : 1;
    if (questions.length < minQuestions) {
      errors.push("exercices " + id + ": " + questions.length + " question(s) < " + minQuestions + " pour " + level);
    }

    if (!pedagogicalType) errors.push("exercices " + id + ": pedagogicalType absent");
    if (curriculumItems.length === 0) errors.push("exercices " + id + ": aucun curriculumItem");
    if (skills.length === 0) errors.push("exercices " + id + ": aucune compétence");
    if (!exercise?.estimatedTime) errors.push("exercices " + id + ": durée indicative absente");

    const minCorrection = level === "N3" ? 220 : level === "N2" ? 140 : 80;
    if (correction.length < minCorrection) {
      errors.push("exercices " + id + ": correction " + correction.length + " caractères < " + minCorrection + " pour " + level);
    }
    if (correctionLines.length < questions.length) {
      errors.push("exercices " + id + ": correction non structurée question par question");
    }

    if (level === "N2") {
      const actionCount = new Set(skills.map(String)).size;
      if (actionCount < 2) errors.push("exercices " + id + ": N2 mobilise moins de 2 compétences/actions");
    }

    if (level === "N3") {
      const highLevel = new Set(["chercher", "raisonner", "modéliser", "communiquer"]);
      if (!skills.some((skill) => highLevel.has(String(skill)))) {
        errors.push("exercices " + id + ": N3 sans compétence de raisonnement/modélisation/communication");
      }
      if (!questions.some((question) => /(justif|expli|interpr|compar|conclu|vérif|contrôl|décid|propos)/i.test(String(question)))) {
        errors.push("exercices " + id + ": N3 sans question de justification/interprétation/décision");
      }
    }

    validateLatexFields("exercices " + id, [
      ["statement", exercise?.statement],
      ["consigne", exercise?.consigne],
      ...questions.map((value, index) => ["questions[" + index + "]", value]),
      ["hint clue", exercise?.hints?.clue],
      ["hint method", exercise?.hints?.method],
      ["hint reminder", exercise?.hints?.reminder],
      ["hint commonMistake", exercise?.hints?.commonMistake],
      ...correctionLines.map((value, index) => ["correction[" + index + "]", value]),
    ], errors);
  }

  if (exercises.length < 12) errors.push("exercices: " + exercises.length + " < 12");
  for (const level of ["N1", "N2", "N3"]) {
    if (levels[level] < 4) errors.push("exercices: " + levels[level] + " " + level + " < 4");
  }

  if (pedagogicalTypes.size < 4) {
    errors.push("exercices: " + pedagogicalTypes.size + " types pédagogiques distincts < 4");
  }

  const canonicalSkills = ["chercher", "modéliser", "représenter", "raisonner", "calculer", "communiquer"];
  const canonicalCovered = canonicalSkills.filter((skill) => skillsCovered.has(skill));
  if (canonicalCovered.length < 5) {
    errors.push("exercices: seulement " + canonicalCovered.length + "/6 compétences mathématiques couvertes");
  }

  if (visualExercises < 2) {
    errors.push("exercices: " + visualExercises + " exercice(s) exploitant un support visuel < 2");
  }

  return {
    errors,
    metrics: {
      total: exercises.length,
      levels,
      pedagogicalTypes: [...pedagogicalTypes].sort(),
      skillsCovered: [...skillsCovered].filter(Boolean).sort(),
      visualExercises,
    },
  };
}

function validateQuiz(raw) {
  const questions = asArray(raw, ["questions", "quiz"]);
  const errors = [];
  const ids = new Set();

  for (const question of questions) {
    if (question?.id) {
      if (ids.has(question.id)) errors.push("quiz: id dupliqué " + question.id);
      ids.add(question.id);
    }
    if (String(question?.question ?? "").trim().length < 15) {
      errors.push("quiz: question trop courte " + (question?.id ?? "(sans id)"));
    }
    if (String(question?.explanation ?? question?.feedback ?? "").trim().length < 20) {
      errors.push("quiz: explication manquante/insuffisante " + (question?.id ?? "(sans id)"));
    }
    validateLatexFields("quiz " + (question?.id ?? "(sans id)"), [
      ["question", question?.question],
      ["explanation", question?.explanation ?? question?.feedback],
      ...((question?.choices ?? []).map((value, index) => ["choices[" + index + "]", value])),
    ], errors);
  }

  if (questions.length < 10) errors.push("quiz: " + questions.length + " < 10");
  return { errors, metrics: { total: questions.length } };
}

function validateFlashcards(raw) {
  const cards = asArray(raw, ["cards", "flashcards"]);
  const errors = [];
  const ids = new Set();

  for (const card of cards) {
    if (card?.id) {
      if (ids.has(card.id)) errors.push("flashcards: id dupliqué " + card.id);
      ids.add(card.id);
    }
    const front = String(card?.front ?? card?.recto ?? card?.question ?? "").trim();
    const back = String(card?.back ?? card?.verso ?? card?.answer ?? "").trim();
    if (front.length < 5 || back.length < 10) {
      errors.push("flashcards: carte trop pauvre " + (card?.id ?? "(sans id)"));
    }
    validateLatexFields("flashcards " + (card?.id ?? "(sans id)"), [
      ["front", front],
      ["back", back],
    ], errors);
  }

  if (cards.length < 12) errors.push("flashcards: " + cards.length + " < 12");
  return { errors, metrics: { total: cards.length } };
}

function validateMeta(meta) {
  const errors = [];
  if (meta.contentQualityVersion !== 2) return errors;
  if (!meta.officialSource) errors.push("meta: officialSource absent");
  if (!meta.programmeVersion) errors.push("meta: programmeVersion absent");
  if (!Array.isArray(meta.curriculumItems) || meta.curriculumItems.length < 3) errors.push("meta: moins de 3 curriculumItems");
  if (!Array.isArray(meta.objectives) || meta.objectives.length < 4) errors.push("meta: moins de 4 objectifs");
  const competencies = meta.competencies ?? meta.competences;
  if (!Array.isArray(competencies) || competencies.length < 3) errors.push("meta: compétences insuffisantes");
  if (!Array.isArray(meta.prerequisites) || meta.prerequisites.length < 1) errors.push("meta: prérequis absents");
  return errors;
}

export function auditMathsV2(root = CHAPTER_ROOT) {
  const chapters = findChapterDirs(root);
  const rows = [];

  for (const dir of chapters) {
    const meta = readJson(path.join(dir, "meta.json"));
    const qualityVersion = meta.contentQualityVersion ?? 1;
    const relative = path.relative(CHAPTER_ROOT, dir).replaceAll("\\", "/");
    const row = {
      relative,
      cycle: meta.cycle ?? relative.split("/")[0],
      level: meta.niveau ?? relative.split("/")[1],
      slug: meta.slug ?? path.basename(dir),
      qualityVersion,
      errors: [],
      metrics: {},
    };

    if (qualityVersion === 2) {
      for (const name of ["cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]) {
        if (!existsSync(path.join(dir, name))) row.errors.push("fichier absent: " + name);
      }

      row.errors.push(...validateMeta(meta));

      if (existsSync(path.join(dir, "cours.mdx"))) {
        const result = validateCourse(readFileSync(path.join(dir, "cours.mdx"), "utf8"), row.cycle);
        row.errors.push(...result.errors);
        row.metrics.course = result.metrics;
      }
      if (existsSync(path.join(dir, "exercices.json"))) {
        const result = validateExercises(readJson(path.join(dir, "exercices.json")));
        row.errors.push(...result.errors);
        row.metrics.exercises = result.metrics;
      }
      if (existsSync(path.join(dir, "quiz.json"))) {
        const result = validateQuiz(readJson(path.join(dir, "quiz.json")));
        row.errors.push(...result.errors);
        row.metrics.quiz = result.metrics;
      }
      if (existsSync(path.join(dir, "flashcards.json"))) {
        const result = validateFlashcards(readJson(path.join(dir, "flashcards.json")));
        row.errors.push(...result.errors);
        row.metrics.flashcards = result.metrics;
      }
    }

    rows.push(row);
  }

  const v2 = rows.filter((row) => row.qualityVersion === 2);
  return {
    rows,
    summary: {
      total: rows.length,
      v1: rows.length - v2.length,
      v2: v2.length,
      v2Valid: v2.filter((row) => row.errors.length === 0).length,
      v2Invalid: v2.filter((row) => row.errors.length > 0).length,
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = auditMathsV2();
  console.log("Mathématiques V2 : " + audit.summary.v2 + "/" + audit.summary.total + " chapitres migrés");
  console.log("V2 valides : " + audit.summary.v2Valid + " ; V2 invalides : " + audit.summary.v2Invalid);
  for (const row of audit.rows.filter((item) => item.qualityVersion === 2 && item.errors.length)) {
    console.log("\n[" + row.relative + "]");
    for (const error of row.errors) console.log("- " + error);
  }
  process.exitCode = audit.summary.v2Invalid > 0 ? 1 : 0;
}
