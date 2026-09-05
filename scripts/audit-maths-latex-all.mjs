import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHAPTERS_ROOT = path.join(ROOT, "src", "data", "mathematiques", "chapters");

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(CHAPTERS_ROOT);
const metas = files.filter((file) => file.endsWith(path.sep + "meta.json"));
const texFiles = new Set(files.filter((file) => file.endsWith(path.sep + "cours.tex")));
const errors = [];
const metrics = [];

function relative(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function count(text, regexp) {
  return [...text.matchAll(regexp)].length;
}

function environmentBalance(tex) {
  const begins = new Map();
  const ends = new Map();
  for (const match of tex.matchAll(/\\begin\{([^}]+)\}/g)) {
    begins.set(match[1], (begins.get(match[1]) ?? 0) + 1);
  }
  for (const match of tex.matchAll(/\\end\{([^}]+)\}/g)) {
    ends.set(match[1], (ends.get(match[1]) ?? 0) + 1);
  }
  const names = new Set([...begins.keys(), ...ends.keys()]);
  return [...names]
    .filter((name) => (begins.get(name) ?? 0) !== (ends.get(name) ?? 0))
    .map((name) => ({
      name,
      begin: begins.get(name) ?? 0,
      end: ends.get(name) ?? 0,
    }));
}

for (const metaFile of metas) {
  const dir = path.dirname(metaFile);
  const texFile = path.join(dir, "cours.tex");
  const chapter = relative(dir);

  if (!texFiles.has(texFile)) {
    errors.push(chapter + ": cours.tex absent");
    continue;
  }

  const tex = readFileSync(texFile, "utf8");
  const sections = count(tex, /^\\section\*?\{.+\}\s*$/gm);
  const displayOpen = count(tex, /^\\\[\s*$/gm);
  const displayClose = count(tex, /^\\\]\s*$/gm);
  const figures = count(tex, /^\\coursefigure\{/gm);

  if (!tex.trim()) errors.push(chapter + ": cours.tex vide");
  if (sections < 1) errors.push(chapter + ": aucune section LaTeX");
  if (displayOpen !== displayClose) {
    errors.push(chapter + ": blocs \\[ ... \\] déséquilibrés (" + displayOpen + "/" + displayClose + ")");
  }

  for (const issue of environmentBalance(tex)) {
    errors.push(chapter + ": environnement " + issue.name + " déséquilibré (" + issue.begin + " begin / " + issue.end + " end)");
  }

  const forbidden = [
    ["titre Markdown", /^#{1,6}\s+/m],
    ["gras Markdown", /\*\*[^*]+\*\*/],
    ["bloc Markdown", /```/],
    ["table Markdown", /^\s*\|.+\|\s*$/m],
    ["figure HTML", /<(?:figure|img|svg|figcaption)\b/i],
    ["composant MDX", /<[A-Z][A-Za-z0-9]*\b/],
  ];

  for (const [label, regexp] of forbidden) {
    if (regexp.test(tex)) errors.push(chapter + ": résidu " + label);
  }

  metrics.push({
    chapter,
    chars: tex.replace(/\s+/g, " ").trim().length,
    sections,
    figures,
  });
}

const orphanTex = [...texFiles].filter((file) => !existsSync(path.join(path.dirname(file), "meta.json")));

console.log("Audit global Mathématiques — contrat cours.tex");
console.log("- chapitres déclarés : " + metas.length);
console.log("- cours.tex déclarés : " + metrics.length);
console.log("- cours.tex orphelins : " + orphanTex.length);
console.log("- figures référencées depuis LaTeX : " + metrics.reduce((sum, item) => sum + item.figures, 0));
console.log("- caractères éditoriaux : " + metrics.reduce((sum, item) => sum + item.chars, 0));

if (orphanTex.length) {
  for (const file of orphanTex) console.log("  info: cours.tex sans meta.json -> " + relative(file));
}

if (errors.length) {
  console.error("\nECHEC — " + errors.length + " anomalie(s)");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

console.log("\nOK — chaque chapitre de mathématiques déclaré possède un cours.tex sans résidu MDX/HTML.");
