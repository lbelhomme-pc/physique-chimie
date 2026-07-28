import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const homePath = join(root, "src/pages/index.astro");
const homeSource = readFileSync(homePath, "utf8");
const heroWebpPath = join(root, "public/images/accueil-v3-hero-sciences-2026-07-27.webp");
const heroPngPath = join(root, "public/images/accueil-v3-hero-sciences-2026-07-27.png");

describe("Accueil public V3", () => {
  it("expose une proposition de valeur immediate avec un H1 unique", () => {
    const h1Matches = homeSource.match(/<h1\b/g) ?? [];
    assert.equal(h1Matches.length, 1);
    assert.match(homeSource, /Comprendre, s'entraîner, réviser et expérimenter/);
    assert.match(homeSource, /mathématiques, physique-chimie et enseignement scientifique/);
  });

  it("conserve les accès publics attendus sans casser l'ancre de recherche", () => {
    for (const href of [
      "/college",
      "/lycee",
      "/mathematiques",
      "/mathematiques/lycee/2nde",
      "/laboratoire",
      "/outils-methodes",
      "/memorisation",
      "/profil",
      "#recherche",
    ]) {
      assert.ok(
        homeSource.includes(`href="${href}"`) || homeSource.includes(`href: "${href}"`),
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
    assert.match(homeSource, /[Ff]onctions premium à valider plus tard/);
    assert.match(homeSource, /L'accueil ne promet pas de prix ni de statistiques non vérifiées/);
  });
});
