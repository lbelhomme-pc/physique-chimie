import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";
import { auditContentContracts } from "../src/data/contentContractAudit.ts";
import {
  getDisciplineFromLevelSlug,
  getPhysiqueChimieTrackFromLevelSlug,
} from "../src/data/disciplineIdentity.ts";

const root = process.cwd();
const targetRoots = [
  {
    niveau: "1ere-ens-scientifique",
    matiere: "chimie",
    sourceId: "bo-enseignement-scientifique-premiere-2023",
    count: 4,
  },
  {
    niveau: "1ere-ens-scientifique",
    matiere: "physique",
    sourceId: "bo-enseignement-scientifique-premiere-2023",
    count: 9,
  },
  {
    niveau: "terminale-ens-scientifique",
    matiere: "chimie",
    sourceId: "bo-enseignement-scientifique-terminale-2023",
    count: 1,
  },
  {
    niveau: "terminale-ens-scientifique",
    matiere: "physique",
    sourceId: "bo-enseignement-scientifique-terminale-2023",
    count: 2,
  },
];

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function resourceItems(raw) {
  if (Array.isArray(raw)) return raw;
  return raw.exercices ?? raw.exercises ?? raw.questions ?? raw.quiz ?? raw.cards ?? raw.flashcards ?? [];
}

