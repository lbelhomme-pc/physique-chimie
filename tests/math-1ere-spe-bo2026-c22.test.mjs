import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const level = "1ere-specialite-mathematiques";
const base = path.join(root, "src/data/mathematiques/chapters/lycee", level);
const mappingPath = path.join(root, "src/data/mathematiques/programmes/premiere-spe-2026.mapping.json");
const levelsPath = path.join(root, "src/data/mathematiques/levels.ts");

const expectedSlugs = [
  "suites-numeriques-modeles-discrets",
  "second-degre",
  "derivation",
  "variations-courbes",
  "fonction-exponentielle",
  "trigonometrie",
  "calcul-vectoriel-produit-scalaire",
  "geometrie-reperee",
  "probabilites-conditionnelles-independance",
  "variables-aleatoires",
  "experimentations-probabilistes",
  "algorithmique-listes",
];
const c22Slugs = expectedSlugs.slice(6);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function chapterFile(slug, name) {
  return path.join(base, slug, name);
}

function levelStatus() {
  const src = fs.readFileSync(levelsPath, "utf8");
  const block = src.match(/slug:\s*"1ere-specialite-mathematiques"[\s\S]*?order:\s*4,/u)?.[0] ?? "";
  return block.match(/status:\s*"([^"]+)"/u)?.[1] ?? null;
}

test("C22 verrouille le programme officiel de Première spécialité 2026", () => {
  const mapping = readJson(mappingPath);
  assert.equal(mapping.mission, "C22");
  assert.equal(mapping.programmeId, "bo-2026-mathematiques-premiere-specialite");
  assert.equal(mapping.source.nor, "MENE2602917A");
  assert.equal(mapping.source.application, "Rentrée scolaire 2026-2027");
  assert.deepEqual(mapping.chapters.map((chapter) => chapter.slug), expectedSlugs);
  assert.deepEqual(mapping.scope.parts, [
    "Algèbre",
    "Analyse",
    "Géométrie",
    "Probabilités et statistiques",
    "Algorithmique et programmation",
  ]);
});

test("C22 livre six paquets pédagogiques complets N1 N2 N3 quiz flashcards", () => {
  const mapping = readJson(mappingPath);
  const expectedNoindex = mapping.scope.publicLevelStatus !== "available";
  for (const slug of c22Slugs) {
    for (const file of ["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]) {
      assert.equal(fs.existsSync(chapterFile(slug, file)), true, `${slug}/${file} absent`);
    }
    const meta = readJson(chapterFile(slug, "meta.json"));
    assert.equal(meta.niveau, level);
    assert.equal(meta.programme, "bo-2026-mathematiques-premiere-specialite");
    assert.equal(meta.programmeVersion, "mathematiques-premiere-specialite-2026");
    assert.equal(meta.applicableFrom, "2026-2027");
    assert.equal(meta.seo.canonical, `/mathematiques/lycee/${level}/${slug}`);
    assert.equal(Boolean(meta.seo.noindex), expectedNoindex);

    const exercises = readJson(chapterFile(slug, "exercices.json")).exercices;
    assert.equal(exercises.length, 6, `${slug}: 6 exercices attendus`);
    assert.deepEqual([...new Set(exercises.map((item) => item.level))].sort(), ["N1", "N2", "N3"]);
    for (const difficulty of ["N1", "N2", "N3"]) {
      assert.equal(exercises.filter((item) => item.level === difficulty).length, 2, `${slug}: 2 ${difficulty} attendus`);
    }
    assert.ok(exercises.every((item) => Array.isArray(item.correction) && item.correction.length > 0));
    assert.equal(readJson(chapterFile(slug, "quiz.json")).questions.length, 5);
    assert.equal(readJson(chapterFile(slug, "flashcards.json")).cards.length, 6);

    const course = fs.readFileSync(chapterFile(slug, "cours.mdx"), "utf8");
    for (const heading of ["## Objectifs", "## Prérequis", "## Activité de découverte", "## Vocabulaire", "## Cours", "## Exemples corrigés", "## Méthode", "## Erreurs fréquentes", "## Synthèse"]) {
      assert.match(course, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"), `${slug}: ${heading} absent`);
    }
  }
});

test("C22 couvre les bornes sensibles géométrie probabilités et algorithmique", () => {
  const mapping = readJson(mappingPath);
  const serialized = JSON.stringify(mapping);
  for (const token of ["produit scalaire", "Al-Kashi", "vecteur normal", "probabilités totales", "n<=4", "univers fini", "König-Huygens", "2sigma/sqrt(n)", "listes", "programmation modulaire"]) {
    assert.ok(serialized.includes(token), `preuve BO absente: ${token}`);
  }
  assert.equal(mapping.transversalCoverage.vocabulaireEnsemblisteEtLogique.mode, "distributed");
  assert.equal(mapping.transversalCoverage.automatismes.mode, "distributed");
  assert.ok(mapping.boundaries.some((item) => item.includes("C30-C31")));
});

test("publication Première spécialité et indexation restent atomiques", () => {
  const mapping = readJson(mappingPath);
  const status = levelStatus();
  assert.equal(status, mapping.scope.publicLevelStatus);
  if (status === "planned") {
    assert.equal(mapping.scope.indexing, "noindex");
    assert.equal(mapping.scope.activationDeferredUntilCertification, true);
  } else {
    assert.equal(status, "available");
    assert.equal(mapping.scope.indexing, "index");
    assert.equal(mapping.scope.activationDeferredUntilCertification, false);
  }
});
