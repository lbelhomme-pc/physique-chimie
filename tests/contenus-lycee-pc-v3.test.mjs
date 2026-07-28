import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";
import { auditContentContracts } from "../src/data/contentContractAudit.ts";

const root = process.cwd();
const targetRoots = [
  { niveau: "2nde", matiere: "chimie", sourceId: "bo-lycee-pc-seconde", programme: "bo-lycee-pc-seconde", count: 7 },
  { niveau: "2nde", matiere: "physique", sourceId: "bo-lycee-pc-seconde", programme: "bo-lycee-pc-seconde", count: 7 },
  { niveau: "1ere-spe", matiere: "chimie", sourceId: "bo-lycee-pc-premiere-specialite", programme: "bo-lycee-pc-premiere-specialite", count: 8 },
  { niveau: "1ere-spe", matiere: "physique", sourceId: "bo-lycee-pc-premiere-specialite", programme: "bo-lycee-pc-premiere-specialite", count: 5 },
  { niveau: "terminale-spe", matiere: "chimie", sourceId: "bo-lycee-pc-terminale-specialite", programme: "bo-lycee-pc-terminale-specialite", count: 9 },
  { niveau: "terminale-spe", matiere: "physique", sourceId: "bo-lycee-pc-terminale-specialite", programme: "bo-lycee-pc-terminale-specialite", count: 12 },
];

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function resourceItems(raw) {
  if (Array.isArray(raw)) return raw;
  return raw.exercices ?? raw.exercises ?? raw.questions ?? raw.quiz ?? raw.cards ?? raw.flashcards ?? [];
}

function chapterDir({ niveau, matiere, slug }) {
  return path.join(root, "src/data/chapters/lycee", niveau, matiere, slug);
}

function chapterKeys() {
  return targetRoots.flatMap((target) => {
    const dir = path.join(root, "src/data/chapters/lycee", target.niveau, target.matiere);
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({ ...target, slug: entry.name }))
      .sort((a, b) => a.slug.localeCompare(b.slug));
  });
}

function packageFor(key) {
  const dir = chapterDir(key);
  return normalizeChapterPackage({
    sourcePath: `src/data/chapters/lycee/${key.niveau}/${key.matiere}/${key.slug}/meta.json`,
    discipline: "physique-chimie",
    cycle: "lycee",
    niveau: key.niveau,
    matiere: key.matiere,
    slug: key.slug,
    meta: readJson(path.join(dir, "meta.json")),
    coursePath: `src/data/chapters/lycee/${key.niveau}/${key.matiere}/${key.slug}/cours.mdx`,
    coursePresent: existsSync(path.join(dir, "cours.mdx")),
    courseFormat: "mdx",
    exercices: readJson(path.join(dir, "exercices.json")),
    quiz: readJson(path.join(dir, "quiz.json")),
    flashcards: readJson(path.join(dir, "flashcards.json")),
  });
}