function chapterDir(key) {
  return path.join(root, "src/data/chapters/lycee", key.niveau, key.matiere, key.slug);
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

describe("enseignement scientifique V3", () => {
  it("reste un parcours identifie dans la discipline parente Physique-Chimie", () => {
    const keys = chapterKeys();
    assert.equal(keys.length, 16);
    assert.equal(getDisciplineFromLevelSlug("1ere-ens-scientifique"), "physique-chimie");
    assert.equal(getDisciplineFromLevelSlug("terminale-ens-scientifique"), "physique-chimie");
    assert.equal(getPhysiqueChimieTrackFromLevelSlug("1ere-ens-scientifique"), "enseignement-scientifique");
    assert.equal(getPhysiqueChimieTrackFromLevelSlug("terminale-ens-scientifique"), "enseignement-scientifique");
    assert.equal(getPhysiqueChimieTrackFromLevelSlug("1ere-spe"), "physique-chimie");

    for (const target of targetRoots) {
      assert.equal(keys.filter((key) => key.niveau === target.niveau && key.matiere === target.matiere).length, target.count);
    }

    for (const key of keys) {
      const relative = `src/data/chapters/lycee/${key.niveau}/${key.matiere}/${key.slug}`;
      assert.match(relative, /ens-scientifique/);
      assert.doesNotMatch(relative, /1ere-spe|terminale-spe/);
      for (const file of ["meta.json", "cours.mdx", "exercices.json", "quiz.json", "flashcards.json"]) {
        assert.equal(existsSync(path.join(chapterDir(key), file)), true, `${relative}/${file}`);
      }

      const result = packageFor(key);
      assert.equal(result.errors.length, 0, `${key.niveau}/${key.matiere}/${key.slug}`);
      assert.equal(result.package?.chapter.seo.canonical, `/lycee/${key.niveau}/${key.matiere}/${key.slug}`);
      assert.equal(result.package?.chapter.canonicalId, `physique-chimie:lycee:${key.niveau}:${key.matiere}:${key.slug}`);
    }
  });

  it("conserve l identite de parcours ES dans les meta.json", () => {
    for (const key of chapterKeys()) {
      const meta = readJson(path.join(chapterDir(key), "meta.json"));
      assert.equal(meta.disciplineIdentity, "enseignement-scientifique", key.slug);
      assert.equal(meta.access?.tier, "free", key.slug);
      assert.equal(meta.access?.requiresAccount, false, key.slug);
      assert.equal(meta.programme, key.sourceId, key.slug);
      assert.ok(meta.sources.some((source) => source.id === key.sourceId && source.kind === "official" && source.citation), key.slug);
      assert.ok(meta.objectives.length >= 3, key.slug);
      assert.ok(meta.prerequisites.length >= 3, key.slug);
      assert.ok(meta.competencies.length >= 5, key.slug);
      assert.ok(meta.competences.every((competence) => competence.domain === "enseignement-scientifique"), key.slug);
      assert.ok(meta.disciplinaryAxes.includes("Nature du savoir scientifique"), key.slug);
      assert.ok(meta.disciplinaryAxes.includes("Pratiques scientifiques"), key.slug);
      assert.ok(meta.disciplinaryAxes.includes("Effets de la science sur les societes et l environnement"), key.slug);
      assert.equal(meta.teachingScience?.identity, "enseignement-scientifique", key.slug);
      assert.ok(meta.teachingScience?.documentWork && meta.teachingScience?.modellingWork, key.slug);
      assert.ok(meta.teachingScience?.societalIssue && meta.teachingScience?.projectPrompt, key.slug);
      assert.ok(meta.links.some((link) => ["laboratory", "tool"].includes(link.kind) && link.href.startsWith("/")), key.slug);
      assert.ok(meta.tags.includes("enseignement-scientifique") && meta.tags.includes("es-v3"), key.slug);
    }
  });

  it("structure les lecons ES autour des documents, modeles, enjeux et projets", () => {
    for (const key of chapterKeys()) {
      const meta = readJson(path.join(chapterDir(key), "meta.json"));
      assert.equal(meta.lessons.length, 3, key.slug);
      assert.deepEqual(meta.lessons.map((lesson) => lesson.id), [
        "documents-et-savoirs",
        "modelisation-donnees",
        "enjeux-societe-projet",
      ]);

      for (const lesson of meta.lessons) {
        assert.ok(lesson.summary && lesson.objectives.length >= 2, `${key.slug}/${lesson.id}`);
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

  it("normalise les exercices, quiz et flashcards ES sans perdre les corrections", () => {
    let totalResources = 0;

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
        totalResources += items.length;

        for (const item of items) {
          assert.equal(item.access?.tier, "free", `${key.slug}/${kind}/${item.id}`);
          assert.ok(item.sources.some((source) => source.id === key.sourceId), `${key.slug}/${kind}/${item.id}`);
          assert.ok(item.competences.includes("Relier sciences, societes et environnement"), `${key.slug}/${kind}/${item.id}`);
          assert.ok(item.links.some((link) => link.href.startsWith("/")), `${key.slug}/${kind}/${item.id}`);
          assert.ok(item.tags.includes("enseignement-scientifique") && item.tags.includes("es-v3"), `${key.slug}/${kind}/${item.id}`);
          assert.ok(item.accessibility?.longDescription, `${key.slug}/${kind}/${item.id}`);
          if (kind === "exercices") assert.ok(item.correction?.length > 0 || item.correctionAvailable !== false, `${key.slug}/${item.id}`);
        }
      }
    }

    assert.equal(totalResources, 313);
  });

  it("branche l experience ES visible sur les pages chapitre et retire les champs manquants du lot", () => {
    const chapterPage = readFileSync(path.join(root, "src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro"), "utf8");
    assert.match(chapterPage, /getPhysiqueChimieTrackFromLevelSlug/);
    assert.match(chapterPage, /parentDiscipline/);
    assert.match(chapterPage, /isTeachingScience/);
    assert.match(chapterPage, /subjectDisplayLabel/);
    assert.match(chapterPage, /badges=\{isTeachingScience/);

    const audit = auditContentContracts(root);
    const lot = audit.chapters.filter((chapter) => chapter.file.includes("ens-scientifique"));
    assert.equal(lot.length, 16);
    assert.equal(lot.filter((chapter) => chapter.errors.length > 0).length, 0);
    assert.equal(lot.filter((chapter) => chapter.missingEditorialFields.length > 0).length, 0);
  });
});
