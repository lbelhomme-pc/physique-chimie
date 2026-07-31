import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const componentSource = readFileSync(join(root, "src/components/search/GlobalSearch.tsx"), "utf8");
const homeSource = readFileSync(join(root, "src/pages/index.astro"), "utf8");

const {
  normalizeSearchText,
  searchResources,
  scoreSearchResource,
} = await import("../src/data/searchIndex.ts");

const resources = [
  {
    id: "physique-chimie:college:5eme:physique:circuits-electriques",
    title: "Circuits electriques",
    description: "Representer un circuit en serie ou derivation.",
    path: "/college/5eme/physique/circuits-electriques",
    subject: "physique-chimie",
    subjectLabel: "Physique-Chimie",
    cycle: "college",
    levelLabel: "5e",
    matiereLabel: "Physique",
    resourceType: "chapter",
    accessTier: "free",
    slug: "circuits-electriques",
    keywords: ["electricite", "tension", "intensite"],
  },
  {
    id: "mathematiques:lycee:2nde:fonctions-generalites",
    title: "Generalites sur les fonctions",
    description: "Images, antecedents et representation graphique.",
    path: "/mathematiques/lycee/2nde/fonctions-generalites",
    subject: "mathematiques",
    subjectLabel: "Mathematiques",
    cycle: "lycee",
    levelLabel: "2nde",
    resourceType: "chapter",
    accessTier: "free",
    slug: "fonctions-generalites",
    keywords: ["fonction", "image", "antecedent"],
  },
  {
    id: "physique-chimie:lycee:terminale-spe:chimie:acide-base-ph",
    title: "Acide-base et pH",
    description: "Couples acide-base et diagrammes.",
    path: "/lycee/terminale-spe/chimie/acide-base-ph",
    subject: "physique-chimie",
    subjectLabel: "Physique-Chimie",
    cycle: "lycee",
    levelLabel: "Terminale",
    matiereLabel: "Chimie",
    resourceType: "chapter",
    accessTier: "premium",
    slug: "acide-base-ph",
    keywords: ["pH", "reaction"],
  },
  {
    id: "enseignement-scientifique:lycee:1ere:physique:bilan-radiatif",
    title: "Bilan radiatif terrestre",
    description: "Puissance solaire recue et temperature de la Terre.",
    path: "/lycee/1ere-ens-scientifique/physique/bilan-radiatif-terrestre",
    subject: "enseignement-scientifique",
    subjectLabel: "Enseignement scientifique",
    cycle: "lycee",
    levelLabel: "Premiere",
    matiereLabel: "Physique",
    resourceType: "chapter",
    accessTier: "free",
    slug: "bilan-radiatif-terrestre",
    keywords: ["climat", "albedo", "rayonnement"],
  },
];

describe("Recherche globale V3", () => {
  it("normalise accents, casse et slugs", () => {
    assert.equal(normalizeSearchText("Fonctions-generalites"), "fonctions generalites");
    assert.equal(normalizeSearchText("Electricite"), "electricite");
  });

  it("cherche par titre, slug et mot-cle avec une pertinence stable", () => {
    assert.equal(searchResources(resources, { query: "circuits" })[0].id, resources[0].id);
    assert.equal(searchResources(resources, { query: "fonctions-generalites" })[0].id, resources[1].id);
    assert.equal(searchResources(resources, { query: "antecedent" })[0].id, resources[1].id);
    assert.ok(scoreSearchResource(resources[0], normalizeSearchText("circuits")) > scoreSearchResource(resources[2], normalizeSearchText("circuits")));
  });

  it("filtre par discipline, niveau et acces sans lien hors corpus", () => {
    assert.deepEqual(searchResources(resources, { query: "pH", subject: "physique-chimie", cycle: "lycee", accessTier: "premium" }).map((item) => item.path), [
      "/lycee/terminale-spe/chimie/acide-base-ph",
    ]);
    assert.deepEqual(searchResources(resources, { query: "pH", accessTier: "free" }), []);
    assert.equal(
      searchResources(resources, {
        query: "climat",
        subject: "enseignement-scientifique",
        cycle: "lycee",
      })[0].id,
      resources[3].id,
    );
  });

  it("expose une combobox accessible et des resultats scannables", () => {
    assert.match(componentSource, /role="combobox"/);
    assert.match(componentSource, /aria-controls="global-search-results"/);
    assert.match(componentSource, /"listbox"/);
    assert.match(componentSource, /"status"/);
    assert.match(componentSource, /role="option"/);
    assert.match(componentSource, /Filtrer par discipline/);
    assert.match(componentSource, /Filtrer par cycle/);
    assert.match(componentSource, /Filtrer par acces/);
    assert.match(componentSource, /enseignement-scientifique/);
    assert.match(componentSource, /Suggestions de recherche/);
    assert.match(componentSource, /Effacer la recherche/);
    assert.match(componentSource, /<fieldset>/);
    assert.match(componentSource, /getSearchResourceTypeLabel/);
    assert.match(componentSource, /getSearchAccessLabel/);
  });

  it("indexe les slugs et les niveaux sans modifier les contenus sources", () => {
    assert.match(homeSource, /slug,/);
    assert.match(homeSource, /accessTier: data\.access\?\.tier \?\? "free"/);
    assert.match(homeSource, /niveau\.includes\("ens-scientifique"\)/);
    assert.match(homeSource, /subject: isScientificEducation \? "enseignement-scientifique" : "physique-chimie"/);
    assert.match(homeSource, /<GlobalSearch client:load resources=\{resources\} \/>/);
  });
});