describe("migration lycee physique-chimie V3", () => {
  it("couvre uniquement les chapitres PC de seconde, premiere speciale et terminale speciale", () => {
    const keys = chapterKeys();
    assert.equal(keys.length, 48);

    for (const target of targetRoots) {
      assert.equal(keys.filter((key) => key.niveau === target.niveau && key.matiere === target.matiere).length, target.count);
    }

    for (const key of keys) {
      const relative = `src/data/chapters/lycee/${key.niveau}/${key.matiere}/${key.slug}`;
      assert.doesNotMatch(relative, /ens-scientifique/);
      const dir = chapterDir(key);
      for (const file of ["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]) {
        assert.equal(existsSync(path.join(dir, file)), true, `${relative}/${file}`);
      }
    }
  });

  it("conserve les routes et ids canoniques du lot lycee PC", () => {
    for (const key of chapterKeys()) {
      const result = packageFor(key);
      assert.equal(result.errors.length, 0, `${key.niveau}/${key.matiere}/${key.slug}`);
      assert.ok(result.package, key.slug);
      assert.equal(result.package.chapter.slug, key.slug);
      assert.equal(result.package.chapter.discipline, "physique-chimie");
      assert.equal(result.package.chapter.cycle, "lycee");
      assert.equal(result.package.chapter.niveau, key.niveau);
      assert.equal(result.package.chapter.matiere, key.matiere);
      assert.equal(result.package.chapter.seo.canonical, `/lycee/${key.niveau}/${key.matiere}/${key.slug}`);
      assert.equal(result.package.chapter.canonicalId, `physique-chimie:lycee:${key.niveau}:${key.matiere}:${key.slug}`);
    }
  });

  it("ajoute les champs V3, sources BO et blocs de cours accessibles", () => {
    for (const key of chapterKeys()) {
      const meta = readJson(path.join(chapterDir(key), "meta.json"));
      assert.equal(meta.programme, key.programme, key.slug);
      assert.equal(meta.access?.tier, "free", key.slug);
      assert.equal(meta.access?.requiresAccount, false, key.slug);
      assert.ok(meta.sources.some((item) => item.id === key.sourceId && item.kind === "official" && item.citation), key.slug);
      assert.ok(meta.objectives.length >= 3, key.slug);
      assert.ok(meta.prerequisites.length >= 2, key.slug);
      assert.ok(meta.competencies.length >= 3, key.slug);
      assert.ok(meta.competences.length >= 3, key.slug);
      assert.ok(meta.lessons.length >= 3, key.slug);
      assert.ok(meta.links.some((item) => ["laboratory", "tool"].includes(item.kind) && item.href.startsWith("/")), key.slug);
      assert.ok(meta.tags.includes("lycee") && meta.tags.includes(key.niveau) && meta.tags.includes(key.matiere), key.slug);
      if (key.niveau === "terminale-spe") assert.ok(meta.tags.includes("bac"), key.slug);

      for (const lesson of meta.lessons) {
        assert.ok(lesson.id && lesson.title && lesson.summary, `${key.slug}/${lesson.id}`);
        assert.ok(lesson.blocks.length >= 1, `${key.slug}/${lesson.id}`);
        for (const block of lesson.blocks) {
          assert.notEqual(block.type, "html", `${key.slug}/${lesson.id}/${block.id}`);
          assert.ok(block.sourceIds.includes(key.sourceId), `${key.slug}/${lesson.id}/${block.id}`);
          if (block.type === "formula") {
            assert.ok(block.formula, `${key.slug}/${lesson.id}/${block.id}`);
            assert.ok(block.accessibility?.formulaText, `${key.slug}/${lesson.id}/${block.id}`);
          }
        }
      }
    }
  });

  it("normalise exercices, quiz et flashcards avec corrections et liens internes", () => {
    for (const key of chapterKeys()) {
      const dir = chapterDir(key);
      const resources = [
        ["exercices", resourceItems(readJson(path.join(dir, "exercices.json")))],
        ["quiz", resourceItems(readJson(path.join(dir, "quiz.json")))],
        ["flashcards", resourceItems(readJson(path.join(dir, "flashcards.json")))],
      ];

      for (const [kind, items] of resources) {
        assert.ok(items.length > 0, `${key.slug}/${kind}`);
        assert.equal(new Set(items.map((item) => item.id)).size, items.length, `${key.slug}/${kind}`);
        for (const item of items) {
          assert.equal(item.access?.tier, "free", `${key.slug}/${kind}/${item.id}`);
          assert.ok(item.sources.some((source) => source.id === key.sourceId), `${key.slug}/${kind}/${item.id}`);
          assert.ok(item.competences.length >= 3, `${key.slug}/${kind}/${item.id}`);
          assert.ok(item.links.some((link) => link.href.startsWith("/")), `${key.slug}/${kind}/${item.id}`);
          assert.ok(item.tags.includes("lycee") && item.tags.includes(key.niveau) && item.tags.includes(key.matiere), `${key.slug}/${kind}/${item.id}`);
          if (key.niveau === "terminale-spe") assert.ok(item.tags.includes("bac"), `${key.slug}/${kind}/${item.id}`);
          if (kind === "exercices") {
            assert.ok(item.correction?.length > 0 || item.correctionAvailable !== false, `${key.slug}/${item.id}`);
          }
        }
      }
    }
  });

  it("conserve des schemas SVG accessibles et sans HTML dangereux", () => {
    const dangerous = /<script|on[a-z]+\s*=|javascript:|<iframe|<object|aria-hidden="true"/i;

    for (const key of chapterKeys()) {
      const exercises = resourceItems(readJson(path.join(chapterDir(key), "exercices.json")));
      for (const item of exercises.filter((exercise) => exercise.schemaSvg)) {
        assert.doesNotMatch(item.schemaSvg, dangerous, `${key.slug}/${item.id}`);
        assert.match(item.schemaSvg, /role="img"/, `${key.slug}/${item.id}`);
        assert.match(item.schemaSvg, /<title(?:\s[^>]*)?>[^<]+<\/title>/, `${key.slug}/${item.id}`);
        assert.match(item.schemaSvg, /<desc(?:\s[^>]*)?>[^<]+<\/desc>/, `${key.slug}/${item.id}`);
        assert.ok(item.accessibility?.altText || item.schemaAlt, `${key.slug}/${item.id}`);
      }
    }
  });

  it("retire les champs editoriaux manquants du lot dans l audit de contrat", () => {
    const audit = auditContentContracts(root);
    const lot = audit.chapters.filter((chapter) => {
      const file = chapter.file.replaceAll("\\", "/");
      return targetRoots.some((target) => file.includes(`src/data/chapters/lycee/${target.niveau}/${target.matiere}/`));
    });

    assert.equal(lot.length, 48);
    assert.equal(lot.filter((chapter) => chapter.file.includes("ens-scientifique")).length, 0);
    assert.equal(lot.filter((chapter) => chapter.errors.length > 0).length, 0);
    assert.equal(lot.filter((chapter) => chapter.missingEditorialFields.length > 0).length, 0);
  });
});
