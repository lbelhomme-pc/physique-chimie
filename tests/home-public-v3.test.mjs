import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const homePath = join(root, "src/pages/index.astro");
const homeSource = readFileSync(homePath, "utf8");
const globalSearchCatalogueSource = readFileSync(join(root, "src/data/globalSearchResources.ts"), "utf8");
const publicMenuSource = readFileSync(join(root, "src/data/publicMenu.ts"), "utf8");
const publicNavigationSource = readFileSync(join(root, "src/components/navigation/PublicNavigationV3.astro"), "utf8");
const baseLayoutSource = readFileSync(join(root, "src/layouts/BaseLayout.astro"), "utf8");
const homeNavigationSource = `${homeSource}\n${publicMenuSource}\n${publicNavigationSource}\n${baseLayoutSource}`;

describe("Accueil public V3", () => {
  it("expose une proposition de valeur immediate avec un H1 unique", () => {
    const h1Matches = homeSource.match(/<h1\b/g) ?? [];
    assert.equal(h1Matches.length, 1);
    assert.match(homeSource, /Comprendre, s’entraîner et réviser/);
    assert.match(homeSource, /Mathématiques · Physique-Chimie/);
    assert.match(homeSource, /getGlobalSearchCatalogue/);
  });

  it("présente deux disciplines publiques et rattache ES à Physique-Chimie", () => {
    assert.match(homeSource, /Deux portes d’entrée, le même fonctionnement/);
    assert.match(homeSource, /title: "Mathématiques"/);
    assert.match(homeSource, /title: "Physique-Chimie"/);
    assert.doesNotMatch(homeSource, /title: "Enseignement Scientifique"/);
    assert.doesNotMatch(homeSource, /subject-card--science/);
    assert.match(homeSource, /Enseignement scientifique/);
  });

  it("garde un CTA principal neutre entre les deux disciplines", () => {
    assert.match(homeSource, /class="ui5-button ui5-button--primary" href="#matieres">Choisir une matière<\/a>/);
    assert.match(homeSource, /class="ui5-button" href="#global-search">Rechercher un chapitre<\/a>/);
    assert.doesNotMatch(homeSource, /btn btn--primary" href="\/physique-chimie"/);
    assert.doesNotMatch(homeSource, />Explorer la Physique-Chimie<\/a>/);
  });

  it("calcule la promesse mathematiques depuis les seuls niveaux réellement publies", () => {
    assert.match(homeSource, /getGlobalSearchCatalogue/);
    assert.match(globalSearchCatalogueSource, /getPublishedMathematicsLevels/);
    assert.match(globalSearchCatalogueSource, /const publishedMathChapters = mathChapters\.filter/);
    assert.match(homeSource, /const mathChapterCount = publishedMathChapters\.length/);
    assert.match(homeSource, /const mathCoverageText = publishedMathLevelLabels\.length === 0/);
    assert.match(homeSource, /text: mathCoverageText/);
    assert.doesNotMatch(homeSource, /Cours, méthodes et entraînement pour progresser du collège au lycée/);
  });

  it("retire les promesses marketing non démontrées de l'accueil", () => {
    for (const unsupportedClaim of [
      /plateforme complète/i,
      /pour tous les niveaux/i,
      /méthode éprouvée/i,
      /parcours d'apprentissage complet/i,
      /recommandé par les enseignants/i,
      /conforme aux programmes officiels/i,
    ]) {
      assert.doesNotMatch(homeSource, unsupportedClaim);
    }
    assert.match(homeSource, /chapitres publiés/);
    assert.match(homeSource, /\{resources\.length\}/);
  });

  it("derive aussi le compteur laboratoire des applications réellement migrees", () => {
    assert.match(homeSource, /import \{ labApps \} from "\.\.\/data\/laboratoire\/apps"/);
    assert.match(homeSource, /const labCount = labApps\.filter\(\(app\) => app\.status === "migrated"\)\.length/);
  });

  it("conserve les accès publics attendus sans casser l'ancre de recherche", () => {
    for (const href of [
      "/college",
      "/lycee",
      "/mathematiques",
      "/physique-chimie",
      "/laboratoire",
      "/outils-methodes",
      "/memorisation",
      "/profil",
      "#global-search",
      "#matieres",
    ]) {
      assert.ok(
        homeNavigationSource.includes(`href="${href}"`) || homeNavigationSource.includes(`href: "${href}"`),
        `lien public manquant : ${href}`,
      );
    }
    assert.ok(homeSource.includes('<GlobalSearch client:load resourceUrl="/search-index.json" resourceCount={resources.length} />'));
  });

  it("garde un accueil léger sans image décorative et avec des repères textuels", () => {
    assert.doesNotMatch(homeSource, /<img|<picture/);
    assert.match(homeSource, /ui5-home-hero/);
    assert.match(homeSource, /<dl class="ui5-home-hero__stats"/);
    assert.match(homeSource, /ui5-subject-card__mark/);
  });

  it("ne publie ni faux chiffres marketing ni prix premium invente", () => {
    assert.doesNotMatch(homeSource, /\+\s?\d/);
    assert.doesNotMatch(homeSource, /\d+[,.]\d+\s?€/);
    assert.doesNotMatch(homeSource, /premium.*\d/i);
    assert.doesNotMatch(homeSource, /[Ff]onctions premium à valider plus tard/);
    assert.doesNotMatch(homeSource, /L'accueil ne promet pas de prix ni de statistiques non vérifiées/);
  });

  it("retire les menus dupliques de l'accueil et affiche un pied de page utile", () => {
    assert.doesNotMatch(homeSource, /feature-strip/);
    assert.doesNotMatch(homeSource, /home-main-menu/);
    assert.doesNotMatch(homeSource, /proof-bar/);
    assert.match(baseLayoutSource, /class="ui5-footer"/);
    assert.match(baseLayoutSource, /aria-label="Disciplines"/);
    assert.match(baseLayoutSource, /aria-label="Ressources"/);
    assert.match(baseLayoutSource, /aria-label="Espace personnel"/);
  });
});
