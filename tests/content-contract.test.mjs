import test from "node:test";
import assert from "node:assert/strict";

import {
  auditContentContracts,
  CONTENT_CONTRACT_VERSION,
  normalizeChapterPackage,
} from "../src/content-model/index.ts";

test("content contract validates every existing chapter without blocking publication", () => {
  const audit = auditContentContracts(process.cwd());
  // C19 added 13 Mathematics 5e packages; C21-C22 add 12 Première specialty packages;
  // C23 adds 5 Première integrated-mathematics packages.
  assert.equal(audit.summary.pcChapters, 101);
  assert.equal(audit.summary.mathChapters, 41);
  assert.equal(audit.summary.chapters, audit.summary.pcChapters + audit.summary.mathChapters);
  assert.equal(audit.summary.bloquants, 0);
  assert.equal(audit.errors.length, 0);
  assert.deepEqual(audit.summary.exerciseFormats, { "array-root": 101, exercices: 41 });
  assert.deepEqual(audit.summary.quizFormats, { "array-root": 101, questions: 41 });
  assert.deepEqual(audit.summary.flashcardFormats, { "array-root": 101, cards: 41 });
});

test("invalid content contract messages include file and field", () => {
  const result = normalizeChapterPackage({
    sourcePath: "src/data/chapters/college/4eme/chimie/exemple/meta.json",
    discipline: "physique-chimie",
    cycle: "college",
    niveau: "4eme",
    matiere: "chimie",
    slug: "exemple",
    meta: {
      description: "Description sans titre.",
      theme: "Organisation et transformations de la matière",
      programme: "bo-cycle4-physique-chimie-2020",
      sources: [{ id: "bo-cycle4-physique-chimie-2020", label: "Programme officiel cycle 4", kind: "official" }],
      seo: { canonical: "/college/4eme/chimie/exemple" },
    },
    coursePath: "src/data/chapters/college/4eme/chimie/exemple/cours.mdx",
    coursePresent: true,
    courseFormat: "mdx",
    exercices: [{ id: "ex1", consigne: "Calculer.", correction: "Réponse." }],
    quiz: [{ id: "q1", question: "Question ?", choices: ["A", "B"], answer: 0 }],
    flashcards: [{ id: "f1", front: "Recto", back: "Verso" }],
  });

  assert.equal(result.package, null);
  assert.ok(result.errors.some((message) => message.includes("meta.json :: title ::")));
});

test("valid V3 fixture exposes access, lessons, blocks, links, sources and competences", () => {
  const result = normalizeChapterPackage({
    sourcePath: "src/data/chapters/college/5eme/physique/circuits-pilote/meta.json",
    discipline: "physique-chimie",
    cycle: "college",
    niveau: "5eme",
    matiere: "physique",
    slug: "circuits-pilote",
    meta: {
      title: "Circuits electriques",
      description: "Comprendre un circuit simple.",
      theme: "Energie et circuits",
      programme: "bo-cycle4-physique-chimie-2020",
      objectives: ["Identifier les dipoles"],
      prerequisites: ["Savoir lire un schema simple"],
      competencies: ["Representer", "Raisonner"],
      access: { tier: "free", preview: true },
      sources: [{ id: "bo-cycle4-physique-chimie-2020", label: "Programme officiel cycle 4", kind: "official" }],
      links: [{ label: "Laboratoire Loi d'Ohm", href: "/laboratoire/loi-ohm", kind: "laboratory" }],
      lessons: [
        {
          id: "lecon-1",
          title: "Schema d'un circuit",
          blocks: [
            {
              id: "schema-simple",
              type: "diagram",
              title: "Circuit ferme",
              accessibility: { altText: "Pile, lampe et interrupteur relies en boucle fermee." },
            },
            {
              id: "loi",
              type: "formula",
              formula: "U = R \\times I",
              accessibility: { formulaText: "La tension U est egale a la resistance R multipliee par l'intensite I." },
            },
          ],
        },
      ],
    },
    coursePath: "src/data/chapters/college/5eme/physique/circuits-pilote/cours.mdx",
    coursePresent: true,
    courseFormat: "mdx",
    exercices: {
      exercices: [
        {
          id: "exo-1",
          title: "Nommer les dipoles",
          statement: "Observe le schema et nomme les dipoles.",
          blocks: [
            {
              id: "doc-schema",
              type: "diagram",
              accessibility: { altText: "Un generateur, une lampe et des fils de connexion." },
            },
          ],
          skills: ["Observer"],
        },
      ],
    },
    quiz: { questions: [{ id: "q1", question: "Un circuit ferme laisse passer le courant ?", choices: ["Oui", "Non"], answer: 0 }] },
    flashcards: { cards: [{ id: "f1", front: "Circuit ferme", back: "Circuit dans lequel le courant peut circuler." }] },
  });

  assert.equal(result.errors.length, 0);
  assert.equal(result.package?.chapter.contractVersion, CONTENT_CONTRACT_VERSION);
  assert.equal(result.package?.chapter.access.tier, "free");
  assert.equal(result.package?.chapter.lessons[0].blocks.length, 2);
  assert.equal(result.package?.chapter.links[0].kind, "laboratory");
  assert.equal(result.package?.chapter.sources[0].kind, "official");
  assert.deepEqual(result.package?.chapter.competences.map((item) => item.label), ["Representer", "Raisonner"]);
  assert.equal(result.package?.exercises[0].blocks[0].accessibility.altText?.includes("generateur"), true);
});

test("invalid V3 fixture rejects unmarked HTML and inaccessible visual blocks", () => {
  const result = normalizeChapterPackage({
    sourcePath: "src/data/chapters/college/5eme/physique/circuits-invalides/meta.json",
    discipline: "physique-chimie",
    cycle: "college",
    niveau: "5eme",
    matiere: "physique",
    slug: "circuits-invalides",
    meta: {
      title: "Circuits invalides",
      description: "Fixture invalide.",
      theme: "Energie et circuits",
      programme: "bo-cycle4-physique-chimie-2020",
      sources: [{ id: "bo-cycle4-physique-chimie-2020", label: "Programme officiel cycle 4", kind: "official" }],
      objectives: ["Verifier le schema"],
      prerequisites: ["Aucun"],
      competencies: ["Observer"],
      lessons: [
        {
          id: "lecon-1",
          title: "Bloc invalide",
          blocks: [
            { id: "schema-sans-alt", type: "diagram", title: "Schema sans alternative" },
            { id: "html-libre", type: "html", html: "<strong>Texte</strong>" },
          ],
        },
      ],
    },
    coursePath: "src/data/chapters/college/5eme/physique/circuits-invalides/cours.mdx",
    coursePresent: true,
    courseFormat: "mdx",
    exercices: [{ id: "exo-1", consigne: "Observer.", correction: "Reponse." }],
    quiz: [{ id: "q1", question: "Question ?", choices: ["A", "B"], answer: 0 }],
    flashcards: [{ id: "f1", front: "Recto", back: "Verso" }],
  });

  assert.equal(result.package, null);
  assert.ok(result.errors.some((message) => message.includes("Visual blocks require altText or longDescription")));
  assert.ok(result.errors.some((message) => message.includes("HTML content must be explicitly marked as trusted")));
});
