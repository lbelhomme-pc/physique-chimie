import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SIXIEME_ROOT = path.join(ROOT, "src", "data", "mathematiques", "chapters", "college", "6eme");

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const count = (text, regexp) => [...text.matchAll(regexp)].length;

function environmentBalance(tex) {
  const begins = new Map();
  const ends = new Map();
  for (const match of tex.matchAll(/\\begin\{([^}]+)\}/g)) begins.set(match[1], (begins.get(match[1]) ?? 0) + 1);
  for (const match of tex.matchAll(/\\end\{([^}]+)\}/g)) ends.set(match[1], (ends.get(match[1]) ?? 0) + 1);
  const names = new Set([...begins.keys(), ...ends.keys()]);
  return [...names].filter((name) => (begins.get(name) ?? 0) !== (ends.get(name) ?? 0)).map((name) => ({
    name, begin: begins.get(name) ?? 0, end: ends.get(name) ?? 0,
  }));
}

const chapterDirs = readdirSync(SIXIEME_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(SIXIEME_ROOT, entry.name))
  .filter((dir) => existsSync(path.join(dir, "meta.json")))
  .sort();

const errors = [];
const metrics = [];

for (const dir of chapterDirs) {
  const slug = path.basename(dir);
  const meta = readJson(path.join(dir, "meta.json"));
  const texFile = path.join(dir, "cours.tex");

  if (meta.courseFormat !== "latex") errors.push(slug + ": courseFormat != latex");
  if (meta.courseSource !== "cours.tex") errors.push(slug + ": courseSource != cours.tex");
  if (Number(meta.courseFormatVersion) !== 3) errors.push(slug + ": courseFormatVersion != 3");
  if (Number(meta.courseQualityVersion) !== 3) errors.push(slug + ": courseQualityVersion != 3");
  if (!existsSync(texFile)) { errors.push(slug + ": cours.tex absent"); continue; }

  const tex = readFileSync(texFile, "utf8");
  const significant = tex.replace(/\s+/g, " ").trim().length;
  const sections = count(tex, /^\\section\*?\{.+\}\s*$/gm);
  const displayOpen = count(tex, /^\\\[\s*$/gm);
  const displayClose = count(tex, /^\\\]\s*$/gm);
  const figures = count(tex, /^\\coursefigure\{/gm);
  const verbatim = count(tex, /^\\begin\{(?:verbatim|lstlisting)\}/gm);

  if (significant < 7000) errors.push(slug + ": cours trop court (" + significant + " < 7000)");
  if (sections < 6) errors.push(slug + ": sections LaTeX insuffisantes (" + sections + " < 6)");
  if (displayOpen !== displayClose) errors.push(slug + ": blocs \\[ ... \\] desequilibres");
  if (figures < 2) errors.push(slug + ": figures pedagogiques insuffisantes (" + figures + " < 2)");
  if (!/^\\section\*?\{Objectifs\}/m.test(tex)) errors.push(slug + ": section Objectifs absente");
  if (!/^\\section\*?\{.*Erreurs? frequentes.*\}/mi.test(tex.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) errors.push(slug + ": section Erreurs frequentes absente");
  if (!/^\\section\*?\{.*A retenir.*\}/mi.test(tex.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) errors.push(slug + ": section A retenir absente");

  for (const issue of environmentBalance(tex)) {
    errors.push(slug + ": environnement " + issue.name + " desequilibre (" + issue.begin + "/" + issue.end + ")");
  }

  const forbidden = [
    ["titre Markdown", /^#{1,6}\s+/m],
    ["gras Markdown", /\*\*[^*]+\*\*/],
    ["bloc Markdown", /```/],
    ["citation Markdown", /^>\s+/m],
    ["figure HTML", /<(?:figure|img|figcaption)\b/i],
  ];
  for (const [label, regexp] of forbidden) if (regexp.test(tex)) errors.push(slug + ": residu " + label);

  metrics.push({ slug, significant, sections, displayMath: displayOpen, figures, verbatim });
}

if (chapterDirs.length !== 13) errors.push("6e: " + chapterDirs.length + " chapitres trouves au lieu de 13");

console.log("Audit Mathématiques V3 — sources LaTeX 6e");
for (const item of metrics) {
  console.log("- " + item.slug + ": " + item.significant + " car., " + item.sections + " sections, " + item.displayMath + " blocs maths, " + item.figures + " figures, " + item.verbatim + " verbatim");
}

if (errors.length) {
  console.error("\nECHEC — " + errors.length + " anomalie(s)");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

console.log("\nOK — les 13 cours de 6e utilisent une source LaTeX V3 cohérente.");
