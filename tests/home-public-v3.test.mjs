import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const homePath = join(root, "src/pages/index.astro");
const homeSource = readFileSync(homePath, "utf8");
const publicMenuSource = readFileSync(join(root, "src/data/publicMenu.ts"), "utf8");
const publicNavigationSource = readFileSync(join(root, "src/components/navigation/PublicNavigationV3.astro"), "utf8");
const baseLayoutSource = readFileSync(join(root, "src/layouts/BaseLayout.astro"), "utf8");
const homeNavigationSource = `${homeSource}\n${publicMenuSource}\n${publicNavigationSource}\n${baseLayoutSource}`;
const heroWebpPath = join(root, "public/images/accueil-v3-hero-sciences-2026-07-27.webp");
const heroPngPath = join(root, "public/images/accueil-v3-hero-sciences-2026-07-27.png");

describe("Accueil public V3", () => {
  it("expose une proposition de valeur immediate avec un H1 unique", () => {
    const h1Matches = homeSource.match(/<h1\b/g) ?? [];
    assert.equal(h1Matches.length, 1);
    assert.match(homeSource, /Comprendre, s'entraîner, réviser et expérimenter/);
    assert.match(homeSource, /Des ressources en mathématiques, physique-chimie et enseignement scientifique/);
    assert.match(homeSource, /niveaux affichés correspondent aux contenus effectivement publiés/i);
  });

  it("présente deux disciplines publiques et rattache ES à Physique-Chimie", () => {
    assert.match(homeSource, /Deux matières, une seule expérience/);
    assert.match(homeSource, /title: "Mathématiques"/);
    assert.match(homeSource, /title: "Physique-Chimie"/);
    assert.doesNotMatch(homeSource, /title: "Enseignement Scientifique"/);
    assert.doesNotMatch(homeSource, /subject-card--science/);
    assert.match(homeSource, /Enseignement scientifique/);
  });

  it("garde un CTA principal neutre entre les deux disciplines", () => {
    assert.match(homeSource, /class="btn btn--primary" href="#plateforme">Choisir une matière<\/a>/);
    assert.match(homeSource, /class="btn btn--secondary" href="#recherche">Rechercher un chapitre<\/a>/);
    assert.doesNotMatch(homeSource, /btn btn--primary" href="\/physique-chimie"/);
    assert.doesNotMatch(homeSource, />Explorer la Physique-Chimie<\/a>/);
  });

  it("calcule la promesse mathematiques depuis les seuls niveaux réellement publies", () => {
    assert.match(homeSource, /getPublishedMathematicsLevels/);
    assert.match(homeSource, /const publishedMathChapters = mathChapters\.filter/);
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
    assert.match(homeSource, /Ce qui est actuellement publié/);
    assert.match(homeSource, /compteurs ci-dessous sont calculés à partir des ressources actuellement disponibles/);
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
      "#recherche",
      "#plateforme",
    ]) {
      assert.ok(
        homeNavigationSource.includes(`href="${href}"`) || homeNavigationSource.includes(`href: "${href}"`),
        `lien public manquant : ${href}`,
      );
    }
    assert.match(homeSource, /<GlobalSearch client:load resources={resources} \/>/);
  });

  it("utilise un visuel scientifique optimise et accessible", () => {
    assert.ok(existsSync(heroWebpPath), "hero WebP manquant");
    assert.ok(existsSync(heroPngPath), "fallback PNG manquant");
    assert.ok(statSync(heroWebpPath).size < 150_000, "hero WebP trop lourd pour l'accueil");
    assert.match(homeSource, /<source srcset="\/images\/accueil-v3-hero-sciences-2026-07-27\.webp" type="image\/webp" \/>/);
    assert.match(homeSource, /alt="Bureau d'étude avec ordinateur, verrerie de chimie, schémas mathématiques et montage électrique scolaire\."/);
    assert.match(homeSource, /loading="eager"/);
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
    assert.match(baseLayoutSource, /class="site-footer"/);
    assert.match(baseLayoutSource, /aria-label="Disciplines"/);
    assert.match(baseLayoutSource, /aria-label="Ressources"/);
    assert.match(baseLayoutSource, /aria-label="Espace personnel et contact"/);
  });
});
