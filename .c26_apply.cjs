const fs = require("node:fs");
const path = require("node:path");

function mustReplace(text, search, replacement, label) {
  if (!text.includes(search)) throw new Error("C26 guard update failed: missing " + label);
  return text.replace(search, replacement);
}

const mappingPath = "src/data/mathematiques/programmes/terminale-specialite-2019.part-a.mapping.json";
const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));
if (!Array.isArray(mapping.chapters) || mapping.chapters.length !== 8) {
  throw new Error("C26 mapping must contain exactly 8 chapters");
}

const chapterRoot = "src/data/mathematiques/chapters/lycee/terminale-specialite-mathematiques";
for (const slug of mapping.chapters) {
  const mdx = path.join(chapterRoot, slug, "cours.mdx");
  if (fs.existsSync(mdx)) fs.rmSync(mdx);
  for (const file of ["meta.json", "cours.tex", "exercices.json", "quiz.json", "flashcards.json"]) {
    if (!fs.existsSync(path.join(chapterRoot, slug, file))) {
      throw new Error("Missing generated C26 file: " + slug + "/" + file);
    }
  }
}

const testPath = "tests/c26-mathematiques-terminale-specialite-a.test.mjs";
let test = fs.readFileSync(testPath, "utf8");
test = mustReplace(
  test,
  '["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]',
  '["meta.json", "cours.tex", "exercices.json", "quiz.json", "flashcards.json"]',
  "C26 required file list"
);
test = mustReplace(test, "assert.equal(exercices.length, 6);", "assert.equal(exercices.length, 12);", "exercise count");
test = mustReplace(test, "{ N1:2, N2:2, N3:2 },", "{ N1:4, N2:4, N3:4 },", "exercise distribution");
test = mustReplace(test, "assert.equal(quizPayload.questions.length, 5);", "assert.equal(quizPayload.questions.length, 10);", "quiz count");
test = mustReplace(test, "assert.equal(flashcardsPayload.cards.length, 6);", "assert.equal(flashcardsPayload.cards.length, 12);", "flashcard count");
test = mustReplace(test, 'path.join(dir, "cours.mdx")', 'path.join(dir, "cours.tex")', "course path");
test = mustReplace(test, 'courseFormat: "mdx"', 'courseFormat: "latex"', "course format");

const anchor = 'assert.equal(meta.programmeVersion, "mathematiques-terminale-specialite-2019");';
if (!test.includes('assert.equal(meta.courseFormat, "latex");')) {
  test = mustReplace(
    test,
    anchor,
    anchor +
      '\n      assert.equal(meta.courseFormat, "latex");' +
      '\n      assert.equal(meta.courseSource, "cours.tex");' +
      '\n      assert.equal(meta.courseFormatVersion, 3);' +
      '\n      assert.equal(meta.courseQualityVersion, 3);' +
      '\n      assert.equal(meta.contentQualityVersion, 3);' +
      '\n      assert.ok(Array.isArray(meta.curriculumItems) && meta.curriculumItems.length >= 4);',
    "meta V3 assertions"
  );
}
fs.writeFileSync(testPath, test);

let audit = fs.readFileSync("scripts/audit-maths-v3-3e-latex.mjs", "utf8");
audit = mustReplace(
  audit,
  'import { existsSync, readFileSync, readdirSync } from "node:fs";',
  'import { existsSync, readFileSync } from "node:fs";',
  "audit fs import"
);
audit = mustReplace(
  audit,
  'const LEVEL_ROOT = path.join(ROOT, "src", "data", "mathematiques", "chapters", "college", "3eme");',
  'const LEVEL_ROOT = path.join(ROOT, "src", "data", "mathematiques", "chapters", "lycee", "terminale-specialite-mathematiques");\nconst MAPPING_FILE = path.join(ROOT, "src", "data", "mathematiques", "programmes", "terminale-specialite-2019.part-a.mapping.json");',
  "audit root"
);
audit = mustReplace(audit, "const EXPECTED_CHAPTERS = 13;", "const EXPECTED_CHAPTERS = 8;", "audit chapter count");
audit = mustReplace(
  audit,
  'meta.officialSource !== "bo-cycle4-mathematiques-2020"',
  'meta.officialSource !== "bo-2019-mathematiques-terminale-specialite"',
  "audit source"
);
audit = mustReplace(
  audit,
  'meta.programmeVersion !== "mathematiques-cycle4-2020"',
  'meta.programmeVersion !== "mathematiques-terminale-specialite-2019"',
  "audit programme"
);

const start = audit.indexOf("const chapterDirs = readdirSync(LEVEL_ROOT");
const endNeedle = "  .sort();";
const end = audit.indexOf(endNeedle, start);
if (start < 0 || end < 0) throw new Error("C26 audit chapter discovery block not found");
audit =
  audit.slice(0, start) +
  'const mapping = readJson(MAPPING_FILE);\nconst chapterDirs = mapping.chapters.map((slug) => path.join(LEVEL_ROOT, slug));' +
  audit.slice(end + endNeedle.length);

audit = mustReplace(
  audit,
  'errors.push("3e: " + chapterDirs.length + " chapitres trouvés au lieu de " + EXPECTED_CHAPTERS);',
  'errors.push("C26: " + chapterDirs.length + " chapitres trouvés au lieu de " + EXPECTED_CHAPTERS);',
  "audit final count message"
);
audit = mustReplace(
  audit,
  'console.log("Audit Mathématiques V3 — 3e complète");',
  'console.log("Audit Mathématiques V3 — C26 Terminale spécialité partie A");',
  "audit title"
);
audit = mustReplace(
  audit,
  'console.log("\\nOK — les 13 chapitres de 3e satisfont le contrat pédagogique V3.");',
  'console.log("\\nOK — les 8 chapitres C26 satisfont le contrat pédagogique V3.");',
  "audit success message"
);
fs.writeFileSync("scripts/audit-maths-v3-c26-latex.mjs", audit);

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.scripts["audit:maths-v3-c26"] = "node scripts/audit-maths-v3-c26-latex.mjs";
if (!pkg.scripts["audit:maths-v3"].includes("audit-maths-v3-c26-latex.mjs")) {
  pkg.scripts["audit:maths-v3"] = mustReplace(
    pkg.scripts["audit:maths-v3"],
    "node scripts/audit-maths-latex-all.mjs",
    "node scripts/audit-maths-v3-c26-latex.mjs && node scripts/audit-maths-latex-all.mjs",
    "package audit chain"
  );
}
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log("C26 V3 permanent guards applied.");
