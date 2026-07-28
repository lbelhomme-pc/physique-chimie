import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";
import { auditContentContracts } from "../src/data/contentContractAudit.ts";
import { renderMathTextToTrustedHtml } from "../src/utils/trustedContent.ts";

const root = process.cwd();
const chapterKeys = [
  "algorithmique-python",
  "arithmetique-ensembles-logique",
  "calcul-litteral-puissances-racines",
  "droites-plan",
  "equations-inequations",
  "fonctions-generalites",
  "fonctions-reference-variations",
  "geometrie-reperee-vecteurs",
  "nombres-reels-intervalles",
  "probabilites-conditionnelles",
  "statistiques-information-chiffree",
];

function chapterDir(slug) {
  return path.join(root, "src/data/mathematiques/chapters/lycee/2nde", slug);
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function resourceItems(raw) {
  if (Array.isArray(raw)) return raw;
  return raw.exercices ?? raw.exercises ?? raw.questions ?? raw.quiz ?? raw.cards ?? raw.flashcards ?? [];
}

function packageFor(slug) {
  const dir = chapterDir(slug);
  return normalizeChapterPackage({
    sourcePath: `src/data/mathematiques/chapters/lycee/2nde/${slug}/meta.json`,
    discipline: "mathematiques",
    cycle: "lycee",
    niveau: "2nde",
    slug,
    meta: readJson(path.join(dir, "meta.json")),
    coursePath: `src/data/mathematiques/chapters/lycee/2nde/${slug}/cours.mdx`,
    coursePresent: existsSync(path.join(dir, "cours.mdx")),
    courseFormat: "mdx",
    exercices: readJson(path.join(dir, "exercices.json")),
    quiz: readJson(path.join(dir, "quiz.json")),
    flashcards: readJson(path.join(dir, "flashcards.json")),
  });
}

describe("migration mathematiques seconde V3", () => {
  it("conserve les routes, ids canoniques et fichiers du pilote", () => {
    assert.equal(chapterKeys.length, 11);

    for (const slug of chapterKeys) {
      const dir = chapterDir(slug);
      for (const file of ["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]) {
        assert.equal(existsSync(path.join(dir, file)), true, `${slug}/${file}`);
      }

      const result = packageFor(slug);
      assert.equal(result.errors.length, 0, slug);
      assert.ok(result.package, slug);
      assert.equal(result.package.chapter.slug, slug);
      assert.equal(result.package.chapter.discipline, "mathematiques");
      assert.equal(result.package.chapter.cycle, "lycee");
      assert.equal(result.package.chapter.niveau, "2nde");
      assert.equal(result.package.chapter.seo.canonical, `/mathematiques/lycee/2nde/${slug}`);
      assert.equal(result.package.chapter.canonicalId, `mathematiques:lycee:2nde:${slug}`);
    }
  });

  it("ajoute les champs V3 attendus aux meta.json maths seconde", () => {
    for (const slug of chapterKeys) {
      const meta = readJson(path.join(chapterDir(slug), "meta.json"));
      assert.equal(meta.programme, "bo-2026-mathematiques-seconde-gt", slug);
      assert.equal(meta.access?.tier, "free", slug);
      assert.equal(meta.access?.requiresAccount, false, slug);
      assert.ok(meta.sources.some((item) => item.id === "bo-2026-mathematiques-seconde-gt" && item.kind === "official"), slug);
      assert.ok(meta.objectives.length >= 3, slug);
      assert.ok(meta.prerequisites.length >= 2, slug);
      assert.ok(meta.competencies.length >= 3, slug);
      assert.ok(meta.competences.length >= 3, slug);
      assert.ok(meta.lessons.length >= 3, slug);
      assert.ok(meta.links.some((item) => ["tool", "course"].includes(item.kind) && item.href.startsWith("/")), slug);
      assert.ok(meta.tags.includes("pilote-v3"), slug);

      for (const lesson of meta.lessons) {
        assert.ok(lesson.id && lesson.title && lesson.summary, `${slug}/${lesson.id}`);
        assert.ok(lesson.blocks.length >= 1, `${slug}/${lesson.id}`);
        for (const block of lesson.blocks) {
          assert.notEqual(block.type, "html", `${slug}/${lesson.id}/${block.id}`);
          assert.ok(block.sourceIds.includes("bo-2026-mathematiques-seconde-gt"), `${slug}/${lesson.id}/${block.id}`);
          if (block.type === "formula") {
            assert.ok(block.formula, `${slug}/${lesson.id}/${block.id}`);
            assert.ok(block.accessibility?.formulaText, `${slug}/${lesson.id}/${block.id}`);
          }
        }
      }
    }
  });

  it("normalise exercices, quiz et flashcards sans changer les ids", () => {
    for (const slug of chapterKeys) {
      const dir = chapterDir(slug);
      const resources = [
        ["exercices", resourceItems(readJson(path.join(dir, "exercices.json"))), 5],
        ["quiz", resourceItems(readJson(path.join(dir, "quiz.json"))), 4],
        ["flashcards", resourceItems(readJson(path.join(dir, "flashcards.json"))), 4],
      ];

      for (const [kind, items, minLength] of resources) {
        assert.ok(items.length >= minLength, `${slug}/${kind}`);
        assert.equal(new Set(items.map((item) => item.id)).size, items.length, `${slug}/${kind}`);
        for (const item of items) {
          assert.equal(item.access?.tier, "free", `${slug}/${kind}/${item.id}`);
          assert.ok(item.sources.some((source) => source.id === "bo-2026-mathematiques-seconde-gt"), `${slug}/${kind}/${item.id}`);
          assert.ok(item.competences.length >= 3, `${slug}/${kind}/${item.id}`);
          assert.ok(item.links.some((link) => link.href.startsWith("/")), `${slug}/${kind}/${item.id}`);
          assert.ok(item.tags.includes("mathematiques") && item.tags.includes("seconde"), `${slug}/${kind}/${item.id}`);
          if (kind === "exercices") {
            assert.ok(item.correction?.length > 0 || item.correctionAvailable !== false, `${slug}/${item.id}`);
          }
        }
      }
    }
  });

  it("rend les formules KaTeX avec MathML et sans evaluation utilisateur", async () => {
    const html = String(renderMathTextToTrustedHtml("Une fonction affine s'ecrit $f(x)=ax+b$."));
    assert.match(html, /katex/);
    assert.match(html, /MathML|mathml|<math/);

    const activity = readFileSync(path.join(root, "src/data/mathematiques/activities.ts"), "utf8");
    const explorer = readFileSync(path.join(root, "src/components/mathematiques/AffineFunctionExplorer.astro"), "utf8");
    assert.doesNotMatch(activity + explorer, /\beval\s*\(|new\s+Function\s*\(/);

    const { getMathematicsPilotActivity } = await import("../src/data/mathematiques/activities.ts");
    assert.equal(getMathematicsPilotActivity("fonctions-generalites")?.id, "maths-2nde-fonctions-affines-pilote");
    assert.equal(getMathematicsPilotActivity("droites-plan"), null);
  });

  it("branche les objectifs V3 sur la page chapitre et retire les champs manquants du lot", () => {
    const page = readFileSync(path.join(root, "src/pages/mathematiques/lycee/[niveau]/[chapitre].astro"), "utf8");
    const contentLoader = readFileSync(path.join(root, "src/data/mathematiques/content.ts"), "utf8");
    const types = readFileSync(path.join(root, "src/data/mathematiques/types.ts"), "utf8");
    assert.match(types, /objectives\?: string\[\]/);
    assert.match(contentLoader, /objectives: Array\.isArray\(data\.objectives\)/);
    assert.match(page, /objectives=\{chapter\.objectives\?\.length/);
    assert.match(page, /headerVariant="math"/);

    const audit = auditContentContracts(root);
    const lot = audit.chapters.filter((chapter) => chapter.file.includes("src/data/mathematiques/chapters/lycee/2nde/"));
    assert.equal(lot.length, 11);
    assert.equal(lot.filter((chapter) => chapter.errors.length > 0).length, 0);
    assert.equal(lot.filter((chapter) => chapter.missingEditorialFields.length > 0).length, 0);
  });
});
